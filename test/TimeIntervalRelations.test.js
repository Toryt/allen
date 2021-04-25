const { NR_OF_RELATIONS, bitPatterns, TimeIntervalRelation, VALUES } = require('../lib/TimeIntervalRelations')

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
})
