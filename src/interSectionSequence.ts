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

import { Interval, isReferenceIntervals, ReferenceIntervals } from './Interval'
import { Comparator } from './Comparator'
import assert, { equal, ok } from 'assert'
import { compareIntervals } from './compareIntervals'
import { commonTypeRepresentation } from './TypeRepresentation'
import { getCompareIfOk } from './getCompareIfOk'
import { AllenRelation } from './AllenRelation'

export interface ReferencedInterval<T> {
  readonly interval: Readonly<Interval<T>>
  readonly reference: string
}

const haveCommonType: string = 'all `start` and `end` values of all intervals must be of a common type'

/**
 * Turn a {@link ReferenceIntervals} instance into an array of {@link ReferencedInterval} instances, ordered with
 * {@link compareIntervals} on their `interval` values.
 */
export function transposeAndOrder<T> (
  sources: Readonly<ReferenceIntervals<T>>,
  compareFn?: Comparator<T>
): ReadonlyArray<Readonly<ReferencedInterval<T>>> {
  equal(typeof sources, 'object')
  ok(sources)
  assert(compareFn === undefined || typeof compareFn === 'function')

  // use for .. in, because we also need the inherited properties
  let transposed: Array<Readonly<ReferencedInterval<T>>> = []
  for (const reference in sources) {
    const referenceTransposed: ReadonlyArray<Readonly<ReferencedInterval<T>>> = sources[reference].map(interval => ({
      interval,
      reference
    }))
    transposed = transposed.concat(referenceTransposed)
  }

  const cType = commonTypeRepresentation(
    ...transposed.reduce((acc: unknown[], { interval: { start, end } }: Readonly<ReferencedInterval<T>>): unknown[] => {
      acc.push(start)
      acc.push(end)
      return acc
    }, [])
  )

  assert(cType !== false, haveCommonType)
  assert(isReferenceIntervals(sources, cType, compareFn))

  function compareReferencedIntervals (
    ri1: Readonly<ReferencedInterval<T>>,
    ri2: Readonly<ReferencedInterval<T>>
  ): number {
    return compareIntervals(ri1.interval, ri2.interval, compareFn)
  }

  return transposed.sort(compareReferencedIntervals)
}

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

/**
 * Return a sequence that has the fewest possible intervals, that are intersections of intervals provided in the
 * `sources`, so that the every interval in the `sources` is “covered” by a gapless subsequence of one or more intervals
 * in the result.
 *
 * Each interval in the result `ri` refers to the intervals `si` in the `sources` in its `referenceIntervals` that cause
 * it to appear (`ri (sedf) si`). `ri` {@link AllenRelation.DOES_NOT_CONCUR_WITH does not concurr with} any other
 * interval in the sources (`(pmMP)`) . In other words, the relation of an interval of the result with any interval in
 * the sources is implied by `(pmsedfMP)`.
 *
 * Since the `sources` do not have to be sequences themselves, one interval in the result might be the intersection of
 * more than one interval of the same `source`.
 *
 * The resulting sequence is ordered, might have gaps, and might be left- and / or right-indefinite.
 */
export function interSectionSequence<T> (
  sources: Readonly<ReferenceIntervals<T>>,
  compareFn?: Comparator<T>
): ReadonlyArray<Readonly<Interval<T>>> {
  ok(sources)
  equal(typeof sources, 'object')

  const pile: ReadonlyArray<Readonly<ReferencedInterval<T>>> = transposeAndOrder(sources, compareFn) // validates preconditions

  // MUDO condition: reference intervals are ordered
  return pile.map(({ interval, reference }: Readonly<ReferencedInterval<T>>) => ({
    start: interval.start,
    end: interval.end,
    referenceIntervals: {
      [reference]: [interval]
    }
  }))
}
// /**
//  * Turn the _set_ of intervals `i` into a {@link isSequence seqyence}.
//  *
//  * Intervals that {@link AllenRelation.CONCURS_WITH concur with} each other are replaced by distinct
//  * {@link AllenRelation.MEETS meeting} intervals (the “intersections“).
//  */
// export function toSequence<T> (i: Interval<T>[], compareFn?: Comparator<T>): Interval<T>[] {}

// /**
//  * Turn the _set_ of intervals `i` into a {@link isSequence seqyence}.
//  *
//  * Intervals that {@link AllenRelation.CONCURS_WITH concur with} each other are replaced by distinct
//  * {@link AllenRelation.MEETS meeting} intervals (the “intersections“).
//  */
// export function toSequence<T> (i: Interval<T>[], compareFn?: Comparator<T>): Interval<T>[] {}

// /**
//  * Turn the _set_ of intervals `i` into a {@link isSequence sequence}. This is a chain, with gaps filled up with
//  * maximal interval.
//  *
//  * Intervals that {@link AllenRelation.CONCURS_WITH concur with} each other are replaced by distinct
//  * {@link AllenRelation.MEETS meeting} intervals (the “intersections“).
//  */
// export function toChain<T> (i: Interval<T>[], compareFn?: Comparator<T>): Interval<T>[] {}

// export function toChain<T> (pi: PseudoInterval<T>[], compareFn?: Comparator<T>): Interval<T>[] {}

// export function toChain<T> (t: <T>[], compareFn?: Comparator<T>): Interval<T>[] {}
