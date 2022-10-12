export function arePointsOfSameType (...p: unknown[]): boolean {
  if (!Array.isArray(p)) {
    return false
  }
  const { result } = p.reduce(
    ({ firstWithType, result }, e) => {
      if (result === false || Number.isNaN(e) || typeof e === 'symbol') {
        return { firstWithType, result: false }
      }
      if (e === undefined || e === null) {
        return { firstWithType, result }
      }
      if (firstWithType === undefined) {
        return { typeDefining: e, result }
      }
      return {
        firstWithType,
        result:
          typeof e === typeof firstWithType &&
          (typeof firstWithType !== 'object' || e instanceof firstWithType.constructor)
      }
    },
    { typeDefining: undefined, result: true }
  )
  return result
}
