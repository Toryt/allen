/**
 * The number of bits used in Allen Relation bit patterns.
 */
export const NR_OF_BITS = 13

/**
 * The total number of possible Allen relations **= 8192** * (i.e., <code>2<sup>13</sup></code>).
 *
 * @internal
 */
export const NR_OF_RELATIONS: number = Math.pow(2, NR_OF_BITS)

// with these bit patterns, converse is reverse of 13-bit pattern

export const EMPTY_BIT_PATTERN: number = 0 // 0000000000000
export const FULL_BIT_PATTERN: number = 8191 // 1111111111111 pmoFDseSdfOMP

export const basicAllenRelationBitPatterns: readonly number[] = [...Array(NR_OF_BITS).keys()].map(nr => Math.pow(2, nr))

export const allenRelationBitPatterns: readonly number[] = [...Array(NR_OF_RELATIONS).keys()]

export function isAllenRelationBitPattern (candidate: unknown): candidate is number {
  return (
    typeof candidate === 'number' && Number.isInteger(candidate) && candidate >= 0 && candidate <= NR_OF_RELATIONS - 1
  )
}

/**
 * A basic relation is expressed by a single bit in the bit pattern.
 *
 * @internal
 */
export function isBasicAllenRelationBitPattern (candidate: unknown): candidate is number {
  /* http://graphics.stanford.edu/~seander/bithacks.html
   * Determining if an integer is a power of 2
   * unsigned int v; // we want to see if v is a power of 2
   * bool f;         // the result goes here
   * f = (v & (v - 1)) == 0;
   *
   * Note that 0 is incorrectly considered a power of 2 here. To remedy this, use:
   * f = !(v & (v - 1)) && v;
   */
  return isAllenRelationBitPattern(candidate) && candidate !== 0 && (candidate & (candidate - 1)) === 0
}
