const {
  NR_OF_RELATIONS,
  EMPTY_BIT_PATTERN,
  PRECEDES_BIT_PATTERN,
  MEETS_BIT_PATTERN,
  OVERLAPS_BIT_PATTERN,
  FINISHED_BY_BIT_PATTERN
} = require('../lib/bitPattern')
const { TimeIntervalRelation } = require('../lib/TimeIntervalRelation')
const {
  VALUES,
  EMPTY,
  PRECEDES,
  MEETS,
  OVERLAPS,
  FINISHED_BY,
  BASIC_RELATIONS
} = require('../lib/TimeIntervalRelations')

function testBasicRelation (name, br, bp) {
  describe(name, function () {
    it('is a TimeIntervalRelation', function () {
      br.should.be.instanceof(TimeIntervalRelation)
    })
    it('has the expected bit pattern', function () {
      br.$bitPattern.should.equal(bp)
    })
  })
}

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
  describe('special relations', function () {
    describe('EMPTY', function () {
      it('is a TimeIntervalRelation', function () {
        EMPTY.should.be.instanceof(TimeIntervalRelation)
      })
      it('has bit pattern 0', function () {
        EMPTY.$bitPattern.should.equal(EMPTY_BIT_PATTERN)
      })
      it.skip('is not implied by anything', function () {
        VALUES.forEach(ar => {
          EMPTY.impliedBy(ar).should.be.false()
        })
      })
    })
    testBasicRelation('PRECEDES', PRECEDES, PRECEDES_BIT_PATTERN)
    testBasicRelation('MEETS', MEETS, MEETS_BIT_PATTERN)
    testBasicRelation('OVERLAPS', OVERLAPS, OVERLAPS_BIT_PATTERN)
    testBasicRelation('FINISHED_BY', FINISHED_BY, FINISHED_BY_BIT_PATTERN)
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
        BASIC_RELATIONS[br.basicRelationOrdinal()].should.equal(br)
      })
    })
  })
})
