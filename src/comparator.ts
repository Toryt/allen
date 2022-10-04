export type Comparator<T> = (t1: T, t2: T) => number

function defaultComparator<T extends number | string | Date> (t1: T, t2: T): number {
  return t1 < t2 ? -1 : t1 > t2 ? +1 : 0
}

export interface HasCompare {
  compare: (other: this) => number
}

export function isHasCompare (t: unknown): t is HasCompare {
  return typeof t === 'object' && t !== null && typeof (t as Partial<HasCompare>).compare === 'function'
}

function comparableComparator<T extends HasCompare> (t1: T, t2: T): number {
  return t1.compare(t2)
}

export type Comparable = number | string | Date | HasCompare

export function isComparable (u: unknown): u is Comparable {
  return ['number', 'string'].includes(typeof u) || u instanceof Date || isHasCompare(u)
}

function isArrayOfNumber (u: unknown): u is number[] {
  return (
    Array.isArray(u) &&
    u.every((e: unknown) => e === undefined || typeof e === 'number') &&
    u.some((e: unknown) => e !== undefined)
  )
}

function isArrayOfString (u: unknown): u is string[] {
  return (
    Array.isArray(u) &&
    u.every((e: unknown) => e === undefined || typeof e === 'string') &&
    u.some((e: unknown) => e !== undefined)
  )
}

function isArrayOfDate (u: unknown): u is Date[] {
  return (
    Array.isArray(u) &&
    u.every((e: unknown) => e === undefined || e instanceof Date) &&
    u.some((e: unknown) => e !== undefined)
  )
}

function isArrayOfHasCompare (u: unknown): u is HasCompare[] {
  return (
    Array.isArray(u) &&
    u.every((e: unknown) => e === undefined || isHasCompare(e)) &&
    u.some((e: unknown) => e !== undefined)
  )
}

export function getComparator (...t: Array<number | undefined>): Comparator<number>
export function getComparator (...t: Array<string | undefined>): Comparator<string>
export function getComparator (...t: Array<Date | undefined>): Comparator<Date>
export function getComparator<T extends HasCompare> (...t: Array<T | undefined>): Comparator<T>
export function getComparator (...t: Array<unknown | undefined>): never
export function getComparator<T extends Comparable | undefined> (...t: T[]): Comparator<any> {
  if (isArrayOfNumber(t)) {
    return defaultComparator<number>
  } else if (isArrayOfString(t)) {
    return defaultComparator<string>
  } else if (isArrayOfDate(t)) {
    return defaultComparator<Date>
  } else if (isArrayOfHasCompare(t)) {
    return comparableComparator<HasCompare>
  } else {
    throw new Error('cannot determine a comparator: argument types are incompatible or all undefined')
  }
}
