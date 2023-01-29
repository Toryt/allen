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
import assert from 'assert'
import { compareIntervals } from './compareIntervals'

/**
 * Optional options to determine whether an array of {@link Interval}s is a _sequence_ with more or less constraints.
 */
export interface SequenceOptions<T> {
  /**
   * Optional compare function with traditional semantics.
   * Mandatory when any point is `NaN`, or symbols are used.
   */
  compareFn?: Comparator<T> | undefined

  /**
   * Optional boolean property. When it is thruthy, the first interval in the sequence, if any, must be
   * left-definite. If the value is falsy, or does not exist, the first interval in the sequence can be left-definite or
   * left-indefinite.
   */
  leftDefinite?: boolean | undefined

  /**
   * Optional boolean property. When it is thruthy, the last interval in the sequence, if any, must be
   * right-definite. If the value is falsy, or does not exist, the last interval in the sequence can be right-definite
   * or right-indefinite.
   */
  rightDefinite?: boolean | undefined

  /**
   * Optional boolean property. When it is truthy, the sequence must be ordered. When the value is falsy, the sequence
   * may be ordered or not ordered.
   */
  ordered?: boolean | undefined

  /**
   * Tristate. When `true`, intervals in the sequence must be {@link AllenRelation.TOUCHES touch} each other. When
   * `false`, intervals in the sequence must  {@link AllenRelation.IS_SEPARATE_FROM separate}. When not present or
   * `undefined`, intervals in the sequence can meet or be separate, i.e., must
   * {@link AllenRelation.DOES_NOT_CONCUR_WITH not concur}.
   */
  gaps?: boolean | undefined
}

/**
 * The elements of `candidate` are discrete (i.e., do not {@link AllenRelation.CONCURS_WITH concur with the previous or
 * next element}), and are ordered from smallest `i.start` to largest `i.end`.
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
export function isSequence<T> (candidate: ReadonlyArray<Readonly<Interval<T>>>, options?: SequenceOptions<T>): boolean {
  assert(options === undefined || typeof options === 'object')
  const compareFn: Comparator<T> = getCompareIfOk(candidate, options?.compareFn) // asserts preconditions
  const leftDefinite: boolean = options?.leftDefinite ?? false
  const rightDefinite: boolean = options?.rightDefinite ?? false
  const ordered: boolean = options?.ordered ?? false

  if (candidate.length <= 0) {
    return true
  }

  function intervalCompare (i1: Readonly<Interval<T>>, i2: Readonly<Interval<T>>): number {
    return compareIntervals(i1, i2, options?.compareFn)
  }

  const sortedIs: ReadonlyArray<Readonly<Interval<T>>> = ordered ? candidate : candidate.slice().sort(intervalCompare)

  if (
    (leftDefinite && (sortedIs[0].start === undefined || sortedIs[0].start === null)) ||
    (rightDefinite && (sortedIs[sortedIs.length - 1].end === undefined || sortedIs[sortedIs.length - 1].end === null))
  ) {
    return false
  }

  function endsBefore (i1: Readonly<Interval<T>>, i2: Readonly<Interval<T>>): boolean {
    if (i1.end === undefined || i1.end === null || i2.start === undefined || i2.start === null) {
      return false
    }

    const comparison: number = compareFn(i1.end, i2.start)

    return options?.gaps === undefined ? comparison <= 0 : options.gaps ? comparison < 0 : comparison === 0
  }

  return sortedIs.every((j: Readonly<Interval<T>>, index: number) => index === 0 || endsBefore(sortedIs[index - 1], j))
}
