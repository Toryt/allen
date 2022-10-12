export function arePointsOfSameType (...p: unknown[]): boolean {
  if (!Array.isArray(p)) {
    return false
  }
  const { result } = p.reduce(
    ({ type, result }, e) => {
      if (result === false || Number.isNaN(e) || typeof e === 'symbol') {
        return { type, result: false }
      }
      if (e === undefined || e === null) {
        return { type, result }
      }
      if (type === undefined) {
        const eType = typeof e
        return { type: eType === 'object' ? e.constructor : eType, result }
      }
      return { type, result: (typeof type === 'string' && typeof e === type) || e instanceof type }
    },
    { type: undefined, result: true }
  )
  return result
}
