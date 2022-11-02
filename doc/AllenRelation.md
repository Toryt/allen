# Allen Relation

When working with intervals, we often want to express constraints (invariants) that limit acceptable combinations.
Expressing this correctly proves difficult in practice. Falling back to working with isolated start and end points, and
reasoning about their relations, in practice proves to be even much more difficult and error-prone.

This problem was tackled in 1983 by James Allen (<a href="https://dl.acm.org/doi/pdf/10.1145/182.358434"><cite>Allen,
James F. &quot;Maintaining knowledge about temporal intervals&quot;; Communications of the ACM 26(11) pages 832-843;
November 1983</cite></a>).

Good synopses of this theory are [Wikipedia](https://en.wikipedia.org/wiki/Allen%27s_interval_algebra), and
<a href="https://www.ics.uci.edu/~alspaugh/cls/shr/allen.html"><cite>Thomas A. Alspaugh &quot;Allen's interval
algebra&quot;</cite></a>, on which the conventions used here are based.

## Quick overview

We find that there are 13 _basic relations_ possible between definite intervals:

- `I1` `PRECEDES` `I2` (`p`)

  ![precedes](AllenRelation-precedes.png)

- `I1` `MEETS` `I2` (`m`)

  ![meets](AllenRelation-meets.png)

- `I1` `OVERLAPS` `I2` (`o`)

  ![in](AllenRelation-overlaps.png)

- `I1` is `FINISHED_BY` `I2` (`F`)

  ![is finished by](AllenRelation-finishedBy.png)

- `I1` `CONTAINS` `I2` (`c`)

  ![contains](AllenRelation-contains.png)

- `I1` `STARTS` `I2` (`s`)

  ![starts](AllenRelation-starts.png)

- `I1` `EQUALS` `I2` (`e`)

  ![equals](AllenRelation-equals.png)

- `I1` is `STARTED_BY` `I2` (`S`)

  ![is started by](AllenRelation-startedBy.png)

- `I1` is `DURING` `I2` (`d`)

  ![is during](AllenRelation-during.png)

- `I1` `FINISHES` `I2` (`f`)

  ![finishes](AllenRelation-finishes.png)

- `I1` is `OVERLAPPED_BY` `I2` (`O`)

  ![is overlapped by](AllenRelation-overlappedBy.png)

- `I1` is `MET_BY` `I2` (`M`)

  ![is met by](AllenRelation-metBy.png)

- `I1` is `PRECEDED_BY` `I2` (`P`)

  ![is preceded by](AllenRelation-precededBy.png)

These basic relations can be compared to the relations `<`, `=`, and `>` between 2 points.

When reasoning about the relationship between intervals however, like when comparing points, we also often employ
_indeterminate_ relations, such as `I1 (pm) I2` (`I1` `PRECEDES` `I2`, or `MEETS` `I2`). This is comparable to reasoning
with `≤`, `≥`, and `≠` with points.

For intervals, given 13 basic relations, we get 8192 (= 2<sup>13</sup>) possible _general relations_. This includes the
`FULL` relation (comparable to `< ⋁ = ⋁ >` with points), which expresses the maximum uncertainty about the relation
between two intervals. `FULL` means you are from Barcelona. The `EMPTY` relation is not a true relation. It does not
express a relational condition between two intervals. It is needed for consistency with some algebraic operations on
relations.

## Interval constraints

## Reasoning with unknown but constrained start and end point

## Inference

**Be aware that, in general, inference over intervals, also using Allen relations, is NP-complete.** This means that the
time the execution of algorithms will take, is at least difficult to ascertain, and quickly completely impractical
(i.e., with realistic parameters the algorithm would take longer than the universe exists — no kidding).

There are subsets of the Allen relations for which there exist algorithms that perform much better. These issues are not
implemented here.
