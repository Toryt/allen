const { bitPatterns, TimeIntervalRelation } = require('./TimeIntervalRelation')

/**
 * All possible time interval relations.
 *
 * @type {TimeIntervalRelation[]}
 * @invar Array.isArray(VALUES)
 * @invar VALUES.length = NR_OF_RELATIONS
 * @invar VALUES.every(ar => ar instanceof TimeIntervalRelation)
 * @invar VALUES.every((ar1, i1) => VALUES.every((ar2, i2) => i1 < i2 || ar1 !== ar2)
 * @invar ∀ ar: !(ar instanceof TimeIntervalRelation) || VALUES.includes(ar)
 */
const VALUES = bitPatterns.map(bitPattern => new TimeIntervalRelation(bitPattern))

module.exports = { VALUES }
