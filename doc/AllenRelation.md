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

| Basic relation             | `(.)` | Illustration        | Definition (mentioned properties must be definite, and …)   |
| -------------------------- | ----- | ------------------- | ----------------------------------------------------------- |
| `i1` precedes `i2`         | `(p)` | ![precedes]         | `i1.end < i2.start`                                         |
| `i1` meets `i2`            | `(m)` | ![meets]            | `i1.end = i2.start`                                         |
| `i1` overlaps `i2`         | `(o)` | ![overlaps]         | `i1.start < i2.start ∧ i2.start < i1.end ∧ i1.end < i2.end` |
| `i1` is finished by `i2`   | `(F)` | ![is finished by]   | `i1.start < i2.start ∧ i1.end = i2.end`                     |
| `i1` contains `i2`         | `(D)` | ![contains]         | `i1.start < i2.start ∧ i2.end < i1.end`                     |
| `i1` starts `i2`           | `(s)` | ![starts]           | `i1.start = i2.start ∧ i1.end < i2.end`                     |
| `i1` equals `i2`           | `(e)` | ![equals]           | `i1.start = i2.start ∧ i1.end = i2.end`                     |
| `i1` is started by `i2`    | `(S)` | ![is started by]    | `i2.start = i1.start ∧ i2.end < i1.end`                     |
| `i1` during `i2`           | `(d)` | ![during]           | `i2.start < i1.start ∧ i1.end < i2.end`                     |
| `i1` finishes `i2`         | `(f)` | ![finishes]         | `i2.start < i1.start ∧ i1.end = i2.end`                     |
| `i1` is overlapped by `i2` | `(O)` | ![is overlapped by] | `i2.start < i1.start ∧ i1.start < i2.end ∧ i2.end < i1.end` |
| `i1` is met by `i2`        | `(M)` | ![is met by]        | `i2.end = i1.start`                                         |
| `i1` is preceded by `i2`   | `(P)` | ![is preceded by]   | `i2.end < i1.start`                                         |

These basic relations can be compared to the relations `<`, `=`, and `>` between 2 points.

When reasoning about the relationship between intervals however, like when comparing points, we also often employ
_indeterminate_ relations, such as `I1 (pm) I2` (`I1` `PRECEDES` `I2`, or `MEETS` `I2`). This is comparable to reasoning
with `≤`, `≥`, and `≠` with points.

For intervals, given 13 basic relations, we get 8192 (= 2<sup>13</sup>) possible _general relations_. The 13 basic
relations are an _orthogonal basis_ for all possible general relations. This includes the `FULL` relation (comparable to
`< ⋁ = ⋁ >` with points), which expresses the maximum uncertainty about the relation between two intervals. `FULL` means
you are from Barcelona. The `EMPTY` relation is not a true relation. It does not express a relational condition between
two intervals. It is needed for consistency with some algebraic operations on relations.

## Notation

_i<sub>1</sub> `(sedf)` i<sub>2</sub>_ expresses that we know for certain that _i<sub>1</sub>_ starts, is equal to, is
during, or finishes _i<sub>2</sub>_, and does not precede, meet, overlaps with, is finished by, contains, is overlapped
by, is met by, nor is preceded by _i<sub>2</sub>_.

When we are discussing an, as yet, unknown relation, we write _i<sub>1</sub> `(.)` i<sub>2</sub>_.

When discussing Allen relations in isolation, we write the basic relations they are composed of in brackets, e.g.,
`(sedf)`. As variables, they are often denoted _R<sub>1</sub>_, _R<sub>2</sub>_, …. E.g.: _R<sub>1</sub> = `(sedf)`_.

Combined, _i<sub>1</sub> R<sub>1</sub> i<sub>2</sub>_ expresses that we know the Allen relation from _i<sub>1</sub>_ to
_i<sub>2</sub>_ is _R<sub>1</sub>_.

## Operations

### Implication

_R<sub>1</sub> ⊆ R<sub>2</sub>_ expresses that _R<sub>1</sub>_ **implies** _R<sub>2</sub>_, and that _R<sub>2</sub>_
**is implied by** _R<sub>1</sub>_.

For example, _`(se)` ⊆ `(sedf)`_: knowing _i<sub>1</sub> `(se)` i<sub>2</sub>_ **implies** knowning _i<sub>1</sub>
`(sedf)` i<sub>2</sub>_. If _i1_ starts or is equal to _i2_, it is true that it starts, is equal to, is during, or
finishes _i<sub>2</sub>_.

The implication is often used to verify whether a constraint is upheld. We require _i<sub>1</sub> `(sedf)`
i<sub>2</sub>_, and our reasoning leads us to known _i<sub>1</sub> `(se)` i<sub>2</sub>_. Because _`(se)` ⊆ `(sedf)`_,
we know the constraint is upheld. When our reasoning leads us to know _i<sub>1</sub> `(sedfOMP)` i<sub>2</sub>_, or
_i<sub>1</sub> `(pm)` i<sub>2</sub>_, e.g., the constraint is not upheld.

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

[precedes]: AllenRelation-precedes.png
[meets]: AllenRelation-meets.png
[overlaps]: AllenRelation-overlaps.png
[is finished by]: AllenRelation-finishedBy.png
[contains]: AllenRelation-contains.png
[starts]: AllenRelation-starts.png
[equals]: AllenRelation-equals.png
[is started by]: AllenRelation-startedBy.png
[during]: AllenRelation-during.png
[finishes]: AllenRelation-finishes.png
[is overlapped by]: AllenRelation-overlappedBy.png
[is met by]: AllenRelation-metBy.png
[is preceded by]: AllenRelation-precededBy.png
[basic compositions table]: https://www.ics.uci.edu/~alspaugh/cls/shr/allen.html#BasicCompositionsTable
