const Joi = require('joi')
const { BitPattern, isBasicBitPattern } = require('./bitPattern')

class TimeIntervalRelation {
  constructor (bitpattern) {
    Joi.assert(bitpattern, BitPattern)

    /**
     * Only the 13 lowest bits are used. The other (32 - 13 = 19 bits) are 0.
     */
    this.$bitPattern = bitpattern
  }


module.exports = { TimeIntervalRelation }
