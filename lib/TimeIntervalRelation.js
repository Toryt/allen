const Joi = require('joi')
const assert = require('assert')
const { BitPattern, isBasicBitPattern } = require('./bitPattern')

class TimeIntervalRelation {
  constructor (bitpattern) {
    Joi.assert(bitpattern, BitPattern)

    /**
     * Only the 13 lowest bits are used. The other (32 - 13 = 19 bits) are 0.
     */
    this.$bitPattern = bitpattern
  }

  /**
   * This is a basic time interval relation.
   *
   * @return {boolean}
   * @post BASIC_RELATIONS.contains(this)
   */
  isBasic () {
    return isBasicBitPattern(this.$bitPattern)
  }

  /**
   * An ordinal for basic relations.
   *
   * @basic
   * @pre this.isBasic()
   * @return {number} result ≥ 0 && result < 13
   */
  basicRelationOrdinal () {
    assert(this.isBasic())

    /*
     * This is the bit position, 0-based, in the 13-bit bit pattern, of the bit
     * representing this as basic relation.
     *
     * See https://www.geeksforgeeks.org/position-of-rightmost-set-bit/
     */
    return Math.log2(this.$bitPattern & -this.$bitPattern)
  }
}

module.exports = { TimeIntervalRelation }
