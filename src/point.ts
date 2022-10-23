import assert from 'assert'
import { Constructor } from './constructor'

/**
 * The primitive types that are acceptable as points.
 *
 * Note that `number` `NaN` is not an acceptable element. This cannot be expressed in TypeScript.
 * All other values of these types are possible points.
 */
export const primitivePointTypes = ['number', 'bigint', 'string', 'boolean', 'symbol'] as const

/**
 * _Dynamic representation_ of the type of a definite point.
 *
 * For primitive types, this is the `typeof` string. For `object` and `function`, it is the constructor.
 *
 * As a side effect, funtions can be represented both as `'function'` and the `Function` constructor
 * `Constructor<Function>`, which is the representation of the function as an `object`.
 */
export type PointTypeRepresentation = typeof primitivePointTypes[number] | Constructor<Object>

export type PrimitivePoint = number | bigint | string | boolean | symbol | Function

/**
 * The super type of all possible definite points, i.e., everything but `symbol`.
 *
 * MUDO this is just anything
 */
export type Point = PrimitivePoint | Object

export type PointTypeFor<
  T extends PointTypeRepresentation
> = /* prettier-ignore */ T extends 'number'
  ? number
  : T extends 'bigint'
    ? bigint
    : T extends 'string'
      ? string
      : T extends 'symbol'
        ? symbol
        : T extends 'boolean'
          ? boolean
          : T extends 'function'
            ? Function
            : T extends Constructor<Object>
              ? InstanceType<T>
              : never

/**
 * The super type of a specific type of {@link Point} `T`, or `undefined` or `null`, to
 * express “don't know 🤷”.
 *
 * We advise against using `null`. Use `undefined` to express “don't know 🤷”.
 */
export type Indefinite<T extends Point> = T | undefined | null

/**
 * Approximation of determining whether `u` is a {@link PointTypeRepresentation}.
 *
 * This is not a full type guard, since we can determine it is a string that describes a primitive point type (see
 * {@link primitivePointTypes}), but we can only determine dynamically in JS that `u` is a function, and not necessarily
 * a constructor according to TS, although we can come close.
 */
export function isPointTypeRepresentation (u: unknown): boolean {
  return (
    ((primitivePointTypes as unknown) as unknown[]).includes(u) ||
    (typeof u === 'function' && 'prototype' in u && 'constructor' in u.prototype && u.prototype.constructor === u)
  )
}

/**
 * The dynamic representation of the precise point type.
 *
 * Returns `undefined` when `p` is `undefined` or `null`, expressing “don't know 🤷”.
 */
export function pointTypeOf (u: unknown): PointTypeRepresentation | undefined {
  if (u === undefined || u === null) {
    return undefined
  }
  const typeOfU = typeof u
  assert(typeOfU !== 'undefined')
  return typeOfU === 'object' || typeOfU === 'function' ? (u.constructor as Constructor<Object>) : typeOfU
}

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
 * TypeScript precondition that `pointType` is required, and has to be a {@link PointTypeRepresentation}). The
 * function behaves as {@link isPoint} in that case, as if the parameter is not given. This does not check
 * whether `u` is `undefined` or `null`, expressing “don't know 🤷”.
 */
export function isPoint<T extends PointTypeRepresentation> (u: unknown, pointType: T): u is PointTypeFor<T>

export function isPoint (u: unknown, pointType?: PointTypeRepresentation): boolean {
  if (pointType !== undefined && !isPointTypeRepresentation(pointType)) {
    return false
  }
  const tOfU = pointTypeOf(u)
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
 * That is why `pointType` is forced to extend {@link PointTypeRepresentation}, and cannot be `undefined`.
 *
 * When calling this function in JavaScript, `pointType` might be explicitly set to `undefined` (in violation of the
 * TypeScript precondition that `pointType` is required, and has to be a {@link PointTypeRepresentation}). The
 * function behaves as {@link isIndefinitePoint} in that case, as if the parameter is not given. This does not check
 * whether `u` is `undefined` or `null`, expressing “don't know 🤷”.
 */
export function isIndefinitePoint<T extends PointTypeRepresentation> (
  u: unknown,
  pointType: T
): u is Indefinite<PointTypeFor<T>>

export function isIndefinitePoint (u: unknown, pointType?: PointTypeRepresentation): boolean {
  if (pointType !== undefined && !isPointTypeRepresentation(pointType)) {
    return false
  }
  const tOfU = pointTypeOf(u)
  return (
    tOfU === undefined ||
    pointType === undefined ||
    tOfU === pointType ||
    (typeof pointType === 'function' && u instanceof pointType)
  )
}
