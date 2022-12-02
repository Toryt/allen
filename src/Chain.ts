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

import { Comparator } from './Comparator'
import { ltCompare } from './ltCompare'
import { commonTypeRepresentation, isTypeRepresentation, TypeRepresentation } from './TypeRepresentation'
import { ChainInterval, compareChainIntervals, isChainInterval } from './ChainInterval'
import { Interval } from './Interval'
import assert, { notEqual, ok } from 'assert'
import { TypeFor } from './type'

/**
 * An array of {@link ChainInterval} elements. Each element has a definite `start`. The `end` of each element is
 * implicitly the `start` of the first interval with a larger `start`. The last element implicitly has an indefinite
 * `end`. The elements do not have to be ordered.
 *
 * All elements have to have a different `start`.
 */
export type Chain<T> = ReadonlyArray<Readonly<ChainInterval<T>>> & { __brand: 'ChainIntervalChain' }

export function isChain<TR extends TypeRepresentation> (
  candidate: unknown,
  pointType: TR,
  compareFn?: Comparator<TypeFor<TR>>
): candidate is Chain<TypeFor<TR>> {
  assert(isTypeRepresentation(pointType))

  if (!Array.isArray(candidate)) {
    return false
  }
  if (candidate.length <= 0) {
    return true
  }

  const cType: TypeRepresentation | undefined | false = commonTypeRepresentation(...candidate.map(ci => ci.start))
  if (cType !== pointType) {
    return false
  }

  if (!candidate.every(ciCandidate => isChainInterval(ciCandidate, cType))) {
    return false
  }

  const sorted: ReadonlyArray<ChainInterval<TypeFor<TR>>> = candidate
    .slice()
    .sort((ci1: ChainInterval<TypeFor<TR>>, ci2: ChainInterval<TypeFor<TR>>) =>
      compareChainIntervals(ci1, ci2, compareFn)
    )

  // no equal starts
  const compare: Comparator<TypeFor<TR>> = compareFn ?? ltCompare
  return sorted.every(
    (ci: ChainInterval<TypeFor<TR>>, index) => index === 0 || compare(sorted[index - 1].start, ci.start) < 0
  )
}

/**
 * Returns an ordered, left-definite, right-indefinite gapless {@link isSequence sequence} from a {@link Chain}.
 * Elements of the result have the {@link ChainInterval} they represent as prototype. The last one does not have an
 * `end`.
 */
export function chainToGaplessLeftDefiniteSequence<T> (
  cis: Chain<T>,
  compareFn?: Comparator<T>
): ReadonlyArray<Readonly<Interval<T>>> {
  assert(Array.isArray(cis), '`cis` must be an array')
  if (cis.length <= 0) {
    return []
  }

  const cType: TypeRepresentation | undefined | false = commonTypeRepresentation(...cis.map(ci => ci.start))
  notEqual(cType, false, 'the `start` properties of `cis` elements have to have a commong type')
  ok(cType)

  assert(isChain(cis, cType, compareFn))

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
