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
  BasicPointIntervalRelation,
  EMPTY,
  BEFORE,
  BEGINS,
  IN,
  ENDS,
  AFTER,
  FULL,
  BASIC_RELATIONS
} from '../src/PointIntervalRelation'
import 'should'

function testBasicRelation (
  name: string,
  pir: PointIntervalRelation,
  pirbp: PointIntervalRelationBitPattern,
  ordinal: number
): void {
  describe(name, function () {
    it('is a BasicPointIntervalRelation', function () {
      pir.should.be.instanceof(BasicPointIntervalRelation)
    })
    it('has the expected bit pattern', function () {
      pir.bitPattern.should.equal(pirbp)
    })
    it(`it is at position ${ordinal} in VALUES`, function () {
      pir.should.equal(BASIC_RELATIONS[ordinal])
    })
    it('reports as a basic PointIntervalRelation', function () {
      pir.isBasic().should.be.true()
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
      BasicPointIntervalRelation.VALUES.should.be.an.Array()
    })
    it('contains the exact amount of instances', function () {
      BasicPointIntervalRelation.VALUES.length.should.equal(NR_OF_RELATIONS)
    })
    it('contains only TimeIntervalRelations', function () {
      BasicPointIntervalRelation.VALUES.forEach(ar => {
        ar.should.be.instanceof(PointIntervalRelation)
      })
    })
    it('does not contain duplicates', function () {
      // optimized to avoid quadratic time
      BasicPointIntervalRelation.VALUES.forEach((ar, i) => {
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
    describe('FULL', function () {
      it('is a PointIntervalRelation', function () {
        FULL.should.be.instanceof(PointIntervalRelation)
      })
      it('has bit pattern 5 1‘s', function () {
        FULL.bitPattern.should.equal(FULL_BIT_PATTERN)
      })
    })
  })
  describe('BASIC_RELATIONS', function () {
    it('is an array', function () {
      BASIC_RELATIONS.should.be.an.Array()
    })
    it('has 5 entries', function () {
      BASIC_RELATIONS.length.should.equal(5)
    })
    it('contains only PointIntervalRelations', function () {
      BASIC_RELATIONS.forEach(ar => {
        ar.should.be.instanceof(BasicPointIntervalRelation)
      })
    })
  })
  describe('basic relations', function () {
    testBasicRelation('BEFORE', BEFORE, BEFORE_BIT_PATTERN, 0)
    testBasicRelation('BEGINS', BEGINS, BEGINS_BIT_PATTERN, 1)
    testBasicRelation('IN', IN, IN_BIT_PATTERN, 2)
    testBasicRelation('ENDS', ENDS, ENDS_BIT_PATTERN, 3)
    testBasicRelation('AFTER', AFTER, AFTER_BIT_PATTERN, 4)
  })
})
