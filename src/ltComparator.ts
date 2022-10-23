import assert, { notStrictEqual } from 'assert'
import { Constructor, areOfSameType } from './typeRepresentation'

/**
 * The primitive types that are acceptable as points for {@link ltComparator}.
 *
 * Note that `number` `NaN` is not an acceptable element. This cannot be expressed in TypeScript.
 * All other values can be compared with {@link ltComparator}, although maybe not intuitively out-of-the-box.
 */
export const ltComparablePrimitiveTypeRepresentations = ['number', 'bigint', 'string', 'boolean', 'function'] as const

/**
 * _Dynamic representation_ of the type of a definite point.
 *
 * For primitive types, this is the `typeof` string. For `objects`, it is the constructor.
 *
 * As a side effect, funtions can be represented both as `'function'` and the `Function` constructor
 * `Constructor<Function>`, which is the representation of the function as an `object`.
 */
export type LTComparableTypeRepresentation =
  | typeof ltComparablePrimitiveTypeRepresentations[number]
  | Constructor<Object>

export type LTComparablePrimitive = number | bigint | string | boolean | Function

export type LTComparable = LTComparablePrimitive | Object

const noUndefined: string = 'default ltComparator cannot compare undefined'
const noNull: string = 'default ltComparator cannot compare null'
const noNaN: string = 'default ltComparator cannot compare NaN'
const noSymbol: string = 'default ltComparator cannot compare symbols'

export function ltComparator<T> (t1: T, t2: T): number {
  assert(t1 !== undefined, noUndefined)
  assert(t2 !== undefined, noUndefined)
  assert(t1 !== null, noNull)
  assert(t2 !== null, noNull)
  assert(!Number.isNaN(t1), noNaN)
  assert(!Number.isNaN(t2), noNaN)
  notStrictEqual(typeof t1, 'symbol', noSymbol)
  notStrictEqual(typeof t2, 'symbol', noSymbol)
  assert(areOfSameType(t1, t2))

  return t1 < t2 ? -1 : t2 < t1 ? +1 : 0
}
