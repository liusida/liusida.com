Recently I have become curious about the residual streams of LLMs.

The residual stream is like the backbone of an LLM. At the very beginning, every token is converted into an embedding, which is really a vector. After optionally adding other information, the vector is passed forward through the Transformer blocks and transformed along the way: first layer 0, then layer 1, and so on, until it reaches the final layer. The final vector then passes through some post-processing steps, and the unembedding converts it into logits. The logits are used to pick the next token. Then the next token goes through the entire process all over again, presumably with a vector of the same shape but different values.

Researchers call these vectors "activations." If we think about them geometrically, each activation is an arrow, with both length and direction. In practice, however, we often think mostly about direction, because there are many normalization modules in the system, and activations usually pass through normalization before being consumed by other submodules. My main intuition is that the arrows we care about point in certain directions in a high-dimensional space. These directions keep changing through the residual stream until they finally settle into the output directions of the final layer.

But what information is stored in these directions? From a macroscopic view, activation vectors are linear combinations of many "primitive" directions. We can imagine this in 2D geometry: a vector can be decomposed into some amount of the x direction plus some amount of the y direction. The x and y directions carry different meanings. What we hope to recover are both the meanings and the amounts contained in an activation vector.

## Sparse Autoencoders

There is a technique called the Sparse Autoencoder (SAE), which people use to recover these directions. Researchers train different SAE models for different layers of different language models. For example, many people have trained SAE models for all the layers of GPT-2 small. GPT-2 small has become a standard testbed for LLM research.

[Neuronpedia](https://www.neuronpedia.org/) aggregates many SAE models and provides annotations for many of them. This is useful because SAE models are typically released without annotations: the trainer gives you the directions and amounts, but not the meanings of those directions. With Neuronpedia, we can peek at the actual meanings, usually through annotations made automatically by LLMs.

However, if we want to inspect new sentences, Neuronpedia cannot really support unlimited requests, because each LLM forward pass takes computation. This is where our [neuronpedia-local](https://github.com/liusida/neuronpedia-local) project comes in. We built a system that can run the LLM forward pass and SAE decomposition locally. Only after we get the IDs of the active features do we send API requests to Neuronpedia for annotations.

By doing this, we save a lot of burden from Neuronpedia's server. Every user runs the model locally and only requests the real gold: the meanings, or annotations, of the features.

## A Local Prompt Explorer

Here is a picture of our system:

<img class="post-wide-image" src="https://github.com/liusida/neuronpedia-local/raw/main/images/screenshot.png" alt="Screenshot of neuronpedia-local">

We currently support GPT-2 small, and we can choose which layer to inspect. In the screenshot, we are inspecting layer 7, which is a relatively deep layer among GPT-2 small's 12 layers. After entering the prompt we want to inspect, we get token cards below. Each token position has its own token card. Right now we show the top 5 features for each token, and the meanings come from Neuronpedia. Everything is handled in the background.

Neuronpedia also provides an API for remotely running LLM and SAE models. We can switch to that mode using the dropdown in the top right. But that mode is slower and puts more burden on Neuronpedia's server, so we only use it to confirm the integrity of the local run.

We can read the meaning of each feature in the token cards. Many of the descriptions are lengthy. I do not really like such long descriptions, but that is what Neuronpedia currently offers. So we added a knob to make the token cards wider, allowing us to see more text at once.

We also make some features semi-transparent according to their feature activations, which are roughly like importance scores. This reduces the overwhelming feeling of seeing loads and loads of text at once.

## Why This View

Our point of view is different from Neuronpedia's. Instead of focusing on individual features and their top examples, we focus on how to inspect activation vectors in real situations. We would like to see explanations of counterexamples and ask "what if" questions. That helps us understand the meanings of activations more deeply.

I encourage you to try [neuronpedia-local](https://github.com/liusida/neuronpedia-local), the unofficial local prompt explorer. All you need is a decent local machine. Clone the repo, run `uv sync`, start the server, and then access the user interface in your browser.

We currently only support GPT-2 small, but if you want other models to be supported, such as Qwen3.5 or Gemma 2, leave a message. Or you can do it yourself with vibe coding. We intentionally keep the project as pure script code, with no compilation needed, so it should be easy to modify at will.

Hope this fun project helps.
