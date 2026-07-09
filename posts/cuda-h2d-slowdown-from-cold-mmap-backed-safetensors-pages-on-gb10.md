## TL;DR

On GB10, if loading a safetensors-backed model is unexpectedly slow, avoid loading or slicing directly onto CUDA.

For Transformers, avoid:

```python
model = AutoModelForCausalLM.from_pretrained(..., device_map="cuda")
```

Prefer loading on CPU first, then moving the model to CUDA:

```python
model = AutoModelForCausalLM.from_pretrained(..., device_map="cpu")
model = model.to("cuda")
```

For direct safetensors usage, avoid:

```python
x = handle.get_slice(key)[...].to("cuda")
```

Prefer splitting materialization and CUDA transfer into two steps:

```python
x = handle.get_slice(key)[...]
x = x.to("cuda")
```

## Problem

GB10 is NVIDIA's Grace Blackwell chip used in small desktop AI systems such as NVIDIA DGX Spark and partner variants including ASUS Ascent GX10, Dell Pro Max with GB10, and HP ZGX Nano. These machines are attractive for local model loading and inference because they provide a large unified memory space in a compact box.

In that setting, loading model weights from safetensors files and moving them to CUDA can be unexpectedly slow.

Many users will first see this through Transformers model loading. Under the hood, Transformers may load weights from safetensors files, and some loading paths can combine safetensors-backed tensor materialization with CUDA transfer. In direct safetensors usage, the same pattern appears more explicitly:

```python
x = handle.get_slice(key)[...].to("cuda")
```

The slowdown is visible even when bypassing high-level PyTorch and Transformers APIs:

```c
cudaMemcpy(dst_gpu, src_cpu, 134217728, cudaMemcpyHostToDevice);
```

where `src_cpu` is `tensor.data_ptr()` from a safetensors/PyTorch mmap-backed CPU tensor.

For a 128 MiB tensor, the slow path can take around `1.2s`, while the normal path is around `0.007-0.02s`.

## Practical Workarounds

### Transformers

For local GB10 use, avoid loading directly to CUDA:

```python
model = AutoModelForCausalLM.from_pretrained(..., device_map="cuda")
```

Prefer loading the model on CPU first, then moving it to CUDA:

```python
model = AutoModelForCausalLM.from_pretrained(..., device_map="cpu")
model = model.to("cuda")
```

This separates model weight materialization from the CUDA transfer path. It is the Transformers-level version of the two-line safetensors workaround below.

### Direct safetensors

For normal Python use with `safetensors.safe_open`, avoid chaining slice materialization and CUDA copy in one expression.

Avoid:

```python
x_cuda = handle.get_slice(key)[...].to("cuda")
```

Prefer:

```python
x = handle.get_slice(key)[...]
x_cuda = x.to("cuda")
```

Focused timing on GB10:

```text
one-line slice[...].to           avg=0.1755s min=0.0191s max=1.1863s
two-line x=slice; x.to           avg=0.0300s min=0.0190s max=0.0452s
two-line touch then to           avg=0.0317s min=0.0198s max=0.0491s
```

So for the common safetensors/Python path, the two-line pattern is the simplest effective workaround.

### Lower-level CUDA

For raw CUDA copies from mmap-backed CPU memory, or for cases where the two-line Python pattern is not enough, touch one byte per page on CPU before H2D:

```c
volatile uint8_t *p = (volatile uint8_t *)src_cpu;
for (size_t off = 0; off < nbytes; off += 4096) {
    sum += p[off];
}
sum += p[nbytes - 1];

cudaMemcpy(dst_gpu, src_cpu, nbytes, cudaMemcpyHostToDevice);
```

Alternative workaround:

```text
mmap-backed tensor -> normal anonymous CPU buffer -> CUDA
```

This adds a CPU memcpy, but can still be much faster than letting CUDA copy directly from cold mmap-backed pages.

## Cause

The evidence does not point to these as the root cause:

- `Tensor.to("cuda")`
- `Tensor.copy_`
- TensorIterator
- bf16 conversion
- Transformers itself
- safetensors parsing

Transformers can expose the issue because it sits on top of safetensors/PyTorch loading paths. The lower-level evidence points instead to CUDA runtime/driver behavior when doing Host-to-Device copy from **cold file-backed mmap pages**.

On GB10, `cudaMemcpyHostToDevice` can take a very slow path if CUDA is the first component to fault/touch those mmap-backed pages. If the CPU touches the pages first, the same `cudaMemcpy` becomes fast.

In short:

```text
cold mmap-backed CPU pages -> cudaMemcpy H2D: slow
CPU-touched mmap pages     -> cudaMemcpy H2D: fast
```

## Evidence

### Raw CUDA from safetensors pointer

Using `safe_open(...).get_slice("x")[...]`, then calling raw CUDA directly:

```text
safe_open raw cudaMemcpy           avg=1.2485s
safe_open CPU page touch           avg=0.0011s
safe_open touch then cudaMemcpy    avg=0.0238s
safe_open CPU libc memcpy          avg=0.0988s
```

This shows CPU reads are fast, but CUDA H2D is slow until pages are CPU-touched.

### Practical safetensors Python path

The simplest two-line pattern avoids the large outlier:

```text
one-line slice[...].to           avg=0.1755s min=0.0191s max=1.1863s
two-line x=slice; x.to           avg=0.0300s min=0.0190s max=0.0452s
two-line touch then to           avg=0.0317s min=0.0198s max=0.0491s
```

This suggests that for high-level PyTorch/safetensors usage, binding the materialized CPU tensor to a Python variable before CUDA copy stabilizes the path enough. Explicit page-touch is mainly needed for raw CUDA or colder mmap experiments.

### PyTorch high-level APIs are not the root cause

Direct `copy_` and raw CUDA show the same issue:

```text
safe_open prealloc.copy_           avg=1.2414s
safe_open raw cudaMemcpy           avg=1.2485s
```

So the slowdown is below PyTorch `copy_`.

### Pure `.cu` repro

A pure CUDA/C++ repro using:

```c
src_cpu = mmap_base + 80;
cudaMemcpy(dst_gpu, src_cpu, 134217728, cudaMemcpyHostToDevice);
```

with cold remapped pages shows the same direction:

```text
remap cold mmap+80 -> gpu          avg=0.09-0.11s
touched mmap+80 -> gpu             avg=0.0075s
anon copy -> gpu                   avg=0.0075s
pinned copy -> gpu                 avg=0.0075s
```

This confirms the core mechanism: CUDA H2D from cold mmap-backed pages is much slower than from touched/anonymous/pinned memory.

## Current Interpretation

There appear to be two related effects:

1. At the application level, loading directly to CUDA can hit a slow or unstable path. For Transformers, split `from_pretrained(..., device_map="cpu")` and `model.to("cuda")`. For direct safetensors use, split `x = handle.get_slice(key)[...]` and `x.to("cuda")`.
2. At the lower level, CUDA's pageable-memory H2D path can be slow from cold mmap-backed pages. CPU page-touching the pages first makes raw `cudaMemcpyHostToDevice` fast.
