import assert from 'assert'
import { arePointsOfSameType } from './util'

export type Comparator<T> = (t1: T, t2: T) => number

export function ltComparator<T> (t1: T, t2: T): number {
  assert(arePointsOfSameType(t1, t2))

  return t1 < t2 ? -1 : t2 < t1 ? +1 : 0
}
