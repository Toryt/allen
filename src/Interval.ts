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

import {
  commonTypeRepresentation,
  isTypeRepresentation,
  representsSuperType,
  TypeRepresentation
} from './TypeRepresentation'
import { Indefinite, TypeFor } from './type'
import assert from 'assert'
import { isLTComparableOrIndefinite, ltCompare } from './ltCompare'
import { Comparator } from './Comparator'

/**
 * Map where each property holds a collection of Intervals. The property name is often used to refer to the collection.
 * This takes into account own and inherited enumerable properties.
 *
 * **Note:** According to TypeScript, arrays are not `ReferenceIntervals`. An array index is not a `string` property
 * name. Also, e.g., `Date` instances do not have any `string` property name, and are not allowed. The empty object `{}`
 * however, _is_ allowed.
 */
export type ReferenceIntervals<T> = Record<string, ReadonlyArray<Interval<T>>>

function loopProtectedIsReferenceIntervals<TR extends TypeRepresentation> (
  u: unknown,
  pointType: TR | undefined,
  compareFn: Comparator<TypeFor<TR>> | undefined,
  visitedIntervals: unknown[], // loop protection
  visitedReferenceIntervals: unknown[] // loop protection
): u is Readonly<ReferenceIntervals<TypeFor<TR>>> {
  if (visitedReferenceIntervals.includes(u)) {
    return true
  }

  if (u === undefined || u === null || typeof u !== 'object') {
    return false
  }

  // explicitly use for .. in, not Object.values, to also get inherited enumerable properties
  visitedReferenceIntervals.push(u)
  for (const key in u) {
    // keys are always strings
    const keyValue: unknown = (u as any)[key]
    if (!Array.isArray(keyValue)) {
      return false
    }

    // tail recursion
    if (
      !keyValue.every(ue =>
        loopProtectedIsInterval<TR>(ue, pointType, compareFn, visitedIntervals, visitedReferenceIntervals)
      )
    ) {
      return false
    }
  }

  return true
}

/**
 * This takes into account own and inherited enumerable properties.
 *
 * **Note:** According to TypeScript, objects that have no `string` property names, such as arrays
 * or `Date` instances are not allowed. The empty object `{}` is allowed. This function returns true
 * however for objects that _have no enumerable properties_, such as the empty array, or `Date`
 * instances. There is no general code possible to bar these instances. (We could explicitly bar
 * arrays and `Date` instances, but there are infinitely many other object types possible that have
 * no enumerable properties.) Yet, we cannot allow these types in TypeScript for a map object.
 *
 * @param u - the candidate {@link ReferenceIntervals}`
 * @param pointType - All point representations in `u` must at least have this type, recursively. If this is
 *                    `undefined`, all intervals in `u` must be fully indefinite. _`undefined` notably does **not** mean
 *                    “don‘t care”._ `indefinite` point representations are allowed in any interval with any
 *                    `pointType`.
 * @param compareFn - Optional {@link Comparator}, used to determine whether all intervals‘ `start < end`, recursively.
 *                    Mandatory when the point representations are `symbol` s, or a point representation is `NaN`.
 */
export function isReferenceIntervals<TR extends TypeRepresentation> (
  u: unknown,
  pointType: TR | undefined,
  compareFn?: Comparator<TypeFor<TR>>
): u is Readonly<ReferenceIntervals<TypeFor<TR>>> {
  assert(pointType === undefined || isTypeRepresentation(pointType))
  assert(compareFn === undefined || typeof compareFn === 'function')

  return loopProtectedIsReferenceIntervals(u, pointType, compareFn, [], [])
}

/**
 * Intervals have `start` and an `end` {@link commonTypeRepresentation _of the same type_}, which can be
 * {@link Indefinite indefinite}.
 *
 * Invariant: `start` must be before `end`, if both are definite, with any {@link Comparator} that is
 * used where the interval is involved.
 *
 * **Note:** Objects that have neither a `start`, `end`, or `referenceIntervals` property, e.g., a `Date` or an array,
 * _are_ considered fully indefinite intervals!
 */
export interface Interval<T> {
  start?: Indefinite<T>
  end?: Indefinite<T>
  referenceIntervals?: ReferenceIntervals<T>
}

function loopProtectedIsInterval<TR extends TypeRepresentation> (
  u: unknown,
  pointType: TR | undefined,
  compareFn: Comparator<TypeFor<TR>> | undefined,
  visitedIntervals: unknown[], // loop protection
  visitedReferenceIntervals: unknown[] // loop protection
): u is Readonly<Interval<TypeFor<TR>>> {
  if (visitedIntervals.includes(u)) {
    return true
  }

  if (u === undefined || u === null || (typeof u !== 'object' && typeof u !== 'function')) {
    return false
  }

  const pi = u as Readonly<Partial<Interval<TypeFor<TR>>>>

  // depth first backtrack
  visitedIntervals.push(pi)
  if (
    pi.referenceIntervals !== undefined &&
    !loopProtectedIsReferenceIntervals<TR>(
      pi.referenceIntervals,
      pointType,
      compareFn,
      visitedIntervals,
      visitedReferenceIntervals
    )
  ) {
    return false
  }

  const cType = commonTypeRepresentation(pi.start, pi.end)
  if (cType === false) {
    return false
  }
  if (cType === undefined) {
    return true
  }
  if (pointType === undefined || !representsSuperType(pointType, cType)) {
    return false
  }

  assert(
    (isLTComparableOrIndefinite(pi.start) && isLTComparableOrIndefinite(pi.end)) || compareFn !== undefined,
    '`compareFn` is mandatory when `i.start` or `i.end` is a `symbol` or `NaN`'
  )

  function startBeforeEnd (
    start: Indefinite<TypeFor<TR>>,
    end: Indefinite<TypeFor<TR>>,
    compare: Comparator<TypeFor<TR>>
  ): boolean {
    return start === undefined || start === null || end === undefined || end === null || compare(start, end) < 0
  }

  return startBeforeEnd(pi.start, pi.end, compareFn ?? ltCompare)
}
/**
 * If both `start` and `end` are definite,
 *
 * * `start` and `end` must be “of the same type”
 * * `start` must be before `end`
 *
 * To compare `start` and `end`, the optional `compareFn` is used when given, or {@link ltCompare} when not. When
 * `start` and `end` are `symbols`, or one of the values is `NaN`, a `compareFn` parameter is mandatory.
 *
 * **Note:** Objects that have neither a `start`, `end`, or `referenceIntervals` property, e.g., a `Date` or an array,
 * _are_ considered fully indefinite intervals!
 *
 * @param u - the candidate {@link Interval}`
 * @param pointType - `start`, `end`, and all point representations in `u.referenceIntervals` must at least have this
 *                    type. If this is `undefined`, `u` and all intervals in `u.referenceIntervals` must be fully
 *                    indefinite, recursively. _`undefined` notably does **not** mean “don‘t care”._ `indefinite` point
 *                    representations are allowed in any interval with any `pointType`.
 * @param compareFn - Optional {@link Comparator}, used to determine whether `u.start < u.end` and that `start < end`
 *                    for all intervals in `u.referenceIntervals`, recursively. Mandatory when the point representations
 *                    are `symbol` s, or a point representation is `NaN`.
 */
export function isInterval<TR extends TypeRepresentation> (
  u: unknown,
  pointType: TR | undefined,
  compareFn?: Comparator<TypeFor<TR>>
): u is Interval<TypeFor<TR>> {
  assert(pointType === undefined || isTypeRepresentation(pointType))
  assert(compareFn === undefined || typeof compareFn === 'function')

  return loopProtectedIsInterval(u, pointType, compareFn, [], [])
}

export interface ReferencedInterval<T> {
  readonly interval: Readonly<Interval<T>>
  readonly reference: string
}
