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

# @toryt/allen

Reason about relations between intervals, and between points and intervals, in JavaScript and TypeScript.

In 1983, James Allen proposed reasoning about the relationships between intervals with an interval algebra (IA): [Allen,
James F. “Maintaining knowledge about temporal intervals”], _Communications of the ACM 26(11) pages 832-843; November
1983_.

Good synopses of this theory are

- [Wikipedia]
- [Thomas A. Alspaugh “Allen's interval algebra”].

Allen noticed that reasoning about time often has to deal with incomplete or imprecise data, and that this is difficult
when this is done with points on a time axis (“state space approaches”). He found that reasoning instead about the
relationships between _intervals as first class objects_, without mapping them to a time axis, is often easier and leads
to better results. This is not limited to reasoning about time, but applies to all domains where intervals are used on a
set with [strict total order].

This library realizes Allen’s Interval Algebra, and offers his implementation for inference.

The main reason for the existence of this library however is the fact that in modern business software we are confronted
with incomplete and imprecise data about time with points on a time axis nevertheless. It is used as a dependency in
[@toryt/intervals], which attempts to bridge the gap. [ppwcode dotnet-util-allen] offers a C# version of the
functionality of this library.

Allen’s Interval Algebra is an algebra over a set with 13 relations as elements. The approach however is more general,
and can also be applied to sets with a different number of relations (e.g., 3 for the [strict total order] (&lt;, =,
&gt;), or 5 for the relationships between points and intervals). Allen’s Interval Algebra is realized in this library as
a specialization of a more general class, that allows other extensions for algebras with a different number of elements.

[TOC]

## Introduction

We find that there are 13 _basic relations_ possible between definite intervals. In this library, we use the notation as
found in [Thomas A. Alspaugh “Allen's interval algebra”].

|                               Basic relation | AR(i<sub>1</sub>,&nbsp;i<sub>2</sub>) | Illustration                          |
| -------------------------------------------: | :-----------------------------------: | ------------------------------------- |
|         i<sub>1</sub> precedes i<sub>2</sub> |                  (p)                  | ![precedes][precedes]                 |
|            i<sub>1</sub> meets i<sub>2</sub> |                  (m)                  | ![meets][meets]                       |
|         i<sub>1</sub> overlaps i<sub>2</sub> |                  (o)                  | ![overlaps][overlaps]                 |
|   i<sub>1</sub> is finished by i<sub>2</sub> |                  (F)                  | ![is finished by][is finished by]     |
|         i<sub>1</sub> contains i<sub>2</sub> |                  (D)                  | ![contains][contains]                 |
|           i<sub>1</sub> starts i<sub>2</sub> |                  (s)                  | ![starts][starts]                     |
|           i<sub>1</sub> equals i<sub>2</sub> |                  (e)                  | ![equals][equals]                     |
|    i<sub>1</sub> is started by i<sub>2</sub> |                  (S)                  | ![is started by][is started by]       |
|           i<sub>1</sub> during i<sub>2</sub> |                  (d)                  | ![during][during]                     |
|         i<sub>1</sub> finishes i<sub>2</sub> |                  (f)                  | ![finishes][finishes]                 |
| i<sub>1</sub> is overlapped by i<sub>2</sub> |                  (O)                  | ![is overlapped by][is overlapped by] |
|        i<sub>1</sub> is met by i<sub>2</sub> |                  (M)                  | ![is met by][is met by]               |
|   i<sub>1</sub> is preceded by i<sub>2</sub> |                  (P)                  | ![is preceded by][is preceded by]     |

These 13 _basic relations_ are an orthogonal basis for all possible _general_ relation-conditions between two intervals
(`AllenRelation`).

**i<sub>1</sub> (pm) i<sub>2</sub>** says that an interval i<sub>1</sub> _precedes **or** meets_ an interval
i<sub>2</sub>. **i<sub>3</sub> (FDseSdf) i<sub>4</sub>** says that an interval i<sub>3</sub> _is finished by **or**
contains **or** starts **or** equals **or** is started by **or** is during **or** finishes_ an interval i<sub>4</sub>.
This implies **¬ (i<sub>3</sub> (pmoOMP) i<sub>4</sub>)**: i<sub>3</sub> _does not precede **and** does not meet **and**
does not overlap **and** is not overlapped by **and** is not met by **and** is not preceded by_ i<sub>4</sub>.

Each general relation expresses a certain amount of _uncertainty_, where a basic relation expresses certainty, and the
**FULL** relation **(pmoFDseSdfOMP)** expresses complete uncertainty.

These 8192 (2<sup>13</sup>), general relations form an algebra, with the operations:

- **∁** `complement`
- **~** `converse`
- **\\** `min`
- **∨** (disjunction, union, `or`)
- **∧** (conjunction, intersection, `and`)
- **⨾** (`compose`)

A relation `implies` another relation, or not. E.g., if we have determined that a relation between i<sub>1</sub> and
i<sub>2</sub> is **(oO)**, and we need it to be **(pmoOMP)**, this is ok because **(oO) ⊢ (pmoOMP)**. If the relation is
**(oeO)** however, it is not ok (**(oO) ⊬ (pmoOMP)**), because **(pmoOMP)** does not allow the intervals to be equal
(**(e)**).

When the relation between 2 intervals i<sub>1</sub> and i<sub>2</sub> is, e.g., **(oFD)**, we write **i1 (oFD) i2** or
**AR(i<sub>1</sub>, i<sub>2</sub>) = (oFD)**.

## Details

- [Allen Relations]
- [Interval Constraints]
- [Points as intervals]
- [Comparing points with intervals]
- [Code documentation]

## Where to find

Repo, CI, issues, pull requests This project is maintained in [Bitbucket] (repo, CI, issues, pull requests, …).

<p style="background-color: lightyellow; color: darkgray;"><strong>TODO</strong> Branches are copied automatically 
to [GitHub] by CI. This is done as backup, and because open source projects are more easily found there. Issues and 
pull requests there will not be reviewed.</p>

### npm

[@toryt/allen][npm]

## Style

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

This code uses the [application to TypeScript][eslint-config-standard-with-typescript] of the [Standard] coding style.

All functions and methods are protected with explicit `assert`s, that throw when a precondition is violated. Although
written in TypeScript, types are verified dynamically too, so that type safety is ensured dynamically when the library
is used with plain JavaScript too.

Tests require complete code coverage.

### Linting and formatting

`eslint` is used for linting, and `prettier` for code formatting. But it is hell to get them to work together nicely,
for years. At this time,
[Setting up ESlint with Standard and Prettier](https://medium.com/nerd-for-tech/setting-up-eslint-with-standard-and-prettier-be245cb9fc64)
seems to be a viable approach.

## Further reading

- [van Beek, Peter; Cohen, Robin “Exact and Approximate Reasoning about Temporal Relations”], _Computational
  Intelligence 6:132-144, 1990_
- [Hogge, J. C. “TPLAN: A Temporal Interval-Based Planner with Novel Extensions”], _University of Illinois Department of
  Computer Science Technical Report UIUCDCS-R-87-1367, September 1987_ (no version found on the internet)
- [Freuder, E. C. “Synthesizing Constraint Expressions”], _Communications of the ACM 21 pages 958-966; November 1978_
- [Eriksson, Leif; Lagerkvist, Victor “Improved Algorithms for Allen’s Interval Algebra: a Dynamic Programming
  Approach”], _Proceedings of the Thirtieth International Joint Conference on Artificial Intelligence (IJCAI-21)_
- [”Principles of Knowledge Representation and Reasoning; Proceedings of the Second International Conference”]

## License

Released under the [Apache License, Version 2.0][license].

<div style="font-style: italic; color: darkslategray;">
<p>Copyright © 2022 – 2023 by Jan Dockx</p>

<p>Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with
the License. You may obtain a copy of the License at</p>

<p style="margin-left: 1cm;"><a href="http://www.apache.org/licenses/LICENSE-2.0">http://www.apache.org/licenses/LICENSE-2.0</a></p>

<p>Unless required by applicable law or agreed to in writing, software distributed under the License is distributed 
on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for 
the specific language governing permissions and limitations under the License.</p>
</div>

## Notes

This code was based on
[a Java implementation](https://github.com/jandppw/ppwcode-recovered-from-google-code/tree/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval)
last updated in December 2008.

<!---
All links are to Bitbucket, and not relative, because otherwise they do not work on the `npm` page.
-->

[precedes]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/precedes.png
[meets]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/meets.png
[overlaps]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/overlaps.png
[is finished by]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/finishedBy.png
[contains]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/contains.png
[starts]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/starts.png
[equals]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/equals.png
[is started by]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/startedBy.png
[during]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/during.png
[finishes]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/finishes.png
[is overlapped by]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/overlappedBy.png
[is met by]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/metBy.png
[is preceded by]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/precededBy.png
[allen, james f. “maintaining knowledge about temporal intervals”]: https://dl.acm.org/doi/pdf/10.1145/182.358434
[wikipedia]: https://en.wikipedia.org/wiki/Allen%27s_interval_algebra
[thomas a. alspaugh “allen's interval algebra”]: https://www.ics.uci.edu/~alspaugh/cls/shr/allen.html
[@toryt/intervals]: https://bitbucket.org/toryt/intervals
[ppwcode dotnet-util-allen]: https://bitbucket.org/ppwcode/dotnet-util-allen
[strict total order]: https://en.wikipedia.org/wiki/Total¬_order
[precedes]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/precedes.png
[meets]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/meets.png
[overlaps]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/overlaps.png
[is finished by]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/finishedBy.png
[contains]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/contains.png
[starts]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/starts.png
[equals]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/equals.png
[is started by]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/startedBy.png
[during]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/during.png
[finishes]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/finishes.png
[is overlapped by]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/overlappedBy.png
[is met by]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/metBy.png
[is preceded by]: https://bitbucket.org/toryt/allen/raw/master/img/ar-basic/precededBy.png
[allen relations]: https://bitbucket.org/toryt/allen/src/master/doc/AllenRelation.md
[interval constraints]: https://bitbucket.org/toryt/allen/src/master/doc/IntervalConstraints.md
[points as intervals]: https://bitbucket.org/toryt/allen/src/master/doc/PointAsIntervals.md
[comparing points with intervals]: https://bitbucket.org/toryt/allen/src/master/doc/ComparingPointsWithIntervals.md
[code documentation]: https://bitbucket.org/toryt/allen/src/master/docs/index.html
[van Beek, Peter; Cohen, Robin “Exact and Approximate Reasoning about Temporal Relations”]:
  https://cs.uwaterloo.ca/~vanbeek/Publications/ci90.pdf
[Hogge, J. C. “TPLAN: A Temporal Interval-Based Planner with Novel Extensions”]:
  https://books.google.be/books/about/TPLAN.html?id=Sm85jtrtS7gC&redir_esc=y
[Freuder, E. C. “Synthesizing Constraint Expressions”]: https://dl.acm.org/doi/10.1145/359642.359654
[Eriksson, Leif; Lagerkvist, Victor “Improved Algorithms for Allen’s Interval Algebra: a Dynamic Programming Approach”]:
  https://www.ijcai.org/proceedings/2021/0258.pdf
[”Principles of Knowledge Representation and Reasoning; Proceedings of the Second International Conference”]:
  https://kr.org/proceedings/KR-1991-proceedings-scanned.pdf
[bitbucket]: https://bitbucket.org/toryt/allen
[github]: https://github.com/Toryt/allen
[npm]: https://www.npmjs.com/package/@toryt/allen
[standard]: https://standardjs.com
[eslint-config-standard-with-typescript]: https://github.com/standard/eslint-config-standard-with-typescript
[license]: https://bitbucket.org/toryt/allen/src/master/LICENSE
