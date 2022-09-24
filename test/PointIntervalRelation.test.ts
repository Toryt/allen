/* eslint-env mocha */

import {
  NR_OF_RELATIONS as BITPATTERN_NR_OF_RELATIONS,
  PointIntervalRelationBitPattern,
  EMPTY_BIT_PATTERN,
  BEFORE_BIT_PATTERN,
  BEGINS_BIT_PATTERN,
  IN_BIT_PATTERN,
  ENDS_BIT_PATTERN,
  AFTER_BIT_PATTERN,
  FULL_BIT_PATTERN
} from '../src/pointIntervalRelationBitPattern'
import {
  NR_OF_RELATIONS,
  PointIntervalRelation,
  EMPTY,
  BEFORE,
  BEGINS,
  IN,
  ENDS,
  AFTER,
  FULL
} from '../src/PointIntervalRelation'
import 'should'

function testBasicRelation (name: string, pir: PointIntervalRelation, pirbp: PointIntervalRelationBitPattern): void {
  describe(name, function () {
    it('is a TimeIntervalRelation', function () {
      pir.should.be.instanceof(PointIntervalRelation)
    })
    it('has the expected bit pattern', function () {
      pir.bitPattern.should.equal(pirbp)
    })
  })
}

describe('PointIntervalRelations', function () {
  describe('NR_OF_RELATIONS', function () {
    it('should pass through pointIntervalRelationBitPattern.NR_OF_RELATIONS', function () {
      NR_OF_RELATIONS.should.equal(BITPATTERN_NR_OF_RELATIONS)
    })
  })
  describe('VALUES', function () {
    it('is an array', function () {
      PointIntervalRelation.VALUES.should.be.an.Array()
    })
    it('contains the exact amount of instances', function () {
      PointIntervalRelation.VALUES.length.should.equal(NR_OF_RELATIONS)
    })
    it('contains only TimeIntervalRelations', function () {
      PointIntervalRelation.VALUES.forEach(ar => {
        ar.should.be.instanceof(PointIntervalRelation)
      })
    })
    it('does not contain duplicates', function () {
      // optimized to avoid quadratic time
      PointIntervalRelation.VALUES.forEach((ar, i) => {
        ar.bitPattern.should.equal(i)
      })
    })
  })
  describe('special relations', function () {
    describe('EMPTY', function () {
      it('is a PointIntervalRelation', function () {
        EMPTY.should.be.instanceof(PointIntervalRelation)
      })
      it('has bit pattern 0', function () {
        EMPTY.bitPattern.should.equal(EMPTY_BIT_PATTERN)
      })
    })
    testBasicRelation('BEFORE', BEFORE, BEFORE_BIT_PATTERN)
    testBasicRelation('BEGINS', BEGINS, BEGINS_BIT_PATTERN)
    testBasicRelation('IN', IN, IN_BIT_PATTERN)
    testBasicRelation('ENDS', ENDS, ENDS_BIT_PATTERN)
    testBasicRelation('AFTER', AFTER, AFTER_BIT_PATTERN)
    describe('FULL', function () {
      it('is a PointIntervalRelation', function () {
        FULL.should.be.instanceof(PointIntervalRelation)
      })
      it('has bit pattern 5 1‘s', function () {
        FULL.bitPattern.should.equal(FULL_BIT_PATTERN)
      })
    })
  })
})
