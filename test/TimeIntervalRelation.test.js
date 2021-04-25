const { bitPatterns, TimeIntervalRelation } = require('../lib/TimeIntervalRelation')

describe('TimeIntervalRelation', function () {
  describe('constructor', function () {
    bitPatterns.forEach(value => {
      it(`constructs for ${value}`, function () {
        const result = new TimeIntervalRelation(value)
        result.$bitPattern.should.equal(value)
      })
    })
  })
})
