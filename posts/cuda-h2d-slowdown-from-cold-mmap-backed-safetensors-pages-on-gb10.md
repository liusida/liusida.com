## TL;DR

On my ASUS Ascent GX10, moving safetensors-backed CPU tensors to CUDA can be much slower than expected. I like this little machine and want it to punch as hard as it can, so I am writing down the workaround for other GX10 / GB10 owners who hit the same strange slowdown.

Two workarounds helped:

- Direct `safetensors`: materialize first, then call `.to("cuda")`.
- Transformers: load on CPU, touch CPU model pages, then call `model.to("cuda")`.

Direct `safetensors`:

```python
x = handle.get_slice(key)[...]
x = x.to("cuda")
```

Transformers:

```python
model = AutoModelForCausalLM.from_pretrained(..., device_map="cpu")
touch_model_cpu_pages(model)
model = model.to("cuda")
```

The helper function for `touch_model_cpu_pages` is below. This appears to be specific to my GB10 setup.

## The Machine

I was debugging this on my ASUS Ascent GX10. It is one of the small desktop AI systems built around NVIDIA GB10, the Grace Blackwell chip also used in NVIDIA DGX Spark and partner variants such as Dell Pro Max with GB10 and HP ZGX Nano.

## The Symptom

Loading weights from safetensors into CPU memory looked fast:

```text
Loading weights: 100%|...| 434/434 [00:00<00:00, thousands it/s]
```

But moving the model to CUDA could be very slow:

```text
Moving model to cuda...
Moved model to cuda in 42.79s
```

For a 3B model with about 5.75 GiB of weights, this was much slower than I expected.

## Direct safetensors

The direct `safetensors.safe_open` case has a very simple workaround: do not combine materialization and CUDA transfer in one expression.

Bad:

```python
x = safe_slice[...].to("cuda")
```

Good:

```python
x = safe_slice[...]
x = x.to("cuda")
```

Timing on my GB10 machine:

```text
one-line slice[...].to             avg=0.0913s min=0.0168s max=1.1939s
two-line x.to                      avg=0.0188s min=0.0174s max=0.0273s
two-line view(shape).to            avg=0.0262s min=0.0174s max=0.0686s
two-line page-touch.to             avg=0.0453s min=0.0183s max=0.0790s
```

The plain two-line version was best. Extra `view()`, `detach()`, or page-touch did not help in this direct safetensors path.

## Transformers

For Transformers, the situation is slightly different.

This is better than direct CUDA loading:

```python
model = AutoModelForCausalLM.from_pretrained(..., device_map="cpu")
model = model.to("cuda")
```

But on my machine, `model.to("cuda")` could still be slow. Touching each CPU tensor once before moving the model to CUDA helped a lot:

```python
def touch_model_cpu_pages(model) -> int:
    touched = 0
    with torch.no_grad():
        for tensor in list(model.parameters()) + list(model.buffers()):
            if tensor.device.type != "cpu" or tensor.numel() == 0:
                continue
            u8 = tensor.detach().view(torch.uint8).reshape(-1)
            _ = u8[::4096].sum().item()
            touched += int(u8.numel())
    return touched
```

Then:

```python
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    dtype=torch.bfloat16,
    device_map="cpu",
)
touched = touch_model_cpu_pages(model)
model = model.to("cuda")
```

Controlled test on `Qwen/Qwen2.5-Coder-3B`:

```text
without page-touch:
load cpu:        0.41-0.77s
model.to(cuda): 23.60-32.08s

with page-touch:
load cpu:        0.49-0.62s
touch pages:     0.22-0.26s
model.to(cuda):  8.12-9.94s
```

In a multi-model activation script, I saw the same direction:

```text
before page-touch: model.to(cuda) took about 36-45s
after page-touch:  model.to(cuda) took about 3-10s
```

The page-touch itself was cheap, but it removed a large part of the transfer cost.

## Why I Think This Happens

This was not just a PyTorch `.to()` artifact. Calling raw CUDA directly could reproduce the slow path:

```c
cudaMemcpy(dst_gpu, src_cpu, 134217728, cudaMemcpyHostToDevice);
```

where `src_cpu` is the `data_ptr()` of a safetensors/PyTorch CPU tensor.

One run:

```text
safe_open raw cudaMemcpy           avg=1.2485s
safe_open CPU page touch           avg=0.0011s
safe_open touch then cudaMemcpy    avg=0.0238s
safe_open CPU libc memcpy          avg=0.0988s
```

CPU reads were not the bottleneck. The expensive part was CUDA H2D from the untouched safetensors-backed memory.

A pure `.cu` repro with a file-backed mmap pointer did not fully reproduce the 1.2s worst case, but it reproduced the same direction:

```text
remap cold mmap+80 -> gpu          avg=0.09-0.11s
touched mmap+80 -> gpu             avg=0.0075s
anon copy -> gpu                   avg=0.0075s
pinned copy -> gpu                 avg=0.0075s
```

So my current interpretation is:

> On this GB10 setup, CUDA Host-to-Device copies can be unusually slow from cold safetensors / mmap-backed CPU memory. Materializing first, or touching CPU pages before CUDA transfer, avoids the slow path.

I would not treat this as a general PyTorch rule for every machine. On RTX 4090 systems, the same workload did not show this bug.

## Appendix: Minimal Test Script

This script compares `model.to("cuda")` with and without the CPU page-touch workaround:

```python
import argparse
import time

import torch
from transformers import AutoModelForCausalLM


def touch_model_cpu_pages(model) -> int:
    touched = 0
    with torch.no_grad():
        for tensor in list(model.parameters()) + list(model.buffers()):
            if tensor.device.type != "cpu" or tensor.numel() == 0:
                continue
            u8 = tensor.detach().view(torch.uint8).reshape(-1)
            _ = u8[::4096].sum().item()
            touched += int(u8.numel())
    return touched


parser = argparse.ArgumentParser()
parser.add_argument("--model", default="Qwen/Qwen2.5-Coder-3B")
parser.add_argument("--touch", action="store_true")
args = parser.parse_args()

print(f"GPU:   {torch.cuda.get_device_name(0)}")
print(f"model: {args.model}")
print(f"touch: {args.touch}")

t0 = time.perf_counter()
model = AutoModelForCausalLM.from_pretrained(
    args.model,
    dtype=torch.bfloat16,
    device_map="cpu",
    local_files_only=True,
    low_cpu_mem_usage=True,
)
print(f"load cpu: {time.perf_counter() - t0:.2f}s")

if args.touch:
    t0 = time.perf_counter()
    touched = touch_model_cpu_pages(model)
    print(f"touch cpu pages: {time.perf_counter() - t0:.2f}s, {touched / 1024**3:.2f} GiB")

torch.cuda.synchronize()
t0 = time.perf_counter()
model = model.to("cuda")
torch.cuda.synchronize()
print(f"model.to(cuda): {time.perf_counter() - t0:.2f}s")
```

Run:

```bash
python test_transformers_cpu_touch_to_cuda.py
python test_transformers_cpu_touch_to_cuda.py --touch
```

On my GX10, I usually see something like:

```text
without --touch:
load cpu:        0.41-0.77s
model.to(cuda): 23.60-32.08s

with --touch:
load cpu:        0.49-0.62s
touch cpu pages: 0.22-0.26s
model.to(cuda):  8.12-9.94s
```
