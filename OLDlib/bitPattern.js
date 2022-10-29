const Joi = require('joi')

/**
 * The total number of possible time interval relations <strong>= {@value}</strong>
 * (i.e., <code>2<sup>13</sup></code>).
 */
const NR_OF_RELATIONS = 8192

// with these bit patterns, converse is reverse of 13-bit pattern

const EMPTY_BIT_PATTERN = 0 // 0000000000000
const PRECEDES_BIT_PATTERN = 1 // 0000000000001 p
const MEETS_BIT_PATTERN = 2 // 0000000000010 m
const OVERLAPS_BIT_PATTERN = 4 // 0000000000100 o
const FINISHED_BY_BIT_PATTERN = 8 // 0000000001000 F
const CONTAINS_BIT_PATTERN = 16 // 0000000010000 D
const STARTS_BIT_PATTERN = 32 // 0000000100000 s
const EQUALS_BIT_PATTERN = 64 // 0000001000000 e
const STARTED_BY_BIT_PATTERN = 128 // 0000010000000 S
const DURING_BIT_PATTERN = 256 // 0000100000000 d
const FINISHES_BIT_PATTERN = 512 // 0001000000000 f
const OVERLAPPED_BY_BIT_PATTERN = 1024 // 0010000000000 O
const MET_BY_BIT_PATTERN = 2048 // 0100000000000 M
const PRECEDED_BY_BIT_PATTERN = 4096 // 1000000000000 P
const FULL_BIT_PATTERN = 8191 // 1111111111111 pmoFDseSdfOMP

const bitPatterns = [...Array(NR_OF_RELATIONS).keys()]

const BitPattern = Joi.number()
  .integer()
  .min(EMPTY_BIT_PATTERN)
  .max(FULL_BIT_PATTERN)

/**
 * A basic relation is expressed by a single bit in the bit pattern.
 */
function isBasicBitPattern (bitPattern) {
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

module.exports = {
  NR_OF_RELATIONS,
  EMPTY_BIT_PATTERN,
  PRECEDES_BIT_PATTERN,
  MEETS_BIT_PATTERN,
  OVERLAPS_BIT_PATTERN,
  FINISHED_BY_BIT_PATTERN,
  CONTAINS_BIT_PATTERN,
  STARTS_BIT_PATTERN,
  EQUALS_BIT_PATTERN,
  STARTED_BY_BIT_PATTERN,
  DURING_BIT_PATTERN,
  FINISHES_BIT_PATTERN,
  OVERLAPPED_BY_BIT_PATTERN,
  MET_BY_BIT_PATTERN,
  PRECEDED_BY_BIT_PATTERN,
  FULL_BIT_PATTERN,
  bitPatterns,
  BitPattern,
  isBasicBitPattern
}
