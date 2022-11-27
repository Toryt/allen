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

# Intervals

`Interval` instances have a `start` and `end` [point](Points.md) property, that can be _indefinite_, expressed by
`undefined` or `null`.

We advise to use `undefined`, or not to have a `start` or `end` property present in an interval to express this, and
leave `null` well alone.

## Invariants

If both `start` and `end` are definite,

- both must be “of the same type”, and
- `start` must come before `end`, using the comparator given (`compareFn<T>`) or the default
  `ltCompare<T> (t1: T, t2: T): number`:

```
∀ i ∈ Interval<T>: i.start ⨀ i.end
```

`start` and `end` cannot be equal. This would represent a degenerate interval, which has no meaning. When interpreting
the interval as half-open, a degenerate interval represents the empty set. Any relation with the empty set is
meaningless in the context of this library. When interpreting the interval as closed, a degenerate interval represents
one point. To compare points with each other, see [_Points and comparison_](Points.md). To compare points with
intervals, use `PointIntervalRelation`.

## Right half-open (`[start, end[`)

We highly advise to _interpret_ intervals _in all cases_ to be _right half-open_.

E.g., when considering the time interval during which a contract is applicable, the contract is applicable in
`[I.start, I.end[`. Whatever the precision of the point type `T` you use (JavaScript `Date`, UTC ISO strings with μs
precision, an integer expressing, ms since epoch, or an ISO string expressing vague day dates, …), this should mean that
the contract is applicable on `I.start`, and not earlier, and that the first moment the contract is no longer applicable
is `I.end`. The main reasons for this are fundamental, and practical.

Fundamentally, when the points express time, due to the maximum speed of information _c_, the information you use about
the universe outside your present location is always about the past. You reason about the state of the outside universe
in the past, the present not included. Practically, some other computer process could be registering the end of the
interval in question _now_, and you would not be aware of that yet (in distributed systems, or with transactional
serialized systems).

Furthermore, the `start` and `end` “points” are never realy points. Due to Heisenberg's uncertainty principle, we know
that we fundamentally cannot be more precise, e.g., for time, than the
[Planck duration](https://en.wikipedia.org/wiki/Planck_units#Planck_time) (~ 5.39.10<sup>−44</sup> s). In practice, any
measurement, any clock, has a limited precision. The “points” we are using are actually also intervals. E.g., given an
interval with ms precision

```ts
const i = {
  start: '2022-10-29T16:03:53.263Z',
  end: '2022-10-29T16:04:20.870Z'
}
```

`start` actually represents the interval `[2022-10-29T16:03:53.263Z, 2022-10-29T16:03:53.264Z[`, and `end` actually
represents the interval `[2022-10-29T16:04:20.870Z, 2022-10-29T16:04:20.871Z[`, where

```
relation(i.start, i) = (s)
relation(i.end, i) = (M)
```

When using right half-open intervals always, this reasoning is consistent.

Whether the contract is applicable at `t` is answered by:

```ts
import { PointIntervalRelation } from './PointIntervalRelation'

const applicable: boolean = PointIntervalRelation.relation(t, i).implies(PointIntervalRelation.fromString('ci'))
```

and whether the contract is not applicable at `t` by:

```ts
import { PointIntervalRelation } from './PointIntervalRelation'

const notApplicable: boolean = PointIntervalRelation.relation(t, i).implies(
  PointIntervalRelation.fromString('ci').complement()
)
```

|     | `[start` |     | `real end[` |     | `applicable` | `notApplicable` |
| --- | -------- | --- | ----------- | --- | ------------ | --------------- |
| `t` |          |     |             |     | no           | yes             |
|     | `t`      |     |             |     | yes          | no              |
|     |          | `t` |             |     | yes          | no              |
|     |          |     | `t`         |     | no           | yes             |
|     |          |     |             | `t` | no           | yes             |

When `i.end` is indefinite, you should compare with <code>i<sub>determinate</sub> = [i.start, now[</code>, as you know
at least at the time of evalution that the contract did not end before `now`, and that `[i.start, now[` `STARTS` or
`EQUALS` `i`.

```ts
import { PointIntervalRelation } from './PointIntervalRelation'

const applicable: boolean = compose(
  PointIntervalRelation.relation(t, { start: i.start, end: now }),
  AllenRelation.fromString('se')
).implies(PointIntervalRelation.fromString('ci'))

const notApplicable: boolean = compose(
  PointIntervalRelation.relation(t, { start: i.start, end: now }),
  AllenRelation.fromString('se')
).implies(PointIntervalRelation.fromString('ci').complement())
```

In this case, both `applicable` and `notApplicable` will be not guaranteed for future times `now ≤ t`, and thus evaluate
to `false`.

Alternatively, you might want to determine whether the contract _might_ be applicable or not:

```ts
import { PointIntervalRelation } from './PointIntervalRelation'

const couldBeApplicable: boolean = !compose(
  PointIntervalRelation.relation(t, { start: i.start, end: now }),
  AllenRelation.fromString('se')
).implies(PointIntervalRelation.fromString('ci').complement())

const couldBeNotApplicable: boolean = !compose(
  PointIntervalRelation.relation(t, { start: i.start, end: now }),
  AllenRelation.fromString('se')
).implies(PointIntervalRelation.fromString('ci'))
```

|     | `[start` |     | `now` |     | actual | `compose(…,'se')` | `applicable` | `couldBeApplicable` | `notApplicable` | `couldBeNotApplicable` |
| --- | -------- | --- | ----- | --- | ------ | ----------------- | ------------ | ------------------- | --------------- | ---------------------- |
| `t` |          |     |       |     | `b`    | `b`               | no           | no                  | yes             | yes                    |
|     | `t`      |     |       |     | `c`    | `c`               | yes          | yes                 | no              | no                     |
|     |          | `t` |       |     | `i`    | `i`               | yes          | yes                 | no              | no                     |
|     |          |     | `t`   |     | `t`    | `ita`             | no           | yes                 | no              | yes                    |
|     |          |     |       | `t` | `a`    | `ita`             | no           | yes                 | no              | yes                    |

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
