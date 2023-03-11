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

import { type Comparator } from './Comparator'
import { type Interval } from './Interval'
import { getCompareIfOk } from './getCompareIfOk'

/**
 * Compare function with the traditional semantics for intervals.
 *
 * This imposes _a_ [strict total order](https://en.wikipedia.org/wiki/Total¬_order) on {@link Interval Intervals}. This
 * order in general is not “natural”, but just a possible order. A general “natural” order for
 * {@link Interval Intervals} does not exist. That is the whole reason why Allen defined
 * {@link AllenRelation.BASIC_RELATIONS 13 basic relations} between intervals. Other orders are possible.
 *
 * This is a natural [strict total order](https://en.wikipedia.org/wiki/Total¬_order) for {@link Interval Intervals} in
 * a {@link isSequence sequence}.
 *
 * The main intention of this function is to make other algorithms easier, not to express an interesting semantics,
 * outside its use for {@link isSequence sequences}.
 *
 * First, the {@link Interval#start}s are compared, interpreting an indefinite {@link Interval#start} as the smallest
 * possible value. When the {@link Interval#start}s are equal, the {@link Interval#end}s are compared, interpreting an
 * indefinite `end` as the largest possible value. When both {@link Interval#start}s are indefinite, or both
 * {@link Interval#end}s are indefinite, they are considered equal. This is not a true representation of their
 * semantics (don't know 🤷), but the intention of this code is to get a deterministic order for all possible intervals,
 * and this does the trick.
 *
 * The 26 possible results of {@link AllenRelation.relation} can be mapped to the result of this function:
 *
 * | Allen relations                                                                                                                                                                                | result          |
 * | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
 * | `(p)`, `(m)`, `(o)`, `(F)`, `(D)`, `(s)`, {@link AllenRelation.STARTS_EARLIER `(pmoFD)`}, {@link AllenRelation.ENDS_IN `(osd)`}, {@link AllenRelation.CONTAINS_START `(oFD)`}, `(oFDseSdfOMP)` | `-1`            |
 * | `(e)`                                                                                                                                                                                          | `0`             |
 * | `(pmoFDseSdfO)`, {@link AllenRelation.CONTAINS_END `(DSO)`}, {@link AllenRelation.STARTS_IN `(dfO)`}, {@link AllenRelation.STARTS_LATER `(dfOMP)`}, `(S)`, `(d)`, `(f)`, `(O)`, `(M)`, `(P)`   | `+1`            |
 * | {@link AllenRelation.ENDS_EARLIER `(pmosd)`}, {@link AllenRelation.ENDS_LATER `(DSOMP)`}                                                                                                       | `-1`, `+1`      |
 * | {@link AllenRelation.START_TOGETHER `(seS)`}, {@link AllenRelation.END_TOGETHER `(Fef)`}, `full`                                                                                               | `-1`, `0`, `+1` |
 *
 * If the result is `0`, the actual relation is implied by `(e)`. There are no other meaningful correlations, but the
 * table shows the symmetry.
 */
export function compareIntervals<T>(
  i1: Readonly<Interval<T>>,
  i2: Readonly<Interval<T>>,
  compareFn?: Comparator<T>
): number {
  const compare: Comparator<T> = getCompareIfOk([i1, i2], compareFn) // asserts preconditions

  function compareEnd(i1: Readonly<Interval<T>>, i2: Readonly<Interval<T>>): number {
    if (i1.end === undefined || i1.end === null) {
      if (i2.end !== undefined && i2.end !== null) {
        return +1
      }
      return 0
    }

    if (i2.end === undefined || i2.end === null) {
      return -1
    }

    return compare(i1.end, i2.end)
  }

  if (i1.start === undefined || i1.start === null) {
    if (i2.start !== undefined && i2.start !== null) {
      return -1
    }

    return compareEnd(i1, i2)
  }

  if (i2.start === undefined || i2.start === null) {
    return +1
  }

  const i1StartVsi2Start = compare(i1.start, i2.start)
  if (i1StartVsi2Start !== 0) {
    return i1StartVsi2Start
  }

  // starts are equal and definite
  return compareEnd(i1, i2)
}
