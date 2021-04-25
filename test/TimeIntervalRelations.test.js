const { NR_OF_RELATIONS } = require('../lib/bitPattern')
const { TimeIntervalRelation } = require('../lib/TimeIntervalRelation')
const { VALUES, BASIC_RELATIONS } = require('../lib/TimeIntervalRelations')

describe('TimeIntervalRelations', function () {
  describe('VALUES', function () {
    it('is an array', function () {
      VALUES.should.be.an.Array()
    })
    it('contains the exact amount of instances', function () {
      VALUES.length.should.equal(NR_OF_RELATIONS)
    })
    it('contains only TimeIntervalRelations', function () {
      VALUES.forEach(ar => {
        ar.should.be.instanceof(TimeIntervalRelation)
      })
    })
    it('does not contain duplicates', function () {
      // optimized to avoid quadratic time
      VALUES.forEach((ar, i) => {
        ar.$bitPattern.should.equal(i)
      })
    })
  })
  describe('BASIC_RELATIONS', function () {
    it('is an array', function () {
      BASIC_RELATIONS.should.be.an.Array()
    })
    it('has 13 entries', function () {
      BASIC_RELATIONS.length.should.equal(13)
    })
    it('contains only TimeIntervalRelations', function () {
      BASIC_RELATIONS.forEach(ar => {
        ar.should.be.instanceof(TimeIntervalRelation)
      })
    })
    it('has the basic relation at the position of its ordinal', function () {
      BASIC_RELATIONS.forEach(br => {
        BASIC_RELATIONS[br.basicRelationOrdinal()].should.strictEqual(br)
      })
    })
  })
})
