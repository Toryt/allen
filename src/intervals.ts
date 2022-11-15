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
import { Interval } from './Interval'
import { Comparator } from './comparator'
import assert from 'assert'
import { getCompareIfOk } from './getCompareIfOk'

/**
 * The second interval is completely in the first interval.
 */
export const ENCLOSES: AllenRelation = AllenRelation.fromString<AllenRelation>('FDeS')

// export const DOES_NOT_CONCUR = AllenRelation.CONCURS_WITH.complement()

/**
 * Does `i` enclose all intervals in `is`?
 *
 * When any interval is fully or partially indefinite, this cannot be guaranteed, and `false` is returned.
 */
export function isEnclosing<T> (i: Interval<T>, is: Array<Interval<T>>, compareFn?: Comparator<T>): boolean {
  assert(Array.isArray(is))
  const compare: Comparator<T> = getCompareIfOk<T>(is.concat([i]), compareFn)
  return is.every(ie => AllenRelation.relation<T>(i, ie, compare).implies(ENCLOSES))
}
//
// export function isMinimalEnclosing<T> (i: Interval<T>[], i2: Interval<T>, compareFn?: Comparator<T>): boolean {
//   return true
// }
//
// /**
//  * Determine the minimal enclosing interval for all intervals `i[j]`.
//  *
//  * When one or more elements of `i` have an indefinite `start`, the `result` has an indefinite `start`. Otherwise,
//  * `result.start` is the smallest `start` of any element of `i`. When one or more elements of `i` have an indefinite
//  * `end`, the `result` has an indefinite `end`. Otherwise, `result.end` is the largest `end` of any element of `i`.
//  *
//  * @return {Interval<T>} `i.every(j => result {@link ENCLOSES} j)` and IS MINIMAL // MUDO
//  */
// export function minimalEnclosing<T> (i: Interval<T>[], compareFn?: Comparator<T>): Interval<T> {
//   const compare: Comparator<T> = getCompareIfOk(i, compareFn)
//
//   return i.reduce((acc, j) => {
//     return {
//       start:
//         j.start !== undefined &&
//         j.start !== null &&
//         (acc.start === undefined || acc.start === null || compare(j.start, acc.start) < 0)
//           ? j.start
//           : acc.start,
//       end:
//         j.end !== undefined &&
//         j.end !== null &&
//         (acc.end === undefined || acc.end === null || compare(j.end, acc.end) > 0)
//           ? j.end
//           : acc.end
//     }
//   }, {})
// }
//
// /**
//  * The elements of `i` are discrete (i.e., do not {@link AllenRelation.CONCURS_WITH concur with the previous or next
//  * element}), and are ordered from smallest `i.start` to largest `i.end`.
//  *
//  * There might be gaps in the chain.
//  *
//  * Only `i[0]` might have an indefinite `start`, and only the last element might have an indefinite `end`.
//  */
// export function isSequence<T> (i: Interval<T>[], compareFn?: Comparator<T>): boolean {
//   const compare: Comparator<T> = getCompareIfOk(i, compareFn)
//
//   return i.every(
//     (j: Interval<T>, index: number) =>
//       index === 0 || AllenRelation.relation(j, i[index - 1], compare).implies(DOES_NOT_CONCUR)
//   )
// }
//
// /**
//  * Turn the _set_ of intervals `i` into a {@link isSequence seqyence}.
//  *
//  * Intervals that {@link AllenRelation.CONCURS_WITH concur with} each other are replaced by distinct
//  * {@link AllenRelation.MEETS meeting} intervals (the “intersections“).
//  */
// export function toSequence<T> (i: Interval<T>[], compareFn?: Comparator<T>): Interval<T>[] {}
//
// /**
//  * The elements of `i` {@link AllenRelation.MEETS}, and are ordered from smallest `i.start` to largest `i.end`.
//  *
//  * There are no gaps in the sequence.
//  *
//  * Only `i[0]` might have an indefinite `start`, and only the last element might have an indefinite `end`.
//  */
// export function isChain<T> (i: Interval<T>[], compareFn?: Comparator<T>): boolean {
//   const compare: Comparator<T> = getCompareIfOk(i, compareFn)
//
//   return i.every(
//     (j: Interval<T>, index: number) =>
//       index === 0 || AllenRelation.relation(j, i[index - 1], compare).implies(AllenRelation.MEETS)
//   )
// }
//
// /**
//  * Turn the _set_ of intervals `i` into a {@link isSequence sequence}. This is a chain, with gaps filled up with
//  * maximal interval.
//  *
//  * Intervals that {@link AllenRelation.CONCURS_WITH concur with} each other are replaced by distinct
//  * {@link AllenRelation.MEETS meeting} intervals (the “intersections“).
//  */
// export function toChain<T> (i: Interval<T>[], compareFn?: Comparator<T>): Interval<T>[] {}
//
//
// export function toChain<T> (t: <T>[], compareFn?: Comparator<T>): Interval<T>[] {}
