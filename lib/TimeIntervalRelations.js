const { bitPatterns } = require('./bitPattern')
const { TimeIntervalRelation } = require('./TimeIntervalRelation')

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

/**
 * The set of all 13 basic time interval relations.
 *
 * That they are presented here in a particular order, is a pleasant side note, but in general not relevant
 * for the user. The list is ordered, first on the first interval beginning
 * before the second (<code><var>I1</var>.begin [&lt;, ==, &gt;]
 * <var>I2</var>.begin</code>) and secondly on the first interval ending
 * before the second (<var><code>I1</code></var><code>.end [&lt;, ==, &gt;]
 * <var>I2</var>.end</code>).
 *
 * @type {TimeIntervalRelation[]}
 * @invar BASIC_RELATIONS.length = 13
 * @invar BASIC_RELATIONS.every(br => BASIC_RELATIONS[br.basicRelationOrdinal()] === br)
 * @invar BASIC_RELATIONS[ 0] == PRECEDES
 * @invar BASIC_RELATIONS[ 1] == MEETS
 * @invar BASIC_RELATIONS[ 2] == OVERLAPS
 * @invar BASIC_RELATIONS[ 3] == FINISHED_BY
 * @invar BASIC_RELATIONS[ 4] == CONTAINS
 * @invar BASIC_RELATIONS[ 5] == STARTS
 * @invar BASIC_RELATIONS[ 6] == EQUALS
 * @invar BASIC_RELATIONS[ 7] == STARTED_BY
 * @invar BASIC_RELATIONS[ 8] == DURING
 * @invar BASIC_RELATIONS[ 9] == FINISHES
 * @invar BASIC_RELATIONS[10] == OVERLAPPED_BY
 * @invar BASIC_RELATIONS[11] == MET_BY
 * @invar BASIC_RELATIONS[12] == PRECEDED_BY
 */
const BASIC_RELATIONS = [
  //PRECEDES,
  //MEETS,
  //OVERLAPS,
  //FINISHED_BY,
  //CONTAINS,
  //STARTS,
  //EQUALS,
  //STARTED_BY,
  //DURING,
  //FINISHES,
  //OVERLAPPED_BY,
  //MET_BY,
  //PRECEDED_BY
]

module.exports = { VALUES, BASIC_RELATIONS }
