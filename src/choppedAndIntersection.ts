/*
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
 */

import { Interval } from './Interval'
import { Comparator } from './Comparator'
import { ok } from 'assert'
import { getCompareIfOk } from './getCompareIfOk'
import { AllenRelation } from './AllenRelation'

interface LabeledInterval<T> {
  readonly label: string
  readonly interval: Interval<T>
}

type Intersector = <T>(i1: LabeledInterval<T>, i2: LabeledInterval<T>) => Readonly<Interval<T>> | null | undefined

const noIntersection: Intersector = (): null => null
const intersectionNotDefined: Intersector = (): undefined => undefined
type Chopper = <T>(i1: LabeledInterval<T>, i2: LabeledInterval<T>) => ReadonlyArray<Readonly<Interval<T>>> | undefined

const choppedNotDefined: Chopper = (): undefined => undefined

interface ChopAndIntersect {
  intersection: Intersector
  chopped: Chopper
}

const chopAndIntersect = new Map<AllenRelation, ChopAndIntersect>([
  [
    AllenRelation.PRECEDES,
    {
      intersection: noIntersection,
      chopped: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> => [
        { ...i1, referenceIntervals: { [label1]: [i1] } },
        { ...i2, referenceIntervals: { [label2]: [i2] } }
      ]
    }
  ],
  [
    AllenRelation.MEETS,
    {
      intersection: noIntersection,
      chopped: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> => [
        { ...i1, referenceIntervals: { [label1]: [i1] } },
        { ...i2, referenceIntervals: { [label2]: [i2] } }
      ]
    }
  ],
  [
    AllenRelation.OVERLAPS,
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({
        start: i2.start,
        end: i1.end,
        referenceIntervals: { [label1]: [i1], [label2]: [i2] }
      }),
      chopped: function <T> (li1: LabeledInterval<T>, li2: LabeledInterval<T>): ReadonlyArray<Readonly<Interval<T>>> {
        const { label: label1, interval: i1 } = li1
        const { label: label2, interval: i2 } = li2
        return [
          { start: i1.start, end: i2.start, referenceIntervals: { [label1]: [i1] } },
          this.intersection(li1, li2)!,
          { start: i1.end, end: i2.end, referenceIntervals: { [label2]: [i2] } }
        ]
      }
    }
  ],
  [
    AllenRelation.FINISHED_BY,
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({
        ...i2,
        referenceIntervals: { [label1]: [i1], [label2]: [i2] }
      }),
      chopped: function <T> (li1: LabeledInterval<T>, li2: LabeledInterval<T>): ReadonlyArray<Readonly<Interval<T>>> {
        const { label: label1, interval: i1 } = li1
        const { interval: i2 } = li2
        return [
          { start: i1.start, end: i2.start, referenceIntervals: { [label1]: [i1] } },
          this.intersection(li1, li2)!
        ]
      }
    }
  ],
  [
    AllenRelation.CONTAINS,
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({
        ...i2,
        referenceIntervals: { [label1]: [i1], [label2]: [i2] }
      }),
      chopped: function <T> (li1: LabeledInterval<T>, li2: LabeledInterval<T>): ReadonlyArray<Readonly<Interval<T>>> {
        const { label: label1, interval: i1 } = li1
        const { interval: i2 } = li2
        return [
          { start: i1.start, end: i2.start, referenceIntervals: { [label1]: [i1] } },
          this.intersection(li1, li2)!,
          { start: i2.end, end: i1.end, referenceIntervals: { [label1]: [i1] } }
        ]
      }
    }
  ],
  [
    AllenRelation.STARTS,
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({
        ...i1,
        referenceIntervals: { [label1]: [i1], [label2]: [i2] }
      }),
      chopped: function <T> (li1: LabeledInterval<T>, li2: LabeledInterval<T>): ReadonlyArray<Readonly<Interval<T>>> {
        const { interval: i1 } = li1
        const { label: label2, interval: i2 } = li2
        return [this.intersection(li1, li2)!, { start: i1.end, end: i2.end, referenceIntervals: { [label2]: [i2] } }]
      }
    }
  ],
  [
    AllenRelation.EQUALS,
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({
        ...i1,
        referenceIntervals: { [label1]: [i1], [label2]: [i2] }
      }),
      chopped: function <T> (li1: LabeledInterval<T>, li2: LabeledInterval<T>): ReadonlyArray<Readonly<Interval<T>>> {
        return [this.intersection(li1, li2)!]
      }
    }
  ],
  [
    AllenRelation.STARTED_BY,
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({
        ...i2,
        referenceIntervals: { [label1]: [i1], [label2]: [i2] }
      }),
      chopped: function <T> (li1: LabeledInterval<T>, li2: LabeledInterval<T>): ReadonlyArray<Readonly<Interval<T>>> {
        const { label: label1, interval: i1 } = li1
        const { interval: i2 } = li2
        return [this.intersection(li1, li2)!, { start: i2.end, end: i1.end, referenceIntervals: { [label1]: [i1] } }]
      }
    }
  ],
  [
    AllenRelation.DURING,
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({
        ...i1,
        referenceIntervals: { [label1]: [i1], [label2]: [i2] }
      }),
      chopped: function <T> (li1: LabeledInterval<T>, li2: LabeledInterval<T>): ReadonlyArray<Readonly<Interval<T>>> {
        const { interval: i1 } = li1
        const { label: label2, interval: i2 } = li2
        return [
          { start: i2.start, end: i1.start, referenceIntervals: { [label2]: [i2] } },
          this.intersection(li1, li2)!,
          { start: i1.end, end: i2.end, referenceIntervals: { [label2]: [i2] } }
        ]
      }
    }
  ],
  [
    AllenRelation.FINISHES,
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({
        ...i1,
        referenceIntervals: { [label1]: [i1], [label2]: [i2] }
      }),
      chopped: function <T> (li1: LabeledInterval<T>, li2: LabeledInterval<T>): ReadonlyArray<Readonly<Interval<T>>> {
        const { interval: i1 } = li1
        const { label: label2, interval: i2 } = li2
        return [
          { start: i2.start, end: i1.start, referenceIntervals: { [label2]: [i2] } },
          this.intersection(li1, li2)!
        ]
      }
    }
  ],
  [
    AllenRelation.OVERLAPPED_BY,
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({
        start: i1.start,
        end: i2.end,
        referenceIntervals: { [label1]: [i1], [label2]: [i2] }
      }),
      chopped: function <T> (li1: LabeledInterval<T>, li2: LabeledInterval<T>): ReadonlyArray<Readonly<Interval<T>>> {
        const { label: label1, interval: i1 } = li1
        const { label: label2, interval: i2 } = li2
        return [
          { start: i2.start, end: i1.start, referenceIntervals: { [label2]: [i2] } },
          this.intersection(li1, li2)!,
          { start: i2.end, end: i1.end, referenceIntervals: { [label1]: [i1] } }
        ]
      }
    }
  ],
  [
    AllenRelation.MET_BY,
    {
      intersection: noIntersection,
      chopped: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> => [
        { ...i2, referenceIntervals: { [label2]: [i2] } },
        { ...i1, referenceIntervals: { [label1]: [i1] } }
      ]
    }
  ],
  [
    AllenRelation.MEETS,
    {
      intersection: noIntersection,
      chopped: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> => [
        { ...i2, referenceIntervals: { [label2]: [i2] } },
        { ...i1, referenceIntervals: { [label1]: [i1] } }
      ]
    }
  ],
  [AllenRelation.ANTERIOR.complement(), { intersection: intersectionNotDefined, chopped: choppedNotDefined }],
  [AllenRelation.STARTS_EARLIER, { intersection: intersectionNotDefined, chopped: choppedNotDefined }],
  [AllenRelation.ENDS_EARLIER, { intersection: intersectionNotDefined, chopped: choppedNotDefined }],
  [
    AllenRelation.ENDS_IN, // `(osd)`
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({ end: i1.end, referenceIntervals: { [label1]: [i1], [label2]: [i2] } }),
      chopped: choppedNotDefined
    }
  ],
  [
    AllenRelation.CONTAINS_START, // `(oFD)`
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({ start: i2.start, referenceIntervals: { [label1]: [i1], [label2]: [i2] } }),
      chopped: choppedNotDefined
    }
  ],
  [
    AllenRelation.fromString<AllenRelation>('seS'),
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({ start: i1.start, referenceIntervals: { [label1]: [i1], [label2]: [i2] } }),
      chopped: choppedNotDefined
    }
  ],
  [
    AllenRelation.END_TOGETHER, // `(Fef)`
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({ start: i1.start, referenceIntervals: { [label1]: [i1], [label2]: [i2] } }),
      chopped: choppedNotDefined
    }
  ],
  [
    AllenRelation.STARTS_IN, // `(dfO)`
    {
      intersection: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): Readonly<Interval<T>> => ({ end: i2.end, referenceIntervals: { [label1]: [i1], [label2]: [i2] } }),
      chopped: choppedNotDefined
    }
  ],
  [AllenRelation.CONTAINS_END, { intersection: intersectionNotDefined, chopped: choppedNotDefined }],
  [AllenRelation.ENDS_LATER, { intersection: intersectionNotDefined, chopped: choppedNotDefined }],
  [AllenRelation.STARTS_LATER, { intersection: intersectionNotDefined, chopped: choppedNotDefined }],
  [AllenRelation.BEFORE.complement(), { intersection: intersectionNotDefined, chopped: choppedNotDefined }],
  [AllenRelation.fullRelation<AllenRelation>(), { intersection: intersectionNotDefined, chopped: choppedNotDefined }]
])

export const chopped: Chopper = <T>(
  li1: LabeledInterval<T>,
  li2: LabeledInterval<T>,
  compareFn?: Comparator<T>
): ReadonlyArray<Readonly<Interval<T>>> | undefined => {
  getCompareIfOk<T>([li1.interval, li2.interval], compareFn)

  const gr = AllenRelation.relation(li1.interval, li2.interval, compareFn)
  const handler: ChopAndIntersect | undefined = chopAndIntersect.get(gr)
  ok(handler)
  return handler.chopped(li1, li2)
}

/**
 * Returns the intervals that form the intersections between `i1` and `i2`.
 *
 * #### Result
 *
 *
 * For fully definite intervals
 *
 * | `i1 (.) i2`  | result                                                                        |
 * | ------------ | ----------------------------------------------------------------------------- |
 * | `i1 (pm) i2` | `i1{i1}, i2{i2]`                                                              |
 * | `i1 (o) i2`  | `[i1.start, i2.start[{i1}, [i2.start, i1.end[{i1, i2} , [i1.end, i2.end[{i2}` |
 * | `i1 (F) i2`  | `[i1.start, i2.start[{i1}, [i2.start, i2.end[{i1, i2}`                        |
 * | `i1 (D) i2`  | `[i1.start, i2.start[{i1}, i2{i1, i2}, [i2.end, i1.end[{i1}`                  |
 * | `i1 (s) i2`  | `i1{i1, i2}, [i1.end, i2.end[{i2}`                                            |
 * | `i1 (e) i2`  | `i1{i1, i2}`                                                                  |
 * | `i1 (S) i2`  | `i2{i2, i1}, [i2.end, i1.end[{i1}`                                            |
 * | `i1 (d) i2`  | `[i2.start, i1.start[{i2}, i1{i2, i1}, [i1.end, i2.end[{i2}`                  |
 * | `i1 (f) i2`  | `[i2.start, i1.start[{i2}, [i1.start, i1.end[{i2, i1}`                        |
 * | `i1 (O) i2`  | `[i2.start, i1.start[{i2}, [i1.start, i2.end[{i2, i1} , [i2.end, i1.end[{i1}` |
 * | `i1 (MP) i2` | `i2{i2}, i1{i1}`                                                              |
 */
export const intersection: Intersector = <T>(
  li1: LabeledInterval<T>,
  li2: LabeledInterval<T>,
  compareFn?: Comparator<T>
): Readonly<Interval<T>> | null | undefined => {
  getCompareIfOk<T>([li1.interval, li2.interval], compareFn)

  const gr = AllenRelation.relation(li1.interval, li2.interval, compareFn)
  const handler: ChopAndIntersect | undefined = chopAndIntersect.get(gr)
  ok(handler)
  return handler.intersection(li1, li2)
}
