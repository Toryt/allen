/*
 Copyright © 2022 – 2023 by Jan Dockx

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

import { Interval, ReferencedInterval, ReferenceIntervals } from './Interval'
import { Comparator } from './Comparator'
import { equal, ok } from 'assert'
import { transposeAndOrder } from './transposeAndOrder'
import { intersection } from './chopsAndIntersection'

/**
 * Return a sequence that has the fewest possible intervals, that are intersections of intervals provided in the
 * `sources`. Each interval in the result must be enclosed by at least one interval of each property of the `sources`.
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
export function intersectionSequence<T> (
  sources: Readonly<ReferenceIntervals<T>>,
  compareFn?: Comparator<T>
): ReadonlyArray<Readonly<Interval<T>>> | false {
  ok(sources)
  equal(typeof sources, 'object')

  const pile: Array<Readonly<ReferencedInterval<T>>> = transposeAndOrder(sources, compareFn) // validates preconditions

  const lastIntersection: Readonly<ReferencedInterval<T>> | undefined = pile.shift()
  if (lastIntersection === undefined) {
    return []
  }

  // const result: Array<Readonly<Interval<T>>> = []

  while (pile.length > 0) {
    const next: Readonly<ReferencedInterval<T>> | undefined = pile.shift()
    ok(next)
    const newIntersection: Readonly<Interval<T>> | undefined | false = intersection(next, lastIntersection)
    if (newIntersection === false) {
      // there is no intersection possible; return false
      return false
    }
    // if (newIntersection === undefined) {
    //   /* No intersection between `lastIntersection` and `next`. If `lastIntersection` is acceptable, add to result.
    //      Discard `lastIntersection` and continue. */
    //   if (isAcceptable(lastIntersection)) {
    //     result.push(lastIntersection)
    //   }
    //   lastIntersection = next
    // } else {
    //   /* We have a new intersection. Remember it. But `next` might also still intersect with later intervals. Remember
    //      it too. */
    //   lastIntersection = newIntersection
    // }
  }

  // MUDO unfinished

  // MUDO condition: reference intervals are ordered
  return pile.map(({ interval, reference }: Readonly<ReferencedInterval<T>>) => ({
    start: interval.start,
    end: interval.end,
    referenceIntervals: {
      [reference]: [interval]
    }
  }))
}
