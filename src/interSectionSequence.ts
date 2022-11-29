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

import { Interval } from './Interval'
import { Comparator } from './Comparator'
import {compareIntervals} from "./sequence";
import {AllenRelation} from "./AllenRelation";

export interface SourceIntervals<T> {
  [reference: string]: Array<Interval<T>>
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
 * MUDO so the whole naming the sources thing does not make sense? It sure does in usage! But each reference can be an
 * array!
 *
 * The resulting sequence is ordered, might have gaps, and might be left- and / or right-indefinite.
 */
export function interSectionSequence<T> (sources: SourceIntervals<T>, compareFn?: Comparator<T>): Interval<T>[] {
  function intervalCompare (i1: Interval<T>, i2: Interval<T>): number {
    return compareIntervals(i1, i2, compareFn)
  }


  function one(is:Interval<T>[]): Interval<T> {
    const sorted = is.slice().sort(intervalCompare)

    return sorted.reduce((acc: Interval<T>[], i: Interval<T>) => {
      const relationWithLast = AllenRelation.relation<T>(i, acc[acc.length-1])
      if (!relationWithLast.implies(AllenRelation.DOES_NOT_CONCUR_WITH)) {
        const previous = acc.pop()
        acc.push({start: previous.start,}) // 2 or 3 new intervals
      }
      return acc
    },[])
  }

  return Object.keys(sources).reduce((acc, key) => ,[])
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
