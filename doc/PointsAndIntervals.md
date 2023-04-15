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

# Intervals and points

Interval Algebra (_IA_, [Allen, James F. “Maintaining knowledge about temporal intervals”] [allen], _Communications of
the ACM 26(11) pages 832-843; November 1983_) explicitly does _not_ work with isolated start and end points (“state
space approaches”). However, in business applications we are constantly confronted with dates and times, so discussing
the mapping is necessary.

The set of intervals is denoted **𝓘**. The set of points, in general is denoted **𝓟**, with an [equivalence relation]
**=** and a [strict partial order] **<**. Often we imagine **𝓟** to be a continous, uncountably infinite set, with a
[strict total order], isomorph with **ℝ**, such as classic non-relativistic time, classic relativistic proper time, or a
space axis.

## Mapping intervals to points

When mapping **𝓟 ↔︎ 𝓘** we define intervals as any couple of points where

> 𝓘 ≝ { [p<sub>1</sub>, p<sub>2</sub>[ | p<sub>1</sub>, p<sub>2</sub> ∈ 𝓟 ∧ p<sub>1</sub> < p<sub>2</sub> }

We can define **𝓟<sup>2◹</sup>** as

> 𝓟 ⨯ 𝓟 ⊃ 𝓟<sup>2◹</sup> ≝ { (p<sub>1</sub>, p<sub>2</sub>) | p<sub>1</sub> ∈ 𝓟, p<sub>2</sub> ∈ 𝓟: p<sub>1</sub> <
> p<sub>2</sub> }

and then see that **𝓘 ≅ 𝓟<sup>2◹</sup>**.

Mapping operators are **[…, …[**, **𝓈** (start), and **ℯ** (end).

> - […, …[: 𝓟<sup>2◹</sup> → 𝓘: (p<sub>1</sub>, p<sub>2</sub>) → [p<sub>1</sub>, p<sub>2</sub>[
>
> - 𝓈: 𝓘 → 𝓟: [p<sub>1</sub>, p<sub>2</sub>[ → p<sub>1</sub>
>
> - ℯ: 𝓘 → 𝓟: [p<sub>1</sub>, p<sub>2</sub>[ → p<sub>2</sub>

## Definition of the 13 basic relations as point relations

In IA, the set of intervals and the 13 basic relations are given axiomatically. If we fall back to mapping intervals to
an ordered set of points, with **𝓈(i)** denoting the start point of **i**, and **ℯ(i)** denoting the end point of **i**,
we can define the 13 basic relations as conjunctions of predicates on the start and end points of the related intervals.

|                               Basic relation | AR(i<sub>1</sub>, i<sub>2</sub>) | Illustration                          | Definition                                                                                                      |
| -------------------------------------------: | :------------------------------: | ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
|         i<sub>1</sub> precedes i<sub>2</sub> |               (p)                | ![precedes][precedes]                 | ℯ(i<sub>1</sub>) < 𝓈(i<sub>2</sub>)                                                                             |
|            i<sub>1</sub> meets i<sub>2</sub> |               (m)                | ![meets][meets]                       | ℯ(i<sub>1</sub>) = 𝓈(i<sub>2</sub>)                                                                             |
|         i<sub>1</sub> overlaps i<sub>2</sub> |               (o)                | ![overlaps][overlaps]                 | 𝓈(i<sub>1</sub>) < 𝓈(i<sub>2</sub>) ∧ 𝓈(i<sub>2</sub>) < ℯ(i<sub>1</sub>) ∧ ℯ(i<sub>1</sub>) < ℯ(i<sub>2</sub>) |
|   i<sub>1</sub> is finished by i<sub>2</sub> |               (F)                | ![is finished by][is finished by]     | 𝓈(i<sub>1</sub>) < 𝓈(i<sub>2</sub>) ∧ ℯ(i<sub>1</sub>) = ℯ(i<sub>2</sub>)                                       |
|         i<sub>1</sub> contains i<sub>2</sub> |               (D)                | ![contains][contains]                 | 𝓈(i<sub>1</sub>) < 𝓈(i<sub>2</sub>) ∧ ℯ(i<sub>2</sub>) < ℯ(i<sub>1</sub>)                                       |
|           i<sub>1</sub> starts i<sub>2</sub> |               (s)                | ![starts][starts]                     | 𝓈(i<sub>1</sub>) = 𝓈(i<sub>2</sub>) ∧ ℯ(i<sub>1</sub>) < ℯ(i<sub>2</sub>)                                       |
|           i<sub>1</sub> equals i<sub>2</sub> |               (e)                | ![equals][equals]                     | 𝓈(i<sub>1</sub>) = 𝓈(i<sub>2</sub>) ∧ ℯ(i<sub>1</sub>) = ℯ(i<sub>2</sub>)                                       |
|    i<sub>1</sub> is started by i<sub>2</sub> |               (S)                | ![is started by][is started by]       | 𝓈(i<sub>2</sub>) = 𝓈(i<sub>1</sub>) ∧ ℯ(i<sub>2</sub>) < ℯ(i<sub>1</sub>)                                       |
|           i<sub>1</sub> during i<sub>2</sub> |               (d)                | ![during][during]                     | 𝓈(i<sub>2</sub>) < 𝓈(i<sub>1</sub>) ∧ ℯ(i<sub>1</sub>) < ℯ(i<sub>2</sub>)                                       |
|         i<sub>1</sub> finishes i<sub>2</sub> |               (f)                | ![finishes][finishes]                 | 𝓈(i<sub>2</sub>) < 𝓈(i<sub>1</sub>) ∧ ℯ(i<sub>1</sub>) = ℯ(i<sub>2</sub>)                                       |
| i<sub>1</sub> is overlapped by i<sub>2</sub> |               (O)                | ![is overlapped by][is overlapped by] | 𝓈(i<sub>2</sub>) < 𝓈(i<sub>1</sub>) ∧ 𝓈(i<sub>1</sub>) < ℯ(i<sub>2</sub>) ∧ ℯ(i<sub>2</sub>) < ℯ(i<sub>1</sub>) |
|        i<sub>1</sub> is met by i<sub>2</sub> |               (M)                | ![is met by][is met by]               | ℯ(i<sub>2</sub>) = 𝓈(i<sub>1</sub>)                                                                             |
|   i<sub>1</sub> is preceded by i<sub>2</sub> |               (P)                | ![is preceded by][is preceded by]     | ℯ(i<sub>2</sub>) < 𝓈(i<sub>1</sub>)                                                                             |

Note that for most definitions of basic interval relations, some relations between the 4 points are explicitly not
mentioned. Yet, in all cases, the subset of points involved when the Allen Relation between 2 intervals is basic, is
[totally ordered][strict total order].

**(p)** expresses a [strict total order] between all 4 points:

> i<sub>1</sub> (p) i<sub>2</sub> ⇔ ℯ(i<sub>1</sub>) < 𝓈(i<sub>2</sub>) _(definition of (p))_
>
> ⇔ 𝓈(i<sub>1</sub>) < ℯ(i<sub>1</sub>) ∧ ℯ(i<sub>1</sub>) < 𝓈(i<sub>2</sub>) ∧ 𝓈(i<sub>2</sub>) < ℯ(i<sub>2</sub>)
> _(definition of 𝓘)_
>
> ⇔ 𝓈(i<sub>1</sub>) < 𝓈(i<sub>2</sub>) ∧ 𝓈(i<sub>1</sub>) < ℯ(i<sub>2</sub>) ∧ ℯ(i<sub>1</sub>) < ℯ(i<sub>2</sub>)
> _(transitivity of < in 𝓟)_

|                  | 𝓈(i<sub>1</sub>) | ℯ(i<sub>1</sub>) | 𝓈(i<sub>2</sub>) | ℯ(i<sub>2</sub>) |
| ---------------- | ---------------- | ---------------- | ---------------- | ---------------- |
| 𝓈(i<sub>1</sub>) | =                | <                | <                | <                |
| ℯ(i<sub>1</sub>) |                  | =                | <                | <                |
| 𝓈(i<sub>2</sub>) |                  |                  | =                | <                |
| ℯ(i<sub>2</sub>) |                  |                  |                  | =                |

and so do **(o)**, **(D)**, **(d)**, **(O)**, and **(P)**.

**(s)** expresses a [strict total order] between all 3 points (2 points are explicitly equal):

> i<sub>1</sub> (s) i<sub>2</sub> ⇔ 𝓈(i<sub>1</sub>) = 𝓈(i<sub>2</sub>) ∧ ℯ(i<sub>1</sub>) < ℯ(i<sub>2</sub>)
> _(definition of (s))_
>
> ⇔ 𝓈(i<sub>1</sub>) < ℯ(i<sub>1</sub>) ∧ 𝓈(i<sub>1</sub>) = 𝓈(i<sub>2</sub>) ∧ ℯ(i<sub>1</sub>) < ℯ(i<sub>2</sub>) ∧
> 𝓈(i<sub>2</sub>) < ℯ(i<sub>2</sub>) _(definition of 𝓘)_
>
> ⇔ (𝓈(i<sub>1</sub>) < ℯ(i<sub>1</sub>) ∧ 𝓈(i<sub>2</sub>) < ℯ(i<sub>1</sub>)) ∧ ℯ(i<sub>1</sub>) < ℯ(i<sub>2</sub>) ∧
> 𝓈(i<sub>1</sub>) < ℯ(i<sub>2</sub>) _(substitute 𝓈(i<sub>2</sub>))_

|                                    | 𝓈(i<sub>1</sub>) = 𝓈(i<sub>2</sub>) | ℯ(i<sub>1</sub>) | ℯ(i<sub>2</sub>) |
| ---------------------------------- | ----------------------------------- | ---------------- | ---------------- |
| 𝓈(i<sub>1</sub>)= 𝓈(i<sub>2</sub>) | =                                   | <                | <                |
| ℯ(i<sub>1</sub>)                   |                                     | =                | <                |
| ℯ(i<sub>2</sub>)                   |                                     |                  | =                |

and so do **m**, **(F)**, **(S)**, **(f)**, and **M**.

**(e)** expresses a [strict total order] between both points:

|                                     | 𝓈(i<sub>1</sub>) = 𝓈(i<sub>2</sub>) | ℯ(i<sub>1</sub>) = ℯ(i<sub>2</sub>) |
| ----------------------------------- | ----------------------------------- | ----------------------------------- |
| 𝓈(i<sub>1</sub>) = 𝓈(i<sub>2</sub>) | =                                   | <                                   |
| ℯ(i<sub>1</sub>) = ℯ(i<sub>2</sub>) |                                     | =                                   |

This is not true for general Allen Relations though. Explicitly not mentioning some point relations in the definitions
leaves room for indefinite relations between points.

_**MUDO:** add example_

## Right-half open interval

_**MUDO:** explain_

## No degenerate intervals

_**MUDO:** explain_

## Indefinite intervals

_**MUDO:** explain_

## 𝓟 is not necessarily a continous, uncountably infinite set with a strict total order

In none of the above it is required that **𝓟** is a continous, uncountably infinite set, with a [strict total order],
isomorph with **ℝ**. The only requirement on **𝓟** is that an [equivalence relation] **=** and a [strict partial order]
**<** is defined.

### Non-total strict order

Working with a [non-total strict order][strict partial order] means that some points cannot be compared.
**¬(p<sub>1</sub> < p<sub>2</sub>)** does _not_ imply **p<sub>1</sub> ≥ p<sub>2</sub>** (i.e., **p<sub>1</sub> =
p<sub>2</sub> ∨ p<sub>2</sub> < p<sub>1</sub>**). When points are incomparable, all 3 point-relations are false at the
same time:

> p<sub>1</sub> ≮ p<sub>2</sub> ∧ p<sub>1</sub> ≠ p<sub>2</sub> ∧ p<sub>1</sub> ≯ p<sub>2</sub>

An example is classic relativistic time.

Looking at the definition of **𝓘** as couples of points, the couples where **p<sub>1</sub> < p<sub>2</sub> = false** are
excluded. With a [non-total strict order][strict partial order] there are couples that are excluded, not because
**p<sub>1</sub> ≥ p<sub>2</sub>**, but because **p<sub>1</sub>** and **p<sub>2</sub>** are _incomparable_. There are
“less” intervals.

The defininitions of the 13 basic relations of IA all require 1 or more of the point-relations to be **true**. The
definitions explicitly do _not_ mention some of the relations, which might thus be either **true** or **false**.

[allen]: https://dl.acm.org/doi/pdf/10.1145/182.358434
[precedes]: ../img/ar-basic/precedes.png
[meets]: ../img/ar-basic/meets.png
[overlaps]: ../img/ar-basic/overlaps.png
[is finished by]: ../img/ar-basic/finishedBy.png
[contains]: ../img/ar-basic/contains.png
[starts]: ../img/ar-basic/starts.png
[equals]: ../img/ar-basic/equals.png
[is started by]: ../img/ar-basic/startedBy.png
[during]: ../img/ar-basic/during.png
[finishes]: ../img/ar-basic/finishes.png
[is overlapped by]: ../img/ar-basic/overlappedBy.png
[is met by]: ../img/ar-basic/metBy.png
[is preceded by]: ../img/ar-basic/precededBy.png
[strict total order]: https://en.wikipedia.org/wiki/Total_order#Strict_and_non-strict_total_orders
[equivalence relation]: https://en.wikipedia.org/wiki/Equivalence_relation
[strict partial order]: https://en.wikipedia.org/wiki/Partially_ordered_set#strict_partial_order
