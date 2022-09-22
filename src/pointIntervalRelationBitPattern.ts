import assert from 'assert'

/**
 * The total number of possible time point-interval relations **= 32** (i.e., <code>2<sup>5</sup></code>).
 */
export const NR_OF_RELATIONS: number = Math.pow(2, 5)

/**
 * See [Coding Adventure: PositiveNumber in TypeScript, Aleksey Kozin,
 * 2021-11-05](https://javascript.plainenglish.io/coding-adventure-positivenumber-in-typescript-8c642c17bc76).
 */
export type TimePointIntervalBitPattern = number & { __brand: 'TimePointIntervalBitPattern' }

export function isTimePointIntervalBitPattern (candidate: unknown): candidate is TimePointIntervalBitPattern {
  return (
    typeof candidate === 'number' && Number.isInteger(candidate) && candidate >= 0 && candidate <= NR_OF_RELATIONS - 1
  )
}

function numberToTimePointIntervalBitPattern (n: number): TimePointIntervalBitPattern {
  assert(isTimePointIntervalBitPattern(n))
  return n
}

export const EMPTY_BIT_PATTERN = 0 // 00000
export const BEFORE_BIT_PATTERN = 1 // 00001 <
export const BEGINS_BIT_PATTERN = 2 // 00010 =[<
export const IN_BIT_PATTERN = 4 // 00100 ><
export const ENDS_BY_BIT_PATTERN = 8 // 01000 =[>
export const AFTER_BIT_PATTERN = 16 // 10000 >
export const FULL_BIT_PATTERN = 31 // 11111 < =[< >< =[> >

export const timePointIntervalBitPatterns: readonly TimePointIntervalBitPattern[] = [
  ...Array(NR_OF_RELATIONS).keys()
].map(nr => numberToTimePointIntervalBitPattern(nr))

/**
 * A basic relation is expressed by a single bit in the bit pattern.
 */
export function isBasicTimePointIntervalBitPattern (candidate: unknown): candidate is TimePointIntervalBitPattern {
  /* http://graphics.stanford.edu/~seander/bithacks.html
   * Determining if an integer is a power of 2
   * unsigned int v; // we want to see if v is a power of 2
   * bool f;         // the result goes here
   * f = (v & (v - 1)) == 0;
   *
   * Note that 0 is incorrectly considered a power of 2 here. To remedy this, use:
   * f = !(v & (v - 1)) && v;
   */
  return typeof candidate === 'number' && (candidate & (candidate - 1)) === 0 && candidate !== 0
}