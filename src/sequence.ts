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
  compareFn?: Comparator<T>
  leftDefinite?: boolean
  rightDefinite?: boolean
}

function normalizeSequenceOptions<T> (
  is: ReadonlyArray<Interval<T>>,
  options?: SequenceOptions<T>
): Required<SequenceOptions<T>> {
  assert(options === undefined || typeof options === 'object')

  return {
    compareFn: getCompareIfOk(is, options?.compareFn), // asserts preconditions
    leftDefinite: options?.leftDefinite ?? false,
    rightDefinite: options?.rightDefinite ?? false
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
 * @returns is.every((i, j) => j === 0 || relation(i, is[j - 1]).implies(DOES_NOT_CONCUR) && is[j - 1].start < i.start)
 */
export function isOrderedSequence<T> (is: ReadonlyArray<Interval<T>>, options?: SequenceOptions<T>): boolean {
  const { compareFn } = normalizeSequenceOptions(is, options)

  function endsBefore (i1: Interval<T>, i2: Interval<T>): boolean {
    return (
      i1.end !== undefined &&
      i1.end !== null &&
      i2.start !== undefined &&
      i2.start !== null &&
      compareFn(i1.end, i2.start) <= 0
    )
  }

  if (is.length <= 0) {
    return true
  }
  if (
    (options?.leftDefinite && (is[0].start === undefined || is[0].start === null)) ||
    (options?.rightDefinite && (is[is.length - 1].end === undefined || is[is.length - 1].end === null))
  ) {
    return false
  }
  return is.every((j: Interval<T>, index: number) => index === 0 || endsBefore(is[index - 1], j))
}

/**
 * The elements of `is` are discrete (i.e., do not {@link AllenRelation.CONCURS_WITH concur with the previous or next
 * element}).
 *
 * There might be gaps in the sequence. The intervals in `is` do not have to be ordered.
 *
 * Only 1 element might have an indefinite `start`, and only one element might have an indefinite `end`.
 *
 * @returns is.every(i => is.every(j => i === j || relation(i, j).implies(DOES_NOT_CONCUR)))
 */
export function isSequence<T> (is: ReadonlyArray<Interval<T>>, options?: SequenceOptions<T>): boolean {
  const { compareFn } = normalizeSequenceOptions(is, options)

  const sortedIs: ReadonlyArray<Interval<T>> = is.slice().sort((i1: Interval<T>, i2: Interval<T>) => {
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
  })

  return isOrderedSequence(sortedIs, options)
}

// /**
//  * Turn the _set_ of intervals `i` into a {@link isSequence seqyence}.
//  *
//  * Intervals that {@link AllenRelation.CONCURS_WITH concur with} each other are replaced by distinct
//  * {@link AllenRelation.MEETS meeting} intervals (the “intersections“).
//  */
// export function toSequence<T> (i: Interval<T>[], compareFn?: Comparator<T>): Interval<T>[] {}
