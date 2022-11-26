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

import { Comparator } from './comparator'
import { Interval } from './Interval'
import { getCompareIfOk } from './getCompareIfOk'
import assert from 'assert'

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
 * | Allen relations                                                                                                                                                                              | result          |
 * | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
 * | `(p)`, `(m)`, `(o)`, `(F)`, `(D)`, `(s)`, {@link AllenRelation.STARTS_EARLIER `(pmoFD)`}, {@link AllenRelation.ENDS_IN `(osd)`}, {@link AllenRelation.CONTAINS_START `(oFD)`}                | `-1`            |
 * | `(e)`                                                                                                                                                                                        | `0`             |
 * | `(S)`, `(d)`, `(f)`, `(O)`, `(M)`, `(P)`, `(pmoFDseSdfO)`, {@link AllenRelation.STARTS_IN `(dfO)`}, {@link AllenRelation.CONTAINS_END `(DSO)`}, {@link AllenRelation.STARTS_LATER `(dfOMP)`} | `+1`            |
 * | {@link AllenRelation.ENDS_LATER `(DSOMP)`}, {@link AllenRelation.ENDS_EARLIER `(pmosd)`}, `(oFDseSdfOMP)`                                                                                    | `-1`, `+1`      |
 * | {@link AllenRelation.START_TOGETHER `(seS)`}, {@link AllenRelation.END_TOGETHER `(Fef)`}, `full`                                                                                             | `-1`, `0`, `+1` |
 *
 * If the result is `0`, the actual relation is implied by `(e)`. There are no other meaningful correlations.
 */
export function compareIntervals<T> (i1: Interval<T>, i2: Interval<T>, compareFn?: Comparator<T>): number {
  const compare: Comparator<T> = getCompareIfOk([i1, i2], compareFn) // asserts preconditions

  if (i1.start === undefined || i1.start === null) {
    if (i2.start !== undefined && i2.start !== null) {
      return -1
    }
    return 0
  }
  if (i2.start === undefined || i2.start === null) {
    return +1
  }

  const i1StartVsi2Start = compare(i1.start, i2.start)
  if (i1StartVsi2Start !== 0) {
    return i1StartVsi2Start
  }

  // starts are equal and definite
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

/**
 * Optional options to determine whether an array of {@link Interval}s is a _sequence_ with more or less constraints.
 */
export interface SequenceOptions<T> {
  /**
   * Optional compare function with traditional semantics.
   * Mandatory when any point is `NaN`, or symbols are used.
   */
  compareFn?: Comparator<T>

  /**
   * Optional boolean property. When it is thruthy, the first interval in the sequence, if any, must be
   * left-definite. If the value is falsy, or does not exist, the first interval in the sequence can be left-definite or
   * left-indefinite.
   */
  leftDefinite?: boolean

  /**
   * Optional boolean property. When it is thruthy, the last interval in the sequence, if any, must be
   * right-definite. If the value is falsy, or does not exist, the last interval in the sequence can be right-definite
   * or right-indefinite.
   */
  rightDefinite?: boolean

  /**
   * Optional boolean property. When it is truthy, the sequence must be ordered. When the value is falsy, the sequence
   * may be ordered or not ordered.
   */
  ordered?: boolean

  /**
   * Tristate. When `true`, intervals in the sequence must be {@link AllenRelation.TOUCHES touch} each other. When
   * `false`, intervals in the sequence must  {@link AllenRelation.IS_SEPARATE_FROM separate}. When not present or
   * `undefined`, intervals in the sequence can meet or be separate, i.e., must
   * {@link AllenRelation.DOES_NOT_CONCUR_WITH not concur}.
   */
  gaps?: boolean
}

/**
 * The elements of `is` are discrete (i.e., do not {@link AllenRelation.CONCURS_WITH concur with the previous or next
 * element}), and are ordered from smallest `i.start` to largest `i.end`.
 *
 * There might be gaps in the sequence.
 *
 * Only `i[0]` might have an indefinite `start`, and only the last element might have an indefinite `end`.
 *
 * // IDEA maybe make the definition more readable by splittin it in parts
 * @returns (is.length <= 0 ||
 *             ((!(optionsBase?.leftDefinite ?? false) || (is[0].start !== undefined && is[0].start !== null)) &&
 *               (!(optionsBase?.rightDefinite ?? false) ||
 *                 (is[is.length - 1].end !== undefined && is[is.length - 1].end !== null)))) &&
 *             is.every(
 *               (i: Interval<T>, index: number) =>
 *                 (!(optionsBase?.ordered ?? false) || index === 0 || hasSmallerStart(is[index - 1], i, compare)) &&
 *                 is.every(
 *                   (j: Interval<T>) =>
 *                     i === j ||
 *                     AllenRelation.relation(i, j, compare).implies(
 *                       optionsBase?.gaps !== undefined && optionsBase.gaps
 *                         ? AllenRelation.IS_SEPARATE_FROM
 *                         : AllenRelation.DOES_NOT_CONCUR_WITH
 *                     )
 *                 ) &&
 *                 (optionsBase?.gaps === undefined ||
 *                   optionsBase.gaps ||
 *                   is.length <= 1 ||
 *                   // is first
 *                   i ===
 *                     is.reduce(
 *                       (acc: Interval<T>, j: Interval<T>) =>
 *                         AllenRelation.relation(acc, j, compare).implies(EARLIER) ? acc : j,
 *                       is[0]
 *                     ) ||
 *                   // must have a predecessor
 *                   is.some((j: Interval<T>) => AllenRelation.relation(j, i, compare).implies(AllenRelation.MEETS)))
 *             )
 */
export function isSequence<T> (is: ReadonlyArray<Interval<T>>, options?: SequenceOptions<T>): boolean {
  assert(options === undefined || typeof options === 'object')
  const compareFn: Comparator<T> = getCompareIfOk(is, options?.compareFn) // asserts preconditions
  const leftDefinite: boolean = options?.leftDefinite ?? false
  const rightDefinite: boolean = options?.rightDefinite ?? false
  const ordered: boolean = options?.ordered ?? false

  if (is.length <= 0) {
    return true
  }

  function intervalCompare (i1: Interval<T>, i2: Interval<T>): number {
    return compareIntervals(i1, i2, options?.compareFn)
  }

  const sortedIs: ReadonlyArray<Interval<T>> = ordered ? is : is.slice().sort(intervalCompare)

  if (
    (leftDefinite && (sortedIs[0].start === undefined || sortedIs[0].start === null)) ||
    (rightDefinite && (sortedIs[sortedIs.length - 1].end === undefined || sortedIs[sortedIs.length - 1].end === null))
  ) {
    return false
  }

  function endsBefore (i1: Interval<T>, i2: Interval<T>): boolean {
    if (i1.end === undefined || i1.end === null || i2.start === undefined || i2.start === null) {
      return false
    }

    const comparison: number = compareFn(i1.end, i2.start)

    return options?.gaps === undefined ? comparison <= 0 : options.gaps ? comparison < 0 : comparison === 0
  }

  return sortedIs.every((j: Interval<T>, index: number) => index === 0 || endsBefore(sortedIs[index - 1], j))
}

// /**
//  * Turn the _set_ of intervals `i` into a {@link isSequence seqyence}.
//  *
//  * Intervals that {@link AllenRelation.CONCURS_WITH concur with} each other are replaced by distinct
//  * {@link AllenRelation.MEETS meeting} intervals (the “intersections“).
//  */
// export function toSequence<T> (i: Interval<T>[], compareFn?: Comparator<T>): Interval<T>[] {}
