Sparse autoencoders (SAEs) and other dictionary-learning methods are increasingly used to make neural representations interpretable. Recently, however, SAEs have faced growing criticism. They do not always outperform simple baselines for concept detection or steering; their features may not form canonical units; and some evaluation metrics suggest surprisingly weak performance.

These results are important. But before concluding that dictionary learning has failed, there is a more basic question we should ask:

**What is a dictionary supposed to do?**

Part of the confusion may come from grouping several distinct goals under the single word *interpretability*.

## Four different goals

When studying neural representations, we often group several distinct goals under the broad term *interpretability*. It is useful to separate at least four:

<div class="equation">\[
\boxed{
\text{Discover}
\rightarrow
\text{Interpret}
\rightarrow
\text{Explain}
\rightarrow
\text{Control}
}
\]</div>

**Feature discovery**: What recurring structure can we discover in the activation space? For SAEs, dictionary learning performs this step by finding a sparse decomposition of the activation distribution.

**Feature interpretation**: What do the discovered features mean? Through examples, counterexamples, and annotation, we try to assign them useful human-understandable descriptions.

**Mechanistic explanation**: What role do these features or the information they represent play in the model's computation?

**Control**: How should we modify the model's internal state to produce a desired change in behavior?

These goals are related, but success at one does not imply success at the others. A feature can be interpretable without being a privileged unit of computation, and an interpretable or mechanistically relevant feature need not provide the best direction for intervention.

**This distinction matters because we sometimes train SAEs for discovery, annotate them for interpretation, and then judge them primarily by their performance at control.**

## A dictionary as semantic compression

A neural activation is a point in a high-dimensional continuous space:

<div class="equation">\[
x\in\mathbb{R}^d.
\]</div>

Humans cannot directly reason about thousands of arbitrary coordinates. Dictionary learning attempts to represent this vector using a finite vocabulary of directions:

<div class="equation">\[
x \approx Dz,
\]</div>

where $z$ is sparse.

If the resulting features are understandable, an opaque vector can instead be described by something resembling

<div class="equation">\[
\{\text{cat},\text{black},\text{animal},\text{indoors},\ldots\}.
\]</div>

This can be viewed as a kind of **semantic discretization** or semantic compression. The original representation is continuous and high-dimensional; the dictionary provides a finite vocabulary with which humans can approximately describe it.

Crucially, this vocabulary does not have to be the coordinate system in which the model itself computes.

Nor does it have to be the best coordinate system for manipulating the model.

A map can be extremely useful without being a steering wheel.

## Description is not control

Suppose an SAE identifies features we label “black,” “cat,” “brown,” and “dog.” We have a representation of a black cat and want to transform it into one representing a brown dog.

It is tempting to perform

<div class="equation">\[
x'
=
x
-d_{\text{black}}
-d_{\text{cat}}
+d_{\text{brown}}
+d_{\text{dog}}.
\]</div>

But why should this be the correct transformation?

The SAE was trained to sparsely describe naturally occurring activations. It was not trained so that arbitrary arithmetic on its learned features corresponds to valid counterfactual transformations.

The correct change from “black cat” to “brown dog” may depend on the current representation, context, layer, and many interacting properties. It may be better estimated directly from examples of the states we want to transform between.

This gives us two fundamentally different problems:

<div class="equation">\[
\textbf{description:}\qquad
x\rightarrow z
\]</div>

and

<div class="equation">\[
\textbf{control:}\qquad
(x,\text{desired outcome})\rightarrow x'.
\]</div>

There is no reason the optimal solution to the first problem should also be the optimal solution to the second.

A supervised contrastive direction, difference-in-means estimator, learned transformation, or context-dependent intervention has access to information about the particular transformation we want. An unsupervised dictionary does not.

Therefore, if such a method outperforms an SAE at steering a predefined concept, that is evidence that it is a better **steering method**. It is not by itself evidence that it provides a better **dictionary of representation space**.

## Description is also not mechanism

There is another distinction that should not be lost.

Suppose an SAE feature reliably activates on some recognizable semantic phenomenon. Through controlled examples, counterexamples, and iterative annotation, we may become increasingly confident about what the feature describes.

This establishes something about the structure of the representation.

It does not necessarily establish how the model uses that structure.

A feature may provide an excellent description of information present in $x$ while being downstream of the computation that produced a behavior, redundant with other information, or organized differently from the variables most naturally used to explain the model's computation.

Thus,

<div class="equation">\[
\text{“this concept is represented here”}
\]</div>

and

<div class="equation">\[
\text{“the model computes with this concept in this way”}
\]</div>

are different scientific claims.

Causal analysis is essential when our goal is the second. But failure to recover privileged causal variables does not automatically imply failure at the first.

## What does it mean for a dictionary feature to be interpretable?

If our goal is human interpretation, feature annotation becomes central.

Suppose we initially label a feature “French.” We then discover that it activates on formal French but not informal French. Our original annotation was incomplete, so we refine it.

Further controlled datasets may reveal additional conditions.

This is an empirical process: propose a description, search for positive and negative examples, find counterexamples, and refine the description.

Importantly, controlled experimentation on **inputs** should not be confused with intervention on **SAE features**.

We may need carefully designed inputs to understand what a dictionary element means without requiring that the dictionary element itself be a good unit of control.

There is nevertheless a fundamental limit to annotation. A discovered feature may respond to several seemingly unrelated concepts, with no useful semantic description that unifies them. We could annotate it as a disjunction—“concept A or concept B or concept C”—but this defeats much of the purpose of learning an interpretable dictionary.

The challenge is therefore not simply to describe each feature more precisely, but to discover features that are sufficiently **semantically coherent** to serve as useful units of human understanding. In this sense, polysemanticity is a failure of the dictionary's interpretability, even if the feature itself is perfectly well-defined mathematically.

At that point the dictionary has failed at something important—not necessarily because the feature is non-causal, but because it has failed to provide useful **semantic compression**.

The goal is not merely to assign every direction a label. The label must compress the feature's behavior enough to help humans reason.

## Evaluating the objective we actually care about

This perspective suggests that SAE evaluation should distinguish at least four families of metrics:

<div class="equation">\[
\begin{array}{lll}
\textbf{Discovery} &:&
\text{Does the dictionary reveal meaningful structure?}\\[3pt]
\textbf{Description} &:&
\text{Can humans understand representations through it?}\\[3pt]
\textbf{Mechanism} &:&
\text{Does it help explain the model's computation?}\\[3pt]
\textbf{Control} &:&
\text{Does it support precise counterfactual interventions?}
\end{array}
\]</div>

A dictionary may perform well on some and poorly on others.

That is not necessarily contradictory.

For example, a dictionary optimized specifically for intervention could provide excellent control while offering humans little insight into the overall structure of activation space. Conversely, an interpretable dictionary might reveal useful semantic organization while providing only crude intervention directions.

The dangerous step is turning one of these measurements into an unconditional ranking:

<div class="equation">\[
\text{better steering}
\Rightarrow
\text{better dictionary}.
\]</div>

The meaningful statement is narrower:

<div class="equation">\[
\text{better steering}
\Rightarrow
\text{better dictionary for steering}.
\]</div>

The same caution applies to causal ablation metrics, sparse probing, reconstruction error, and automated feature-interpretability scores. Each measures some property of a representation. None should silently become the definition of interpretability as a whole.

## The missing benchmark: understanding

This leaves an uncomfortable problem.

Reconstruction is easy to measure.

Sparsity is easy to measure.

Classification is easy to measure.

Steering is easy to measure.

Causal ablation is relatively easy to measure.

But the original motivation for dictionary learning is arguably something much harder:

<div class="equation">\[
\boxed{
\text{Does this representation help us understand the model's internal state?}
}
\]</div>

If this is the objective, we eventually need to evaluate it directly.

Instead of asking only whether an SAE feature can steer a predefined concept, we might ask whether access to an SAE dictionary allows researchers to discover distinctions they did not know beforehand, formulate hypotheses about unfamiliar activations, predict properties of unseen examples, diagnose unexpected model behavior, or communicate what is happening inside a representation more efficiently.

Schematically:

<div class="equation">\[
\text{activation}
\rightarrow
\text{dictionary}
\rightarrow
\text{human}
\rightarrow
\text{new understanding}.
\]</div>

Such experiments are considerably harder than measuring reconstruction error or steering strength. But difficulty of measurement should not cause us to substitute an easier objective for the one we actually care about.

## Better for what?

None of this implies that causal interventions, steering benchmarks, or supervised concept methods are misguided.

If our goal is control, we should develop and evaluate methods for control.

If our goal is mechanistic explanation, we should test causal claims about computation.

If our goal is detecting a known concept, supervised methods that are explicitly told what to look for may be exactly the right tools.

And if our goal is discovering and describing the unknown structure of a high-dimensional representation, dictionary learning may still have an important role—even if it loses to those specialized methods at their respective tasks.

The important question is therefore not simply:

> **Are sparse autoencoders useful?**

It is:

> **Useful for what?**

Before deciding whether a dictionary-learning method has succeeded or failed, we should specify whether we are asking it to discover, describe, explain, or control.

Only then can we build the right benchmark.

**A dictionary need not be a steering wheel.**

**But if we claim that it is a map, we should demonstrate that it actually helps someone understand the territory.**
