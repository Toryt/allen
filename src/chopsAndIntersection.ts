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
import { notEqual, ok } from 'assert'
import { getCompareIfOk } from './getCompareIfOk'
import { AllenRelation } from './AllenRelation'

export interface LabeledInterval<T> {
  readonly label: string
  readonly interval: Interval<T>
}

type SimpleIntersector = <T>(i1: Interval<T>, i2: Interval<T>) => Interval<T> | undefined | false
const noIntersection: SimpleIntersector = (): undefined => undefined
const intersectionNotDefined: SimpleIntersector = (): false => false
type Intersector = <T>(
  li1: LabeledInterval<T>,
  li2: LabeledInterval<T>,
  compareFn?: Comparator<T>
) => Readonly<Interval<T>> | undefined | false

type Chopper = <T>(
  li1: LabeledInterval<T>,
  li2: LabeledInterval<T>,
  compareFn?: Comparator<T>
) => ReadonlyArray<Readonly<Interval<T>>> | false

const chopsNotDefined: Chopper = (): false => false

interface ChopAndIntersectKwargs {
  intersection: SimpleIntersector
  chops: Chopper
}

class ChopAndIntersect {
  intersection: SimpleIntersector
  chops: Chopper

  constructor ({ intersection, chops }: ChopAndIntersectKwargs) {
    this.intersection = intersection
    this.chops = chops
  }

  referencingIntersection<T> (
    li1: LabeledInterval<T>,
    li2: LabeledInterval<T>
  ): Readonly<Interval<T>> | undefined | false {
    const provisional: Interval<T> | undefined | false = this.intersection(li1.interval, li2.interval)

    if (provisional === false || provisional === undefined) {
      return provisional
    }

    return { ...provisional, referenceIntervals: { [li1.label]: [li1.interval], [li2.label]: [li2.interval] } }
  }

  cleanIntersection<T> (li1: LabeledInterval<T>, li2: LabeledInterval<T>): Readonly<Interval<T>> {
    const provisional: Interval<T> | undefined | false = this.referencingIntersection(li1, li2)
    ok(provisional)

    return provisional
  }
}

const chopAndIntersect = new Map<AllenRelation, ChopAndIntersect>([
  [
    AllenRelation.PRECEDES,
    new ChopAndIntersect({
      intersection: noIntersection,
      chops: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> => [
        { ...i1, referenceIntervals: { [label1]: [i1] } },
        { ...i2, referenceIntervals: { [label2]: [i2] } }
      ]
    })
  ],
  [
    AllenRelation.MEETS,
    new ChopAndIntersect({
      intersection: noIntersection,
      chops: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> => [
        { ...i1, referenceIntervals: { [label1]: [i1] } },
        { ...i2, referenceIntervals: { [label2]: [i2] } }
      ]
    })
  ],
  [
    AllenRelation.OVERLAPS,
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>, i2: Readonly<Interval<T>>): Readonly<Interval<T>> => ({
        start: i2.start,
        end: i1.end
      }),
      chops: function <T> (
        this: ChopAndIntersect,
        li1: LabeledInterval<T>,
        li2: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { label: label1, interval: i1 } = li1
        const { label: label2, interval: i2 } = li2
        return [
          { start: i1.start, end: i2.start, referenceIntervals: { [label1]: [i1] } },
          this.cleanIntersection(li1, li2),
          { start: i1.end, end: i2.end, referenceIntervals: { [label2]: [i2] } }
        ]
      }
    })
  ],
  [
    AllenRelation.FINISHED_BY,
    new ChopAndIntersect({
      intersection: <T>(_: Readonly<Interval<T>>, i2: Readonly<Interval<T>>): Readonly<Interval<T>> => i2,
      chops: function <T> (
        this: ChopAndIntersect,
        li1: LabeledInterval<T>,
        li2: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { label: label1, interval: i1 } = li1
        const { interval: i2 } = li2
        return [
          { start: i1.start, end: i2.start, referenceIntervals: { [label1]: [i1] } },
          this.cleanIntersection(li1, li2)
        ]
      }
    })
  ],
  [
    AllenRelation.CONTAINS,
    new ChopAndIntersect({
      intersection: <T>(_: Readonly<Interval<T>>, i2: Readonly<Interval<T>>): Readonly<Interval<T>> => i2,
      chops: function <T> (
        this: ChopAndIntersect,
        li1: LabeledInterval<T>,
        li2: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { label: label1, interval: i1 } = li1
        const { interval: i2 } = li2
        return [
          { start: i1.start, end: i2.start, referenceIntervals: { [label1]: [i1] } },
          this.cleanIntersection(li1, li2),
          { start: i2.end, end: i1.end, referenceIntervals: { [label1]: [i1] } }
        ]
      }
    })
  ],
  [
    AllenRelation.STARTS,
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>): Readonly<Interval<T>> => i1,
      chops: function <T> (
        this: ChopAndIntersect,
        li1: LabeledInterval<T>,
        li2: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { interval: i1 } = li1
        const { label: label2, interval: i2 } = li2
        return [
          this.cleanIntersection(li1, li2),
          { start: i1.end, end: i2.end, referenceIntervals: { [label2]: [i2] } }
        ]
      }
    })
  ],
  [
    AllenRelation.EQUALS,
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>): Readonly<Interval<T>> => i1,
      chops: function <T> (
        this: ChopAndIntersect,
        li1: LabeledInterval<T>,
        li2: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        return [this.cleanIntersection(li1, li2)]
      }
    })
  ],
  [
    AllenRelation.STARTED_BY,
    new ChopAndIntersect({
      intersection: <T>(_: Readonly<Interval<T>>, i2: Readonly<Interval<T>>): Readonly<Interval<T>> => i2,
      chops: function <T> (
        this: ChopAndIntersect,
        li1: LabeledInterval<T>,
        li2: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { label: label1, interval: i1 } = li1
        const { interval: i2 } = li2
        return [
          this.cleanIntersection(li1, li2),
          { start: i2.end, end: i1.end, referenceIntervals: { [label1]: [i1] } }
        ]
      }
    })
  ],
  [
    AllenRelation.DURING,
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>): Readonly<Interval<T>> => i1,
      chops: function <T> (
        this: ChopAndIntersect,
        li1: LabeledInterval<T>,
        li2: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { interval: i1 } = li1
        const { label: label2, interval: i2 } = li2
        return [
          { start: i2.start, end: i1.start, referenceIntervals: { [label2]: [i2] } },
          this.cleanIntersection(li1, li2),
          { start: i1.end, end: i2.end, referenceIntervals: { [label2]: [i2] } }
        ]
      }
    })
  ],
  [
    AllenRelation.FINISHES,
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>): Readonly<Interval<T>> => i1,
      chops: function <T> (
        this: ChopAndIntersect,
        li1: LabeledInterval<T>,
        li2: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { interval: i1 } = li1
        const { label: label2, interval: i2 } = li2
        return [
          { start: i2.start, end: i1.start, referenceIntervals: { [label2]: [i2] } },
          this.cleanIntersection(li1, li2)
        ]
      }
    })
  ],
  [
    AllenRelation.OVERLAPPED_BY,
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>, i2: Readonly<Interval<T>>): Readonly<Interval<T>> => ({
        start: i1.start,
        end: i2.end
      }),
      chops: function <T> (
        this: ChopAndIntersect,
        li1: LabeledInterval<T>,
        li2: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { label: label1, interval: i1 } = li1
        const { label: label2, interval: i2 } = li2
        return [
          { start: i2.start, end: i1.start, referenceIntervals: { [label2]: [i2] } },
          this.cleanIntersection(li1, li2),
          { start: i2.end, end: i1.end, referenceIntervals: { [label1]: [i1] } }
        ]
      }
    })
  ],
  [
    AllenRelation.MET_BY,
    new ChopAndIntersect({
      intersection: noIntersection,
      chops: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> => [
        { ...i2, referenceIntervals: { [label2]: [i2] } },
        { ...i1, referenceIntervals: { [label1]: [i1] } }
      ]
    })
  ],
  [
    AllenRelation.MEETS,
    new ChopAndIntersect({
      intersection: noIntersection,
      chops: <T>(
        { label: label1, interval: i1 }: LabeledInterval<T>,
        { label: label2, interval: i2 }: LabeledInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> => [
        { ...i2, referenceIntervals: { [label2]: [i2] } },
        { ...i1, referenceIntervals: { [label1]: [i1] } }
      ]
    })
  ],
  [
    AllenRelation.ANTERIOR.complement(),
    new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })
  ],
  [
    AllenRelation.STARTS_EARLIER,
    new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })
  ],
  [AllenRelation.ENDS_EARLIER, new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })],
  [
    AllenRelation.ENDS_IN, // `(osd)`
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>): Readonly<Interval<T>> => ({ end: i1.end }),
      chops: chopsNotDefined
    })
  ],
  [
    AllenRelation.CONTAINS_START, // `(oFD)`
    new ChopAndIntersect({
      intersection: <T>(_: unknown, i2: Readonly<Interval<T>>): Readonly<Interval<T>> => ({ start: i2.start }),
      chops: chopsNotDefined
    })
  ],
  [
    AllenRelation.fromString<AllenRelation>('seS'),
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>): Readonly<Interval<T>> => ({ start: i1.start }),
      chops: chopsNotDefined
    })
  ],
  [
    AllenRelation.END_TOGETHER, // `(Fef)`
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>): Readonly<Interval<T>> => ({ start: i1.start }),
      chops: chopsNotDefined
    })
  ],
  [
    AllenRelation.STARTS_IN, // `(dfO)`
    new ChopAndIntersect({
      intersection: <T>(_: unknown, i2: Readonly<Interval<T>>): Readonly<Interval<T>> => ({
        end: i2.end
      }),
      chops: chopsNotDefined
    })
  ],
  [AllenRelation.CONTAINS_END, new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })],
  [AllenRelation.ENDS_LATER, new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })],
  [AllenRelation.STARTS_LATER, new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })],
  [
    AllenRelation.BEFORE.complement(),
    new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })
  ],
  [
    AllenRelation.fullRelation<AllenRelation>(),
    new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })
  ]
])

export const chops: Chopper = <T>(
  li1: LabeledInterval<T>,
  li2: LabeledInterval<T>,
  compareFn?: Comparator<T>
): ReadonlyArray<Readonly<Interval<T>>> | false => {
  getCompareIfOk<T>([li1.interval, li2.interval], compareFn)

  const gr = AllenRelation.relation(li1.interval, li2.interval, compareFn)
  const handler: ChopAndIntersect | undefined = chopAndIntersect.get(gr)
  ok(handler)
  return handler.chops(li1, li2)
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
): Readonly<Interval<T>> | undefined | false => {
  notEqual(li1.label, li2.label)

  getCompareIfOk<T>([li1.interval, li2.interval], compareFn)

  const gr = AllenRelation.relation(li1.interval, li2.interval, compareFn)
  const handler: ChopAndIntersect | undefined = chopAndIntersect.get(gr)
  ok(handler)
  return handler.referencingIntersection(li1, li2)
}
