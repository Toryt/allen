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
  isTypeRepresentation,
  representsSuperType,
  TypeRepresentation,
  typeRepresentationOf
} from './typeRepresentation'
import { TypeFor } from './type'

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
  readonly start: T
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
