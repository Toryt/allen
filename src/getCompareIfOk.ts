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

import assert, { ok } from 'assert'
import { Interval, isInterval } from './Interval'
import { Comparator } from './comparator'
import { isLTComparableOrIndefinite, ltCompare } from './ltCompare'
import { commonTypeRepresentation } from './typeRepresentation'

const haveCommonType: string = 'i1.start, i1.end, i2.start and i2.end must be of a common type'

/**
 * Assert that the parameters are acceptable, and return the {@link Comparator} to use.
 */
export function getCompareIfOk<T> (i1: Interval<T>, i2: Interval<T>, compareFn?: Comparator<T>): Comparator<T> {
  ok(i1)
  ok(i2)
  assert(
    (isLTComparableOrIndefinite(i1.start) &&
      isLTComparableOrIndefinite(i1.end) &&
      isLTComparableOrIndefinite(i2.start) &&
      isLTComparableOrIndefinite(i2.end)) ||
      compareFn !== undefined,
    '`compareFn` is mandatory when `iN.start` or `iN.end` is a `symbol` or `NaN`'
  )

  const cType = commonTypeRepresentation(i1.start, i1.end, i2.start, i2.end)

  assert(cType !== false, haveCommonType)
  assert(cType === undefined || (isInterval(i1, cType, compareFn) && isInterval(i2, cType, compareFn)))

  return compareFn ?? ltCompare
}
