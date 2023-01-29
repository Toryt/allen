/*
 Copyright © 2022 – 2023 by Jan Dockx

 Licensed under the Apache License, Version 2.0 (the “License”);
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an “AS IS” BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import assert from 'assert'

/**
 * Representations of types that are represented as strings.
 */
export const primitiveTypeRepresentations = ['number', 'bigint', 'string', 'boolean', 'symbol'] as const

/**
 * An `object` or `function` instances dynamic type is expressed by its constructor.
 *
 * Any constructor represents a type.
 *
 * Why is this using `Record`? Because of feedback from `eslint`:
 *
 * > Don't use `Object` as a type. The `Object` type actually means “any non-nullish value”, so it is marginally better
 * > than `unknown`. If you want a type meaning “any object”, you probably want `Record<string, unknown>` instead.
 */
export type Constructor<T extends Record<string, unknown>> = new (...args: never[]) => T

/**
 * _Dynamic representation_ of a type.
 *
 * For 'number', 'bigint', 'string', 'boolean', 'symbol', this is the `typeof` string. For `object` and `function`, it
 * is the constructor.
 *
 * `undefined` or `null` as value are acceptable for any `TypeRepresentation`. See {@link Indefinite}.
 *
 * `undefined` as `TypeRepresentation` demands values to be `undefined` or `null`. It notable does _not_ mean “don't
 * care”. `TypeRepresentation` does not include `undefined`, because in some cases that is not allowed. When an
 * `undefined` `TypeRepresentation` has meaning in its context, use `TypeRepresentation | undefined` as type.
 *
 * Why is this using `Record`? Because of feedback from `eslint`:
 *
 * > Don't use `Object` as a type. The `Object` type actually means “any non-nullish value”, so it is marginally better
 * > than `unknown`. If you want a type meaning “any object”, you probably want `Record<string, unknown>` instead.
 */
export type TypeRepresentation = typeof primitiveTypeRepresentations[number] | Constructor<Record<string, unknown>>

/**
 * Approximation of determining whether `u` is a {@link TypeRepresentation}.
 *
 * This is not a full type guard, since we can determine it is a string that describes a primitive point type (see
 * {@link primitiveTypeRepresentations}), but we can only determine dynamically in JS that `u` is a function, and not necessarily
 * a constructor according to TS, although we can come close.
 */
export function isTypeRepresentation (u: unknown): boolean {
  return (
    (primitiveTypeRepresentations as unknown as unknown[]).includes(u) ||
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
  return typeOfU === 'object' || typeOfU === 'function'
    ? (u.constructor as Constructor<Record<string, unknown>>)
    : typeOfU
}

interface Acc {
  typeDefiner?: unknown
  type?: TypeRepresentation | undefined
  result: boolean
}

export function mostSpecializedCommonType (
  c1: Constructor<Record<string, unknown>>,
  c2: Constructor<Record<string, unknown>>
): Constructor<Record<string, unknown>> {
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
 * `superRepresentation` is, or is a super type of `typeRepresentation`.
 *
 * The arguments are not allowed to be `undefined`. Whether `undefined` is an acceptable subtype of another type is
 * context dependent. The case must be handled in situ, before calling this function.
 */
export function representsSuperType (
  superRepresentation: TypeRepresentation,
  typeRepresentation: TypeRepresentation
): boolean {
  assert(isTypeRepresentation(superRepresentation))
  assert(isTypeRepresentation(typeRepresentation))

  return (
    superRepresentation === typeRepresentation ||
    (typeof superRepresentation === 'function' &&
      typeof typeRepresentation === 'function' &&
      mostSpecializedCommonType(superRepresentation, typeRepresentation) === superRepresentation)
  )
}
