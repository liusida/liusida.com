A recurring criticism in mechanistic interpretability (mech interp) discussions is that a finding is "not causal." A study might identify an interesting pattern in a model's internal representations, only to face the objection that it has not demonstrated a causal effect on the model's behavior.

Sometimes this is a valid criticism. If a study claims that a particular feature is responsible for a model's behavior, causal evidence is needed to support that claim.

But not every contribution to mech interp makes such a claim. Treating causality as a universal requirement risks overlooking other kinds of scientific progress.

## Outputs are not the only thing worth studying

A common description of mech interp is that it aims to understand how neural networks produce their outputs. This is an important goal, but it is narrower than understanding how neural networks work.

A model's internal representations, activation patterns, and computational processes can be studied without immediately connecting them to its final predictions. We can investigate what information is represented in hidden states, how that information changes across layers, and what structures emerge during computation. These are meaningful questions in their own right.

One might object that neural networks are trained to perform particular tasks, so their outputs are what matter. But a system's purpose does not necessarily determine the scope of its scientific study.

Organisms have been shaped by evolution, with reproductive success playing a central role in natural selection. Biology, however, is not restricted to explaining reproduction. It also studies biological structures and processes whose functions may be unknown or only partially understood.

Likewise, a neural network's training objective need not determine everything worth investigating about its internal organization.

## What inspection tools contribute

Mech interp is still a relatively young field. Many aspects of neural network computation remain poorly understood, including which internal structures are useful units of analysis and how those structures should be described.

In this situation, a common and useful kind of work starts from an assumption about how a model might organize information, and builds a tool for inspecting the model under that assumption. The tool then makes certain structures visible, and those structures become things that can be studied further.

Sparse autoencoders (SAEs) provide a useful example. An SAE is built on several assumptions: that meaningful features correspond to directions in activation space, that a model can represent more features than it has dimensions, and that only a few features are active for any given input. Given these assumptions, an SAE decomposes activations into a large set of features that researchers can inspect one by one.

What the SAE does not decide in advance is which features will appear. In that sense it is open-ended. It can surface structures that no one had thought to look for, and those structures can then suggest specific hypotheses about how the model processes information.

A common reaction to SAE features is "that's not causal." It is true that a feature activating in response to a particular concept does not necessarily play a role in producing the model's output. But the contribution of such work is not a causal claim. It is closer to this: under a stated set of assumptions, this tool reveals this structure in the model. That claim can be examined on its own terms. Are the assumptions reasonable? Is the tool reliable? Does the structure hold up across models, datasets, and alternative methods?

Science has often worked this way. New instruments, such as the microscope, made structures visible before anyone could explain what those structures did. The instrument was valuable because it opened up questions, not because it answered them.

## Two kinds of causal questions

The meaning of "causal" also deserves some attention. In mech interp, asking whether a feature is causal often means asking whether intervening on it changes the model's final output. This is one kind of causal question, but not the only one.

For example, suppose an SAE feature consistently activates when a model processes a certain kind of input. Researchers could investigate which properties of the input cause the activation, how earlier layers contribute to it, or how the representation develops during computation. These are causal questions about internal processes. Understanding how a representation arises can be valuable even before its downstream role has been established.

A model contains many causal relationships between inputs, intermediate states, and later computations. Studying these relationships does not always require tracing their effects all the way to the final output. So a lack of demonstrated output-level causality does not imply an absence of causal knowledge.

## Steering a model is not explaining it

Causal methods serve two purposes: explaining a model and controlling it. Control is especially relevant to AI safety, where researchers may want to steer model behavior, edit particular capabilities, or reduce undesirable responses. Finding an internal intervention that reliably produces a desired effect can be practically valuable.

However, successful control does not necessarily imply a detailed understanding of the underlying mechanism.

Medicine offers a familiar example. Aspirin was widely used to relieve pain and fever for decades before its biological mechanism was understood. The treatment worked, and the evidence that it worked was real, but that evidence did not explain why.

A similar distinction applies to neural networks. Suppose a steering vector reliably increases the likelihood that a language model produces truthful answers. This establishes a useful relationship between an intervention and a behavioral change. But it does not, by itself, explain how the model represents truth, how it evaluates factual claims, or how the relevant computations are organized. The intervention provides causal knowledge, but that knowledge may be limited to the relationship between a particular modification and its observed effect.

The ability to intervene successfully and the depth of mechanistic understanding should not be treated as the same thing.

## Say more than "not causal"

There is a difference between saying that a result does not establish a causal mechanism and saying that it does not advance our understanding of a model. The first statement may be correct without implying the second.

Descriptive work and causal testing often inform each other. A descriptive finding can motivate a causal hypothesis. A causal experiment can reveal an unexpected internal pattern, or show that an earlier interpretation was mistaken. Scientific progress does not have to follow a single sequence from observation to validation. Discovery and explanation can develop together.

The appropriate question for evaluating a piece of research is therefore not simply whether it is causal, but **what it claims to teach us about the model, and whether the evidence supports that claim.**
