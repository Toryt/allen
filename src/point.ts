import assert from 'assert'

/**
 * The primitive types that are acceptable as points.
 *
 * Note that `number` `NaN` is not an acceptable element. This cannot be expressed in TypeScript.
 * All other values of these types are possible points.
 */
export const primitivePointTypes = ['number', 'bigint', 'string', 'boolean', 'function'] as const

/**
 * When an `object` is used as point, it's precise type is expressed by its constructor.
 *
 * Any constructor represents a possible point type.
 */
export type Constructor<T extends Object> = new (...args: never[]) => T

/**
 * _Dynamic representation_ of the type of a definite point.
 *
 * For primitive types, this is the `typeof` string. For `objects`, it is the constructor.
 */
export type DefinitePointTypeRepresentation = typeof primitivePointTypes[number] | Constructor<Object>

/**
 * The super type of all possible definite points, i.e., everything but `symbol`.
 */
export type DefinitePoint = typeof primitivePointTypes[number] | Object

/**
 * _Dynamic representation_ of the type of a point, i.e., {@link DefinitePointTypeRepresentation} or
 * `undefined`.
 *
 * When the point is `undefined` or `null`, to express “don't know 🤷”, its point type representation
 * is `undefined`.
 */
export type PointTypeRepresentation = DefinitePointTypeRepresentation | undefined

/**
 * The dynamic representation of the precise point type.
 *
 * Returns `undefined` when `p` is `undefined` or `null`, expressing “don't know 🤷”.
 * Returns `false` when `p` is not an acceptable point, i.e., when `p` is `NaN`, or a `symbol`.
 */
export function pointTypeOf (u: unknown): PointTypeRepresentation | false {
  if (u === undefined || u === null) {
    return undefined
  }
  const typeOfU = typeof u
  assert(typeOfU !== 'undefined')
  if (typeOfU === 'symbol' || Number.isNaN(u)) {
    return false
  }
  return typeOfU === 'object' ? (u.constructor as Constructor<Object>) : typeOfU
}

/**
 * `u` is a {@link DefinitePoint}.
 *
 * `undefined` or `null` as `u`, expressing “don't know 🤷”, are not {@link DefinitePoint}s.
 */
export function isDefinitePoint (u: unknown): u is DefinitePoint

export function isDefinitePoint (u: unknown, pointType?: DefinitePointTypeRepresentation): boolean {
  const tOfU = pointTypeOf(u)
  return (
    tOfU !== false &&
    tOfU !== undefined &&
    (pointType === undefined || tOfU === pointType || (typeof tOfU === 'function' && u instanceof tOfU))
  )
}

