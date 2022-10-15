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
 *
 * As a side effect, funtions can be represented both as `'function'` and the `Function` constructor
 * `Constructor<Function>`, which is the representation of the function as an `object`.
 */
export type DefinitePointTypeRepresentation = typeof primitivePointTypes[number] | Constructor<Object>

/**
 * The super type of all possible definite points, i.e., everything but `symbol`.
 */
export type DefinitePoint = typeof primitivePointTypes[number] | Object

// TODO remove when not really used
// export type DefinitePointTypeRepresentationOf<T extends DefinitePoint> = T extends number
//   ? 'number'
//   : T extends bigint
//   ? 'bigint'
//   : T extends string
//   ? 'string'
//   : T extends boolean
//   ? 'boolean'
//   : T extends Function
//   ? 'function'
//   : T extends Object
//   ? Constructor<T>
//   : never

export type DefinitePointTypeFor<
  T extends DefinitePointTypeRepresentation
> = /* prettier-ignore */ T extends 'number'
  ? number
  : T extends 'bigint'
    ? bigint
    : T extends 'string'
      ? string
      : T extends 'boolean'
        ? boolean
        : T extends 'function'
          ? Function
          : T extends Constructor<Object>
            ? InstanceType<T>
            : never

/**
 * _Dynamic representation_ of the type of a point, i.e., {@link DefinitePointTypeRepresentation} or
 * `undefined`.
 *
 * When the point is `undefined` or `null`, to express “don't know 🤷”, its point type representation
 * is `undefined`.
 */
export type PointTypeRepresentation = DefinitePointTypeRepresentation | undefined

/**
 * The super type of all possible points, i.e., {@link DefinitePoint}s, or `undefined` or `null`,
 * to express “don't know 🤷”.
 *
 * We advise against using `null`. Use `undefined` to express “don't know 🤷”.
 */
export type Point = DefinitePoint | undefined | null

// TODO remove when not really used
// export type PointTypeRepresentationOf<T extends Point> = T extends DefinitePoint
//   ? DefinitePointTypeRepresentationOf<T>
//   : T extends undefined | null
//   ? undefined
//   : never
//
export type PointTypeFor<T extends PointTypeRepresentation> = T extends DefinitePointTypeRepresentation
  ? DefinitePointTypeFor<T>
  : /* prettier-ignore */ T extends undefined
    ? undefined | null
    : never

/**
 * Approximation of determining whether `u` is a {@link DefinitePointTypeRepresentation}.
 *
 * This is not a full type guard, since we can determine it is a string that describes a primitive point type (see
 * {@link primitivePointTypes}), but we can only determine dynamically in JS that `u` is a function, and not necessarily
 * a constructor according to TS, although we can come close.
 */
export function isDefinitePointTypeRepresentation (u: unknown): boolean {
  return (
    ((primitivePointTypes as unknown) as unknown[]).includes(u) ||
    (typeof u === 'function' && 'prototype' in u && 'constructor' in u.prototype && u.prototype.constructor === u)
  )
}

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

/**
 * `u` is a {@link DefinitePoint} of specfic type `pointType`.
 *
 * `undefined` or `null` as `u`, expressing “don't know 🤷”, are not {@link DefinitePoint}s.
 *
 * When calling this function in JavaScript, `pointType` might be explicitly set to `undefined` (in violation of the
 * TypeScript precondition that `pointType` is required, and has to be a {@link DefinitePointTypeRepresentation}). The
 * function behaves as {@link isDefinitePoint} in that case, as if the parameter is not given. This does not check
 * whether `u` is `undefined` or `null`, expressing “don't know 🤷”.
 */
export function isDefinitePoint<T extends DefinitePointTypeRepresentation> (
  u: unknown,
  pointType: T
): u is DefinitePointTypeFor<T>

export function isDefinitePoint (u: unknown, pointType?: DefinitePointTypeRepresentation): boolean {
  if (pointType !== undefined && !isDefinitePointTypeRepresentation(pointType)) {
    return false
  }
  const tOfU = pointTypeOf(u)
  return (
    tOfU !== false &&
    tOfU !== undefined &&
    (pointType === undefined || tOfU === pointType || (typeof pointType === 'function' && u instanceof pointType))
  )
}

/**
 * `u` is a {@link Point}. `undefined` or `null` express “don't know 🤷”.
 */
export function isPoint (u: unknown): u is Point

/**
 * `u` is a {@link Point}, of specific type `pointType`.
 *
 * `undefined` or `null` as `u`, expressing “don't know 🤷”, are considered valid instances of every `pointType`.
 * That is why `pointType` is forced to extend {@link DefinitePointTypeRepresentation}, and not
 * {@link PointTypeRepresentation}.
 *
 * When calling this function in JavaScript, `pointType` might be explicitly set to `undefined` (in violation of the
 * TypeScript precondition that `pointType` is required, and has to be a {@link DefinitePointTypeRepresentation}). The
 * function behaves as {@link isPoint} in that case, as if the parameter is not given. This does not check whether `u`
 * is `undefined` or `null`, expressing “don't know 🤷”.
 */
export function isPoint<T extends DefinitePointTypeRepresentation> (
  u: unknown,
  pointType: T
): u is DefinitePointTypeFor<T>

export function isPoint (u: unknown, pointType?: DefinitePointTypeRepresentation): boolean {
  if (pointType !== undefined && !isDefinitePointTypeRepresentation(pointType)) {
    return false
  }
  const tOfU = pointTypeOf(u)
  return (
    tOfU !== false &&
    (tOfU === undefined ||
      pointType === undefined ||
      tOfU === pointType ||
      (typeof pointType === 'function' && u instanceof pointType))
  )
}