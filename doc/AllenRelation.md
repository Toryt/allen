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
Expressing this correctly proves difficult in practice. Falling back to working with isolated start and end points
(“state space approaches”), and reasoning about their relations, in practice proves to be even much more difficult and
error-prone.

This problem was tackled in 1983 by James Allen ([Allen, James F. “Maintaining knowledge about temporal intervals”]
[allen], _Communications of the ACM 26(11) pages 832-843; November 1983_) by introducing an _interval algebra_ (IA).

Good synopses of this theory are [Wikipedia], and [Thomas A. Alspaugh “Allen's interval algebra”][alspaugh]. The
notation used in this text for the Allen Relations is the one used by [Alspaugh].

## Quick overview

### Basic Relations

[Allen] finds that there are 13 _basic relations_ possible between intervals:

|                               Basic relation | AR(i<sub>1</sub>, i<sub>2</sub>) | Illustration                          | Definition                                                  |
| -------------------------------------------: | :------------------------------: | ------------------------------------- | ----------------------------------------------------------- |
|         i<sub>1</sub> precedes i<sub>2</sub> |               (p)                | ![precedes][precedes]                 | `i1.end < i2.start`                                         |
|            i<sub>1</sub> meets i<sub>2</sub> |               (m)                | ![meets][meets]                       | `i1.end = i2.start`                                         |
|         i<sub>1</sub> overlaps i<sub>2</sub> |               (o)                | ![overlaps][overlaps]                 | `i1.start < i2.start ∧ i2.start < i1.end ∧ i1.end < i2.end` |
|   i<sub>1</sub> is finished by i<sub>2</sub> |               (F)                | ![is finished by][is finished by]     | `i1.start < i2.start ∧ i1.end = i2.end`                     |
|         i<sub>1</sub> contains i<sub>2</sub> |               (D)                | ![contains][contains]                 | `i1.start < i2.start ∧ i2.end < i1.end`                     |
|           i<sub>1</sub> starts i<sub>2</sub> |               (s)                | ![starts][starts]                     | `i1.start = i2.start ∧ i1.end < i2.end`                     |
|           i<sub>1</sub> equals i<sub>2</sub> |               (e)                | ![equals][equals]                     | `i1.start = i2.start ∧ i1.end = i2.end`                     |
|    i<sub>1</sub> is started by i<sub>2</sub> |               (S)                | ![is started by][is started by]       | `i2.start = i1.start ∧ i2.end < i1.end`                     |
|           i<sub>1</sub> during i<sub>2</sub> |               (d)                | ![during][during]                     | `i2.start < i1.start ∧ i1.end < i2.end`                     |
|         i<sub>1</sub> finishes i<sub>2</sub> |               (f)                | ![finishes][finishes]                 | `i2.start < i1.start ∧ i1.end = i2.end`                     |
| i<sub>1</sub> is overlapped by i<sub>2</sub> |               (O)                | ![is overlapped by][is overlapped by] | `i2.start < i1.start ∧ i1.start < i2.end ∧ i2.end < i1.end` |
|        i<sub>1</sub> is met by i<sub>2</sub> |               (M)                | ![is met by][is met by]               | `i2.end = i1.start`                                         |
|   i<sub>1</sub> is preceded by i<sub>2</sub> |               (P)                | ![is preceded by][is preceded by]     | `i2.end < i1.start`                                         |

These basic relations can be compared to the 3 relations **<**, **=**, and **>** between 2 points.

### General Relations

When reasoning about the relationship between intervals, like when comparing points, we also often employ
_indeterminate_ relations, such as **i<sub>1</sub> (pm) i<sub>2</sub>** (i<sub>1</sub> _precedes_ i<sub>2</sub> **or**
i<sub>1</sub> _meets_ i<sub>2</sub>). This is comparable to reasoning with **≤**, **≥**, and **≠** with points.

When comparing points **a** and **b**, given 3 basic relations, there are 8 (= 2<sup>3</sup>) possible _general
relations_: the 3 basic relations **a < b**, **a = b**, and **a > b**; all possible binary disjunctions , **a < b ∨ a =
b ≝ a ≤ b**, **a < b ∨ a > b ≝ a ≠ b**, and **a = b ∨ a > b ≝ a ≥ b**; the ternary disjunction **a < b ∨ a = b ∨ a >
b**, that expresses complete uncertainty; and the combination of 0 basic relations.

For IA, given 13 basic relations, we get 8192 (= 2<sup>13</sup>) possible _general relations_. The 13 basic relations
are an _orthogonal basis_ for all possible general relations.

This includes the _full relation_ **i<sub>1</sub> (pmoFDseSdfOMP) i<sub>2</sub>** (comparable to **a = b ∨ a > b ≝ a ≥
b** with points), which expresses the maximum uncertainty about the relation between two intervals. The _full relation_
means you are from Barcelona.

The _empty relation_ **i<sub>1</sub> () i<sub>2</sub>** is not a true relation. It does not express a relational
condition between two intervals. It is needed for consistency with some algebraic operations on relations.

## Notation

When discussing specific Allen relations in isolation, we write the basic relations they are composed of in brackets.
**i<sub>1</sub> (sedf) i<sub>2</sub>** expresses that we know for certain that **i<sub>1</sub>** _starts_, _is equal
to_, is _during_, or _finishes_ **i<sub>2</sub>**, and does not _precede_, _meet_, _overlaps with_, _is finished by_,
_contains_, _is overlapped by_, _is met by_, nor is _preceded by_ **i<sub>2</sub>**.

When the relation between 2 intervals **i<sub>1</sub>** and **i<sub>2</sub>** is, e.g., **(oFD)**, we write **i1 (oFD)
i2** or **AR(i<sub>1</sub>, i<sub>2</sub>) = (oFD)**.

As variables, they are often denoted **R<sub>1</sub>**, **R<sub>2</sub>**, …. E.g.: **R<sub>1</sub> = (sedf)**.

The set of all general Allen relations is denoted **𝓐** (Allen’s interval algebra).

Combined, **i<sub>1</sub> R<sub>1</sub> i<sub>2</sub>** expresses that we know the Allen relation from **i<sub>1</sub>**
to **i<sub>2</sub>** is **R<sub>1</sub>**.

## Operations

The set of 8192 general Allen relations for an algebra, with the following operations:

### Implication

**R<sub>1</sub> ⊢ R<sub>2</sub>** expresses that **R<sub>1</sub>** _implies_ **R<sub>2</sub>**, and that
**R<sub>2</sub>** _is implied by_ **R<sub>1</sub>**. **R<sub>3</sub> ⊬ R<sub>4</sub>** expresses that **R<sub>3</sub>**
_does not imply_ **R<sub>4</sub>**.

For example, **(se) ⊢ (sedf)**: knowing **i<sub>1</sub> (se) i<sub>2</sub>** _implies_ knowning **i<sub>1</sub> (sedf)
i<sub>2</sub>**. If **i1** _starts_ or _equals_ **i2**, it is true that it _starts_, _equals_, is _during_, or
_finishes_ **i<sub>2</sub>**.

The implication is often used to verify whether a constraint is upheld. Suppose we require **i<sub>1</sub> (sedf)
i<sub>2</sub>**, and our reasoning leads us to know **i<sub>1</sub> (se) i<sub>2</sub>**. Because **(se) ⊢ (sedf)**, we
are sure the constraint is upheld. When our reasoning leads us to know **i<sub>1</sub> (sedfOMP) i<sub>2</sub>** instead
we are not certain the constraint is upheld. **(sedfOMP) ⊬ (sedf)**, because the relation could also be **O**, **M**, or
**P**. When our reasoning leads us to know **i<sub>1</sub> (pm) i<sub>2</sub>**, we are certain the constraint is not
upheld. **(pm) ⊬ (sedf)**: we explicitly know the relation is not **s**, **e**, **d**, nor **f**.

The implicitation is

- reflexive: **∀ R ∈ 𝓐: R ⊢ R**
- anti-symmetric: **∀ R<sub>1</sub>, R<sub>2</sub> ∈ 𝓐: R<sub>1</sub> ⊢ R<sub>2</sub> ∧ R<sub>2</sub> ⊢ R<sub>1</sub> ⇒
  R<sub>1</sub> = R<sub>2</sub>**
- transitive: **∀ R<sub>1</sub>, R<sub>2</sub>, R<sub>3</sub> ∈ 𝓐: R<sub>1</sub> ⊢ R<sub>2</sub> ∧ R<sub>2</sub> ⊢
  R<sub>3</sub> ⇒ R<sub>1</sub> ⊢ R<sub>3</sub>**

and thus defines a partial order on **𝓐**.

### Complement

The complement of an Allen relation is the disjunction of all basic relations that are not implied by the Allen
relation. The complement of _R_ is denoted _~R_.

> `~(pmoFDs)` = `(eSdfOMP)`

The complement of a basic relation is the disjunction of all the other basic relations. E.g.:

> `~(p)` = `(moFDseSdfOMP)`

The complement of the complement of an Allen relation is the orginal Allen relation.

> ~(~R) = R

**Be aware that the complement has in general a different meaning than a logic negation.**

<div style="background-color: red; color: white; padding: 5mm;">// TODO</div>

### Disjunction (or)

The disjunction _R<sub>1</sub> ∨ R<sub>2</sub>_ is the union of all basic relations in _R<sub>1</sub>_ and
_R<sub>2</sub>_`, when they are considered as sets of basic relations. E.g.:

> `(se)` ∨ `(edf)` = `(sedf)`

The disjunction commutes, and is associative.

> R<sub>1</sub> ∨ R<sub>2</sub> = R<sub>2</sub> ∨ R<sub>1</sub>
>
> (R<sub>1</sub> ∨ R<sub>2</sub>) ∨ R<sub>3</sub> = R<sub>1</sub> ∨ (R<sub>2</sub> ∨ R<sub>3</sub>)

The binary disjunction can be extended to a multi-parameter function _∨(R<sub>i</sub>)_:

> ∨(R<sub>1</sub>, R<sub>2</sub>, R<sub>3</sub>, R<sub>4</sub>) = R<sub>1</sub> ∨ R<sub>2</sub> ∨ R<sub>3</sub> ∨
> R<sub>4</sub>

### Conjunction (and)

The conjunction _R<sub>1</sub> ∧ R<sub>2</sub>_ is the intersection of all relations in _R<sub>1</sub>_ and
_R<sub>2</sub>_`, when they are considered as sets of basic relations. E.g.:

> `(pmoOMP)` ∧ `(oOFD)` = `(oO)`

The conjunction commutes, and is associative.

> R<sub>1</sub> ∧ R<sub>2</sub> = R<sub>2</sub> ∧ R<sub>1</sub>
>
> (R<sub>1</sub> ∧ R<sub>2</sub>) ∧ R<sub>3</sub> = R<sub>1</sub> ∧ (R<sub>2</sub> ∧ R<sub>3</sub>)

The binary conjunction can be extended to a multi-parameter function _∧(R<sub>i</sub>)_:

> ∧(R<sub>1</sub>, R<sub>2</sub>, R<sub>3</sub>, R<sub>4</sub>) = R<sub>1</sub> ∧ R<sub>2</sub> ∧ R<sub>3</sub> ∧
> R<sub>4</sub>

### Converse

The _converse_ of an Allen relation _R_, denoted _R^_, is the relation when the argument intervals are switched:

> i<sub>1</sub> R i<sub>2</sub> ⇔ i<sub>2</sub> R^ <sub>1</sub>

The converse of a basic relation is defined:

> `(p)^` = `(P)`
>
> `(m)^` = `(M)`
>
> `(o)^` = `(O)`
>
> `(F)^` = `(f)`
>
> `(D)^` = `(d)`
>
> `(s)^` = `(S)`
>
> `(e)^` = `(e)`
>
> `(S)^` = `(s)`
>
> `(d)^` = `(D)`
>
> `(f)^` = `(F)`
>
> `(O)^` = `(o)`
>
> `(M)^` = `(m)`
>
> `(P)^` = `(p)`

The converse of a general Allen relation _R_ is the disjunction of the converse relations of the basic relations that
are implied by _R_. E.g.:

> `(pmoFDse)^` = `(eSdfOMP)`

The converse of the converse of an Allen relation is the orginal Allen relation.

> (R^)^ = R

### Difference (min)

The difference _R<sub>1</sub> \ R<sub>2</sub>_ between 2 Allen relations _R<sub>1</sub>_ and _R<sub>2</sub>_ is the
relation that contains all basic relations of _R<sub>1</sub>_ that are not in _R<sub>2</sub>_. E.g.:

> `(sedf)` \ `(se)` = `(df)`

The difference does not commute, is not associative:

> R<sub>1</sub> \ R<sub>2</sub> ≠ R<sub>2</sub> \ R<sub>1</sub>
>
> (R<sub>1</sub> \ R<sub>2</sub>) \ R<sub>3</sub> ≠ R<sub>1</sub> \ (R<sub>2</sub> \ R<sub>3</sub>)

### Composition

Given knowledge about the relation between intervals _i<sub>1</sub>_, _i<sub>2</sub>_, and between _i<sub>2</sub>_ and
_i<sub>3</sub>_, we can derive knowledge about the relation between intervals _i<sub>1</sub>_ and _i<sub>3</sub>_
through composition, denoted _R<sub>12</sub> ⊕ R<sub>23</sub>_.

> (i<sub>1</sub> R<sub>12</sub> i<sub>2</sub>) ∧ (i<sub>2</sub> R<sub>23</sub> i<sub>3</sub>) ⇒ i<sub>1</sub>
> (R<sub>12</sub> ⊕ R<sub>23</sub>) i<sub>3</sub>

Composition is the most important operation for inference, combined with the converse and the conjunction.

Composition does not commute, but is associative, and distributes over the disjunction:

> R<sub>1</sub> ⊕ R<sub>2</sub> ≠ R<sub>2</sub> ⊕ R<sub>1</sub>
>
> (R<sub>1</sub> ⊕ R<sub>2</sub>) ⊕ R<sub>3</sub> = R<sub>1</sub> ⊕ (R<sub>2</sub> ⊕ R<sub>3</sub>)
>
> (R<sub>1</sub> ∨ R<sub>2</sub>) ⊕ R<sub>3</sub> = (R<sub>1</sub> ⊕ R<sub>3</sub>) ∨ (R<sub>2</sub> ⊕ R<sub>3</sub>)
>
> R<sub>1</sub> ⊕ (R<sub>2</sub> ∨ R<sub>3</sub>) = (R<sub>1</sub> ⊕ R<sub>2</sub>) ∨ (R<sub>1</sub> ⊕ R<sub>3</sub>)

The latter is used to find the composition of general Allen relations. We determine the compositions for the cartesian
product of all basic relations, and then combine those results for general Allen relations. E.g., we can determine that:

> (i<sub>1</sub> `(p)` i<sub>2</sub>) ∧ (i<sub>2</sub> `(s)` i<sub>3</sub>) ⇒ i<sub>1</sub> `(p)` i<sub>3</sub>: `(p)` ⊕
> `(s)` = `(p)`
>
> (i<sub>1</sub> `(S)` i<sub>2</sub>) ∧ (i<sub>2</sub> `(s)` i<sub>3</sub>) ⇒ i<sub>1</sub> `(seS)` i<sub>3</sub>: `(S)`
> ⊕ `(s)` = `(seS)`
>
> (i<sub>1</sub> `(p)` i<sub>2</sub>) ∧ (i<sub>2</sub> `(D)` i<sub>3</sub>) ⇒ i<sub>1</sub> `(p)` i<sub>3</sub>: `(p)` ⊕
> `(D)` = `(p)`
>
> (i<sub>1</sub> `(S)` i<sub>2</sub>) ∧ (i<sub>2</sub> `(D)` i<sub>3</sub>) ⇒ i<sub>1</sub> `(D)` i<sub>3</sub>: `(S)` ⊕
> `(D)` = `(D)`

The compositions of all basic relations are shown in the [basic compositions table].

Then, we derive:

> `(pS)` ⊕ `(sD)`
>
> = (`(p)` ∨ `(S)`) ⊕ `(sD)`
>
> = (`(p)` ⊕ `(sD)`) ∨ (`(S)` ⊕ `(sD)`)
>
> = (`(p)` ⊕ (`(s)` ∨ `(D)`)) ∨ (`(S)` ⊕ (`(s)` ∨ `(D)`))
>
> = (`(p)` ⊕ `(s)`) ∨ (`(p)` ⊕ `(D)`) ∨ (`(S)` ⊕ `(s)` ∨ (`(S)` ⊕ `(D)`)
>
> = `(p)` ∨ `(p)` ∨ `(seS)` ∨ `(D)`
>
> = `(pseSD)`

Note that we can use the converse to determine _i<sub>1</sub> `(.)` i<sub>3</sub>_ if, e.g., not _i<sub>2</sub>
R<sub>23</sub> i<sub>3</sub>_ is known, but _i<sub>3</sub> R<sub>32</sub> i<sub>2</sub>_ is:

> (i<sub>1</sub> R<sub>12</sub> i<sub>2</sub>) ∧ (i<sub>3</sub> R<sub>32</sub> i<sub>2</sub>) ⇒ i<sub>1</sub>
> (R<sub>12</sub> ⊕ R<sub>32</sub>^) i<sub>3</sub>

[allen]: https://dl.acm.org/doi/pdf/10.1145/182.358434
[wikipedia]: https://en.wikipedia.org/wiki/Allen%27s_interval_algebra
[alspaugh]: https://www.ics.uci.edu/~alspaugh/cls/shr/allen.html
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
[basic compositions table]: https://www.ics.uci.edu/~alspaugh/cls/shr/allen.html#BasicCompositionsTable
