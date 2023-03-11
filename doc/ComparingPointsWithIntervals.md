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

# Comparing points with intervals

We can also compare point representations with regular intervals. Consider the `start` and `end` of intervals as point
representations, representing intervals of fixed minimum length `pl`. We then know, with right half-open intervals,
`i.start (s) i` and `i.end (M) i`. We can now compose the relationship of a point representation `p` with `i.start` and
`i.end` with these relations, to find the relation with `i`. `⊕` represents the composition operator.

| `p ⨀ i.P` | `p (.) i.P` | `p (.) i.start ⊕ i.start (s) i` | `p (.) i.end ⊕ i.end (M) i` |
| --------- | ----------- | ------------------------------- | --------------------------- |
| <         | `(pm)`      | `(pm)`                          | `(pmoFsedf)`                |
| =         | `(e)`       | `(s)`                           | `(M)`                       |
| &gt;      | `(MP)`      | `(dfOMP)`                       | `(P)`                       |
| 🤷        | `(pmeMP)`   | `(pmsdfOMP)`                    | `(pmoFsedfMP)`              |

We then calculate the conjunction of the relationship between `p` and `i.start` with the relationship between `p` and
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
| &gt;          | `(MP)`          | <           | `(pm)`        | `(dfOMP) ∧ (pmoFsedf)`      | `(df)`      |
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

Note the asymmetry. This is a consequence of our choice to work with right half-open intervals. With another choice, the
same reasoning applies, but we would find different basic relations.

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
