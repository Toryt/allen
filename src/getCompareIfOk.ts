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
import { Interval, isInterval } from './Interval'
import { Comparator } from './Comparator'
import { isLTComparableOrIndefinite, ltCompare } from './ltCompare'
import { commonTypeRepresentation } from './TypeRepresentation'
import { Indefinite } from './type'

const haveCommonType: string = 'i1.start, i1.end, i2.start and i2.end must be of a common type'

/**
 * Assert that the parameters are acceptable, and return the {@link Comparator} to use.
 */
export function getCompareIfOk<T> (i: ReadonlyArray<Readonly<Interval<T>>>, compareFn?: Comparator<T>): Comparator<T> {
  i.forEach(j => assert(typeof j === 'object' && j !== null))
  assert(
    compareFn !== undefined || i.every(j => isLTComparableOrIndefinite(j.start) && isLTComparableOrIndefinite(j.end)),
    '`compareFn` is mandatory when `iN.start` or `iN.end` is a `symbol` or `NaN`'
  )

  const cType = commonTypeRepresentation(
    ...i.reduce((acc: Array<Indefinite<T>>, j: Interval<T>) => acc.concat([j.start, j.end]), [])
  )

  assert(cType !== false, haveCommonType)
  assert(
    cType === undefined || i.every(j => isInterval(j, cType, compareFn)),
    'intervals must have `iN.start` and `iN.end` of the same type, and `iN.start < iN.end`'
  )

  return compareFn ?? ltCompare
}
