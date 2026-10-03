Sparse autoencoders (SAEs) usually have a bias for the residual-stream input.
Geometrically, this bias acts like a new origin. In many training setups, it is
initialized from the first batch—for example, with a geometric median—and then
learned with the rest of the model, although it usually moves very little.

The reason is easy to picture. Imagine looking at a cloud of points from far
away. The rays from you to the points are nearly parallel, so their directions
are difficult to distinguish. If you move to the middle of the cloud, the same
points spread around you. Their directions become easier to separate. This can
help when an SAE reconstructs the data with a sparse set of features.

But the transformer itself does not use that SAE origin. A downstream layer
applies an affine map to the residual stream:

<div class="equation">\[
y = Wx + b.
\]</div>

Here, $x$ is a vector from the model's original zero and is multiplied
directly by $W$. The downstream bias $b$ is added only afterward. There is
no step that first recentres $x$ around the SAE bias. This raises a simple
question: when we interpret a direction in the residual stream, should we
measure it from the model origin or from the SAE bias?

## A small weekday experiment

We tested this question with **Qwen 3.5 9B Base**, the public **Qwen-Scope SAE**,
and residual-stream activations from **layer 28**.

We wrote 10 football sentence templates and 10 quantum-physics templates. Each
template was rendered once with every weekday, giving 140 sentences in total
(<a href="#appendix-a-sentence-templates" onclick="document.getElementById('appendix-a-sentence-templates').open = true">Appendix A</a>).
The topic appeared before the weekday so that it could affect the weekday token
in this causal language model. We then saved the layer-28 activation at the
weekday token.

For each weekday, we averaged its 20 activation vectors. This gave one weekday
centroid. We defined a weekday direction in two ways:

1. From the model origin: normalize the weekday centroid.
2. From the SAE origin: subtract the SAE decoder bias, then normalize the
   shifted weekday centroid.

These definitions let us compare the same data from two different origins.

## The SAE bias is not the center of these examples

<figure>
  <img src="/images/posts/do-we-really-need-the-bias-in-sae-models/01_origin_bias_centroid_triangle.png" alt="Triangle connecting the model origin, SAE bias, and weekday-token centroid">
  <figcaption>Figure 1. The model origin, SAE bias, and centroid of the weekday-token activations form a triangle rather than lying on one line.</figcaption>
</figure>

The centroid of all 140 weekday tokens is **149.81** units from the model
origin. It is **122.78** units from the SAE bias. The SAE bias itself is
**92.07** units from the model origin.

The SAE bias is closer to this centroid than the model origin is, but only by
about 18%, and the remaining distance is still large. The bias is also not on
the straight line from zero to the weekday centroid. This is not surprising:
the SAE bias reflects a broad activation distribution, not this small subset
of weekday tokens.

## The weekday directions change, but not dramatically

<figure>
  <img src="/images/posts/do-we-really-need-the-bias-in-sae-models/02_weekday_direction_cosines.png" alt="Cosine similarities between weekday directions measured from the model origin and SAE origin">
  <figcaption>Figure 2. Pairwise cosine similarities between weekday directions measured from the two origins.</figcaption>
</figure>

From the model origin, the mean cosine between different weekday directions is
**0.954**. From the SAE bias, it is **0.932**. The SAE bias therefore spreads
the directions apart a little, which agrees with the usual motivation for
recentering.

However, both cosine values are still very high. Under either origin, the
seven weekday directions form a narrow cone with a large shared component.
The recentering changes the geometry, but it does not turn the weekdays into
seven cleanly separated axes.

## The raw-origin ranking is more stable

The cosine heatmap only compares the directions themselves. It does not tell
us whether those directions order the actual data points in the same way. To
test that, we kept the 20 sentence templates aligned across weekdays. For each
weekday, we projected its 20 examples onto that weekday's direction and ranked
them from strongest to weakest. We then compared the seven rankings.

<figure>
  <img src="/images/posts/do-we-really-need-the-bias-in-sae-models/03_projection_rank_consistency.png" alt="Aligned projection ranks and pairwise Spearman correlations for weekday directions measured from two origins">
  <figcaption>Figure 3. Aligned projection ranks and their pairwise correlations. Rankings measured from the model origin are more consistent across weekdays.</figcaption>
</figure>

The templates are ordered from strongest to weakest according to their shared
ideal rank. The left column is an ideal reference: all seven weekday directions
reproduce that ordering, and every pairwise correlation is 1. From the model
origin, the same sentence templates tend to receive similar ranks for every
weekday direction, producing nearly the same pattern. From the SAE bias, the
ordering is less consistent and more local rankings change.

The Spearman correlations in the bottom heatmaps make this precise. Their
off-diagonal mean is **0.951** from the model origin and **0.893** from the SAE
bias. In a stricter comparison—ranking the same 140 vectors under every
direction—the gap is larger: **0.888** from the model origin versus **0.740**
from the SAE bias.

In other words, raw-origin directions recover a more consistent notion of
which examples are strong and weak. SAE recentering makes the directions more
angularly distinct, but also makes the ordering of examples more dependent on
the chosen direction.

Subtracting the bias is not, by itself, what changes a ranking: for one fixed
direction, it only subtracts the same constant from every sample. The ranking
changes because recentering also rotates the seven centroid directions. Those
more separated directions respond differently to variation among the sentence
templates.

## So, should we remove the bias?

The bias may create a trade-off. Moving the SAE origin closer to the activation
cloud spreads nearby directions apart and may make sparse reconstruction
easier. At the same time, it rotates those directions away from the model
origin. In this experiment, that change makes the original ranking of sentence
contexts less stable across weekday directions.

We have only compared two origins, so this experiment does not yet show that
the trade-off is smooth or causal. Still, it suggests that optimizing the
geometry for SAE reconstruction may come at the cost of preserving the
representational pattern seen from the transformer's own origin.

How should we balance easier reconstruction against faithful preservation of
the geometry that the transformer actually uses? **Do SAE models really need
the bias?**

<details class="post-appendix" id="appendix-a-sentence-templates">
<summary>Appendix A: Sentence templates</summary>

Each template was rendered with Monday through Sunday, producing 140 sentences
in total. In every sentence, the topic appears before the weekday token.

### Football

1. The football coach rehearsed a high press and quick counterattacks during [weekday]'s practice session.
2. The underdog football team scored from a corner on [weekday] and protected its lead until the final whistle.
3. Heavy rain soaked the football pitch before [weekday], forcing both teams to favor long balls over short passes.
4. The football analyst reviewed the goalkeeper's penalty technique on [weekday] during the live broadcast.
5. Thousands of football supporters filled the stadium on [weekday] as their club chased a place in the final.
6. The youth football midfielder created three goals on [weekday] with a series of precise through-balls.
7. The football striker's ankle injury worsened on [weekday] and changed the manager's substitution plan.
8. The rival football clubs entered their tense derby on [weekday] with disciplined defenses and cautious tactics.
9. The football statistician compared expected goals with the scoreline on [weekday] after reviewing every shot.
10. The football captain praised the squad's fitness on [weekday] following a demanding away victory.

### Quantum physics

1. The quantum physics group calibrated detectors for an entanglement experiment during [weekday]'s laboratory session.
2. The photon researchers measured quantum interference fringes on [weekday] using a stabilized optical apparatus.
3. Noise in the quantum coherence apparatus increased on [weekday] and forced the physicists to repeat their measurements.
4. The quantum physics lecturer discussed measurement and state collapse on [weekday] with a class of graduate students.
5. The quantum theorists debated decoherence on [weekday] while deriving the emergence of the classical limit.
6. The trapped-ion quantum experiment maintained a superposition on [weekday] for longer than the researchers expected.
7. The superconducting-qubit physicists encountered a cryogenic failure on [weekday] and postponed their gate test.
8. Two entangled quantum particles violated a Bell inequality on [weekday] in a carefully controlled experiment.
9. The quantum simulation researcher compared predicted amplitudes with observations on [weekday] after processing the data.
10. The quantum computing team measured improved gate fidelity on [weekday] following a successful calibration run.

</details>
