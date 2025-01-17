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

import { AllenRelation } from './AllenRelation'
import { type Interval } from './Interval'
import { type Comparator } from './Comparator'
import assert from 'assert'
import { getCompareIfOk } from './getCompareIfOk'

/**
 * Does `i` enclose all intervals in `is`?
 *
 * When any interval is fully or partially indefinite, this cannot be guaranteed, and `false` is returned.
 */
export function isEnclosing<T>(
  i: Readonly<Interval<T>>,
  is: ReadonlyArray<Readonly<Interval<T>>>,
  compareFn?: Comparator<T>
): boolean {
  assert(Array.isArray(is))
  const compare: Comparator<T> = getCompareIfOk<T>(is.concat([i]), compareFn)

  return is.every(ie => AllenRelation.relation<T>(i, ie, compare).implies(AllenRelation.ENCLOSES))
}

/**
 * Does `i` enclose all intervals in `is`, and is `i` not larger than necessary to do that?
 *
 * When any interval is fully or partially indefinite, this cannot be guaranteed, and `false` is returned.
 *
 * When `is` has no elements, there is no `i` that could be enclosing, so `false` is returned always.
 *
 * ### Result
 *
 * ```ts
 * @return i.start !== undefined && i.start !== null &&
 *         i.end !== undefined && i.end !== null &&
 *         is.every(j => j.start !== undefined && j.start !== null &&
 *                       j.end !== undefined && j.end !== null &&
 *                       !(j.start < i.start) ) &&
 *                       !(i.end < j.end)) &&
 *         is.some(j => j.start !== undefined && j.start !== null && i.start === j.start) &&
 *         is.some(j => j.end !== undefined && j.end !== null && i.end === j.end)
 * ```
 */
export function isMinimalEnclosing<T>(
  i: Readonly<Interval<T>>,
  is: ReadonlyArray<Readonly<Interval<T>>>,
  compareFn?: Comparator<T>
): boolean {
  assert(Array.isArray(is))
  const compare: Comparator<T> = getCompareIfOk<T>(is.concat([i]), compareFn)

  if (i.start === undefined || i.start === null || i.end === undefined || i.end === null || is.length <= 0) {
    return false
  }

  let foundStart: boolean = false
  let foundEnd: boolean = false
  for (let j = 0; j < is.length; j++) {
    if (is[j].start === undefined || is[j].start === null || is[j].end === undefined || is[j].end === null) {
      return false // break
    }
    const jStartVsIStart = compare(is[j].start, i.start)
    if (jStartVsIStart < 0) {
      return false
    }
    if (jStartVsIStart === 0) {
      foundStart = true
    }
    const iEndVsJEnd = compare(i.end, is[j].end)
    if (iEndVsJEnd < 0) {
      return false
    }
    if (iEndVsJEnd === 0) {
      foundEnd = true
    }
  }

  return foundStart && foundEnd
}

/**
 * Determine the minimal enclosing interval for all intervals `i[j]`.
 *
 * When one or more elements of `i` have an indefinite `start`, the `result` has an indefinite `start`. Otherwise,
 * `result.start` is the smallest `start` of any element of `i`. When one or more elements of `i` have an indefinite
 * `end`, the `result` has an indefinite `end`. Otherwise, `result.end` is the largest `end` of any element of `i`.
 *
 *
 * ### Result
 *
 * ```ts
 * is.every(i => AllenRelation.relation(result, i).implies(ENCLOSES))
 * result.start !== null
 * result.end !== null
 * result.start !== undefined || is.length <= 0 || is.some(i => i.start === undefined || i.start === null)
 * result.start === undefined || is.every(i => i.start !== undefined && i.start !== null && !(i.start < result.start))
 * result.end !== undefined || is.length <= 0 || is.some(i => i.end === undefined || i.end === null)
 * result.end === undefined || is.every(i => i.end !== undefined && i.end !== null && !(result.end < i.end))
 * ```
 */
export function minimalEnclosing<T>(
  is: ReadonlyArray<Readonly<Interval<T>>>,
  compareFn?: Comparator<T>
): Readonly<Interval<T>> {
  /* IDEA: add optional property name for referenceIntervals */
  const compare: Comparator<T> = getCompareIfOk(is, compareFn)

  if (is.length <= 0) {
    return {}
  }

  let result: Interval<T> = is[0]

  for (let j = 1; j < is.length; j++) {
    const i: Interval<T> = is[j]
    if (i.start === undefined || i.start === null) {
      result = { end: result.end } // delete start
    } else if (result.start !== undefined && result.start !== null && compare(i.start, result.start) < 0) {
      result = { start: i.start, end: result.end }
    }
    if (i.end === undefined || i.end === null) {
      result = { start: result.start } // delete end
    } else if (result.end !== undefined && result.end !== null && compare(result.end, i.end) < 0) {
      result = { start: result.start, end: i.end }
    }
  }

  return result
}
