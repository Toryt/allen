import assert from 'assert'

/**
 * Representations of types that are represented as strings.
 */
export const primitiveTypeRepresentations = ['number', 'bigint', 'string', 'boolean', 'symbol'] as const

/**
 * An `object` or `function` instances dynamic type is expressed by its constructor.
 *
 * Any constructor represents a type.
 */
export type Constructor<T extends Object> = new (...args: never[]) => T

/**
 * _Dynamic representation_ of a type.
 *
 * For 'number', 'bigint', 'string', 'boolean', 'symbol', this is the `typeof` string. For `object` and `function`, it
 * is the constructor.
 */
export type TypeRepresentation = typeof primitiveTypeRepresentations[number] | Constructor<Object>

/**
 * Approximation of determining whether `u` is a {@link TypeRepresentation}.
 *
 * This is not a full type guard, since we can determine it is a string that describes a primitive point type (see
 * {@link primitiveTypeRepresentations}), but we can only determine dynamically in JS that `u` is a function, and not necessarily
 * a constructor according to TS, although we can come close.
 */
export function isTypeRepresentation (u: unknown): boolean {
  return (
    ((primitiveTypeRepresentations as unknown) as unknown[]).includes(u) ||
    (typeof u === 'function' && 'prototype' in u && 'constructor' in u.prototype && u.prototype.constructor === u)
  )
}

/**
 * The dynamic representation of the precise point type.
 *
 * Returns `undefined` when `p` is `undefined` or `null`, expressing “don't know 🤷”.
 */
export function typeRepresentationOf (u: unknown): TypeRepresentation | undefined {
  if (u === undefined || u === null) {
    return undefined
  }
  const typeOfU = typeof u
  assert(typeOfU !== 'undefined')
  return typeOfU === 'object' || typeOfU === 'function' ? (u.constructor as Constructor<Object>) : typeOfU
}

interface Acc {
  typeDefiner?: unknown
  type?: TypeRepresentation | undefined
  result: boolean
}

export function mostSpecializedCommonType (c1: Constructor<Object>, c2: Constructor<Object>): Constructor<Object> {
  if (c1 === c2 || c2.prototype instanceof c1) {
    return c1
  }
  return mostSpecializedCommonType(Object.getPrototypeOf(c1.prototype).constructor, c2)
}

/**
 * Returns the {@link TypeRepresentation} of the type that all parameters have in common.
 *
 * `undefined` and `null` parameters are not taken into account. If all parameters are `undefined` or `null`,
 * `undefined` is returned.
 *
 * If there is no common type between the parameters, `false` is returned.
 */
export function commonTypeRepresentation (...p: unknown[]): TypeRepresentation | undefined | false {
  const { type, result } = p.reduce(
    ({ type, result }: Acc, e: unknown): Acc => {
      if (!result) {
        // determined earlier that there is no common type; return false
        return { result }
      }
      const eType = typeRepresentationOf(e)
      if (eType === undefined) {
        // e does not define the common type: continue
        return { type, result }
      }
      if (type === undefined) {
        // first occurence of a value that determines the common type
        return { type: eType, result }
      }
      if (typeof eType !== 'function' || typeof type !== 'function') {
        // e is a primitive type: is that the common type?
        if (eType !== type) {
          // nope: there is no common type; return false
          return { result: false }
        }
        // yes; continue
        return {
          type,
          result
        }
      }
      // the common type so far could finally be Object, but there always is one
      return { type: mostSpecializedCommonType(eType, type), result }
    },
    { result: true }
  )
  return result && type
}

/**
 * `superRepresentation` is, or is a super type of `typeRepresentation`
 */
export function representsSuperType (
  superRepresentation: TypeRepresentation,
  typeRepresentation: TypeRepresentation
): boolean {
  return (
    superRepresentation === typeRepresentation ||
    (typeof superRepresentation === 'function' &&
      typeof typeRepresentation === 'function' &&
      mostSpecializedCommonType(superRepresentation, typeRepresentation) === superRepresentation)
  )
}
