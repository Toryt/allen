/**
 * The total number of relations, i.e., <code>2<sup>nrOfBits</sup></code>.
 */
export function nrOfRelations (nrOfBits: number): number {
  return Math.pow(2, nrOfBits)
}

export const EMPTY_BIT_PATTERN = 0 // 00000

export function fullBitPattern (nrOfBits: number): number {
  return nrOfRelations(nrOfBits) - 1
}

export function relationBitPatterns (nrOfBits: number): readonly number[] {
  return [...Array(nrOfRelations(nrOfBits)).keys()]
}

export function isRelationBitPattern (nrOfBits: number, candidate: unknown): candidate is number {
  return (
    typeof candidate === 'number' &&
    Number.isInteger(candidate) &&
    candidate >= 0 &&
    candidate <= nrOfRelations(nrOfBits) - 1
  )
}

export function basicRelationBitPatterns (nrOfBits: number): readonly number[] {
  return [...Array(nrOfBits).keys()].map(nr => Math.pow(2, nr))
}

/**
 * A basic relation is expressed by a single bit in the bit pattern.
 */
export function isBasicRelationBitPattern (nrOfBits: number, candidate: unknown): candidate is number {
  /* http://graphics.stanford.edu/~seander/bithacks.html
   * Determining if an integer is a power of 2
   * unsigned int v; // we want to see if v is a power of 2
   * bool f;         // the result goes here
   * f = (v & (v - 1)) == 0;
   *
   * Note that 0 is incorrectly considered a power of 2 here. To remedy this, use:
   * f = !(v & (v - 1)) && v;
   */
  return isRelationBitPattern(nrOfBits, candidate) && candidate !== 0 && (candidate & (candidate - 1)) === 0
}

export function bitCount (n: number): number {
  let count = 0
  while (n > 0) {
    n &= n - 1
    count++
  }
  return count
}
