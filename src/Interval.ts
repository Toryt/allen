import { commonType, mostSpecializedCommonType } from './util'
import { Indefinite, Point, PointTypeFor, PointTypeRepresentation } from './point'

// MUDO why extends Point? to forbid Symbol? but what if user gives a compare?
export interface Interval<T extends Point> {
  readonly start?: Indefinite<T>
  readonly end?: Indefinite<T>
}

export function isInterval (i: unknown): i is Interval<Point>
export function isInterval<T extends PointTypeRepresentation> (i: unknown, pointType: T): i is Interval<PointTypeFor<T>>
export function isInterval (i: unknown, pointType?: PointTypeRepresentation): boolean {
  if (i === undefined || i === null || typeof i !== 'object') {
    return false
  }

  const pI = i as Partial<Interval<Point>>
  // MUDO will return false for symbol; why? if the user gives a compare, it is ok
  const cType = commonType(pI.start, pI.end)
  return (
    cType !== false &&
    (cType === undefined ||
      pointType === undefined ||
      cType === pointType ||
      (typeof cType === 'function' &&
        typeof pointType === 'function' &&
        mostSpecializedCommonType(cType, pointType) === pointType))
  )
}
