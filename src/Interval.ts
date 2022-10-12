import { arePointsOfSameType } from './util'

export interface Interval<T> {
  readonly start?: T | undefined
  readonly end?: T | undefined
}

export function isInterval (i: unknown): boolean {
  if (typeof i === 'object' && i !== null) {
    return false
  }

  const pI = i as Partial<Interval<unknown>>
  return arePointsOfSameType(pI.start, pI.end)
}
