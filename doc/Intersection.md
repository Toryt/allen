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

# Chop and intersection

Given 2 intervals `i1` and `i2`, we can consider their _chopped sequence_. This is an ordered sequence such that both
`i1` and `i2` are “covered” by a gapless subsequence `ss1` and `ss2` of one or more intervals. The minimal enclosing
interval of the subsequence `minimalEnclosing(ss1) (e) i1`, respectively `minimalEnclosing(ss2) (e) i2`. All intervals
in the chopped sequence are part of such a subsequence. For each interval `isspq` in the subsequence `ssp`, its relation
with `ip` must imply `(sedf)` (`isspq ENCLOSED_BY ip`). I imagine both intervals to be cooky cutters, which slice the
other interval at the `start` and `end`.

The _intersection_ of 2 intervals `i1` and `i2` is the maximal interval `is` that is enclosed by both `i1` and `i2`:

```
is ENCLOSED_BY i1 ∧ is ENCLOSED_BY i2
```

When `i1 DOES_NOT_CONCUR_WITH i2`, there is no intersection interval.

### Definite intervals

For fully definite intervals, we get the following chopped sequences and subsequences, and intersection, depending on
their relation.

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

Note there are always 1, 2, or 3 intervals in the chopped sequence. The intersection does not exist, is `i1` or `i2` (or
both for `(e)`), or a new interval for `(o)` and `(O)`.

We get the same results for `i2 (.) i1`. Chopping, and the intersection, commute.

### Indefinite intervals

For indefinite intervals, the result is most often indeterminate.

Consider the actual relation between a left-indefinite interval `lii` and an interval `i`, and vice versa. Depending on
the relation between `lii.end` and `i.start`, and `lii.end` and `i.end`, we get:

| `lii.end ⨀ i.start` | `lii.end ⨀ i.end` | `lii (.) i`     | `i (.) lii`     |
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

For a right-indefinite interval `rii` and an interval `i`, and vice versa, we get:

| `rii.start ⨀ i.end` | `rii.start ⨀ i.start` | `rii (.) i`     | `i (.) rii`     |
| ------------------- | --------------------- | --------------- | --------------- |
| &gt;                | &gt;                  | `(P)`           | `(p)`           |
| =                   | <                     | `(M)`           | `(m)`           |
| <                   | >                     | `(dfO)`         | `(oFD)`         |
|                     | =                     | `(seS)`         | `(seS)`         |
|                     | <                     | `(pmoFD)`       | `(dfOMP)`       |
|                     | 🤷                    | `(pmoFDseSdfO)` | `(oFDseSdfOMP)` |
| 🤷                  | >                     | `(dfOMP)`       | `(pmoFD)`       |
|                     | =                     | `(seS)`         | `(seS)`         |
|                     | <                     | `(pmoFD)`       | `(dfOMP)`       |
|                     | 🤷                    | full            | full            |

`(p)`, `(m)`, `(M)`, and `(P)` are basic relations, and the chopped sequence can be looked up in the table above. There
is no intersection in these cases.

When `lii.end > i.start`, and `i.end` definite, and `rii.start < i.end`, and `i.start` definite however, we have 3
different cases where the actual relation is not a basic relation, and there are 3, respectively 5, possible chopped
sequences and intersections. Let's display them visually:

| `[i.start, –` |             | `…, lii.end[` |             | `lii (.) i` | chopped sequence                                       | intersection            | most meaningfull intersection |
| ------------- | ----------- | ------------- | ----------- | ----------- | ------------------------------------------------------ | ----------------------- | ----------------------------- |
|               |             |               | `–, i.end[` | `(o)`       | `[🤷, i.start[, [i.start, lii.end[ , [lii.end, i.end[` | `[i.start, lii.end[`    | `[🤷, lii.end[`               |
|               |             |               |             | `(s)`       | `[lii.start = i.start, lii.end[, [lii.end, i.end[`     | `[i.start, lii.end[`    |                               |
|               |             |               |             | `(d)`       | `[i.start, ❓▶️[, [◀️❓, lii.end], [lii.end, i.end[`   | `[🤷, lii.end[`         |                               |
|               |             | `–, i.end[`   |             | `(F)`       | `[🤷, i.start[, i`                                     | `i`                     | `[🤷, lii.end = i.end[`       |
|               |             |               |             | `(e)`       | `i`                                                    | `i`                     |                               |
|               |             |               |             | `(f)`       | `[i.start, ❓▶️[, [◀️❓, lii.end = i.end[`             | `[🤷, lii.end = i.end[` |                               |
|               | `–, i.end[` |               |             | `(D)`       | `[🤷, i.start[, i, [i.end, lii.end[`                   | `i`                     | ❌                            |
|               |             |               |             | `(S)`       | `i, [i.end, lii.end[`                                  | `i`                     |                               |
|               |             |               |             | `(O)`       | `[i.start, ❓▶️[, [◀️❓, i.end[, [i.end, lii.end[`     | `[🤷, i.end[`           |                               |
|               |             |               |             | `(M)`       | `i, [◀️ = i.end, lii.end[`                             | —                       |                               |
|               |             |               |             | `(P)`       | `i, [◀️❓, lii.end[`                                   | —                       |                               |
|               | 🤷          | 🤷            | 🤷          | `(o)`       | `[🤷, i.start[, [i.start, lii.end[ , [lii.end, 🤷[`    | `[i.start, lii.end[`    | ❌                            |
|               |             |               |             | `(F)`       | `[🤷, i.start[, [i.start, 🤷[`                         | `i`                     |                               |
|               |             |               |             | `(D)`       | `[🤷, i.start[, [i.start, ❓▶️[, [◀️❓, lii.end[`      | `i`                     |                               |
|               |             |               |             | `(s)`       | `[lii.start = i.start, lii.end[, [lii.end, 🤷[`        | `[i.start, lii.end[`    |                               |
|               |             |               |             | `(e)`       | `i`                                                    | `i`                     |                               |
|               |             |               |             | `(S)`       | `[i.start, ❓▶️[, [◀️❓, lii.end[`                     | `i`                     |                               |
|               |             |               |             | `(d)`       | `[i.start, ❓▶️[, [◀️❓, lii.end], [lii.end, 🤷[`      | `[🤷, lii.end[`         |                               |
|               |             |               |             | `(f)`       | `[i.start, ❓▶️[, [◀️❓, lii.end = i.end[`             | `[🤷, lii.end = i.end[` |                               |
|               |             |               |             | `(O)`       | `[i.start, ❓▶️[, [◀️❓, ❓▶️[, [◀️❓, lii.end[`       | `[🤷, 🤷[`              |                               |
|               |             |               |             | `(M)`       | `[i.start, ❓▶️[, [◀️❓, lii.end[`                     | —                       |                               |
|               |             |               |             | `(P)`       | `[i.start, ❓▶️[, [◀️❓, lii.end[`                     | —                       |                               |

|               | `[rii.start, …` |               | `–, i.end[` | `rii (.) i` | chopped sequence                                         | intersection                | most meaningfull intersection |
| ------------- | --------------- | ------------- | ----------- | ----------- | -------------------------------------------------------- | --------------------------- | ----------------------------- |
| `[i.start, –` |                 |               |             | `(d)`       | `[i.start, rii.start[, [rii.start, ❓▶️], [◀️❓, i.end[` | `[rii.start, 🤷[`           | `[rii.start, 🤷[`             |
|               |                 |               |             | `(f)`       | `[i.start, rii.start[, [rii.start, i.end = rii.end]`     | `[rii.start, i.end[`        |                               |
|               |                 |               |             | `(O)`       | `[i.start, rii.start[, [rii.start, i.end[ , [i.end, 🤷[` | `[rii.start, i.end[`        |                               |
|               | `[i.start, –`   |               |             | `(s)`       | `[i.start = rii.start, ❓▶️], [◀️❓, i.end[`             | `[i.start = rii.start, 🤷[` | `[i.start = rii.start, 🤷[`   |
|               |                 |               |             | `(e)`       | `i`                                                      | `i`                         |                               |
|               |                 |               |             | `(S)`       | `i, [i.end, 🤷[`                                         | `i`                         |                               |
|               |                 | `[i.start, –` |             | `(p)`       | `[rii.start, ❓▶️[, i`                                   | —                           | ❌                            |
|               |                 |               |             | `(m)`       | `[rii.start, ▶️ = i.start[, i`                           | —                           |                               |
|               |                 |               |             | `(o)`       | `[rii.start, i.start[, [i.start, ❓▶️[, [◀️❓, i.end[`   | `[i.start, 🤷[`             |                               |
|               |                 |               |             | `(F)`       | `[rii.start, i.start[, i`                                | `i`                         |                               |
|               |                 |               |             | `(D)`       | `[rii.start, i.start[, i, [i.end, 🤷[`                   | `i`                         |                               |
| 🤷            | 🤷              | 🤷            |             | `(p)`       | `[rii.start, ❓▶️[, [◀️❓, i.end[`                       | —                           | ❌                            |
|               |                 |               |             | `(m)`       | `[rii.start, ❓▶️[, [◀️❓, i.end[`                       | —                           | ❌                            |
|               |                 |               |             | `(o)`       | `[rii.start, ❓▶️[, [◀️❓, ❓▶️[, [◀️❓, i.end[`         | `[🤷, 🤷[`                  | ❌                            |
|               |                 |               |             | `(F)`       | `[rii.start, ❓▶️[, [◀️❓, i.end[`                       | `i`                         | ❌                            |
|               |                 |               |             | `(D)`       | `[rii.start, ❓▶️[, [◀️❓, i.end[, [i.end, 🤷[`          | `i`                         | ❌                            |
|               |                 |               |             | `(s)`       | `[i.start = rii.start, ❓▶️], [◀️❓, i.end[`             | `[i.start = rii.start, 🤷[` | ❌                            |
|               |                 |               |             | `(e)`       | `i`                                                      | `i`                         | ❌                            |
|               |                 |               |             | `(S)`       | `[🤷, i.end[, [i.end, 🤷[`                               | `i`                         | ❌                            |
|               |                 |               |             | `(d)`       | `[🤷, rii.start[, [rii.start, ❓▶️], [◀️❓, i.end[`      | `[rii.start, 🤷[`           | ❌                            |
|               |                 |               |             | `(f)`       | `[🤷, rii.start[, [rii.start, i.end = rii.end]`          | `[rii.start, i.end[`        | ❌                            |
|               |                 |               |             | `(O)`       | `[🤷, rii.start[, [rii.start, i.end[ , [i.end, 🤷[`      | `[rii.start, i.end[`        | ❌                            |

We get the same results for `i (.) lii`, and `i (.) rii`.

The intersection is well-defined in all cases. We get a left-indefinite intersection interval for `(d)`, `(f)`, `(O) `,
respectively a right-indefinite interval for `(d)`, `(s)`, `(o)`, and no, or a definite interval in the other cases. If
we had a little more information we might be sure about the intersection. E.g., when `lii.end > i.start`, and
`lii.end < i.end`, if we would know that `¬ (lii (d) i)`, we are sure the intersection is `[i.start, lii.end[`. The
choice is limited to returning a definite, or indefinite interval, when `lii.end > i.start` and `lii.end < i.end`, or
`lii.end = i.end`, and when `rii.start < i.end` and `rii.start > i.start`, or `rii.start = i.start`. In these cases, it
is correct to say the intersection is `[🤷, lii.end[`, and `[rii.start, 🤷[`, respectively. This does not apply to
`lii.end > i.start` and `lii.end > i.end`, or `rii.start < i.end` and `rii.start < i.start`. `[🤷, i.end[`, respectively
`[i.start, 🤷[` would be the intersection, except for the cases `(M)` and `(P)`, and `(p)` and `(m)`, respectively,
where there is no intersection. Saying that the intersection is the fully indefinite interval would be wrong. It is
`[🤷, i.end[`, respectively `[i.start, 🤷[`, or there is no intersection. We don't know.

Therefor, we only define the intersection in cases where the answer is well-definined. Users should apply “Reasoning
with unknown but constrained start and end point” to the indefinite intervals first, to express the extra knowledge
about constraints that they have.

The chopped sequence is not well-defined for `(d)`, `(f)`, `(O)` and `(P)`, respectively `(d)`, `(s)`,`(p)`,`(o)`, and
well-defined for the other cases. If we know the relation between `lii` and `i`, or `rii` and `i` respectively, and it
is one of the well-defined cases, we would be sure about the chopped sequence. In the cases that are not well-defined,
we cannot use an indefinite point 🤷 to replace the unknown points (`?`). With indefinite intervals, the result would
not be guaranteed to be a sequence. There are intervals following an indefinite `end`, or preceding an indefinite
`start`. But, in general, there are simply 3, 3, and 5 possible sequences, of which 2, 2, and 3, respectively, are
well-defined. Even the well-defined cases differ in the number of intervals in the sequence.

Therefor, we only define the chopped sequence for fully definite intervals. Users should apply “Reasoning with unknown
but constrained start and end point” to the indefinite intervals first, to express the extra knowledge about constraints
that they have.

When we calculate the actual relation between intervals, there are 13 possible results apart from the basic relations
discussed above. The chopped sequence is not defined for any of them. The intersection, however, is for the 6 with the
smallest uncertainty. When the uncertainly `> 1/6`, the intersection is not defined.

| `i1 (.) i2 `    | chopped sequence | intersection                |
| --------------- | ---------------- | --------------------------- |
| `(pmoFDseSdfO)` | ❌               | ❌                          |
| `(pmoFD)`       | ❌               | ❌                          |
| `(pmosd)`       | ❌               | ❌                          |
| `(osd)`         | ❌               | `[🤷, i1.end[`              |
| `(oFD)`         | ❌               | `[i2.start, 🤷[`            |
| `(seS)`         | ❌               | `[i1.start = i2.start, 🤷[` |
| `(Fef)`         | ❌               | `[🤷, i1.end = i2.end[`     |
| `(dfO)`         | ❌               | `[i1.start, 🤷[`            |
| `(DSO)`         | ❌               | `[🤷, i2.end[`              |
| `(DSOMP)`       | ❌               | ❌                          |
| `(dfOMP)`       | ❌               | ❌                          |
| `(oFDseSdfOMP)` | ❌               | ❌                          |
| full            | ❌               | ❌                          |

### Collection intersection set

Here, we want to determine the collection of all intersection intervals for the cross product of _n ∈ ℕ<sub>0</sub>_
collections of intervals _I<sub>k</sub>, k ∈ ℕ<sub>1</sub>, k ≤ n_, with different cardinalities _#I<sub>k</sub> ∈
ℕ<sub>0</sub>_:

> ∩<sub>k ∈ ℕ<sub>1</sub>, k&nbsp;≤&nbsp;n</sub>(I<sub>k</sub>) ≝ { i | ∃ k ∈ ℕ<sub>1</sub>, k&nbsp;≤&nbsp;n; ∃ j ∈
> ℕ<sub>0</sub>, j&nbsp;<&nbsp;#I<sub>k</sub>; (i<sub>kj</sub>) ∈ ×(I<sub>k</sub>); i = ∩((i<sub>kj</sub>)); i ≠ ∅ }

In other words, we take the cross product of all _I<sub>k</sub>_ (1-based counting). The elements are tuples of
intervals, whose second index is limited to the cardinality of the collection it originates from (0-based counting):

> (i<sub>1p</sub>, i<sub>2q</sub>, …, i<sub>nr</sub>) ∈ _I<sub>1</sub> × I<sub>2</sub> × … × I<sub>n</sub>_,
>
> where p ∈ ℕ<sub>0</sub>, p&nbsp;<&nbsp;#I<sub>1</sub>, q ∈ ℕ<sub>0</sub>, q&nbsp;<&nbsp;#I<sub>2</sub>, …, r ∈
> ℕ<sub>0</sub>, r&nbsp;<&nbsp;#I<sub>r</sub>

The collection of intersection intervals are the intersection intervals of all these tuples _∩(i<sub>1p</sub>,
i<sub>2q</sub>, …, i<sub>nr</sub>)_.

The intersection is only defined as a binary operation _∩(i<sub>1</sub>, i<sub>2</sub>)_ up until now. We extend this
definition to the intersection of tuples of intervals _∩((i<sub>s</sub>)<sub>s ∈ ℕ<sub>1</sub>, s&nbsp;≤&nbsp;m</sub>)_
for _m ∈ ℕ<sub>0</sub>_ using [currying](https://en.wikipedia.org/wiki/Currying):

|                                                                 |     |                 |                                                                                              |
| --------------------------------------------------------------- | --- | --------------- | -------------------------------------------------------------------------------------------- |
| ∩((i<sub>s</sub>)<sub>s ∈ ℕ<sub>1</sub>, s&nbsp;≤&nbsp;m</sub>) | ≝   | m&nbsp;=&nbsp;0 | ∅                                                                                            |
|                                                                 |     | m&nbsp;=&nbsp;1 | i<sub>1</sub>                                                                                |
|                                                                 |     | m&nbsp;=&nbsp;2 | i<sub>1</sub> ∩ i<sub>2</sub>                                                                |
|                                                                 |     | m&nbsp;>&nbsp;2 | ∩((i<sub>t</sub>)<sub>t ∈ ℕ<sub>1</sub> t&nbsp;≤&nbsp;m&nbsp;-&nbsp;1</sub>) ∩ i<sub>m</sub> |

Since the binary intersection commutes, the order of the elements in the tuple is irrelevant.

We know from the binary operation that some intersections are empty, and some intersections are not well-defined. This
extends to the intersection of tuples of intervals. If 1 of the curried intersections is empty, the final intersection
is empty. If one of the curried intersections is not well-defined, the final intersection is not well-defined. This,
again, extends to the collection intersection. Empty tuple intersections are not included in the result. If one of the
tuple intersections is not well-defined, the collection intersection is not well-defined.

This gives us the opportunity to optimize the algorithm to determine the collection intersection collection. Instead of
evaluating all possible tuples in _×<sub>k</sub>(I<sub>k</sub>)_, which can become large quickly, and eliminating
duplicates, we can instead [curry](https://en.wikipedia.org/wiki/Currying) the intersection collection too:

|                                                               |     |                 |                                                                                             |
| ------------------------------------------------------------- | --- | --------------- | ------------------------------------------------------------------------------------------- |
| ∩<sub>k ∈ ℕ<sub>1</sub>, k&nbsp;≤&nbsp;n</sub>(I<sub>k</sub>) | ≝   | n&nbsp;=&nbsp;0 | ∅                                                                                           |
|                                                               |     | n&nbsp;=&nbsp;1 | I<sub>1</sub>                                                                               |
|                                                               |     | n&nbsp;=&nbsp;2 | I<sub>1</sub> ∩ I<sub>2</sub>                                                               |
|                                                               |     | n&nbsp;>&nbsp;2 | ∩<sub>l ∈ ℕ<sub>1</sub>, l&nbsp;≤&nbsp;n&nbsp;-&nbsp;1</sub>(I<sub>l</sub>) ∩ i<sub>n</sub> |

where the binary operation is defined as:

> I<sub>1</sub> ∩ I<sub>2</sub> ≝ { i | v ∈ I<sub>1</sub>; w ∈ I<sub>2</sub>; i = v ∩ w; i ≠ ∅ }

If either _I<sub>1</sub>_ or _I<sub>2</sub>_ is the empty collection, the intersection collection is empty too. If any
_v ∩ w_ is not well-defined, the intersection collection is not well-defined either.

Since _v ∩ w_ commutes, _I<sub>1</sub> ∩ I<sub>2</sub>_ commutes too.

Some, and in practice most, _(v, w)_ combinations will have no intersection, which means that _#(I<sub>1</sub> ∩
I<sub>2</sub>) ≤ #I<sub>1</sub>&nbsp;⋅&nbsp;#I<sub>2</sub>_. When this result is combined with I<sub>3</sub> to
determine _(I<sub>1</sub> ∩ I<sub>2</sub>) ∩ I<sub>3</sub>_, _#(I<sub>1</sub> ∩ I<sub>2</sub>)
&nbsp;⋅&nbsp;#I<sub>3</sub>_ evaluations have to be done. The number of evaluations necessary to determine
_(I<sub>1</sub> ∩ I<sub>2</sub>) ∩ I<sub>3</sub> ≡ ∩(I<sub>1</sub>, I<sub>2</sub>, I<sub>3</sub>)_ is then
_#I<sub>1</sub>&nbsp;⋅&nbsp;#I<sub>2</sub> + #(I<sub>1</sub> ∩ I<sub>2</sub>)&nbsp;⋅&nbsp;#I<sub>3</sub> ≤
#I<sub>1</sub>&nbsp;⋅&nbsp;#I<sub>2</sub>&nbsp;⋅&nbsp;#I<sub>3</sub>_.

When both interval collections are sequences (which implies that all intervals in the collection _i_ are distinct),
I<sub>1</sub> ∩ I<sub>2</sub> is a sequence too. Indeed, suppose that there are 2 intersections _e ∩ g_ and _f ∩ h_ that
have at least 1 point in common:

> ∃ e ∈ I<sub>1</sub>, ∃ f ∈ I<sub>1</sub>, ∃ g ∈ I<sub>2</sub>, ∃ h ∈ I<sub>2</sub>: (e ∩ g) ∩ (f ∩ h) ≠ ∅
>
> ⇔ ∃ e ∈ I<sub>1</sub>, ∃ f ∈ I<sub>1</sub>, ∃ g ∈ I<sub>2</sub>, ∃ h ∈ I<sub>2</sub>, ∃ x: x ∈ (e ∩ g) ∧ x ∈ (f ∩ h)
>
> ⇔ ∃ e ∈ I<sub>1</sub>, ∃ f ∈ I<sub>1</sub>, ∃ g ∈ I<sub>2</sub>, ∃ h ∈ I<sub>2</sub>, ∃ x: (x ∈ e ∧ x ∈ g) ∧ (x ∈ f ∧
> x ∈ h)
>
> ⇔ ∃ e ∈ I<sub>1</sub>, ∃ f ∈ I<sub>1</sub>, ∃ g ∈ I<sub>2</sub>, ∃ h ∈ I<sub>2</sub>, ∃ x: (x ∈ e ∧ x ∈ f) ∧ (x ∈ g ∧
> x ∈ h)
>
> ⇔ ∃ e ∈ I<sub>1</sub>, ∃ f ∈ I<sub>1</sub>, ∃ g ∈ I<sub>2</sub>, ∃ h ∈ I<sub>2</sub>: (e ∩ f ≠ ∅) ∧ (g ∩ h ≠ ∅)

I.e., if _I<sub>1</sub> ∩ I<sub>2</sub>_ is not a sequence, neither _I<sub>1</sub>_, nor _I<sub>2</sub>_, is a sequence.
In other words, if either _I<sub>1</sub>_ or _I<sub>2</sub>_ is a sequence, _I<sub>1</sub> ∩ I<sub>2</sub>_ is a
sequence. Recursively: if any _I<sub>k</sub>_ is a sequence, _∩<sub>k ∈ ℕ<sub>1</sub>,
k&nbsp;≤&nbsp;n</sub>(I<sub>k</sub>)_ is a sequence.

We can also define the intersection collection of a collection of intervals _I_ with 1 interval _v_, as follows:

> I ∩ v ≝ { w | i ∈ I; w = i ∩ v; w ≠ ∅ }

(Note that _i ∩ v_ might generate duplicate entries, which appear only once in a set.)

Note that when _I_ is a sequence (which implies that all intervals _i_ are distinct), _I ∩ v_ is a sequence too.

To limit the number of _i ∩ v_ couple evaluations necessary when deterimining _I ∩ v_, it would be nice if we could
order _I_ in such a way that we know for certain what the final result will be from a certain point on. Consider the
naive order of `compareIntervals`. This function sorts intervals, first on their `start`, and if that is equal, on their
`end`. An `undefined` `start` is considered the smallest possible value, so that left-indefinite intervals come first in
the order. An `undefined` `end` is considered the largest possible value, so that the subcollection of left-indefinite
intervals end with the fully indefinite intervals, and that the left-definite, right-indefinite intervals come last in
the order.

For fully definite and left-definite, right-indefinite intervals, we know at least that later intervals in the sorted
collection start at the same point or later. Using indices _p, q ∈ ℕ<sub>0</sub>, p&nbsp;<&nbsp;q&nbsp;<&nbsp; #I_ to
denote an intervals position zero-based in the sorted collection _I_:

> ∀ p ∈ ℕ<sub>0</sub>, p&nbsp;<&nbsp;#I, i<sub>p</sub> ∈ I, i<sub>p</sub>.start ≠ undefined; ∀ q ∈ ℕ<sub>1</sub>,
> p&nbsp;<&nbsp;q&nbsp;<&nbsp;#I, i<sub>q</sub> ∈ I, i<sub>q</sub>.start ≠ undefined: i<sub>p</sub>.start ≤
> i<sub>q</sub>.start

i.e.,

> ∀ p ∈ ℕ<sub>0</sub>, p&nbsp;<&nbsp;#I, i<sub>p</sub> ∈ I, i<sub>p</sub>.start ≠ undefined; ∀ q ∈ ℕ<sub>1</sub>,
> p&nbsp;<&nbsp;q&nbsp;<&nbsp;#I, i<sub>q</sub> ∈ I, i<sub>q</sub>.start ≠ undefined: i<sub>p</sub> (pmoFDseS)
> i<sub>q</sub> = i<sub>p</sub> R<sub>order</sub> i<sub>q</sub>

When _v (pm) i<sub>p</sub>_, we can compose this to get the relation of _v_ with _i<sub>q</sub>_:

> ∀ p ∈ ℕ<sub>0</sub>, p&nbsp;<&nbsp;#I, i<sub>p</sub> ∈ I, i<sub>p</sub>.start ≠ undefined; ∀ q ∈ ℕ<sub>1</sub>,
> p&nbsp;<&nbsp;q&nbsp;<&nbsp;#I, i<sub>q</sub> ∈ I, i<sub>q</sub>.start ≠ undefined; ∀ v: v (pm) i<sub>p</sub> ⇒ v
> ((pm) ⊕ (pmoFDseS)) i<sub>q</sub> = v (pm) i<sub>q</sub> ⇒ v ∩ i<sub>q</sub> = ∅

_v (pm) i<sub>q</sub>_ implies the intersection of _v_ and i<sub>q</sub> is well-defined, but empty (even if
_i<sub>q</sub>_ is left-definite, right-indefinite, or _v_ is left-indefinite, right-definite). When we traverse _I_ in
this order, we can stop after we determined that _v (pm) i<sub>p</sub>_. If _v_ is right-indefinite or fully indefinite,
its relation with any other interval can never be _(pm)_, so _v (pm) i<sub>p</sub>_ will never become true, and the
traversal will continue to the end. In some of these cases, we might discover that an intersection is not well-defined.

When _I_ contains left-indefinite intervals or fully indefinite intervals, we encounter them at the start of the
traversal. Their relation with any _v_ can never be _(pm)_. In some of these cases too, we might discover that an
intersection is not well-defined.

In reverse

> ∀ p ∈ ℕ<sub>0</sub>, p&nbsp;<&nbsp;#I, i<sub>p</sub> ∈ I, i<sub>p</sub>.start ≠ undefined; ∀ q ∈ ℕ<sub>1</sub>,
> p&nbsp;<&nbsp;q&nbsp;<&nbsp;#I, i<sub>q</sub> ∈ I, i<sub>q</sub>.start ≠ undefined; ∀ v: v (MP) i<sub>q</sub> ⇒ v
> ((MP) ⊕ (seSdfOMP)) i<sub>p</sub> = v (dfOMP) i<sub>p</sub>

In this case, the intersection _v ∩ i<sub>p</sub>_ might be well-defined or not, and be empty or not. To be able to skip
evaluations at the start of the order, we would need another sort order, that sorts first on _i<sub>q</sub>.end_. We
can't have both.

Note that, because

> ∀ v, w; w.start ≠ undefined; (v ∩ w) ≠ ∅: (v ∩ w) (FseSdfO) v = (v ∩ w) R<sub>∩</sub> v

> ∀ p ∈ ℕ<sub>0</sub>, p&nbsp;<&nbsp;#I, i<sub>p</sub> ∈ I, i<sub>p</sub>.start ≠ undefined; ∀ q ∈ ℕ<sub>1</sub>,
> p&nbsp;<&nbsp;q&nbsp;<&nbsp;#I, i<sub>q</sub> ∈ I, i<sub>q</sub>.start ≠ undefined; ∀ v: i<sub>p</sub> (pmoFDseS)
> i<sub>q</sub> ⇒ (v ∩ i<sub>p</sub>) (R<sub>∩</sub> ⊕ R<sub>order</sub> ⊕ Ṙ<sub>∩</sub>) (v ∩ i<sub>q</sub>)
>
> = (v ∩ i<sub>p</sub>) ((FseSdfO) ⊕ (pmoFDseS) ⊕ Ṙ<sub>∩</sub>) (v ∩ i<sub>q</sub>)
>
> = (v ∩ i<sub>p</sub>) ((pmoFDseSdfOMP) ⊕ Ṙ<sub>∩</sub>) (v ∩ i<sub>q</sub>)
>
> = (v ∩ i<sub>p</sub>) ((pmoFDseSdfOMP) ⊕ (oFDseSf)) (v ∩ i<sub>q</sub>)
>
> = (v ∩ i<sub>p</sub>) (pmoFDseSdfOMP) (v ∩ i<sub>q</sub>)

because `dfO` is in R<sub>∩</sub>, the order is not conserved. **But that is wrong, isn't it? It seems like it should be
conserved by intersection. Probably because oftern either intersection with p or q, but not both? The offending cases
give an empty intersection?**

[basic compositions table]: https://www.ics.uci.edu/~alspaugh/cls/shr/allen.html#BasicCompositionsTable
[`array.prototype.sort` as `comparefn`]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
