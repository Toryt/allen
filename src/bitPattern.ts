/**
 * The total number of relations, i.e., <code>2<sup>nrOfBits</sup></code>.
 */
import assert from 'assert'

/* limited by

   - number size (< 2^(32 - 1) < Math.log2(Number.MAX_SAFE_INTEGER),
   - address space for arrays, and
   - reasonability

   only. See also `bitCount`.  */
export const largestNrOfBits = 16

export function nrOfRelations (nrOfBits: number): number {
  assert(Number.isInteger(nrOfBits))
  assert(nrOfBits >= 0)
  assert(nrOfBits <= largestNrOfBits)

  return Math.pow(2, nrOfBits)
}

export const EMPTY_BIT_PATTERN = 0 // 00000

export function fullBitPattern (nrOfBits: number): number {
  // preconditions in nrOfRelations

  return nrOfRelations(nrOfBits) - 1
}

export function relationBitPatterns (nrOfBits: number): readonly number[] {
  // preconditions in nrOfRelations

  return [...Array(nrOfRelations(nrOfBits)).keys()]
}

export function isRelationBitPattern (nrOfBits: number, candidate: unknown): candidate is number {
  // preconditions in nrOfRelations

  return (
    typeof candidate === 'number' &&
    Number.isInteger(candidate) &&
    candidate >= 0 &&
    candidate <= fullBitPattern(nrOfBits)
  )
}

export function basicRelationBitPatterns (nrOfBits: number): readonly number[] {
  assert(Number.isInteger(nrOfBits))
  assert(nrOfBits >= 0)
  assert(nrOfBits <= largestNrOfBits)

  return [...Array(nrOfBits).keys()].map(nr => Math.pow(2, nr))
}

/**
 * A basic relation is expressed by a single bit in the bit pattern.
 */
export function isBasicRelationBitPattern (nrOfBits: number, candidate: unknown): candidate is number {
  // preconditions in isRelationBitPattern

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

export const largestBitInteger = 2 ** (32 - 1)

/**
 * Reverses the `bitPattern` of `nrOfBits` long.
 */
export function reverse (nrOfBits: number, bitPattern: number): number {
  assert(Number.isInteger(nrOfBits))
  assert(nrOfBits >= 0)
  assert(nrOfBits <= largestNrOfBits)
  assert(Number.isInteger(bitPattern))
  assert(bitPattern >= 0)
  assert(bitPattern <= nrOfRelations(nrOfBits))

  return 0
}

export function bitCount (n: number): number {
  assert(Number.isInteger(n))
  assert(n >= 0)
  assert(n <= largestBitInteger) // otherwise the algoritm flips the sign bit

  let count = 0
  while (n > 0) {
    n &= n - 1
    count++
  }
  return count
}
