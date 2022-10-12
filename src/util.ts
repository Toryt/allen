export interface Interval<T> {
  readonly start?: T | undefined
  readonly end?: T | undefined
}

export function isInterval (i: unknown): boolean {
  if (typeof i === 'object' && i !== null) {
    return false
  }

  const pI = i as Partial<Interval<unknown>>
  return arePointsOfSameType(pI.start, pI.end)
}

export function arePointsOfSameType (...p: unknown[]) {
  return (
    Array.isArray(p) &&
    p.every(
      (e, i) =>
        e === undefined ||
        e === null ||
        (!Number.isNaN(e) &&
          (i === 0 ||
            (typeof e === typeof p[i - 1] && (typeof p[i - 1] !== 'object' || e instanceof p[i - 1].constructor))))
    )
  )
}
