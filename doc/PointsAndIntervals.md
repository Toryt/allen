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

## Right-half open interval

_**MUDO:** explain_

## No degenerate intervals

An interval **[p, p[**, where the start and the end are the same point, would be a _degenerate interval_. This is not an
interval in our definition, because that states **p<sub>1</sub> < p<sub>2</sub>**.

This is a deliberate choice. We found that allowing degenerate intervals invokes complexity at different points, and
does not add to the useability.

## Indefinite intervals

_**MUDO:** explain_

## 𝓟 is not necessarily a continous, uncountably infinite set with a strict total order

In none of the above it is required that **𝓟** is a continous, uncountably infinite set, with a [strict total order],
isomorph with **ℝ**. The only requirement on **𝓟** is that an [equivalence relation] **=** and a [strict partial order]
**<** is defined.

**𝓟** might be a finite set, such as a set of colors, or countable, such as **ℕ**.

Working with a [non-total strict order][strict partial order] means that some points cannot be compared.
**¬(p<sub>1</sub> < p<sub>2</sub>)** does _not_ imply **p<sub>1</sub> ≥ p<sub>2</sub>** (i.e., **p<sub>1</sub> =
p<sub>2</sub> ∨ p<sub>2</sub> < p<sub>1</sub>**). When points are incomparable, all 3 point-relations are false at the
same time:

> ¬(p<sub>1</sub> < p<sub>2</sub>) ∧ ¬(p<sub>1</sub> = p<sub>2</sub>) ∧ ¬(p<sub>2</sub> < p<sub>1</sub>)
>
> ⇔ ¬(p<sub>1</sub> < p<sub>2</sub> ∨ p<sub>1</sub> = p<sub>2</sub> ∨ p<sub>2</sub> < p<sub>1</sub>)

In contrast to a [strict total order], **p<sub>1</sub> < p<sub>2</sub> ∨ p<sub>1</sub> = p<sub>2</sub> ∨ p<sub>2</sub> <
p<sub>1</sub>** is _not_ a tautology:

> (p<sub>1</sub> < p<sub>2</sub> ∨ p<sub>1</sub> = p<sub>2</sub> ∨ p<sub>2</sub> < p<sub>1</sub>) ≠ true

An example is classic relativistic time.

Looking at the definition of **𝓘** as couples of points, the couples where **p<sub>1</sub> < p<sub>2</sub> = false** are
excluded. With a [non-total strict order][strict partial order] there are couples that are excluded, not because
**p<sub>1</sub> ≥ p<sub>2</sub>**, but because **p<sub>1</sub>** and **p<sub>2</sub>** are _incomparable_. There are
“less” intervals.

The defininitions of the 13 basic relations of IA all require 1 or more of the point-relations to be **true**. The
definitions explicitly do _not_ mention some of the relations, which might thus be either **true** or **false**.

## Basic relations imply a strict total order on the points involved

Note that for most definitions of _basic_ Allen relations, some relations between the 4 points are explicitly not
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

|                                     | 𝓈(i<sub>1</sub>) = 𝓈(i<sub>2</sub>) | ℯ(i<sub>1</sub>) | ℯ(i<sub>2</sub>) |
| ----------------------------------- | ----------------------------------- | ---------------- | ---------------- |
| 𝓈(i<sub>1</sub>) = 𝓈(i<sub>2</sub>) | =                                   | <                | <                |
| ℯ(i<sub>1</sub>)                    |                                     | =                | <                |
| ℯ(i<sub>2</sub>)                    |                                     |                  | =                |

and so do **m**, **(F)**, **(S)**, **(f)**, and **M**.

**(e)** expresses a [strict total order] between both points:

|                                     | 𝓈(i<sub>1</sub>) = 𝓈(i<sub>2</sub>) | ℯ(i<sub>1</sub>) = ℯ(i<sub>2</sub>) |
| ----------------------------------- | ----------------------------------- | ----------------------------------- |
| 𝓈(i<sub>1</sub>) = 𝓈(i<sub>2</sub>) | =                                   | <                                   |
| ℯ(i<sub>1</sub>) = ℯ(i<sub>2</sub>) |                                     | =                                   |

This is not true for general Allen Relations though. Explicitly not mentioning some point relations in the definitions
leaves room for indefinite relations between points.

<div style='margin: 2mm; padding: 5mm; background-color: red; color: yellow'>
<strong>MUDO:</strong> below is wrong. Is there a way to get it right?
</div>

Consider Alice and Bob. For both, we look at 2 intervals that meet:

> - i<sub>a1</sub> (m) i<sub>a2</sub>
>
> - i<sub>b1</sub> (m) i<sub>b2</sub>

For both Alice and Bob, 3 points are involved, since **(m)** implies **ℯ(i<sub>a1</sub>) = 𝓈(i<sub>a2</sub>)** and
**ℯ(i<sub>b1</sub>) = 𝓈(i<sub>b2</sub>)**. We will call these middle points **p<sub>am</sub>** and **p<sub>bm</sub>**.

Alice stays in one inertial frame of reference for our experiment, while Bob travels away at some speed in
**i<sub>b1</sub>**, and returns to Alice at another speed in **i<sub>b2</sub>**. Bob’s inertial reference frame changes
at **p<sub>bm</sub>**.

Alice’s and Bob’s first intervals start together, and their second intervals end together:

> - i<sub>a1</sub> (seS) i<sub>b1</sub>
>
> - i<sub>a2</sub> (Fef) i<sub>b2</sub>

Note that these relations are non-basic. This says nothing about the relation between **p<sub>am</sub>** and
**p<sub>bm</sub>**.

> i<sub>a1</sub> (seS) i<sub>b1</sub>
>
> ⇔ (𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>) ∧ p<sub>am</sub> < p<sub>bm</sub>)
>
> &nbsp;&nbsp;&nbsp;&nbsp;∨ (𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>) ∧ p<sub>am</sub> = p<sub>bm</sub>)
>
> &nbsp;&nbsp;&nbsp;&nbsp;∨ (𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>) ∧ p<sub>bm</sub> < p<sub>am</sub>)
>
> ⇔ 𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>)
>
> &nbsp;&nbsp;&nbsp;&nbsp;∧ (p<sub>am</sub> < p<sub>bm</sub> ∨ p<sub>am</sub> = p<sub>bm</sub> ∨ p<sub>bm</sub> <
> p<sub>am</sub>)
>
> <div style='margin: 2mm; padding: 5mm; background-color: red; color: yellow'>
> This step is the problem. We just said that <bold>(p<sub>am</sub> < p<sub>bm</sub> ∨ p<sub>am</sub> = 
> p<sub>bm</sub> ∨ p<sub>bm</sub> < p<sub>am</sub>) ≠ true</bold>. Stronger, the statement above explicitly says that
> <bold>p<sub>am</sub></bold> and <bold>p<sub>bm</sub></bold> <strong>must</strong> be related.
> </div>
>
> ⇔ 𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>) ∧ true
>
> ⇔ 𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>)

> i<sub>a2</sub> (FeF) i<sub>b2</sub>
>
> ⇔ (p<sub>am</sub> < p<sub>bm</sub> ∧ ℯ(i<sub>a2</sub>) = ℯ(i<sub>b2</sub>))
>
> &nbsp;&nbsp;&nbsp;&nbsp;∨ (p<sub>am</sub> = p<sub>bm</sub> ∧ ℯ(i<sub>a2</sub>) = ℯ(i<sub>b2</sub>))
>
> &nbsp;&nbsp;&nbsp;&nbsp;∨ (p<sub>bm</sub> < p<sub>am</sub> ∧ ℯ(i<sub>a2</sub>) = ℯ(i<sub>b2</sub>))
>
> ⇔ (p<sub>am</sub> < p<sub>bm</sub> ∨ p<sub>am</sub> = p<sub>bm</sub> ∨ p<sub>bm</sub> < p<sub>am</sub>)
>
> &nbsp;&nbsp;&nbsp;&nbsp;∧ ℯ(i<sub>a2</sub>) = ℯ(i<sub>b2</sub>)
>
> <div style='margin: 2mm; padding: 5mm; background-color: red; color: yellow'>
> This step is the problem. We just said that <bold>(p<sub>am</sub> < p<sub>bm</sub> ∨ p<sub>am</sub> = 
> p<sub>bm</sub> ∨ p<sub>bm</sub> < p<sub>am</sub>) ≠ true</bold>. Stronger, the statement above explicitly says that
> <bold>p<sub>am</sub></bold> and <bold>p<sub>bm</sub></bold> <strong>must</strong> be related.
> </div>
>
> ⇔ true ∧ ℯ(i<sub>a2</sub>) = ℯ(i<sub>b2</sub>)
>
> ⇔ ℯ(i<sub>a2</sub>) = ℯ(i<sub>b2</sub>)

<div style='margin: 2mm; padding: 5mm; background-color: red; color: yellow'>
A solution would be, in the definitions, to never say explicitly that points are related in some way, but rather 
that they are not related in the other 2 ways. This keeps everything as it is when a total order is used. E.g.:
</div>

> i<sub>a1</sub> (seS) i<sub>b1</sub>
>
> ⇔ (𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>) ∧ ¬(p<sub>am</sub> = p<sub>bm</sub>) ∧ ¬(p<sub>bm</sub> < p<sub>am</sub>))
>
> &nbsp;&nbsp;&nbsp;&nbsp;∨ (𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>) ∧ ¬(p<sub>am</sub> < p<sub>bm</sub>) ∧
> ¬(p<sub>bm</sub> < p<sub>am</sub>))
>
> &nbsp;&nbsp;&nbsp;&nbsp;∨ (𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>) ∧ ¬(p<sub>am</sub> < p<sub>bm</sub>) ∧
> ¬(p<sub>am</sub> = p<sub>bm</sub>))
>
> ⇔ 𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>)
>
> &nbsp;&nbsp;&nbsp;&nbsp;∧ ( (¬(p<sub>am</sub> = p<sub>bm</sub>) ∧ ¬(p<sub>bm</sub> < p<sub>am</sub>))
>
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;∨ (¬(p<sub>am</sub> < p<sub>bm</sub>) ∧ ¬(p<sub>bm</sub> <
> p<sub>am</sub>))
>
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;∨ (¬(p<sub>am</sub> < p<sub>bm</sub>) ∧ ¬(p<sub>am</sub> =
> p<sub>bm</sub>)) )
>
> ⇔ 𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>)
>
> &nbsp;&nbsp;&nbsp;&nbsp;∧ ( ¬(p<sub>am</sub> = p<sub>bm</sub> ∨ p<sub>bm</sub> < p<sub>am</sub>)
>
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;∨ ¬(p<sub>am</sub> < p<sub>bm</sub> ∨ p<sub>bm</sub> <
> p<sub>am</sub>))
>
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;∨ ¬(p<sub>am</sub> < p<sub>bm</sub> ∨ p<sub>am</sub> = p<sub>bm</sub>)
> )
>
> ⇔ 𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>)
>
> &nbsp;&nbsp;&nbsp;&nbsp;∧ ¬( (p<sub>am</sub> = p<sub>bm</sub> ∨ p<sub>bm</sub> < p<sub>am</sub>)
>
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;∧ (p<sub>am</sub> < p<sub>bm</sub> ∨ p<sub>bm</sub> < p<sub>am</sub>))
>
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;∧ (p<sub>am</sub> < p<sub>bm</sub> ∨ p<sub>am</sub> = p<sub>bm</sub>)
> )
>
> ⇔ 𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>) ∧ ¬(false)
>
> ⇔ 𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>) ∧ true
>
> ⇔ 𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>)
>
> _(Any 2 of the 3 disjunctions cannot be true at the same time, because a partial order is irreflexive. If
> p<sub>am</sub> = p<sub>bm</sub> is true, then (p<sub>am</sub> < p<sub>bm</sub> ∨ p<sub>bm</sub> < p<sub>am</sub>) is
> false. If p<sub>bm</sub> < p<sub>am</sub> is true, then (p<sub>am</sub> < p<sub>bm</sub> ∨ p<sub>am</sub> =
> p<sub>bm</sub>) is false.)_

<div style="margin: 2mm; padding: 5mm; background-color: red; color: yellow">
Above nowhere it is said that <bold>p<sub>am</sub></bold> and <bold>p<sub>bm</sub></bold> must be related. Problem 
solved (not).
<br />
<br />
This has to be done everywhere. <bold>𝓈(i<sub>a1</sub>) = 𝓈(i<sub>b1</sub>)</bold> above has to be replaced with
<bold>¬(𝓈(i<sub>a1</sub>) < 𝓈(i<sub>b1</sub>)) ∧ ¬(𝓈(i<sub>b1</sub>) < 𝓈(i<sub>a1</sub>)) ⇔ ¬(𝓈(i<sub>a1</sub>) <
𝓈(i<sub>b1</sub>) ∨ 𝓈(i<sub>b1</sub>) < 𝓈(i<sub>a1</sub>))</bold>. We can no longer conclude that <bold>𝓈(i<sub>a1</sub>)
= 𝓈(i<sub>b1</sub>)</bold>, but rather that they are equal, <em>or incomparable</em>.
<br />
<br />
This no longer expresses that “Alice’s and Bob’s first intervals start together”. With these definitions, the basic
relations are no longer complete. That “Alice’s and Bob’s first intervals start together” can no longer be expressed.
<br />
<br />
The conclusion is that
<ol style="margin: 2mm; padding: 5mm; background-color: red; color: yellow">
<li>the definitions are correct as they are for IA</li>
<li>although a partial order is all we need on 𝓟, the subset of points involved in any related intervals are 
totally ordered as a consequence of these definitions, and there is no way around that, without losing the core 
semantics of the 13 basic relations.
<li>Maybe something can be done with more basic relations, but in that case the basic relations will not be a basis
anymore.</li>
<li>although a partial order is all we need on 𝓟, when talking abount points involved in any related intervals
<bold>(p<sub>1</sub> < p<sub>2</sub> ∨ p<sub>1</sub> = p<sub>2</sub> ∨ p<sub>2</sub> < p<sub>1</sub>) <em>=</em> 
true</bold> for those points. This will help in reasoning.</li>
<li>IA cannot be used with special relativity. A paper that does this is mentioned however. Need to look that up.</li>
<li>When comparing points to intervals <bold>(p<sub>1</sub> < p<sub>2</sub> ∨ p<sub>1</sub> = p<sub>2</sub> ∨
p<sub>2</sub> < p<sub>1</sub>) <em>≠</em> true</bold>. What is the effect of this on reasoning about points as 
intervals?</li>
<li>Since the subset of all points involved in related intervals is totally ordered anyway, and we are only talking 
about interval relations, it is easier to define 𝓟 as totally ordered. If the user has a set with a partial order, 
the user can choose 𝓟 as a subset for which the order is total. Intervals of such disjunct subsets cannot be 
related anyway.</li>
<li>Change the text to reflect this. Say at the start that we need a total order. Then discuss that, up until now,
a partial order would have been enough. Then show that the definitions imply a total order on all points involved.
Then say it is easier to just demand a total order on 𝓟, and have the user select subsets, because _see above_. 
Finally note that special relativity is out.</li>
</ol>

</div>

We will call the common start point **p<sub>s</sub>**, and the common end point **p<sub>e</sub>**. Only 4 points are
involved in this example.

Since the 4 intervals are intervals, we know

> - p<sub>s</sub> < p<sub>am</sub>
>
> - p<sub>am</sub> < p<sub>e</sub>
>
> - p<sub>s</sub> < p<sub>bm</sub>
>
> - p<sub>bm</sub> < p<sub>e</sub>
>
> - p<sub>s</sub> < p<sub>e</sub> _(transitivity of < in 𝓟)_

|                | p<sub>s</sub> | p<sub>am</sub> | p<sub>bm</sub> | p<sub>e</sub> |
| -------------- | ------------- | -------------- | -------------- | ------------- |
| p<sub>s</sub>  | =             | <              | <              | <             |
| p<sub>am</sub> |               | =              | 🤷             | <             |
| p<sub>bm</sub> |               |                | =              | <             |
| p<sub>e</sub>  |               |                |                | =             |

The relation between **p<sub>am</sub>** and **p<sub>bm</sub>** is 🤷 undefined. Special relativity shows that we cannot
compare durations in different inertial reference frames consistently. There is only causality.

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
