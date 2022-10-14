import { arePointsOfSameType, commonType, Constructor, primitiveTypes, TypeResult } from './util'

export interface Interval<T> {
  readonly start?: T | undefined
  readonly end?: T | undefined
}

export function isInterval (i: unknown): i is Interval<TypeResult> {
  if (i === undefined || i === null || typeof i !== 'object') {
    return false
  }

  const pI = i as Partial<Interval<unknown>>
  return arePointsOfSameType(pI.start, pI.end)
}

export function isInterval2<T extends TypeResult> (
  i: unknown,
  type: T extends typeof primitiveTypes[number] ? T : Constructor<T>
): i is Interval<T> {
  if (i === undefined || i === null || typeof i !== 'object') {
    return false
  }

  const pI = i as Partial<Interval<unknown>>
  const cType = commonType(pI.start, pI.end)
  if (cType === false) {
    return false
  }
  if (cType === undefined) {
    return true
  }
  return (
    cType === type || (typeof cType === 'function' && typeof type === 'function' && cType.prototype instanceof type)
  )
}
