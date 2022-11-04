/*
 Copyright © 2022 by Jan Dockx

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { notStrictEqual, ok } from 'assert'
import { commonTypeRepresentation, Constructor } from './typeRepresentation'
import { Indefinite } from './type'

/**
 * The primitive types that are acceptable as points for {@link ltCompare}.
 *
 * Note that `number` `NaN` is not an acceptable element. This cannot be expressed in TypeScript.
 * All other values can be compared with {@link ltCompare}, although maybe not intuitively out-of-the-box.
 */
export const ltComparablePrimitiveTypeRepresentations = ['number', 'bigint', 'string', 'boolean'] as const

/**
 * _Dynamic representation_ of the type of a definite point.
 *
 * For primitive types, this is the `typeof` string. For `object` and `function`, it is the constructor.
 */
export type LTComparableTypeRepresentation =
  | typeof ltComparablePrimitiveTypeRepresentations[number]
  | Constructor<Object>

export type LTComparablePrimitive = number | bigint | string | boolean

export type LTComparable = LTComparablePrimitive | Object | Function

export function isLTComparableOrIndefinite (u: unknown): u is Indefinite<LTComparable> {
  return u === undefined || u === null || (typeof u !== 'symbol' && !Number.isNaN(u))
}

const noUndefined: string = 'default ltComparator cannot compare undefined'
const noNull: string = 'default ltComparator cannot compare null'
const noNaN: string = 'default ltComparator cannot compare NaN'
const noSymbol: string = 'default ltComparator cannot compare symbols'
const haveCommonType: string = 't1 and t2 must be of a common type'

export function ltCompare<T> (t1: T, t2: T): number {
  notStrictEqual(t1, undefined, noUndefined)
  notStrictEqual(t2, undefined, noUndefined)
  notStrictEqual(t1, null, noNull)
  notStrictEqual(t2, null, noNull)
  ok(!Number.isNaN(t1), noNaN)
  ok(!Number.isNaN(t2), noNaN)
  notStrictEqual(typeof t1, 'symbol', noSymbol)
  notStrictEqual(typeof t2, 'symbol', noSymbol)
  ok(commonTypeRepresentation(t1, t2), haveCommonType)

  return t1 < t2 ? -1 : t2 < t1 ? +1 : 0
}
