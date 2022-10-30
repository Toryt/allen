/**
 * The number of bits used in Point Interval Relation bit patterns.
 */
export const NR_OF_BITS = 5

/**
 * The total number of possible time point-interval relations **= 32** (i.e., <code>2<sup>5</sup></code>).
 */
export const NR_OF_RELATIONS: number = Math.pow(2, NR_OF_BITS)

export const EMPTY_BIT_PATTERN = 0 // 00000
export const BEFORE_BIT_PATTERN = 1 // 00001 b
export const COMMENCES_BIT_PATTERN = 2 // 00010 c
export const IN_BIT_PATTERN = 4 // 00100 i
export const TERMINATES_BIT_PATTERN = 8 // 01000 t
export const AFTER_BIT_PATTERN = 16 // 10000 a
export const FULL_BIT_PATTERN = 31 // 11111 bcita

export const basicPointIntervalRelationBitPatterns: readonly number[] = [...Array(NR_OF_BITS).keys()].map(nr =>
  Math.pow(2, nr)
)

export const pointIntervalRelationBitPatterns: readonly number[] = [...Array(NR_OF_RELATIONS).keys()]

export function isPointIntervalRelationBitPattern (candidate: unknown): candidate is number {
  return (
    typeof candidate === 'number' && Number.isInteger(candidate) && candidate >= 0 && candidate <= NR_OF_RELATIONS - 1
  )
}

/**
 * A basic relation is expressed by a single bit in the bit pattern.
 */
export function isBasicPointIntervalRelationBitPattern (candidate: unknown): candidate is number {
  /* http://graphics.stanford.edu/~seander/bithacks.html
   * Determining if an integer is a power of 2
   * unsigned int v; // we want to see if v is a power of 2
   * bool f;         // the result goes here
   * f = (v & (v - 1)) == 0;
   *
   * Note that 0 is incorrectly considered a power of 2 here. To remedy this, use:
   * f = !(v & (v - 1)) && v;
   */
  return isPointIntervalRelationBitPattern(candidate) && candidate !== 0 && (candidate & (candidate - 1)) === 0
}
