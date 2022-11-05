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
- `start` must come before, or be equal to, `end`, using the comparator given (`compareFn<T>`) or the default
  `ltCompare<T> (t1: T, t2: T): number`:

```
∀ i ∈ Interval<T>: ¬ (i.end ⨀ i.start)
```

When `start` equals `end`, the interval is _degenerate_, and has no duration. Note that with 1 degenerate interval,
there are 2 cases where `AllenRelation.relation` returns a semantically incomplete result (see detailed documentation
there).

## Right half open (`[start, end[`)

We highly advise to _interpret_ intervals _in all cases_ to be _right half open_. E.g., when considering the time
interval during which a contract is applicable, the contract is applicable in `[I.start, I.end[`. Whatever the precision
of the point type `T` you use (JavaScript `Date`, UTC ISO strings with μs precision, an integer expressing, ms since
epoch, or an ISO string expressing vague day dates, …), this should mean that the contract is applicable on `I.start`,
and not earlier, and that the first moment the contract is no longer applicable is `I.end`.

The main reasons for this are fundamental, and practical. Fundamentally, when the points express time, due to the
maximum speed of information _c_, the information you use about the universe outside your present location is always
about the past. You reason about the state of the outside universe in the past, the present not included. Practically,
some other computer process could be registering the end of the interval in question _now_, and you would not be aware
of that yet (in distributed systems, or with transactional serialized systems).

Furthermore, the `start` and `end` “points” are never realy points. Due to Heisenberg's uncertainty principle, we know
that we fundamentally cannot be more precise, e.g., for time, than the
[Planck duration](https://en.wikipedia.org/wiki/Planck_units#Planck_time) (~ 5.39.10<sup>−44</sup> s). In practice, any
measurement, any clock, has a limited precision. The “points” we are using are actually also intervals! E.g., given an
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

When using right half open intervals always, this reasoning is consistent.

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
