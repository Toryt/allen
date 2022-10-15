import assert from 'assert'

interface Acc {
  typeDefiner?: unknown
  type?: TypeResult | undefined
  result: boolean
}

// MUDO what about functions?

export function arePointsOfSameType (...p: unknown[]): boolean {
  const { result } = p.reduce(
    ({ typeDefiner, result }: Acc, e: unknown): Acc => {
      if (!result || Number.isNaN(e) || typeof e === 'symbol') {
        return { typeDefiner, result: false }
      }
      if (e === undefined || e === null) {
        return { typeDefiner, result }
      }
      if (typeDefiner === undefined) {
        return { typeDefiner: e, result }
      }
      if (typeof typeDefiner !== 'object') {
        return {
          typeDefiner,
          result: typeof e === typeof typeDefiner
        }
      }
      assert(typeDefiner !== null)
      if (typeDefiner instanceof e.constructor) {
        // e is a supertype of firstWithType: switch
        return { typeDefiner: e, result }
      }
      return { typeDefiner, result: e instanceof typeDefiner.constructor }
    },
    { result: true }
  )
  return result
}

export const primitiveTypes = ['number', 'bigint', 'string', 'boolean'] as const
export type Constructor<T extends Object> = new (...args: never[]) => T
export type TypeResult = typeof primitiveTypes[number] | Constructor<Object>

export function commonType (...p: unknown[]): TypeResult | undefined | false {
  const { type, result } = p.reduce(
    ({ typeDefiner, type, result }: Acc, e: unknown): Acc => {
      if (!result || Number.isNaN(e) || typeof e === 'symbol') {
        // there is no common type: return false
        return { result: false }
      }
      if (e === undefined || e === null) {
        // e does not define the common type: continue
        return { typeDefiner, type, result }
      }
      if (type === undefined) {
        // first occurence of a value that might determine the common type
        const type: TypeResult =
          typeof e === 'object' ? (e.constructor as Constructor<Object>) : (typeof e as typeof primitiveTypes[number])
        // assert(type1 !== 'undefined')
        // assert(type1 !== 'symbol')
        // assert(type1 !== 'object')
        // assert(type1 !== 'function') // MUDO
        return { typeDefiner: e, type, result }
      }
      if (typeof type !== 'function') {
        // we expect a primitive type: is e of that type?
        if (/* eslint-disable-line valid-typeof */ typeof e !== type) {
          return { result: false }
        }
        return {
          typeDefiner,
          type,
          result
        }
      }
      // assert(typeDefiner !== null)
      if (typeDefiner instanceof e.constructor) {
        // e is a supertype of typeDefiner: switch
        return { typeDefiner: e, type: e.constructor as Constructor<Object>, result }
      }
      if (e instanceof type) {
        // typeDefiner is a supertype of e: continue
        return { typeDefiner, type, result }
      }
      // e and typeDefiner are unrelated: there is no common type: return false
      return { result: false }
    },
    { result: true }
  )
  return result && type
}
