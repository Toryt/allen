import Joi, {number} from "joi";

/**
 * The total number of possible time interval relations <strong>= {@value}</strong>
 * (i.e., <code>2<sup>13</sup></code>).
 */

export const NR_OF_RELATIONS: number = 8192

// with these bit patterns, converse is reverse of 13-bit pattern

export const EMPTY_BIT_PATTERN: number = 0 // 0000000000000
export const PRECEDES_BIT_PATTERN: number = 1 // 0000000000001 p
export const MEETS_BIT_PATTERN: number = 2 // 0000000000010 m
export const OVERLAPS_BIT_PATTERN: number = 4 // 0000000000100 o
export const FINISHED_BY_BIT_PATTERN: number = 8 // 0000000001000 F
export const CONTAINS_BIT_PATTERN: number = 16 // 0000000010000 D
export const STARTS_BIT_PATTERN: number = 32 // 0000000100000 s
export const EQUALS_BIT_PATTERN: number = 64 // 0000001000000 e
export const STARTED_BY_BIT_PATTERN: number = 128 // 0000010000000 S
export const DURING_BIT_PATTERN: number = 256 // 0000100000000 d
export const FINISHES_BIT_PATTERN: number = 512 // 0001000000000 f
export const OVERLAPPED_BY_BIT_PATTERN: number = 1024 // 0010000000000 O
export const MET_BY_BIT_PATTERN: number = 2048 // 0100000000000 M
export const PRECEDED_BY_BIT_PATTERN: number = 4096 // 1000000000000 P
export const FULL_BIT_PATTERN: number = 8191 // 1111111111111 pmoFDseSdfOMP

export const bitPatterns: number[] = [...Array(NR_OF_RELATIONS).keys()]

export const BitPattern: Joi.Schema<number> = number()
  .integer()
  .min(EMPTY_BIT_PATTERN)
  .max(FULL_BIT_PATTERN)

/**
 * A basic relation is expressed by a single bit in the bit pattern.
 */
export function isBasicBitPattern (bitPattern: number):boolean {
  /* http://graphics.stanford.edu/~seander/bithacks.html
   * Determining if an integer is a power of 2
   * unsigned int v; // we want to see if v is a power of 2
   * bool f;         // the result goes here
   * f = (v & (v - 1)) == 0;
   *
   * Note that 0 is incorrectly considered a power of 2 here. To remedy this, use:
   * f = !(v & (v - 1)) && v;
   */
  return (bitPattern & (bitPattern - 1)) === 0 && bitPattern !== 0
}
