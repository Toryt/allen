import { commonType, mostSpecializedCommonType } from './util'
import { Indefinite, Point, PointTypeFor, PointTypeRepresentation } from './point'

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
