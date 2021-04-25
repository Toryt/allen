const { NR_OF_RELATIONS, TimeIntervalRelation } = require('../lib/TimeIntervalRelation')

const values = [...Array(NR_OF_RELATIONS).keys()]

describe('TimeIntervalRelation', function () {
  describe('VALUES', function () {})
  describe('constructor', function () {
    values.forEach(value => {
      it(`constructs for ${value}`, function () {
        const result = new TimeIntervalRelation(value)
        result.$bitPattern.should.equal(value)
      })
    })
  })
})
