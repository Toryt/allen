const { NR_OF_RELATIONS, TimeIntervalRelation } = require('../lib/TimeIntervalRelation')

describe('TimeIntervalRelation', function () {
  for (let i = 0; i < NR_OF_RELATIONS; i++) {
    it(`constructs for ${i}`, function () {
      const result = new TimeIntervalRelation(i)
      result.$bitPattern.should.equal(i)
    })
  }
})
