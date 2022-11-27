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

import { Comparator, SafeComparator } from './Comparator'
import { ltCompare } from './ltCompare'
import { commonTypeRepresentation, TypeRepresentation } from './TypeRepresentation'
import { ChainInterval, compareChainIntervals, isChainInterval } from './ChainInterval'
import { Interval } from './Interval'
import assert from 'assert'

/**
 * An array of {@link ChainInterval} elements. Each element has a definite `start`. The `end` of each element is
 * implicitly the `start` of the first interval with a larger `start`. The last element implicitly has an indefinite
 * `end`. The elements do not have to be ordered.
 *
 * All elements have to have a different `start`.
 */
export type Chain<T> = ReadonlyArray<ChainInterval<T>> & { __brand: 'ChainIntervalChain' }

export function isChain<T> (candidate: unknown, compareFn?: SafeComparator<T>): candidate is Chain<T> {
  if (!Array.isArray(candidate)) {
    return false
  }
  if (candidate.length <= 0) {
    return true
  }

  const cType: TypeRepresentation | undefined | false = commonTypeRepresentation(...candidate.map(ci => ci.start))
  if (cType === false || cType === undefined) {
    return false
  }

  if (!candidate.every(ciCandidate => isChainInterval(ciCandidate, cType))) {
    return false
  }

  const sorted: ReadonlyArray<ChainInterval<T>> = candidate
    .slice()
    .sort((ci1: ChainInterval<T>, ci2: ChainInterval<T>) => compareChainIntervals(ci1, ci2, compareFn))

  // no equal starts
  const compare: Comparator<T> = compareFn ?? ltCompare
  return sorted.every((ci: ChainInterval<T>, index) => index === 0 || compare(sorted[index - 1].start, ci.start) < 0)
}

/**
 * Returns an ordered, left-definite, right-indefinite gapless {@link isSequence sequence} from a {@link Chain}.
 * Elements of the result have the {@link ChainInterval} they represent as prototype. The last one does not have an
 * `end`.
 */
export function chainToGaplessLeftDefiniteSequence<T> (
  cis: Chain<T>,
  compareFn?: SafeComparator<T>
): ReadonlyArray<Interval<T>> {
  assert(isChain(cis, compareFn))

  const sorted = cis
    .slice()
    .sort((ci1: ChainInterval<T>, ci2: ChainInterval<T>) => compareChainIntervals(ci1, ci2, compareFn))

  return sorted.map((ci, index) =>
    index < sorted.length - 1
      ? /* prettier-ignore */ Object.create(ci, {
        end: {
          enumerable: true,
          value: sorted[index + 1].start
        }
      })
      : Object.create(ci)
  )
}
