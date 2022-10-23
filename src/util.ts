import { pointTypeOf, PointTypeRepresentation } from './point'
import { Constructor } from './constructor'

interface Acc {
  typeDefiner?: unknown
  type?: PointTypeRepresentation | undefined
  result: boolean
}

export function mostSpecializedCommonType (c1: Constructor<Object>, c2: Constructor<Object>): Constructor<Object> {
  if (c1 === c2 || c2.prototype instanceof c1) {
    return c1
  }
  return mostSpecializedCommonType(Object.getPrototypeOf(c1.prototype).constructor, c2)
}

export function commonType (...p: unknown[]): PointTypeRepresentation | undefined | false {
  const { type, result } = p.reduce(
    ({ type, result }: Acc, e: unknown): Acc => {
      if (!result) {
        // determined earlier that there is no common type; return false
        return { result }
      }
      const eType = pointTypeOf(e)
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

export function areOfSameType (...p: unknown[]): boolean {
  return commonType(...p) !== false
}
