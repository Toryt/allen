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
import { getCompareIfOk } from './getCompareIfOk'
import { compareIntervals } from './compareIntervals'
import { isTypeRepresentation, TypeRepresentation } from './TypeRepresentation'
import { TypeFor } from './type'

interface ReferencedInterval<T> {
  readonly interval: Readonly<Interval<T>>
  readonly reference: string
}

/**
 * Turn a {@link ReferenceIntervals} instance into an array of {@link ReferencedInterval} instances, ordered with
 * {@link compareIntervals} on their `interval` values.
 */
export function transposeAndOrder<TR extends TypeRepresentation> (
  sources: Readonly<ReferenceIntervals<TypeFor<TR>>>,
  pointType: TR,
  compareFn?: Comparator<TypeFor<TR>>
): ReadonlyArray<ReferencedInterval<TypeFor<TR>>> {
  assert(isTypeRepresentation(pointType))
  assert(compareFn === undefined || typeof compareFn === 'function')
  assert(isReferenceIntervals(sources, pointType, compareFn))

  function compareReferencedIntervals (
    ri1: Readonly<ReferencedInterval<TypeFor<TR>>>,
    ri2: Readonly<ReferencedInterval<TypeFor<TR>>>
  ): number {
    return compareIntervals(ri1.interval, ri2.interval, compareFn)
  }

  let result: Array<ReferencedInterval<TypeFor<TR>>> = []
  for (const reference in sources) {
    const transposed: ReadonlyArray<Readonly<ReferencedInterval<TypeFor<TR>>>> = sources[reference].map(interval => ({
      interval,
      reference
    }))
    result = result.concat(transposed)
  }
  return result.sort(compareReferencedIntervals)
}

/**
 * Return a sequence that has the fewest possible intervals, that are intersections of intervals provided in the
 * `sources`, so that the every interval in the `sources` is “covered” by a gapless subsequence of one or more intervals
 * in the result.
 *
 * Each interval in the result `ir` refers to the intervals `is` in the `sources` in its `referenceIntervals` that cause
 * it to appear (`ir (sedf) is`). `ir` {@link AllenRelation.DOES_NOT_CONCUR_WITH does not concurr with} any other
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
  // TODO isSourceIntervals

  const pile = Object.values(sources).flat()

  const compare: Comparator<T> = getCompareIfOk(pile, compareFn) // asserts preconditions

  function intervalCompare (i1: Interval<T>, i2: Interval<T>): number {
    return compareIntervals(i1, i2, compare)
  }

  const sorted = pile
    .sort(intervalCompare)
    .map(is => ({ start: is.start, end: is.end, referenceIntervals: { lala: [is] } }))

  return sorted
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
