/* eslint-env mocha */

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
  describe('impliedBy', function () {
    it('is implied by itself', function () {
      VALUES.forEach(ar => {
        ar.impliedBy(ar).should.be.true()
      })
    })
    it('basic relations are not implied by other basic relations', function () {
      BASIC_RELATIONS.forEach(br1 => {
        BASIC_RELATIONS.filter(br2 => br2 !== br1).forEach(br2 => br1.impliedBy(br2).should.be.false())
      })
    })
    /* MUDO limit tests to less than 67e6
    it('is equivalent', function () {
      this.timeout(500000)
      const total = VALUES.length * VALUES.length
      let counter = 0
      // 67 million tests
      VALUES.forEach(ar1 => {
        VALUES.forEach(ar2 => {
          counter++
          if (counter % 500000 === 0) {
            console.log(`${counter}/${total} (${(counter * 100) / total}%)`)
          }
          const result = ar1.impliedBy(ar2)
          const calculated = BASIC_RELATIONS.every(br => !ar2.impliedBy(br) || ar1.impliedBy(br))
          result.should.equal(calculated)
        })
      })
    })
    */
  })
})
