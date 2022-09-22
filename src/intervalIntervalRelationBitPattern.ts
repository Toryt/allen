import Joi from 'joi'
import assert from 'assert'

/**
 * The total number of possible interval - interval relations **= 8192** * (i.e., <code>2<sup>13</sup></code>).
 */
export const NR_OF_RELATIONS: number = Math.pow(2, 13)

/**
 * See [Coding Adventure: PositiveNumber in TypeScript, Aleksey Kozin,
 * 2021-11-05](https://javascript.plainenglish.io/coding-adventure-positivenumber-in-typescript-8c642c17bc76).
 */
export type IntervalIntervalRelationBitPattern = number & { __brand: 'BitPattern' }

export function isIntervalIntervalRelationBitPattern (
  candidate: unknown
): candidate is IntervalIntervalRelationBitPattern {
  return (
    typeof candidate === 'number' && Number.isInteger(candidate) && candidate >= 0 && candidate <= NR_OF_RELATIONS - 1
  )
}

export const BitPatternSchema: Joi.Schema<IntervalIntervalRelationBitPattern> = Joi.number()
  .integer()
  .min(0)
  .max(NR_OF_RELATIONS - 1)

function numberToIntervalIntervalRelationBitPattern (n: number): IntervalIntervalRelationBitPattern {
  assert(isIntervalIntervalRelationBitPattern(n))
  return n
}

// with these bit patterns, converse is reverse of 13-bit pattern

export const EMPTY_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(0) // 0000000000000
export const PRECEDES_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(1) // 0000000000001 p
export const MEETS_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(2) // 0000000000010 m
export const OVERLAPS_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(4) // 0000000000100 o
export const FINISHED_BY_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(8) // 0000000001000 F
export const CONTAINS_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(16) // 0000000010000 D
export const STARTS_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(32) // 0000000100000 s
export const EQUALS_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(64) // 0000001000000 e
export const STARTED_BY_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(
  128
) // 0000010000000 S
export const DURING_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(256) // 0000100000000 d
export const FINISHES_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(512) // 0001000000000 f
export const OVERLAPPED_BY_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(
  1024
) // 0010000000000 O
export const MET_BY_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(2048) // 0100000000000 M
export const PRECEDED_BY_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(
  4096
) // 1000000000000 P
export const FULL_BIT_PATTERN: IntervalIntervalRelationBitPattern = numberToIntervalIntervalRelationBitPattern(8191) // 1111111111111 pmoFDseSdfOMP

export const intervalIntervalRelationBitPatterns: readonly IntervalIntervalRelationBitPattern[] = [
  ...Array(NR_OF_RELATIONS).keys()
].map(nr => numberToIntervalIntervalRelationBitPattern(nr))

/**
 * A basic relation is expressed by a single bit in the bit pattern.
 */
export function isBasicIntervalIntervalRelationBitPattern (
  candidate: unknown
): candidate is IntervalIntervalRelationBitPattern {
  /* http://graphics.stanford.edu/~seander/bithacks.html
   * Determining if an integer is a power of 2
   * unsigned int v; // we want to see if v is a power of 2
   * bool f;         // the result goes here
   * f = (v & (v - 1)) == 0;
   *
   * Note that 0 is incorrectly considered a power of 2 here. To remedy this, use:
   * f = !(v & (v - 1)) && v;
   */
  return isIntervalIntervalRelationBitPattern(candidate) && (candidate & (candidate - 1)) === 0 && candidate !== 0
}