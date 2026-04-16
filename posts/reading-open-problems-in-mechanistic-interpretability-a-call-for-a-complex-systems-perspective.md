The recent review *[Open Problems in Mechanistic Interpretability](https://arxiv.org/abs/2501.16496)* (arXiv:2501.16496) is one of the clearest snapshots of where the field of mechanistic interpretability (MI) stands today. It’s thorough, honest about its limitations, and refreshingly forward-looking.

But while the review is excellent on its own terms, reading it also made something else crystal clear to me:

**Many of the field’s biggest challenges look exactly like the challenges we face when trying to apply reductionist methods to complex systems.**

Problems like:

- persistent high reconstruction error in *Sparse Dictionary Learning*,

- distributed, overlapping representations (“*Superposition*”),

- components with many unrelated roles (“*Polysemanticity*”),

- and difficulty generalizing methods beyond simple tasks…

These are not random technical frustrations. They suggest that mechanistic interpretability is trying to study modern AI systems using a primarily reductionist toolkit. And reductionism is simply not enough for objects shaped by high-dimensional nonlinear interactions, feedback, and self-organization.

In other words:

**LLMs behave less like machines and more like biological or cognitive systems — and those systems require complex-systems thinking.**

## **Where the Reductionist Paradigm Hits Its Limits**

Mechanistic interpretability today implicitly assumes:

- neural networks can be cleanly decomposed into parts,

- each part has a stable, identifiable function,

- and understanding the parts and their wiring explains the whole.

This assumption works beautifully for engineered systems like CPUs or compilers.

But in biology — from brains to ecosystems — this assumption often fails. Components change roles with context, mechanisms are distributed across scales, and causality emerges from interactions rather than isolated parts.

The same problems now surface in AI interpretability.

When the field struggles with feature (latent) splitting, cross-layer representation, or nonlocal circuits, it is encountering the same obstacles that once forced biology to evolve beyond strict reductionism.

Reductionism is not wrong. It’s just insufficient.

## **Toward a Complex-Systems-Aware Mechanistic Interpretability**

If LLMs really are complex adaptive systems — and the evidence is piling up — then our interpretability toolkit must expand accordingly.

A complex-systems-aware MI would complement bottom-up decomposition with tools designed for emergence, dynamics, and multi-scale behavior.

Here’s what that could look like.

### **1. Focus on dynamical structure**

Instead of asking *“What does this neuron/head/latent do?”*, ask:

- How do representations evolve across the forward pass?

- How do competing algorithms evolve during training?

- What attractor dynamics shape the model’s internal state?

- What trajectories represent reasoning, recall, or planning?

This mirrors systems neuroscience: understanding computation through population-level dynamics, not individual neurons.

### **2. Pay attention to macroscopic mechanisms**

Just as biology uses concepts like homeostasis, feedback, and robustness, we may need analogous macro-variables for LLMs.

Not everything worth understanding lives at the micro-level.

### **3. Embrace statistical and thermodynamic descriptions**

Brains, flocks of birds, and economies are all described statistically because micro-level precision is both impossible and unnecessary.

For LLMs, this could mean:

- modeling distributional flows rather than individual activations,

- studying ensembles of activations under perturbations,

- identifying global constraints rather than local circuits.

Statistical descriptions capture behavior that decomposition alone cannot.

### **4. Accept that not all mechanisms are decomposable**

Perhaps the most important shift:

**Some computations may simply not decompose cleanly.**

Just as there is no single neuron that “stores a memory” and no single gene that “makes an organism,” there may be no single head or latent that “implements reasoning” or “stores a fact.”

This isn’t a failure of interpretability — it’s the nature of emergent systems.

## **Conclusion: A Broader View for a Broader Phenomenon**

The review paper does a fantastic job outlining the difficulties in mechanistic interpretability. But many of these difficulties may not be obstacles to be engineered away. While continuing to push the current reductionist approach forward, we can also expand our conceptual framework.

A richer approach to interpretability will, of course, include reductionist methods — but situate them alongside a broader complex-systems paradigm. This is the same shift biology made in the 20th century, moving from molecular catalogs to systems biology, network theory, and nonlinear dynamics.