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

export interface ReferenceIntervals<T> {
  [reference: string]: Array<Interval<T>>
}

export function loopProtectedIsReferenceIntervals<TR extends TypeRepresentation> (
  u: unknown,
  pointType: TR,
  compareFn: Comparator<TypeFor<TR>> | undefined,
  visitedIntervals: unknown[], // loop protection
  visitedReferenceIntervals: unknown[] // loop protection
): u is Readonly<ReferenceIntervals<TypeFor<TR>>> {
  assert(isTypeRepresentation(pointType))
  assert(compareFn === undefined || typeof compareFn === 'function')
  assert(visitedReferenceIntervals === undefined || Array.isArray(visitedReferenceIntervals))

  if (visitedReferenceIntervals.includes(u)) {
    return true
  }

  if (
    u === undefined ||
    u === null ||
    typeof u !== 'object' ||
    !Object.entries(u).every(([key, value]: [string, unknown]) => typeof key === 'string' && Array.isArray(value))
  ) {
    return false
  }

  const pile: unknown[] = Object.values(u).flat()

  // tail recursion
  visitedReferenceIntervals.push(u)
  return pile.every(ue =>
    loopProtectedIsInterval<TR>(ue, pointType, compareFn, visitedIntervals, visitedReferenceIntervals)
  )
}

export function isReferenceIntervals<TR extends TypeRepresentation> (
  u: unknown,
  pointType: TR,
  compareFn?: Comparator<TypeFor<TR>>
): u is Readonly<ReferenceIntervals<TypeFor<TR>>> {
  assert(isTypeRepresentation(pointType))
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
 * **Note:** Objects that have neither a `start`, `end`, or `referenceIntervals` property, e.g., a `Date`,  _are_
 * considered fully indefinite intervals!
 */
export interface Interval<T> {
  start?: Indefinite<T>
  end?: Indefinite<T>
  referenceIntervals?: ReferenceIntervals<T>
}

function loopProtectedIsInterval<TR extends TypeRepresentation> (
  u: unknown,
  pointType: TR,
  compareFn: Comparator<TypeFor<TR>> | undefined,
  visitedIntervals: unknown[], // loop protection
  visitedReferenceIntervals: unknown[] // loop protection
): u is Readonly<Interval<TypeFor<TR>>> {
  if (visitedIntervals.includes(u)) {
    return true
  }

  function startBeforeEnd (
    start: Indefinite<TypeFor<TR>>,
    end: Indefinite<TypeFor<TR>>,
    compare: Comparator<TypeFor<TR>>
  ): boolean {
    return start === undefined || start === null || end === undefined || end === null || compare(start, end) < 0
  }

  if (u === undefined || u === null || (typeof u !== 'object' && typeof u !== 'function')) {
    return false
  }

  const pi = u as Readonly<Partial<Interval<TypeFor<TR>>>>
  const cType = commonTypeRepresentation(pi.start, pi.end)
  if (cType === false) {
    return false
  }
  if (cType === undefined) {
    return true
  }
  if (!representsSuperType(pointType, cType)) {
    return false
  }

  assert(
    (isLTComparableOrIndefinite(pi.start) && isLTComparableOrIndefinite(pi.end)) || compareFn !== undefined,
    '`compareFn` is mandatory when `i.start` or `i.end` is a `symbol` or `NaN`'
  )

  if (!startBeforeEnd(pi.start, pi.end, compareFn ?? ltCompare)) {
    return false
  }

  // tail recursion
  visitedIntervals.push(pi)
  return (
    pi.referenceIntervals === undefined ||
    loopProtectedIsReferenceIntervals<TR>(
      pi.referenceIntervals,
      pointType,
      compareFn,
      visitedIntervals,
      visitedReferenceIntervals
    )
  )
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
 * **Note:** Objects that have neither a `start`, `end`, or `referenceIntervals` property, e.g., a `Date`,  _are_
 * considered fully indefinite intervals!
 */
export function isInterval<TR extends TypeRepresentation> (
  i: unknown,
  pointType: TR,
  compareFn?: Comparator<TypeFor<TR>>
): i is Interval<TypeFor<TR>> {
  assert(isTypeRepresentation(pointType))
  assert(compareFn === undefined || typeof compareFn === 'function')

  return loopProtectedIsInterval(i, pointType, compareFn, [], [])
}
