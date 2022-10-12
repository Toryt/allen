import { arePointsOfSameType } from './util'

export interface Interval<T> {
  readonly start?: T | undefined
  readonly end?: T | undefined
}

export function isInterval (i: unknown): boolean {
  if (i === undefined || i === null || typeof i !== 'object') {
    return false
  }

  const pI = i as Partial<Interval<unknown>>
  return arePointsOfSameType(pI.start, pI.end)
}
