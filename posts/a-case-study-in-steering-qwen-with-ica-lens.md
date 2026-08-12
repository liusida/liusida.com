Recently, I packaged our [ICA Lens](https://liusida.github.io/ica-lens-paper/) pipeline into a Python package called [`icalens`](https://icalens.readthedocs.io/en/latest/).

One thing ICA Lens can do is similar to feature steering with sparse autoencoders: find an interpretable direction in a language model’s residual stream, modify its activation during generation, and observe how the output changes.

Unlike an SAE, an ICA lens is compact—typically containing no more components than the model’s hidden dimension—and can be obtained directly with FastICA. This makes it much cheaper to fit for a new model or layer.

In this experiment, I will use one ICA component to steer Qwen 3.5 2B from answering “Quantum Computing” to answering “Neuroplasticity.”

The interesting part is not only that the steering works. It is how we move from an unnamed mathematical direction to a tentative interpretation, test that interpretation on independent inputs, and only then use the component as an intervention.

## Establishing a baseline

First, install the package:

```bash
pip install icalens
```

Then load a published ICA lens for Qwen 3.5 2B:

```python
from icalens import ICALens

lens = ICALens.from_pretrained(
    "sida/icalens-qwen3.5-2b-ultrachat-1m"
)
```

I asked the model a deliberately open-ended question:

```python
messages = [{
    "role": "user",
    "content": (
        "If you had to pick one, what is the most "
        "interesting science? Be brief."
    ),
}]

baseline = lens.generate(
    messages,
    max_new_tokens=16,
)

print(baseline)
```

With greedy decoding, the model begins its answer with:

```text
Quantum Computing
```

This gives us a deterministic baseline to compare against.

<figure>
  <img src="/images/posts/a-case-study-in-steering-qwen-with-ica-lens/01-baseline-quantum-computing.png" alt="Notebook showing the Qwen prompt and its baseline Quantum Computing response">
  <figcaption>Figure 1. With greedy decoding and no intervention, Qwen begins its answer with “Quantum Computing.”</figcaption>
</figure>

## Looking at component 188

An ICA decomposition gives us component directions, but it does not automatically tell us what they mean.

A component ID such as `C188` is only a coordinate. Any semantic description must be inferred from evidence and then tested.

ICA Lens artifacts can include a profile for each component. A profile records information such as:

- how the component’s energy is divided between its positive and negative directions;
- representative high-energy occurrences from a profiling corpus;
- context surrounding those occurrences; and
- vocabulary tokens associated with each writing direction through a logit-lens projection.

For component 188 at layer 5:

```python
profile = lens.component_profile(
    layer=5,
    component=188,
)

print(profile["dominant_sign"])
print(profile["sign_statistics"])
print(
    profile["examples"]
    [profile["dominant_sign"]]
    ["tokens"][:10]
)
```

The profile says that C188’s dominant direction is negative. Its representative examples suggest a possible relationship to neuroscience, the brain, and related biological concepts.

“Negative” does not mean undesirable or semantically negative. ICA signs are arbitrary: multiplying a component and all its scores by `-1` produces an equivalent decomposition. The sign is meaningful only within this particular fitted lens.

Nor should we immediately declare that C188 is “the neuroscience component.” The profile gives us a hypothesis, not a conclusion.

<figure>
  <img src="/images/posts/a-case-study-in-steering-qwen-with-ica-lens/02-component-188-profile-evidence.png" alt="Notebook output showing component 188's negative dominant sign, sign statistics, and representative tokens">
  <figcaption>Figure 2. C188’s stored profile has a dominant negative direction and includes neuroscience-related token evidence.</figcaption>
</figure>

## Testing the hypothesis

If C188’s negative direction is genuinely associated with neuroscience-related contexts, then independent neuroscience inputs should produce strong negative scores.

An unrelated concept such as quantum computing should not.

I first analyzed:

```python
neuroscience = lens.analyze(
    "Neuroscience.",
    layer=5,
)

neuroscience
```

For this lens, C188 becomes strongly negative on parts of the word “Neuroscience.” In my run, the scores on the `uro` and `science` tokens were approximately `-8.7` and `-14.9`.

I then analyzed the comparison separately:

```python
quantum = lens.analyze(
    "Quantum computing.",
    layer=5,
)

quantum
```

C188 remained close to zero throughout “Quantum computing.”

It is important to analyze these phrases separately. In a causal language model, tokens appearing earlier in a sequence influence later tokens. Putting all the concepts into one prompt would make the comparison harder to interpret.

<figure>
  <img src="/images/posts/a-case-study-in-steering-qwen-with-ica-lens/03-neuroscience-analysis.png" alt="ICA Lens token analysis of Neuroscience with component 188 highlighted at the science token">
  <figcaption>Figure 3. C188 reaches −14.839 on the “science” token in “Neuroscience.”</figcaption>
</figure>

<figure>
  <img src="/images/posts/a-case-study-in-steering-qwen-with-ica-lens/04-quantum-computing-analysis.png" alt="ICA Lens token analysis of Quantum computing where component 188 is not among the strongest displayed components">
  <figcaption>Figure 4. In “Quantum computing,” C188 is not among the three strongest components shown for any token.</figcaption>
</figure>

I also tried related probes:

```python
lens.analyze("The human brain.", layer=5)
lens.analyze("Neuroplasticity.", layer=5)
```

They showed the same negative direction.

<figure>
  <img src="/images/posts/a-case-study-in-steering-qwen-with-ica-lens/05-human-brain-analysis.png" alt="ICA Lens token analysis of The human brain with component 188 highlighted at brain">
  <figcaption>Figure 5. C188 scores −11.035 on “brain” in the independent probe “The human brain.”</figcaption>
</figure>

<figure>
  <img src="/images/posts/a-case-study-in-steering-qwen-with-ica-lens/06-neuroplasticity-analysis.png" alt="ICA Lens token analysis of Neuroplasticity with component 188 highlighted across several tokens">
  <figcaption>Figure 6. C188 appears across three token positions in “Neuroplasticity,” with consistently negative scores.</figcaption>
</figure>

These tests do not prove that C188 has one fixed semantic meaning. However, they give us stronger evidence than a label inferred from a few profile examples alone:

1. The stored component profile suggests a possible interpretation.
2. Independent prompts activate the expected direction.
3. A relevant comparison remains near zero.

## Steering the model

We can now use C188 as an intervention coordinate.

During generation, I clamp the component’s score to `-20` at layer 5:

```python
steered = lens.generate(
    messages,
    layer=5,
    clamp=(188, -20.0),
    max_new_tokens=16,
)

print(steered)
```

The model now begins its answer with:

```text
Neuroplasticity
```

The language model’s weights have not changed. At every processed token position and autoregressive generation step, ICA Lens:

1. captures the layer-5 residual-stream vector;
2. L2-normalizes it using the same preprocessing as the fitted lens;
3. projects it into signed ICA coordinates;
4. replaces C188 with `-20`;
5. maps the edited coordinates back into the residual stream;
6. restores the original vector norm; and
7. returns the modified activation to the model.

Conceptually, the intervention is:

$$
s_{188} \leftarrow -20
$$

This is analogous to SAE feature steering: identify a meaningful coordinate, edit its activation, reconstruct the hidden state, and observe the downstream behavioral effect.

<figure>
  <img src="/images/posts/a-case-study-in-steering-qwen-with-ica-lens/07-steered-neuroplasticity-response.png" alt="Notebook showing Qwen's Neuroplasticity response after clamping component 188 to negative 20">
  <figcaption>Figure 7. After clamping C188 to −20, Qwen begins its answer with “Neuroplasticity.”</figcaption>
</figure>

## Sweeping the steering strength

A component score is not a semantic dosage. Setting C188 to twice the magnitude does not necessarily produce twice as much “neuroscience.”

Instead of choosing only one successful value, it is more informative to test a range:

```python
for target in (-5, -10, -15, -17, -20, -25):
    response = lens.generate(
        messages,
        layer=5,
        clamp=(188, target),
        max_new_tokens=16,
    )

    print(target, response.splitlines()[0])
```

In my experiment, the answers moved through concepts including:

```text
Quantum Computing
Quantum Biology
The Human Brain
Neuroplasticity
```

This gradual movement is more interesting than a single successful intervention. It suggests that C188 participates in a direction that can bias the model toward brain- and neuroscience-related answers.

Still, the relationship need not be perfectly smooth or monotonic. At large magnitudes, an intervention can rotate the residual vector substantially, interact with other model features, or degrade generation.

<figure>
  <img src="/images/posts/a-case-study-in-steering-qwen-with-ica-lens/08-steering-strength-sweep.png" alt="Notebook output showing Qwen responses while sweeping component 188 from negative 5 to negative 25">
  <figcaption>Figure 8. Sweeping C188 moves the response from “Quantum Computing,” through “Quantum Biology” and “The Human Brain,” to “Neuroplasticity.”</figcaption>
</figure>

## ICA components and SAE features

This workflow resembles SAE feature steering, but ICA and sparse autoencoders optimize different objectives.

An SAE learns a usually overcomplete dictionary that reconstructs activations using sparse feature coefficients. ICA finds a compact basis whose coordinates are as statistically independent and non-Gaussian as possible.

An ICA lens generally has roughly one component per hidden dimension, while an SAE may contain many times more features. The larger SAE dictionary may separate concepts that a compact ICA basis combines.

The advantage of ICA is cost.

It does not require training a large neural dictionary. FastICA directly estimates a compact linear transformation from sampled activations. This makes it practical to fit lenses for models and layers where no public SAE exists.

I do not see ICA as a replacement for SAEs. The two methods expose related but non-identical structure. But this example suggests that useful feature inspection and steering do not always require an expensive overcomplete dictionary.

A comparatively inexpensive ICA basis can already provide directions that are:

- statistically distinctive;
- inspectable through corpus examples;
- testable on independent inputs;
- reconstructable into activation space; and
- capable of influencing generation.

## What this experiment does—and does not—show

The result does not mean that C188 is a single “neuroscience neuron.”

It would be more accurate to say:

> In this Qwen 3.5 2B lens, component 188 has a negative direction associated with neuroscience-related evidence. Increasing the model’s activation along that direction can bias this particular generation toward related answers.

The result depends on the fitted lens, model revision, layer, prompt, decoding method, software versions, and intervention magnitude.

A successful qualitative example also does not establish that C188 controls neuroscience in every context. Component labels remain working hypotheses, and steering experiments should be repeated across prompts and compared with suitable controls.

Nevertheless, I find the full sequence encouraging:

$$
\text{inspect}
\longrightarrow
\text{hypothesize}
\longrightarrow
\text{test}
\longrightarrow
\text{intervene}
\longrightarrow
\text{observe}
$$

The component was not chosen only because one steering attempt happened to work. Its interpretation was first suggested by corpus-level evidence, then checked on independent inputs, and finally tested through intervention.

That is the workflow I hope ICA Lens can make easier.

- [`icalens` documentation](https://icalens.readthedocs.io/en/latest/)
- [Source code](https://github.com/liusida/icalens)
- [ICA Lens research project](https://liusida.github.io/ica-lens-paper/)
