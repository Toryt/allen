import { isTypeRepresentation, typeRepresentationOf, TypeRepresentation } from './typeRepresentation'
import { TypeFor, Indefinite } from './type'

export type PrimitivePoint = number | bigint | string | boolean | symbol | Function

/**
 * The super type of all possible definite points, i.e., everything but `symbol`.
 *
 * MUDO this is just anything
 */
export type Point = PrimitivePoint | Object

/**
 * `u` is a {@link Point}.
 *
 * `undefined` or `null` as `u`, expressing “don't know 🤷”, are not {@link Point}s.
 */
export function isPoint (u: unknown): u is Point

/**
 * `u` is a {@link Point} of specfic type `pointType`.
 *
 * `undefined` or `null` as `u`, expressing “don't know 🤷”, are not {@link Point}s.
 *
 * When calling this function in JavaScript, `pointType` might be explicitly set to `undefined` (in violation of the
 * TypeScript precondition that `pointType` is required, and has to be a {@link TypeRepresentation}). The
 * function behaves as {@link isPoint} in that case, as if the parameter is not given. This does not check
 * whether `u` is `undefined` or `null`, expressing “don't know 🤷”.
 */
export function isPoint<T extends TypeRepresentation> (u: unknown, pointType: T): u is TypeFor<T>

export function isPoint (u: unknown, pointType?: TypeRepresentation): boolean {
  if (pointType !== undefined && !isTypeRepresentation(pointType)) {
    return false
  }
  const tOfU = typeRepresentationOf(u)
  return (
    tOfU !== undefined &&
    (pointType === undefined || tOfU === pointType || (typeof pointType === 'function' && u instanceof pointType))
  )
}

/**
 * `u` is an {@link Indefinite} {@link Point}. `undefined` or `null` express “don't know 🤷”.
 */
export function isIndefinitePoint (u: unknown): u is Indefinite<Point>

/**
 * `u` is a {@link Indefinite} {@link Point}}, of specific type `pointType`.
 *
 * `undefined` or `null` as `u`, expressing “don't know 🤷”, are considered valid instances of every `pointType`.
 * That is why `pointType` is forced to extend {@link TypeRepresentation}, and cannot be `undefined`.
 *
 * When calling this function in JavaScript, `pointType` might be explicitly set to `undefined` (in violation of the
 * TypeScript precondition that `pointType` is required, and has to be a {@link TypeRepresentation}). The
 * function behaves as {@link isIndefinitePoint} in that case, as if the parameter is not given. This does not check
 * whether `u` is `undefined` or `null`, expressing “don't know 🤷”.
 */
export function isIndefinitePoint<T extends TypeRepresentation> (u: unknown, pointType: T): u is Indefinite<TypeFor<T>>

export function isIndefinitePoint (u: unknown, pointType?: TypeRepresentation): boolean {
  if (pointType !== undefined && !isTypeRepresentation(pointType)) {
    return false
  }
  const tOfU = typeRepresentationOf(u)
  return (
    tOfU === undefined ||
    pointType === undefined ||
    tOfU === pointType ||
    (typeof pointType === 'function' && u instanceof pointType)
  )
}
