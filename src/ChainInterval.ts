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

import assert from 'assert'
import {
  commonTypeRepresentation,
  isTypeRepresentation,
  representsSuperType,
  TypeRepresentation,
  typeRepresentationOf
} from './TypeRepresentation'
import { TypeFor } from './type'
import { Comparator } from './Comparator'
import { isLTComparableOrIndefinite, ltCompare } from './ltCompare'

/**
 * When a {@link isSequence gapless sequence} for which only the end can be indefinite occurs in business logic, it is
 * often represented as a collection of elements that only have a `start`. The `end` of each interval in the chain is
 * implicitly the `start` of the first interval with a larger `start`, and the `end` of the last interval is implicitly
 * indefinite.
 *
 * Such pseudo-intervals implement this interface.
 *
 * **The property name `end` is reserved.**
 */
export interface ChainInterval<T> {
  start: T
}

export function isChainInterval<TR extends TypeRepresentation> (
  ci: unknown,
  pointType: TypeRepresentation
): ci is Readonly<ChainInterval<TypeFor<TR>>> {
  assert(isTypeRepresentation(pointType))

  if (ci === undefined || ci === null || (typeof ci !== 'object' && typeof ci !== 'function') || 'end' in ci) {
    return false
  }

  const pci = ci as Partial<ChainInterval<TypeFor<TR>>>
  const ciType = typeRepresentationOf(pci.start)
  return ciType !== undefined && representsSuperType(pointType, ciType)
}

const haveCommonType: string = 'i1.start and i2.start must be of a common type'

/**
 * Assert that the parameters are acceptable, and return the {@link Comparator} to use.
 */
export function getCompareIfOk<T> (
  cis: ReadonlyArray<Readonly<ChainInterval<T>>>,
  compareFn?: Comparator<T>
): Comparator<T> {
  cis.forEach(ci => assert(typeof ci === 'object' && ci !== null))
  assert(
    compareFn !== undefined || cis.every(ci => isLTComparableOrIndefinite(ci.start)),
    '`compareFn` is mandatory when `iN.start` is a `symbol` or `NaN`'
  )

  const cType = commonTypeRepresentation(...cis.map(ci => ci.start))

  assert(cType !== false, haveCommonType)
  assert(
    cType === undefined || cis.every(ci => isChainInterval(ci, cType)),
    'chain intervals must have `iN.start` of the same type'
  )

  return compareFn ?? ltCompare
}

/**
 * Compare function with the traditional semantics for {@link ChainInterval}s. Compares on `start` (which is mandatory).
 */
export function compareChainIntervals<T> (
  i1: Readonly<ChainInterval<T>>,
  i2: Readonly<ChainInterval<T>>,
  compareFn?: Comparator<T>
): number {
  const compare: Comparator<T> = getCompareIfOk([i1, i2], compareFn) // asserts preconditions

  return compare(i1.start, i2.start)
}
