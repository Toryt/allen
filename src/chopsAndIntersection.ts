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

import { type Interval, type ReferencedInterval } from './Interval'
import { type Comparator } from './Comparator'
import { notEqual, ok } from 'assert'
import { getCompareIfOk } from './getCompareIfOk'
import { AllenRelation } from './AllenRelation'

type SimpleIntersector = <T>(i1: Interval<T>, i2: Interval<T>) => Interval<T> | undefined | false
const noIntersection: SimpleIntersector = (): undefined => undefined
const intersectionNotDefined: SimpleIntersector = (): false => false
type Intersector = <T>(
  li1: ReferencedInterval<T>,
  li2: ReferencedInterval<T>,
  compareFn?: Comparator<T>
) => Readonly<Interval<T>> | undefined | false

type Chopper = <T>(
  li1: ReferencedInterval<T>,
  li2: ReferencedInterval<T>,
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
    li1: ReferencedInterval<T>,
    li2: ReferencedInterval<T>
  ): Readonly<Interval<T>> | undefined | false {
    const provisional: Interval<T> | undefined | false = this.intersection(li1.interval, li2.interval)

    if (provisional === false || provisional === undefined) {
      return provisional
    }

    return { ...provisional, referenceIntervals: { [li1.reference]: [li1.interval], [li2.reference]: [li2.interval] } }
  }

  cleanIntersection<T> (li1: ReferencedInterval<T>, li2: ReferencedInterval<T>): Readonly<Interval<T>> {
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
        { reference: label1, interval: i1 }: ReferencedInterval<T>,
        { reference: label2, interval: i2 }: ReferencedInterval<T>
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
        { reference: label1, interval: i1 }: ReferencedInterval<T>,
        { reference: label2, interval: i2 }: ReferencedInterval<T>
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
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { reference: label1, interval: i1 } = li1
        const { reference: label2, interval: i2 } = li2
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
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { reference: label1, interval: i1 } = li1
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
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { reference: label1, interval: i1 } = li1
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
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { interval: i1 } = li1
        const { reference: label2, interval: i2 } = li2
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
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
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
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { reference: label1, interval: i1 } = li1
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
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { interval: i1 } = li1
        const { reference: label2, interval: i2 } = li2
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
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { interval: i1 } = li1
        const { reference: label2, interval: i2 } = li2
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
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> {
        const { reference: label1, interval: i1 } = li1
        const { reference: label2, interval: i2 } = li2
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
        { reference: label1, interval: i1 }: ReferencedInterval<T>,
        { reference: label2, interval: i2 }: ReferencedInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> => [
        { ...i2, referenceIntervals: { [label2]: [i2] } },
        { ...i1, referenceIntervals: { [label1]: [i1] } }
      ]
    })
  ],
  [
    AllenRelation.PRECEDED_BY,
    new ChopAndIntersect({
      intersection: noIntersection,
      chops: <T>(
        { reference: label1, interval: i1 }: ReferencedInterval<T>,
        { reference: label2, interval: i2 }: ReferencedInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> => [
        { ...i2, referenceIntervals: { [label2]: [i2] } },
        { ...i1, referenceIntervals: { [label1]: [i1] } }
      ]
    })
  ],
  [
    AllenRelation.AFTER.complement(),
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
    AllenRelation.START_TOGETHER,
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>): Readonly<Interval<T>> => ({ start: i1.start }),
      chops: chopsNotDefined
    })
  ],
  [
    AllenRelation.END_TOGETHER, // `(Fef)`
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>): Readonly<Interval<T>> => ({ end: i1.end }),
      chops: chopsNotDefined
    })
  ],
  [
    AllenRelation.STARTS_IN, // `(dfO)`
    new ChopAndIntersect({
      intersection: <T>(i1: Readonly<Interval<T>>): Readonly<Interval<T>> => ({
        start: i1.start
      }),
      chops: chopsNotDefined
    })
  ],
  [
    AllenRelation.CONTAINS_END,
    new ChopAndIntersect({
      intersection: <T>(_: unknown, i2: Readonly<Interval<T>>): Readonly<Interval<T>> => ({ end: i2.end }),
      chops: chopsNotDefined
    })
  ],
  [AllenRelation.ENDS_LATER, new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })],
  [AllenRelation.STARTS_LATER, new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })],
  [
    AllenRelation.BEFORE.complement(),
    new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })
  ],
  [AllenRelation.FULL, new ChopAndIntersect({ intersection: intersectionNotDefined, chops: chopsNotDefined })]
])

/**
 * Returns the intervals that form the intersections between `i1` and `i2`.
 *
 * The relation between the intersection `i` and `i1` (`i (.) i1`), and `i2` (`i (.) i2`), must be one of
 *
 * * {@link AllenRelation.STARTS `(s)`}
 * * {@link AllenRelation.START_TOGETHER `(seS)`}
 * * {@link AllenRelation.STARTS_IN `(dfO)`}
 * * {@link AllenRelation.EQUALS `(e)`}
 * * {@link AllenRelation.DURING `(d)`}
 * * {@link AllenRelation.ENDS_IN `(osd)`}
 * * {@link AllenRelation.END_TOGETHER `(Fef)`}
 * * {@link AllenRelation.FINISHES `(f)`}
 *
 * When there is definitely no intersection, `undefined` is returned. When we cannot determine whether or not there is
 * an intersection, which can happend with indefinite intervals, `false` is returned.
 *
 * Both `i1` and `i2` are mentioned under their label in the reference intervals of the intersection, if there is an
 * intersection.
 *
 * The intersection commutes: `intersection(i1, i2) = intersection(i2, i1)`.
 *
 * #### Result
 *
 * For the 26 possible actual relations between `i1` and `i2`, we get:
 *
 * | `i1 (.) i2`     | intersection                |
 * | --------------- | --------------------------- |
 * | `(p)`           | —                           |
 * | `(m)`           | —                           |
 * | `(o)`           | `[i2.start, i1.end[`        |
 * | `(F)`           | `i2`                        |
 * | `(D)`           | `i2`                        |
 * | `(s)`           | `i1`                        |
 * | `(e)`           | `i1` = `i2`                 |
 * | `(S)`           | `i2`                        |
 * | `(d)`           | `i1`                        |
 * | `(f)`           | `i1`                        |
 * | `(O)`           | `[i1.start, i2.end[`        |
 * | `(M)`           | —                           |
 * | `(P)`           | —                           |
 * | `(pmoFDseSdfO)` | ❌                          |
 * | `(pmoFD)`       | ❌                          |
 * | `(pmosd)`       | ❌                          |
 * | `(osd)`         | `[🤷, i1.end[`              |
 * | `(oFD)`         | `[i2.start, 🤷[`            |
 * | `(seS)`         | `[i1.start = i2.start, 🤷[` |
 * | `(Fef)`         | `[🤷, i1.end = i2.end[`     |
 * | `(dfO)`         | `[i1.start, 🤷[`            |
 * | `(DSO)`         | `[🤷, i2.end[`              |
 * | `(DSOMP)`       | ❌                          |
 * | `(dfOMP)`       | ❌                          |
 * | `(oFDseSdfOMP)` | ❌                          |
 * | full            | ❌                          |                                                          |
 */
export const intersection: Intersector = <T>(
  li1: ReferencedInterval<T>,
  li2: ReferencedInterval<T>,
  compareFn?: Comparator<T>
): Readonly<Interval<T>> | undefined | false => {
  notEqual(li1.reference, li2.reference)

  getCompareIfOk<T>([li1.interval, li2.interval], compareFn)

  const gr = AllenRelation.relation(li1.interval, li2.interval, compareFn)
  const handler: ChopAndIntersect | undefined = chopAndIntersect.get(gr)
  ok(handler)
  return handler.referencingIntersection(li1, li2)
}

/**
 * Returns the sequence of intervals that are the result of chopping `i1` and `i2` with each other.
 *
 * There is always a chopped sequence if the relation between `i1` and `i2` is basic. This is true if `i1` and `i2` are
 * definite intervals. For indefinite intervals, it is only true if the relation is `(p)`, `(m)`, `(M)`, `(P)`. The
 * chopped sequence contains 1, 2, or 3 intervals.
 *
 * If the relation between `i1` and `i2` is not basic, we cannot determine the chopped sequence, because we are missing
 * a necessary intermediate point. In this case, `false` is returned.
 *
 * The relation between the intervals of the chopped sequence `csi` and `i1` (`csi (.) i1`), and `i2` (`csi (.) i2`),
 * must be one of
 *
 * * {@link AllenRelation.PRECEDES `(p)`}
 * * {@link AllenRelation.MEETS `(m)`}
 * * {@link AllenRelation.STARTS `(s)`}
 * * {@link AllenRelation.START_TOGETHER `(seS)`}
 * * {@link AllenRelation.EQUALS `(e)`}
 * * {@link AllenRelation.DURING `(d)`}
 * * {@link AllenRelation.END_TOGETHER `(Fef)`}
 * * {@link AllenRelation.FINISHES `(f)`}
 * * {@link AllenRelation.MET_BY `(M)`}
 * * {@link AllenRelation.PRECEDED_BY `(P)`}
 *
 * If `i1` and `i2` have an {@link intersection}, and there is a chopped sequence, the intersection is an element of the
 * chopped sequence. When the relation between `i1` and `i2` is {@link AllenRelation.STARTS_IN `(dfO)`} or
 * {@link AllenRelation.ENDS_IN `(osd)`}, we cannot determine the chopped sequence, although there is an
 * {@link intersection}.
 *
 * Chops commutes: `chops(i1, i2) = chops(i2, i1)`.
 *
 * #### Result
 *
 * For basic relations we get the following results. The subsequences indicate in which interval of the result `i1`,
 * respectively `i2`, are mentioned as reference intervals.
 *
 * | `i1 (.) i2` | chopped sequence                                              | subsequence `i1`                             | subsequence `i2`                             |
 * | ----------- | ------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
 * | `(p)`       | `i1, i2`                                                      | `i1`                                         | `i2`                                         |
 * | `(m)`       | `i1, i2`                                                      | `i1`                                         | `i2`                                         |
 * | `(o)`       | `[i1.start, i2.start[, [i2.start, i1.end[ , [i1.end, i2.end[` | `[i1.start, i2.start[, [i2.start, i1.end[`   | `[i2.start, i1.end[, [i1.end, i2.end[`       |
 * | `(F)`       | `[i1.start, i2.start[, i2`                                    | `[i1.start, i2.start[, i2`                   | `i2`                                         |
 * | `(D)`       | `[i1.start, i2.start[, i2, [i2.end, i1.end[`                  | `[i1.start, i2.start[, i2, [i2.end, i1.end[` | `i2`                                         |
 * | `(s)`       | `i1, [i1.end, i2.end[`                                        | `i1`                                         | `i1, [i1.end, i2.end[`                       |
 * | `(e)`       | `i1` = `i2`                                                   | `i1, i2`                                     | `i1, i2`                                     |
 * | `(S)`       | `i2, [i2.end, i1.end[`                                        | `i2, [i2.end, i1.end[`                       | `i2`                                         |
 * | `(d)`       | `[i2.start, i1.start[, i1, [i1.end, i2.end[`                  | `i1`                                         | `[i2.start, i1.start[, i1, [i1.end, i2.end[` |
 * | `(f)`       | `[i2.start, i1.start[, i1`                                    | `i1`                                         | `[i2.start, i1.start[, i1`                   |
 * | `(O)`       | `[i2.start, i1.start[, [i1.start, i2.end[ , [i2.end, i1.end[` | `[i1.start, i2.end[ , [i2.end, i1.end[`      | `[i2.start, i1.start[, [i1.start, i2.end[ `  |
 * | `(M)`       | `i2, i1`                                                      | `i1`                                         | `i2`                                         |
 * | `(P)`       | `i2, i1`                                                      | `i1`                                         | `i2`                                         |
 */
export const chops: Chopper = <T>(
  li1: ReferencedInterval<T>,
  li2: ReferencedInterval<T>,
  compareFn?: Comparator<T>
): ReadonlyArray<Readonly<Interval<T>>> | false => {
  getCompareIfOk<T>([li1.interval, li2.interval], compareFn)

  const gr = AllenRelation.relation(li1.interval, li2.interval, compareFn)
  const handler: ChopAndIntersect | undefined = chopAndIntersect.get(gr)
  ok(handler)
  return handler.chops(li1, li2)
}
