const { bitPatterns } = require('../lib/bitPattern')
const { TimeIntervalRelation } = require('../lib/TimeIntervalRelation')
const { VALUES, BASIC_RELATIONS } = require('../lib/TimeIntervalRelations')

describe('TimeIntervalRelation', function () {
  describe('constructor', function () {
    it('constructs for all bit patterns', function () {
      bitPatterns.forEach(value => {
        const result = new TimeIntervalRelation(value)
        result.$bitPattern.should.equal(value)
      })
    })
  })
  describe('isBasic', function () {
    it('returns true for all basic relations', function () {
      BASIC_RELATIONS.forEach(ar => {
        const result = ar.isBasic()
        result.should.be.true()
      })
    })
    it('returns false for all non-basic relations', function () {
      VALUES.filter(ar => !BASIC_RELATIONS.includes(ar)).forEach(ar => {
        const result = ar.isBasic()
        result.should.be.false()
      })
    })
  })
  describe('basicRelationOrdinal', function () {
    it('works', function () {
      BASIC_RELATIONS.forEach(br => {
        const result = br.basicRelationOrdinal()
        result.should.be.a.Number()
        Number.isInteger(result).should.be.true()
        result.should.be.greaterThanOrEqual(0)
        result.should.be.lessThan(13)
      })
    })
  })
})
