import {
  commonTypeRepresentation,
  isTypeRepresentation,
  mostSpecializedCommonType,
  TypeRepresentation
} from './typeRepresentation'
import { Indefinite, TypeFor } from './type'
import assert from 'assert'

/**
 * Intervals have `start` and an `end` {@link commonTypeRepresentation _of the same type_}, which can be
 * {@link Indefinite indefinite}.
 */
export interface Interval<T> {
  readonly start?: Indefinite<T>
  readonly end?: Indefinite<T>
}

// MUDO start before end

export function isInterval<TR extends TypeRepresentation> (i: unknown, pointType: TR): i is Interval<TypeFor<TR>> {
  assert(isTypeRepresentation(pointType))

  if (i === undefined || i === null || (typeof i !== 'object' && typeof i !== 'function')) {
    return false
  }

  const cType = commonTypeRepresentation(
    (i as Partial<Interval<TypeFor<TR>>>).start,
    (i as Partial<Interval<TypeFor<TR>>>).end
  )
  return (
    cType === undefined ||
    cType === pointType ||
    (typeof cType === 'function' &&
      typeof pointType === 'function' &&
      mostSpecializedCommonType(cType, pointType) === pointType)
  )
}
