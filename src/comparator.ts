import assert, { notStrictEqual } from 'assert'
import { arePointsOfSameType } from './util'

export type LTComparablePrimitive = number | bigint | string | boolean | Function

export type LTComparable = LTComparablePrimitive | Object

export type Comparator<T extends LTComparable> = (t1: T, t2: T) => number

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
  assert(arePointsOfSameType(t1, t2))

  return t1 < t2 ? -1 : t2 < t1 ? +1 : 0
}
