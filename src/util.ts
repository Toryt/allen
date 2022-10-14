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
      if (result === false || Number.isNaN(e) || typeof e === 'symbol') {
        return { typeDefiner: typeDefiner, result: false }
      }
      if (e === undefined || e === null) {
        return { typeDefiner: typeDefiner, result }
      }
      if (typeDefiner === undefined) {
        return { typeDefiner: e, result }
      }
      if (typeof typeDefiner !== 'object') {
        return {
          typeDefiner: typeDefiner,
          result: typeof e === typeof typeDefiner
        }
      }
      assert(typeDefiner !== null)
      if (typeDefiner instanceof e.constructor) {
        // e is a supertype of firstWithType: switch
        return { typeDefiner: e, result }
      }
      return { typeDefiner: typeDefiner, result: e instanceof typeDefiner.constructor }
    },
    { result: true }
  )
  return result
}
