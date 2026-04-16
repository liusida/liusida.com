## **0. TL;DR**

Rather than treating System 1 and System 2 as distinct cognitive systems, I argue that “System 2” describes a behavioral profile associated with early-stage use of structured mental tools. I suggest this reframing may be useful for thinking about how reasoning-like behaviors emerge in language models during training.

## **1. The Classic Two-System View**

Human cognition is complex, layered, and difficult to observe directly. To make sense of this complexity, psychologists have proposed simplified models that capture recurring patterns in how minds behave. One of the most influential of these is the distinction between **System 1** and **System 2**, popularized by Daniel Kahneman in *[Thinking, Fast and Slow](https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow)*.

In this framework, **System 1** refers to cognitive processes that are fast, automatic, and intuitive. These include perception, pattern recognition, emotional responses, and well-practiced skills. System 1 operates with little conscious effort and often outside awareness.

**System 2**, by contrast, refers to processes that are slower, deliberate, and effortful. It is associated with conscious reasoning, rule-following, mental computation, and self-control. Tasks such as mental arithmetic, logical checking, and overriding an initial impulse are typically classified as System 2 activities.

Classic demonstrations support this distinction. In the Stroop task[1](#c6ed2955-a7dd-4c22-8fa7-c25c90f6082b), reading a word happens automatically while naming the ink color requires effortful control. In the bat-and-ball problem[2](#c0dbb351-99d0-4c33-8d02-48be36f121b6), an intuitive answer appears quickly, but careful reasoning is required to reach the correct one. Across many such cases, the model captures a real and useful regularity: some cognition feels fast and effortless, while other cognition feels slow and demanding.

Importantly, this model is not meant to describe the full computational structure of the mind. It is an abstraction — a way of grouping observable properties of behavior and experience. Its usefulness lies in description, not in claiming that the mind literally contains two neatly separated machines.

## **2. A Friction in the Story: When Automaticity Changes Sides**

Because System 1 and System 2 are defined by properties such as speed, effort, and control, the model implicitly assumes that these properties are relatively stable. But this assumption becomes less clear once learning and training are taken seriously.

Consider again the Stroop task. In its canonical form, reading is fast and automatic, while naming the ink color is slow and effortful. This cleanly maps reading to System 1 and color naming to System 2.

But with practice, performance changes. Reaction times improve, errors decrease, and the subjective feeling of effort diminishes. The task does not become effortless overnight, but the boundary between automatic and controlled processing clearly shifts.

Now consider a more extreme case. Imagine a person who can barely read but has spent years naming colors for a living. For this person, color naming is fast, fluent, and automatic, while reading remains slow and demanding.

If System 1 and System 2 are defined by automaticity and effort, then in this case color naming fits System 1 better than reading. If, on the other hand, reading must always be classified as System 1 regardless of experience, then the model stops tracking its own defining features.

This creates a friction. The distinction between System 1 and System 2 appears to depend not only on the type of task, but on how that task is solved.

## **3. How System 2 Is Born: Thinking With Tools**

The distinction between System 1 and System 2 is often presented as if two cognitive systems are simply “there” from the start. But a more plausible story is developmental.

A mind begins with many fast, intuitive processes: perception, association, pattern recognition, and learned habits. These processes correspond well to what we call System 1. They are adaptive, efficient, and largely opaque to introspection.

At some point, however, the mind encounters **mental tools**. These include symbols, written language, number systems, diagrams, logical rules, and conceptual frameworks. Most of these tools are not invented by the individual; they are cultural artifacts accumulated over long periods and learned through instruction and practice.

Crucially, mental tools are not just aids for expressing thought. They perform computation themselves. They provide structured representations and rule-governed transformations that can be relied upon instead of being continuously simulated by neural processes alone. Written arithmetic, for example, computes relationships that would otherwise have to be maintained internally. Diagrams encode constraints. Formal rules enforce consistency.

When a mind begins to use such a tool, cognition becomes coupled to an explicit computational structure. This coupling enables more complex reasoning, but it also introduces costs. The mind must coordinate perception, memory, attention, and action with the tool’s structure. This coordination is slow, effortful, and fragile—especially early on.

This subjective profile is what we label **System 2**.

On this view, System 2 is not a fundamentally separate cognitive engine. It is a mode of cognition that emerges when intuitive processes operate through unfamiliar representational and computational structures. The effort is real, but it reflects learning and coordination costs, not the operation of a different cognitive engine.

The System 1 / System 2 model remains useful here—not as a map of internal architecture, but as a description of how thinking feels and behaves at different stages of tool use.

## **4. How System 2 Becomes Less Effortful**

With practice, skills internalize, and the relationship between cognition and mental tools changes.

New representations stabilize. Operations reorganize. Intermediate steps are fused or bypassed entirely. What once required careful, explicit coordination becomes fast and automatic. The same reasoning process that initially felt slow and effortful now feels intuitive.

Nothing fundamental has switched off. The underlying computational machinery may be just as complex as before. What changes is the structure of computation and representation itself. New abstractions reorganize how problems are solved, and what we experience as fluency emerges as a consequence of that reorganization.

As a result, the boundary between System 1 and System 2 shifts. What was once a System 2 activity becomes indistinguishable from System 1 behavior—not because a system has been deactivated, but because the structure of the computation has changed.

The process also runs in reverse. Intuitive judgments can be slowed down, externalized, and inspected using tools such as writing, diagrams, or formal reasoning. In doing so, fast intuition is transformed into deliberate thought. System 1 becomes System 2 when cognition is re-coupled to explicit structure.

From this perspective, System 1 and System 2 are best understood as descriptive categories. They capture real regularities in speed, effort, and control, but those regularities emerge from how cognition is structured, trained, and coupled to tools.

## **5. Why I Am Thinking About System 2 This Way**

The motivation for this reframing does not come primarily from psychology. It comes from looking closely at neural network training.

In recent years, large language models have shown increasingly complex behaviors: multi-step reasoning, tool use, self-correction, and abstraction. This has led many people to ask where such abilities “come from,” and whether they require something fundamentally new. When framed in human terms, these questions are often translated into the language of System 1 and System 2. 

That is why I use System 2 as a proxy. Not because I believe there is literally a System 2 module waiting to be discovered in either brains or models, but because the concept captures a familiar cluster of behaviors: effortful thinking, explicit structure, and methodical problem-solving. By examining how these behaviors emerge through training—rather than assuming they require a separate system—we may get closer to understanding when and why reasoning appears at all.

On this view, reasoning is not a privileged faculty reserved for human minds. It is a set of **mental tools**—invented by humans over time for structured computation and representation. Any system that can learn to use such tools, apply them to novel problems, and refine them through practice should be treated as a system that can reason.

The hope, then, is not to find a magical moment when System 2 “turns on,” but to understand the conditions under which different structured mental tools are learned, used, and eventually become fluent.