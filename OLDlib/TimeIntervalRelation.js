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

  /**
   * Is `this` implied by `gr`?
   *
   * In other words, when considering the relations as a set
   * of basic relations, is `this` a superset of `gr` (considering equality as also acceptable)?
   *
   * @basic
   * @pre gr instanceof TimeInterval
   * @invar this.impliedBy(this)
   * @invar !this.isBasic() || BASIC_RELATIONS.every(br => br === this || !this.impliedBy(br))
   * @invar VALUES.every(gr => this.impliedBy(gr) === BASIC_RELATIONS.every(br => !gr.impliedBy(br) || this.impliedBy(br)))
   * @return {boolean}
   */
  impliedBy (gr) {
    assert(gr instanceof TimeIntervalRelation)

    return (this.$bitPattern & gr.$bitPattern) === gr.$bitPattern
  }
}

module.exports = { TimeIntervalRelation }
