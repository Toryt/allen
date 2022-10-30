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

/**
 * @internal
 */
export const EMPTY_BIT_PATTERN: number = 0 // 0000000000000
/**
 * @internal
 */
export const PRECEDES_BIT_PATTERN: number = 1 // 0000000000001 p
/**
 * @internal
 */
export const MEETS_BIT_PATTERN: number = 2 // 0000000000010 m
/**
 * @internal
 */
export const OVERLAPS_BIT_PATTERN: number = 4 // 0000000000100 o
/**
 * @internal
 */
export const FINISHED_BY_BIT_PATTERN: number = 8 // 0000000001000 F
/**
 * @internal
 */
export const CONTAINS_BIT_PATTERN: number = 16 // 0000000010000 D
/**
 * @internal
 */
export const STARTS_BIT_PATTERN: number = 32 // 0000000100000 s
/**
 * @internal
 */
export const EQUALS_BIT_PATTERN: number = 64 // 0000001000000 e
/**
 * @internal
 */
export const STARTED_BY_BIT_PATTERN: number = 128 // 0000010000000 S
/**
 * @internal
 */
export const DURING_BIT_PATTERN: number = 256 // 0000100000000 d
/**
 * @internal
 */
export const FINISHES_BIT_PATTERN: number = 512 // 0001000000000 f
/**
 * @internal
 */
export const OVERLAPPED_BY_BIT_PATTERN: number = 1024 // 0010000000000 O
/**
 * @internal
 */
export const MET_BY_BIT_PATTERN: number = 2048 // 0100000000000 M
/**
 * @internal
 */
export const PRECEDED_BY_BIT_PATTERN: number = 4096 // 1000000000000 P
/**
 * @internal
 */
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
export function isBasicIntervalIntervalRelationBitPattern (candidate: unknown): candidate is number {
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
