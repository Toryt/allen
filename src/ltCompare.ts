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

import { notStrictEqual, ok } from 'assert'
import { commonTypeRepresentation } from './TypeRepresentation'

/**
 * Dynamicly test whether we can apply `<` to `u`.
 *
 * This cannot be enforced with a type. First of all, `NaN` does not have a separate type.
 * But secondly, a type `number | bigint | string | boolean  | Object | Function`, that “excludes” `symbol` is still
 * assignable with `symbol`-s by coercion:
 *
 * ```ts
 * const number | bigint | string | boolean  | Object | Function: LTComparable = Symbol('s')
 * ```
 *
 * is accepted by TypeScript. There is no way in TypeScript to express “not a `symbol`”.
 */
export function isLTComparableOrIndefinite(u: unknown): boolean {
  return u === undefined || u === null || (typeof u !== 'symbol' && !Number.isNaN(u))
}

const noUndefined: string = 'default ltComparator cannot compare undefined'
const noNull: string = 'default ltComparator cannot compare null'
const noNaN: string = 'default ltComparator cannot compare NaN'
const noSymbol: string = 'default ltComparator cannot compare symbols'
const haveCommonType: string = 't1 and t2 must be of a common type'

/**
 * This function cannot be used with `symbol` valus or `NaN` (unless some methods used by the `<` operator are
 * overridden in a very clever way).
 */
export function ltCompare<T>(t1: T, t2: T): number {
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
