<!---
Copyright © 2022 by Jan Dockx

Licensed under the Apache License, Version 2.0 (the “License”);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an “AS IS” BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Allen Relations

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

Allen finds that there are 13 _basic relations_ possible between definite intervals:

| Basic relation             | `(.)` | Illustration                                        | Definition (mentioned properties must be definite, and …)   |
| -------------------------- | ----- | --------------------------------------------------- | ----------------------------------------------------------- |
| `i1` precedes `i2`         | `(p)` | ![precedes](AllenRelation-precedes.png)             | `i1.end < i2.start`                                         |
| `i1` meets `i2`            | `(m)` | ![meets](AllenRelation-meets.png)                   | `i1.end = i2.start`                                         |
| `i1` overlaps `i2`         | `(o)` | ![overlaps](AllenRelation-overlaps.png)             | `i1.start < i2.start ∧ i2.start < i1.end ∧ i1.end < i2.end` |
| `i1` is finished by `i2`   | `(F)` | ![is finished by](AllenRelation-finishedBy.png)     | `i1.start < i2.start ∧ i1.end = i2.end`                     |
| `i1` contains `i2`         | `(D)` | ![contains](AllenRelation-contains.png)             | `i1.start < i2.start ∧ i2.end < i1.end`                     |
| `i1` starts `i2`           | `(s)` | ![starts](AllenRelation-starts.png)                 | `i1.start = i2.start ∧ i1.end < i2.end`                     |
| `i1` equals `i2`           | `(e)` | ![equals](AllenRelation-equals.png)                 | `i1.start = i2.start ∧ i1.end = i2.end`                     |
| `i1` is started by `i2`    | `(S)` | ![is started by](AllenRelation-startedBy.png)       | `i2.start = i1.start ∧ i2.end < i1.end`                     |
| `i1` during `i2`           | `(d)` | ![during](AllenRelation-during.png)                 | `i2.start < i1.start ∧ i1.end < i2.end`                     |
| `i1` finishes `i2`         | `(f)` | ![finishes](AllenRelation-finishes.png)             | `i2.start < i1.start ∧ i1.end = i2.end`                     |
| `i1` is overlapped by `i2` | `(O)` | ![is overlapped by](AllenRelation-overlappedBy.png) | `i2.start < i1.start ∧ i1.start < i2.end ∧ i2.end < i1.end` |
| `i1` is met by `i2`        | `(M)` | ![is met by](AllenRelation-metBy.png)               | `i2.end = i1.start`                                         |
| `i1` is preceded by `i2`   | `(P)` | ![is preceded by](AllenRelation-precededBy.png)     | `i2.end < i1.start`                                         |

These basic relations can be compared to the relations `<`, `=`, and `>` between 2 points.

When reasoning about the relationship between intervals however, like when comparing points, we also often employ
_indeterminate_ relations, such as `I1 (pm) I2` (`I1` `PRECEDES` `I2`, or `MEETS` `I2`). This is comparable to reasoning
with `≤`, `≥`, and `≠` with points.

For intervals, given 13 basic relations, we get 8192 (= 2<sup>13</sup>) possible _general relations_. The 13 basic
relations are an _orthogonal basis_ for all possible general relations. This includes the `FULL` relation (comparable to
`< ⋁ = ⋁ >` with points), which expresses the maximum uncertainty about the relation between two intervals. `FULL` means
you are from Barcelona. The `EMPTY` relation is not a true relation. It does not express a relational condition between
two intervals. It is needed for consistency with some algebraic operations on relations.

## Interval constraints

<div style="background-color: red; color: yellow;"><strong>MUDO: port remaining text</strong></div>

## Reasoning with unknown but constrained start and end point

<div style="background-color: red; color: yellow;"><strong>MUDO: port remaining text</strong></div>

## Points as intervals

“Points”, including the `start` and `end` of intervals, are never realy points. Due to Heisenberg's uncertainty
principle, we know that we fundamentally cannot be more precise, e.g., for time, than the
[Planck duration](https://en.wikipedia.org/wiki/Planck_units#Planck_time) (~ 5.39.10<sup>−44</sup> s). In practice, any
measurement, any clock, has a limited precision. The “points” we are using are actually also intervals. E.g., given an
interval with ms precision:

```ts
const i = {
  start: '2022-10-29T16:03:53.263Z',
  end: '2022-10-29T16:04:20.870Z'
}
```

`start` actually represents the interval `is = [2022-10-29T16:03:53.263Z, 2022-10-29T16:03:53.264Z[`, and `end` actually
represents the interval `ie = [2022-10-29T16:04:20.870Z, 2022-10-29T16:04:20.871Z[`. The interval `i` starts somewhere
in `is`, and ends somewhere in `ie`.

With this reasoning, when we compare isolated “points” `p1` and `p2`, we are actually comparing definite intervals,
_represented by a point_, too. The Allen relation between the point representations will be a basic relation, because
`p1` and `p2` are _definite_ intervals. When we limit ourselves to point representations with a defined precision, the
same for `p1` and `p2`, we know both point-intervals have the same length or duration, and a shorter length is
impossible. This limits the possibilities further.

| `p1 (.) p2` | Illustration                                        | Definition (mentioned properties must be definite, and …)   | Point relation |
| ----------- | --------------------------------------------------- | ----------------------------------------------------------- | -------------- |
| `p1 (p) p2` | ![precedes](AllenRelation-precedes.png)             | `p1.end < p2.start`                                         | `p1 < p2`      |
| `p1 (m) p2` | ![meets](AllenRelation-meets.png)                   | `p1.end = p2.start`                                         | `p1 < p2`      |
| `p1 (o) p2` | ![overlaps](AllenRelation-overlaps.png)             | `p1.start < p2.start ∧ p2.start < p1.end ∧ p1.end < p2.end` | ❌ 3.          |
| `p1 (F) p2` | ![is finished by](AllenRelation-finishedBy.png)     | `p1.start < p2.start ∧ p1.end = p2.end`                     | ❌ 1. 2.       |
| `p1 (D) p2` | ![contains](AllenRelation-contains.png)             | `p1.start < p2.start ∧ p2.end < p1.end`                     | ❌ 2.          |
| `p1 (s) p2` | ![starts](AllenRelation-starts.png)                 | `p1.start = p2.start ∧ p1.end < p2.end`                     | ❌ 1.          |
| `p1 (e) p2` | ![equals](AllenRelation-equals.png)                 | `p1.start = p2.start ∧ p1.end = p2.end`                     | `p1 = p2`      |
| `p1 (S) p2` | ![is started by](AllenRelation-startedBy.png)       | `p2.start = p1.start ∧ p2.end < p1.end`                     | ❌ 1.          |
| `p1 (d) p2` | ![during](AllenRelation-during.png)                 | `p2.start < p1.start ∧ p1.end < p2.end`                     | ❌ 2.          |
| `p1 (f) p2` | ![finishes](AllenRelation-finishes.png)             | `p2.start < p1.start ∧ p1.end = p2.end`                     | ❌ 1. 2.       |
| `p1 (O) p2` | ![is overlapped by](AllenRelation-overlappedBy.png) | `p2.start < p1.start ∧ p1.start < p2.end ∧ p2.end < p1.end` | ❌ 3.          |
| `p1 (M) p2` | ![is met by](AllenRelation-metBy.png)               | `p2.end = p1.start`                                         | `p2 < p1`      |
| `p1 (P) p2` | ![is preceded by](AllenRelation-precededBy.png)     | `p2.end < p1.start`                                         | `p2 < p1`      |

1. When either `start` or `end` of `p1` and `p2` should be equal according to the definition (`(F)`, `(s)`, `(e)`,
   ` (S)`, `(f)`), the other end will be equal too, since `p1` and `p2` as intervals have equal length. This is only
   satisfied by `(e)`.

2. If either `start` or `end` of `p1` and `p2` should not be equal according to the definition, but either relate as `<`
   or `>` (`(p)`, `(o)`, `(F)`, `(D)`, `(s)`, `(S)`, `(d)`, `(f)`, `(O)`, `(P)`), the other ends will have the same
   relation, since `p1` and `p2` as intervals have equal length. `(o)` and `(O)` satisfy this condition. `(p)` and `(P)`
   avoid the condition by not expressing the relation of the other end. The definitions of `(F)`, `(D)`, `(s)`, `(S)`,
   `(d)`, or `(f)`, cannot be satisfied for intervals of equal lenght.

3. If `p1.start < p2.start`, `p1.end = p1.start + pl ≤ p2.start`, since `p1` has the smallest possible length `pl > 0`.
   Adding the smallest possible length to `p1.start` can at most make it equal to `p2.start`, but can cannot make it
   larger. If `p2.start < p1. start`, `p2.end = p2.start + pl ≤ p1. start`, since `p2` has the smallest possible length
   `pl > 0`. Adding the smallest possible length to `p2.start` can at most make it equal to `p1.start`, but can cannot
   make it larger. (`(p)`, `(o)`, `(F)`, `(D)`, `(s)`, `(S)`, `(d)`, `(f)`, `(O)`, `(P)`) have this relation between
   their starting points. (`(p)`, `(F)`, `(D)`, `(s)`, `(S)`, `(d)`, `(f)`, `(P)`) avoid the condition by not expressing
   the cross relation with the `end` of the other point. The definitions of `(o)` and `(O)` cannot be satisfied for
   intervals of minimum length.

### Equal point reprsentations (=)

When we interpret the point representation `rp` as the interval `i` such that `p ∈ i`, two equal point representations
`rp1 = rp2` do not necessarily represent the same interval. `rp1 = rp2`, with `rp1` representing `i1` and `rp2`
representing `i2`, then means

```
  (rp1 ∈ i1) ∧ (rp2 ∈ = i2) ∧ (|i1| = pl) ∧ (|i2| = pl) ∧ (rp1 = rp2)
⇔ (rp1 = rp2 ∈ i1) ∧ (rp1 = rp2 ∈ i2)
⇔ (rp1 = rp2 ∈ i1 ∩ i2)
⇔ (i1 ∩ i2 ≠ ∅)
```

The relationship where 2 half-open intervals have at least 1 common point is `i1 (oFDseSdfO) i2`. Since `(F)`, `(D)`,
`(s)`, `(S)`, `(d)`, and `(f)`, and `(o)` and `(O)` cannot be satisfied with point-intervals, only `i1 (e) i2` remains.

### Unequal point representations (<, >)

When a point interpretation is smaller than the other, e.g., `rp1 < rp2`, with `rp1` representing `i1` and `rp2`
representing `i2`, this means the smallest possible element of `i1` must be smaller than the largest possible element of
`i2`. When we are working with right half-open intervals, with a fixed minimum length `pl`, this means:

```
  (rp1 ∈ i1) ∧ (rp2 ∈ = i2) ∧ (|i1| = pl) ∧ (|i2| = pl) ∧ (rp1 < rp2)
⇔ (rp1 ∈ [i1.start, i1.start + pl[) ∧ (rp2 ∈ [i2.start, i2.start + pl[) ∧ (rp1 < rp2)  [A]
⇔ i1.start < i2.start + pl = i2.end
```

The relationship where `i1.start < i2.end` is possible is `i1 (pmoFDseSdfO) i2`. Barring definitions that cannot be
satisfied for point-intervals, this results in `i1 (pme) i2`. The symmetric case, for `rp2 < rp1`, results in
`i1 (eMP) i2`. `(e)` turns up here because the intervals `i1` and `i2` are not precisely known, and only knowing
`i1. start < i2.end` does not bar interval equality. For that `p1.start = p2.start ∧ p1.end = p2.end` has to be false in
all cases. If this was true, with `p1.start = p2.start = pstart` and `p1.end = p2.end = pstart + pl` (reductio ad
absurdum):

```
  [A]
⇔ (rp1 ∈ [pstart, pstart + pl[) ∧ (rp2 ∈ [pstart, pstart + pl[)
⇔ |rp1 - rp2| < pl
```

The point representations `rp1` and `rp2` have to be less than `pl` apart. That is impossible, since `pl` is the
smallest precision that can be expressed in the point representations. Finally, the resulting relations are
`i1 (pm) i2`, and `i1 (MP) i2` for the symmetric case.

### Indefinite points

When a point representation is indefinite, we do not know what interval it represents, but we do know that it represents
an interval of fixed minimal length `pl`. This means the above rules apply, and that the comparison of an indefinite
point representation with another, definite or indefinite point representation, must be `(pm)`, `(e)`, or `(MP)`. Since
we do not know where on the number line this interval is located, we cannot limit the relation more, and the result is
`(pmeMP)`.

## Comparing points with intervals

We can also compare point representations with regular intervals. Consider the `start` and `end` of intervals as point
representations, representing intervals of fixed minimum length `pl`. We then know, with right half-open intervals,
`i.start (s) i` and `i.end (M) i`. We can now compose the relationship of a point representation `p` with `i.start` and
`i.end` with these relations, to find the relation with `i`. `⊕` represents the composition operator.

| `p ⨀ i.P` | `p (.) i.P` | `p (.) i.start ⊕ i.start (s) i` | `p (.) i.end ⊕ i.end (M) i` |
| --------- | ----------- | ------------------------------- | --------------------------- |
| <         | `(pm)`      | `(pm)`                          | `(pmoFsedf)`                |
| =         | `(e)`       | `(s)`                           | `(M)`                       |
| >         | `(MP)`      | `(dfOMP)`                       | `(P)`                       |
| 🤷        | `(pmeMP)`   | `(pmsdfOMP)`                    | `(pmoFsedfMP)`              |

When then calculate the conjunction of the relationship between `p` and `i.start` with the relationship between `p` and
`i.end`. `p (.) i` is `(p (.) i.start ⊕ i.start (s) i) ∧ (p (.) i.end ⊕ i.end (M) i)`.

| `p ⨀ i.start` | `p (.) i.start` | `p ⨀ i.end` | `p (.) i.end` | `p (.) i`                   | conjunction |
| ------------- | --------------- | ----------- | ------------- | --------------------------- | ----------- |
| <             | `(pm)`          | <           | `(pm)`        | `(pm) ∧ (pmoFsedf)`         | `(pm)`      |
|               |                 | =           | `(e)`         | `(pm) ∧ (M)`                | `()`        |
|               |                 | >           | `(MP)`        | `(pm) ∧ (P)`                | `()`        |
|               |                 | 🤷          | `(pmeMP)`     | `(pm) ∧ (pmoFsedfMP)`       | `(pm)`      |
| =             | `(e)`           | <           | `(pm)`        | `(s) ∧ (pmoFsedf)`          | `(s)`       |
|               |                 | =           | `(e)`         | `(s) ∧ (M)`                 | `()`        |
|               |                 | >           | `(MP)`        | `(s) ∧ (P)`                 | `()`        |
|               |                 | 🤷          | `(pmeMP)`     | `(s) ∧ (pmoFsedfMP)`        | `(s)`       |
| >             | `(MP)`          | <           | `(pm)`        | `(dfOMP) ∧ (pmoFsedf)`      | `(df)`      |
|               |                 | =           | `(e)`         | `(dfOMP) ∧ (M)`             | `(M)`       |
|               |                 | >           | `(MP)`        | `(dfOMP) ∧ (P)`             | `(P)`       |
|               |                 | 🤷          | `(pmeMP)`     | `(dfOMP) ∧ (pmoFsedfMP)`    | `(dfMP)`    |
| 🤷            | `(pmeMP)`       | <           | `(pm)`        | `(pmsdfOMP) ∧ (pmoFsedf)`   | `(pmsdf)`   |
|               |                 | =           | `(e)`         | `(pmsdfOMP) ∧ (M)`          | `(M)`       |
|               |                 | >           | `(MP)`        | `(pmsdfOMP) ∧ (P)`          | `(P)`       |
|               |                 | 🤷          | `(pmeMP)`     | `(pmsdfOMP) ∧ (pmoFsedfMP)` | `(pmsdfMP)` |

We get a subalgebra with an orthogonal basis of 5 possible Allen relations as result, that correspond to the basic
relations we found for point interval relations:

|            | Point – interval relation | Allen relation |
| ---------- | ------------------------- | -------------- |
| before     | `(b)`                     | `(pm)`         |
| commences  | `(c)`                     | `(s)`          |
| in         | `(i)`                     | `(df)`         |
| terminates | `(t)`                     | `(M)`          |
| after      | `(a)`                     | `(P)`          |

Note the assymmetry. This is a consequence of our choice to work with right half-open intervals. With another choice,
the same reasoning applies, but we would find different basic relations.

Given 5 basic relations, we get 32 (= 2<sup>5</sup>) possible general relations between points and intervals. This
includes the EMPTY relation `()`, and a full relation, which is `(pmsdfMP)` for point – interval relations.

There are 8 actual relations that can exist between points and intervals:

|                                            | Point – interval relation | Allen relation |
| ------------------------------------------ | ------------------------- | -------------- |
| the 5 basic relations                      | `(b)`                     | `(pm)`         |
|                                            | `(c)`                     | `(s)`          |
|                                            | `(i)`                     | `(df)`         |
|                                            | `(t)`                     | `(M)`          |
|                                            | `(a)`                     | `(P)`          |
| relations with indefinite `start` or `end` | `(bci)`                   | `(pmsdf)`      |
|                                            | `(ita)`                   | `(dfMP)`       |
| the full relation                          | `(bcita)`                 | `(pmsdfMP)`    |

Note that `(o)`, `(F)`, `(D)`, `(e)`, `(S)`, and `(O)` can never appear in actual point — interval relations, in part
because of the fixed minimal lenght of points-as-intervals, in part because we choose to work with right half-open
intervals.

The following table gives a graphical overview of the 8 actual relations that are possible:

|     | `[start,` |     | `end[` |     | actual    |             |
| --- | --------- | --- | ------ | --- | --------- | ----------- |
| `p` |           |     |        |     | `(b)`     | `(pm)`      |
|     | `p`       |     |        |     | `(c)`     | `(s)`       |
|     |           | `p` |        |     | `(i)`     | `(df)`      |
|     |           |     | `p`    |     | `(t)`     | `(M)`       |
|     |           |     |        | `p` | `(a)`     | `(P)`       |
| 🤷  | 🤷        | 🤷  | 🤷     | 🤷  | `(bcita)` | `(pmsdfMP)` |

| `[🤷,` | `end[` |     | actual    |             |
| ------ | ------ | --- | --------- | ----------- |
| `p`    |        |     | `(bci)`   | `(pmsdf)`   |
|        | `p`    |     | `(t)`     | `(M)`       |
|        |        | `p` | `(a)`     | `(P)`       |
| 🤷     | 🤷     | 🤷  | `(bcita)` | `(pmsdfMP)` |

|     | `[start,` | `🤷[` | actual    |             |
| --- | --------- | ----- | --------- | ----------- |
| `p` |           |       | `(b)`     | `(pm)`      |
|     | `p`       |       | `(c)`     | `(s)`       |
|     |           | `p`   | `(ita)`   | `(dfMP)`    |
| 🤷  | 🤷        | 🤷    | `(bcita)` | `(pmsdfMP)` |

When comparing an interval with a point, instead of a point with an interval, the converse relationships apply for the
basic relations, as expected. This generates a separate algebra with a separate set of basic relations:

|                  | Point – interval relation | Allen relation |
| ---------------- | ------------------------- | -------------- |
| prior to         | `(A)`                     | `(p)`          |
| is terminated by | `(T)`                     | `(m)`          |
| encloses         | `(I)`                     | `(FD)`         |
| is commenced by  | `(C)`                     | `(S)`          |
| anterior to      | `(B)`                     | `(MP)`         |

The full relation for interval — point relations is `(pmFDSMP)`.

`(o)`, `(s)`, `(e)`, `(d)`, `(f)`, and `(O)` can never appear in actual interval — point relations.

There are 8 actual relations that can exist between intervals and point:

|                                            | Point – interval relation | Allen relation |
| ------------------------------------------ | ------------------------- | -------------- |
| the 5 basic relations                      | `(A)`                     | `(p)`          |
|                                            | `(T)`                     | `(m)`          |
|                                            | `(I)`                     | `(FD)`         |
|                                            | `(C)`                     | `(S)`          |
|                                            | `(B)`                     | `(MP)`         |
| relations with indefinite `start` or `end` | `(ATI)`                   | `(pmFD)`       |
|                                            | `(ICB)`                   | `(FDSMP)`      |
| the full relation                          | `(ATICB)`                 | `(pmFDSMP)`    |

The following table gives a graphical overview of the 8 actual relations that are possible:

|     | `[start,` |     | `end[` |     | actual    |             |
| --- | --------- | --- | ------ | --- | --------- | ----------- |
|     |           |     |        | `p` | `(A)`     | `(p)`       |
|     |           |     | `p`    |     | `(T)`     | `(m)`       |
|     |           | `p` |        |     | `(I)`     | `(FD)`      |
|     | `p`       |     |        |     | `(C)`     | `(S)`       |
| `p` |           |     |        |     | `(B)`     | `(MP)`      |
| 🤷  | 🤷        | 🤷  | 🤷     | 🤷  | `(ATICB)` | `(pmFDSMP)` |

| `[🤷,` | `end[` |     | actual    |             |
| ------ | ------ | --- | --------- | ----------- |
|        |        | `p` | `(A)`     | `(p)`       |
|        | `p`    |     | `(T)`     | `(m)`       |
| `p`    |        |     | `(ICB)`   | `(FDSMP)`   |
| 🤷     | 🤷     | 🤷  | `(ATICB)` | `(pmFDSMP)` |

|     | `[start,` | `🤷[` | actual    |             |
| --- | --------- | ----- | --------- | ----------- |
|     |           | `p`   | `(ATI)`   | `(pmFD)`    |
|     | `p`       |       | `(C)`     | `(S)`       |
| `p` |           |       | `(B)`     | `(MP)`      |
| 🤷  | 🤷        | 🤷    | `(ATICB)` | `(pmFDSMP)` |

## Chop and intersection

Given 2 intervals `i1` and `i2`, we can consider their _chopped sequence_. This is an ordered sequence such that both
`i1` and `i2` are “covered” a gapless subsequence `ss` of one or more intervals in it. The minimal enclosing interval of
the subsequence `minimalEnclosing(ss) (e) i1`, respectively `minimalEnclosing(ss) (e) i2`. All intervals in the chopped
sequence are part of such a subsequence. There is such a subsequence for both `i1` and `i2`. For each interval in the
subsequence, its relation with `i1` or `i2` must imply `(sedf)`, or the relation between `i1` or `i2` and the intervals
in their subsequence must imply `ENCLOSES`. I imagine both intervals to be cooky cutters, which slice the other interval
at the `start` and `end`.

When we only retain the intervals from the chopped sequence that are enclosed by both `i1` and `i2`, we get the
_intersection sequence_.

### Definite intervals

For fully definite intervals, we get the following intersection sequences and subsequences, depending on their relation.

| `i1 (.) i2` | chopped sequence                                              | subsequence `i1`                             | subsequence `i2`                             | intersection         |
| ----------- | ------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------- | -------------------- |
| `i1 (p) i2` | `i1, i2`                                                      | `i1`                                         | `i2`                                         | —                    |
| `i1 (m) i2` | `i1, i2`                                                      | `i1`                                         | `i2`                                         | —                    |
| `i1 (o) i2` | `[i1.start, i2.start[, [i2.start, i1.end[ , [i1.end, i2.end[` | `[i1.start, i2.start[, [i2.start, i1.end[`   | `[i2.start, i1.end[, [i1.end, i2.end[`       | `[i2.start, i1.end[` |
| `i1 (F) i2` | `[i1.start, i2.start[, i2`                                    | `[i1.start, i2.start[, i2`                   | `i2`                                         | `i2`                 |
| `i1 (D) i2` | `[i1.start, i2.start[, i2, [i2.end, i1.end[`                  | `[i1.start, i2.start[, i2, [i2.end, i1.end[` | `i2`                                         | `i2`                 |
| `i1 (s) i2` | `i1, [i1.end, i2.end[`                                        | `i1`                                         | `i1, [i1.end, i2.end[`                       | `i1`                 |
| `i1 (e) i2` | `i1` = `i2`                                                   | `i1, i2`                                     | `i1, i2`                                     | `i1` = `i2`          |
| `i1 (S) i2` | `i2, [i2.end, i1.end[`                                        | `i2, [i2.end, i1.end[`                       | `i2`                                         | `i2`                 |
| `i1 (d) i2` | `[i2.start, i1.start[, i1, [i1.end, i2.end[`                  | `i1`                                         | `[i2.start, i1.start[, i1, [i1.end, i2.end[` | `i1`                 |
| `i1 (f) i2` | `[i2.start, i1.start[, i1`                                    | `i1`                                         | `[i2.start, i1.start[, i1`                   | `i1`                 |
| `i1 (O) i2` | `[i2.start, i1.start[, [i1.start, i2.end[ , [i2.end, i1.end[` | `[i1.start, i2.end[ , [i2.end, i1.end[`      | `[i2.start, i1.start[, [i1.start, i2.end[ `  | `[i1.start, i2.end[` |
| `i1 (M) i2` | `i2, i1`                                                      | `i1`                                         | `i2`                                         | —                    |
| `i1 (P) i2` | `i2, i1`                                                      | `i1`                                         | `i2`                                         | —                    |

Note there are always 1, 2, or 3 intervals in the chopped sequence. The intersection sequence has zero or 1 interval,
which is `i1` or `i2` (or both for `(e)`), or a new interval for `(o)` and `(O)`.

### Indefinite intervals

For indefinite intervals, the result is indeterminate.

Consider the actual relation between a left-indefinite interval `lii` and an interval `i`. Depending on the relation
between `lii.end` and `i.start`, and `lii.end` and `i.end`, we get:

| `lii.end ⨀ i.start` | `lii.end ⨀ i.end` | `lii (.) i`     | `i (.) liii`    |
| ------------------- | ----------------- | --------------- | --------------- |
| <                   | <                 | `(p)`           | `(P)`           |
| =                   | <                 | `(m)`           | `(M)`           |
| &gt;                | <                 | `(osd)`         | `(DSO)`         |
|                     | =                 | `(Fef)`         | `(Fef)`         |
|                     | >                 | `(DSOMP)`       | `(pmosd)`       |
|                     | 🤷                | `(oFDseSdfOMP)` | `(pmoFDseSdfO)` |
| 🤷                  | <                 | `(pmosd)`       | `(DSOMP)`       |
|                     | =                 | `(Fef)`         | `(FeF)`         |
|                     | >                 | `(DSOMP)`       | `(pmosd)`       |
|                     | 🤷                | full            | full            |

`(p)`, `(m)`, `(M)`, and `(P)` are basic relations, and the chopped sequence can be looked up in the table above. There
is no intersection.

Note that the possible actual relations `(oFD)`, `(dfO)`, `(seS)`, and `(dfOMP)` do not appear in this list.

// MUDO why not? They should. With a right-indefinite interval `rii`?

When `lii. end > i.start` however, we have 3 different cases where the actual relation is not a basic relation, and
there are 3, respectively 5, possible chopped sequences. Let's display them visually:

| `[lii.start,` | `[i.start` |          | `lii.end[` |          | `lii (.) i` | chopped sequence                                      | intersection           |
| ------------- | ---------- | -------- | ---------- | -------- | ----------- | ----------------------------------------------------- | ---------------------- |
|               |            |          |            | `i.end[` | `(o)`       | `[…, i.start[, [i.start, lii.end[ , [lii.end, i.end[` | `[i.start, lii.end[`   |
|               |            |          |            |          | `(s)`       | `[lii.start = i.start, lii.end[, [lii.end, i.end[`    | `[i.start, lii.end[`   |
|               |            |          |            |          | `(d)`       | `[i.start, ?[, [?, lii.end], [lii.end, i2.end[`       | `[?, lii.end]`         |
|               |            |          | `i.end[`   |          | `(F)`       | `[…, i.start[, i`                                     | `i`                    |
|               |            |          |            |          | `(e)`       | `i`                                                   | `i`                    |
|               |            |          |            |          | `(f)`       | `[i.start, ?[, [?, lii.end = i.end[`                  | `[?, lii.end = i.end]` |
|               |            | `i.end[` |            |          | `(D)`       | `[…, i.start[, i, [i.end, lii.end[`                   | `i`                    |
|               |            |          |            |          | `(S)`       | `i, [i.end, lii.end[`                                 | `i`                    |
|               |            |          |            |          | `(O)`       | `[i.start, ?[, [?, i.end[, [i.end, lii.end[`          | `[?, i.end]`           |
|               |            |          |            |          | `(M)`       | `i, [? = i.end, lii.end[`                             | —                      |
|               |            |          |            |          | `(P)`       | `i, [? = i.end, lii.end[`                             | —                      |

WE FORBID THE USE OF INDEFINITE INTERVALS FOR THIS ALGORITHM USERS MUST MAKE THE SEMANTICS OF indefinite points CLEAR
FIRST BY “Reasoning with unknown but constrained start and end point”, before using the algorithm, and take into account
that the returned result is that for constrained (definite) intervals, not the original interval.

## Inference

**Be aware that, in general, inference over intervals, also using Allen relations, is NP-complete.** This means that the
time the execution of inference algorithms will take, is at least difficult to ascertain, and quickly completely
impractical (i.e., with realistic parameters the algorithm would take longer than the universe exists — no kidding).

There are subsets of the Allen relations for which there exist algorithms that perform much better.

This library does not offer inference functions at this time. The main intention of this library is validation.
