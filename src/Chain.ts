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
import assert from 'assert'
import { isLTComparableOrIndefinite, LTComparable, ltCompare } from './ltCompare'
import { commonTypeRepresentation, TypeRepresentation } from './typeRepresentation'
import { Interval } from './Interval'
import { ChainInterval, isChainInterval } from './ChainInterval'

/**
 * An array of {@link ChainInterval} elements. Each element has a definite `start`. The `end` of each element is
 * implicitly the `start` of the first interval with a larger `start`. The last element implicitly has an indefinite
 * `end`. The elements do not have to be ordered.
 *
 * All elements have to have a different `start`.
 */
type Chain<T> = ReadonlyArray<ChainInterval<T>> & { __brand: 'ChainIntervalChain' }

export function isChain<T> (
  cis: unknown,
  compareFn?: T extends LTComparable ? Comparator<T> | undefined : Comparator<T>
): cis is Chain<T> {
  if (!Array.isArray(cis)) {
    return false
  }

  assert(
    cis.every(ci => ci !== undefined && ci !== null && isLTComparableOrIndefinite(ci.start)) || compareFn !== undefined,
    '`compareFn` is mandatory when a start is a `symbol` or `NaN`'
  )
  const compare: Comparator<T> = compareFn ?? ltCompare

  const cType: TypeRepresentation | undefined | false = commonTypeRepresentation(...cis.map(ci => ci.start))
  return (
    cType !== false &&
    cType !== undefined &&
    cis.every(
      (ci: ChainInterval<T>, index) =>
        isChainInterval(ci, cType) && (index === 0 || compare(cis[index - 1].start, ci.start) < 0)
    )
  )
}

/**
 * Returns an ordered gapless {@link isSequence sequence} from a {@link Chain}. Elements of the result reference the
 * {@link ChainInterval} they represent.
 */
export function chainToSequence<T> (
  cis: ReadonlyArray<ChainInterval<T>>,
  compareFn?: T extends LTComparable ? Comparator<T> | undefined : Comparator<T>
): ReadonlyArray<Interval<T>> {
  assert(isChain(cis, compareFn))

  return cis.map((ci, index) =>
    index < cis.length - 1
      ? /* prettier-ignore */ Object.create(ci, {
        end: {
          enumerable: true,
          value: cis[index + 1].start
        }
      })
      : cis
  )
}
