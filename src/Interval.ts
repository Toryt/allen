import {
  commonTypeRepresentation,
  isTypeRepresentation,
  representsSuperType,
  TypeRepresentation
} from './typeRepresentation'
import { Indefinite, TypeFor } from './type'
import assert from 'assert'
import { isLTComparableOrIndefinite, LTComparable, ltCompare } from './ltCompare'
import { Comparator } from './comparator'

/**
 * Intervals have `start` and an `end` {@link commonTypeRepresentation _of the same type_}, which can be
 * {@link Indefinite indefinite}.
 *
 * Invariant: `start` must be before, or equal to, `end`, if both are definite, with any {@link Comparator} that is
 * used where the interval is involved.
 */
export interface Interval<T> {
  readonly start?: Indefinite<T>
  readonly end?: Indefinite<T>
}

/**
 * If both `start` and `end` are definite,
 *
 * - `start` and `end` must be “of the same type”
 * - `start` must be before, or equal to `end`
 *
 * To compare `start` and `end`, the optional `compareFn` is used when given, or {@link ltCompare} when not. When
 * `start` and `end` are `symbols`, or one of the values is `NaN`, a `compareFn` parameter is mandatory.
 */
export function isInterval<TR extends TypeRepresentation> (
  i: unknown,
  pointType: TR,
  compareFn?: TypeFor<TR> extends LTComparable ? Comparator<TypeFor<TR>> | undefined : Comparator<TypeFor<TR>>
): i is Interval<TypeFor<TR>> {
  assert(isTypeRepresentation(pointType))

  function startBeforeEnd (
    start: Indefinite<TypeFor<TR>>,
    end: Indefinite<TypeFor<TR>>,
    compare: Comparator<TypeFor<TR>>
  ): boolean {
    return start === undefined || start === null || end === undefined || end === null || compare(start, end) <= 0
  }

  if (i === undefined || i === null || (typeof i !== 'object' && typeof i !== 'function')) {
    return false
  }

  const pi = i as Partial<Interval<TypeFor<TR>>>
  assert(
    (isLTComparableOrIndefinite(pi.start) && isLTComparableOrIndefinite(pi.end)) || compareFn !== undefined,
    '`compareFn` is mandatory when `i.start` or `i.end` is a `symbol` or `NaN`'
  )

  const cType = commonTypeRepresentation(pi.start, pi.end)

  return (
    cType !== false &&
    (cType === undefined ||
      (representsSuperType(pointType, cType) && startBeforeEnd(pi.start, pi.end, compareFn ?? ltCompare)))
  )
}
