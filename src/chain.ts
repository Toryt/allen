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
// isOrderedChain
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
// export function toChain<T> (pi: PseudoInterval<T>[], compareFn?: Comparator<T>): Interval<T>[] {}
//
// export function toChain<T> (t: <T>[], compareFn?: Comparator<T>): Interval<T>[] {}