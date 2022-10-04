export type Comparator<T> = (t1: T, t2: T) => number

function defaultComparator<T extends number | string | Date> (t1: T, t2: T): number {
  return t1 < t2 ? -1 : t1 > t2 ? +1 : 0
}

export interface HasCompare {
  compare(other: this): number
}

export function isHasCompare (t: unknown): t is HasCompare {
  return typeof t === 'object' && t !== null && typeof (t as Partial<HasCompare>).compare === 'function'
}

function comparableComparator<T extends HasCompare> (t1: T, t2: T) {
  return t1.compare(t2)
}

export type Comparable = number | string | Date | HasCompare

function isArrayOf (u: unknown, type: string): boolean {
  return (
    Array.isArray(u) &&
    u.every((e: unknown) => e === undefined || typeof e === type) &&
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

export function getComparator (...t: (number | undefined)[]): Comparator<number>
export function getComparator (...t: (string | undefined)[]): Comparator<string>
export function getComparator (...t: (Date | undefined)[]): Comparator<Date>
export function getComparator<T extends HasCompare> (...t: (T | undefined)[]): Comparator<T>
export function getComparator (...t: (unknown | undefined)[]): never
export function getComparator<T extends Comparable | undefined> (...t: T[]): Comparator<any> {
  if (isArrayOf(t, 'number')) {
    return defaultComparator<number>
  } else if (isArrayOf(t, 'string')) {
    return defaultComparator<string>
  } else if (isArrayOfDate(t)) {
    return defaultComparator<Date>
  } else if (isArrayOfHasCompare(t)) {
    return comparableComparator<HasCompare>
  } else {
    throw new Error('cannot determine a comparator: argument types are incompatible or all undefined')
  }
}
