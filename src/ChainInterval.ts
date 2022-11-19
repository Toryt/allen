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
import {
  commonTypeRepresentation,
  isTypeRepresentation,
  representsSuperType,
  TypeRepresentation,
  typeRepresentationOf
} from './typeRepresentation'
import { TypeFor } from './type'
import { Interval } from './Interval'

/**
 * When a {@link isChain} for which only the end can be indefinite occurs in business logic, it is often represented as
 * an ordered list of elements that only have a `start`. The `end` of each interval in the chain is implicitly the
 * `start` of the next interval, and the `end` of the last interval is implicitly indefinite.
 *
 * Such pseudo-intervals implement this interface.
 *
 * **The property name `end` is reserved.**
 */
export interface ChainInterval<T> {
  readonly start: T
  readonly end: never
}

export function isChainInterval<TR extends TypeRepresentation> (
  ci: unknown,
  pointType: TypeRepresentation
): ci is ChainInterval<TypeFor<TR>> {
  assert(isTypeRepresentation(pointType))

  if (ci === undefined || ci === null || (typeof ci !== 'object' && typeof ci !== 'function') || 'end' in ci) {
    return false
  }

  const pci = ci as Partial<ChainInterval<TypeFor<TR>>>
  const ciType = typeRepresentationOf(pci.start)
  return ciType !== undefined && representsSuperType(pointType, ciType)
}

/**
 * An array of {@link ChainInterval} elements. Each element has a definite `start`. The `end` of each element is
 * implicitly the `start` of the next element in the array. The last element implicitly has an indefinite `end`.
 *
 * The `start` of each element must be smaller than the `start` of the next element.
 */
type ChainIntervalChain<T> = ReadonlyArray<ChainInterval<T>> & { __brand: 'ChainIntervalChain' }

export function isChainIntervalChain<T> (
  cis: unknown,
  compareFn?: T extends LTComparable ? Comparator<T> | undefined : Comparator<T>
): cis is ChainIntervalChain<T> {
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

export function chainIntervalChainToIntervalChain<T> (
  cis: ReadonlyArray<ChainInterval<T>>,
  compareFn?: T extends LTComparable ? Comparator<T> | undefined : Comparator<T>
): ReadonlyArray<Interval<T>> {
  assert(isChainIntervalChain(cis, compareFn))

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
