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
}

function normalizeSequenceOptions<T> (
  is: ReadonlyArray<Interval<T>>,
  options?: SequenceOptions<T>
): Required<SequenceOptions<T>> {
  assert(options === undefined || typeof options === 'object')

  return {
    compareFn: getCompareIfOk(is, options?.compareFn), // asserts preconditions
    leftDefinite: options?.leftDefinite ?? false,
    rightDefinite: options?.rightDefinite ?? false,
    ordered: options?.ordered ?? false
  }
}

/**
 * The elements of `is` are discrete (i.e., do not {@link AllenRelation.CONCURS_WITH concur with the previous or next
 * element}), and are ordered from smallest `i.start` to largest `i.end`.
 *
 * There might be gaps in the sequence.
 *
 * Only `i[0]` might have an indefinite `start`, and only the last element might have an indefinite `end`.
 *
 * // MUDO fix definition
 * @returns is.every((i, j) => j === 0 || relation(i, is[j - 1]).implies(DOES_NOT_CONCUR) && is[j - 1].start < i.start)
 */
export function isSequence<T> (is: ReadonlyArray<Interval<T>>, options?: SequenceOptions<T>): boolean {
  const { compareFn } = normalizeSequenceOptions(is, options)

  if (is.length <= 0) {
    return true
  }

  function intervalCompare (i1: Interval<T>, i2: Interval<T>): number {
    if (i1.start === undefined || i1.start === null) {
      if (i2.start !== undefined && i2.start !== null) {
        return -1
      }
      return 0
    }
    if (i2.start === undefined || i2.start === null) {
      return +1
    }

    const i1StartVsi2Start = compareFn(i1.start, i2.start)
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

    return compareFn(i1.end, i2.end)
  }

  const sortedIs: ReadonlyArray<Interval<T>> = options?.ordered ?? false ? is : is.slice().sort(intervalCompare)

  if (
    ((options?.leftDefinite ?? false) && (sortedIs[0].start === undefined || sortedIs[0].start === null)) ||
    ((options?.rightDefinite ?? false) &&
      (sortedIs[sortedIs.length - 1].end === undefined || sortedIs[sortedIs.length - 1].end === null))
  ) {
    return false
  }

  function endsBefore (i1: Interval<T>, i2: Interval<T>): boolean {
    return (
      i1.end !== undefined &&
      i1.end !== null &&
      i2.start !== undefined &&
      i2.start !== null &&
      compareFn(i1.end, i2.start) <= 0
    )
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
