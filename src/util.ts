export function arePointsOfSameType (...p: unknown[]) {
  return (
    Array.isArray(p) &&
    p.every(
      (e, i) =>
        e === undefined ||
        e === null ||
        (!Number.isNaN(e) &&
          typeof e !== 'symbol' &&
          (i === 0 ||
            (typeof e === typeof p[i - 1] && (typeof p[i - 1] !== 'object' || e instanceof p[i - 1].constructor))))
    )
  )
}
