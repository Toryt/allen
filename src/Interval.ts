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
} from './typeRepresentation'
import { Indefinite, TypeFor } from './type'
import assert from 'assert'
import { isLTComparableOrIndefinite, LTComparable, ltCompare } from './ltCompare'
import { Comparator } from './comparator'
import { getCompareIfOk } from './getCompareIfOk'

/**
 * Intervals have `start` and an `end` {@link commonTypeRepresentation _of the same type_}, which can be
 * {@link Indefinite indefinite}.
 *
 * Invariant: `start` must be before `end`, if both are definite, with any {@link Comparator} that is
 * used where the interval is involved.
 */
export interface Interval<T> {
  readonly start?: Indefinite<T>
  readonly end?: Indefinite<T>
}

/**
 * If both `start` and `end` are definite,
 *
 * - `start` and `end` must be “of the same type”
 * - `start` must be before `end`
 *
 * To compare `start` and `end`, the optional `compareFn` is used when given, or {@link ltCompare} when not. When
 * `start` and `end` are `symbols`, or one of the values is `NaN`, a `compareFn` parameter is mandatory.
 */
export function isInterval<TR extends TypeRepresentation> (
  i: unknown,
  pointType: TR,
  compareFn?: TypeFor<TR> extends LTComparable ? Comparator<TypeFor<TR>> | undefined : Comparator<TypeFor<TR>>
): i is Interval<TypeFor<TR>> {
  assert(isTypeRepresentation(pointType))

  function startBeforeEnd (
    start: Indefinite<TypeFor<TR>>,
    end: Indefinite<TypeFor<TR>>,
    compare: Comparator<TypeFor<TR>>
  ): boolean {
    return start === undefined || start === null || end === undefined || end === null || compare(start, end) < 0
  }

  if (i === undefined || i === null || (typeof i !== 'object' && typeof i !== 'function')) {
    return false
  }

  const pi = i as Partial<Interval<TypeFor<TR>>>
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

  return startBeforeEnd(pi.start, pi.end, compareFn ?? ltCompare)
}

/**
 * Compare function with the traditional semantics for intervals.
 *
 * This imposes _a_ [strict total order](https://en.wikipedia.org/wiki/Total¬_order) on {@link Interval Intervals}. This
 * order in general is not “natural”, but just a possible order. A general “natural” order for
 * {@link Interval Intervals} does not exist. That is the whole reason why Allen defined 13 basic relations between
 * intervals. Other orders are possible.
 *
 * This is however a natural [strict total order](https://en.wikipedia.org/wiki/Total¬_order) for
 * {@link Interval Intervals} in a {@link isSequence}.
 */
export function compareIntervals<T> (i1: Interval<T>, i2: Interval<T>, compareFn?: Comparator<T>): number {
  const compare: Comparator<T> = getCompareIfOk([i1, i2], compareFn) // asserts preconditions

  if (i1.start === undefined || i1.start === null) {
    if (i2.start !== undefined && i2.start !== null) {
      return -1
    }
    return 0
  }
  if (i2.start === undefined || i2.start === null) {
    return +1
  }

  const i1StartVsi2Start = compare(i1.start, i2.start)
  if (i1StartVsi2Start !== 0) {
    return i1StartVsi2Start
  }

  // starts are equal and definite
  if (i1.end === undefined || i1.end === null) {
    if (i2.end !== undefined && i2.end !== null) {
      return +1
    }
    return 0
  }
  if (i2.end === undefined || i2.end === null) {
    return -1
  }

  return compare(i1.end, i2.end)
}
