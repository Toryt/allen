/* eslint-env mocha */

import {
  NR_OF_BITS,
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
  BASIC_POINT_INTERVAL_RELATION_REPRESENTATIONS,
  BASIC_RELATIONS
} from '../src/PointIntervalRelation'
import 'should'

function testBasicRelation (
  name: string,
  pir: BasicPointIntervalRelation,
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
    it(`has ${ordinal} as ordinal`, function () {
      pir.ordinal().should.equal(ordinal)
    })
    it(`has an integer ordinal [0, 5[`, function () {
      const o = pir.ordinal()
      Number.isInteger(o).should.be.true()
      o.should.be.greaterThanOrEqual(0)
      o.should.be.lessThan(NR_OF_BITS)
    })
    it('reports as a basic PointIntervalRelation', function () {
      pir.isBasic().should.be.true()
    })
    it(`has ${BASIC_POINT_INTERVAL_RELATION_REPRESENTATIONS[ordinal]} as representation`, function () {
      pir.representation.should.equal(BASIC_POINT_INTERVAL_RELATION_REPRESENTATIONS[ordinal])
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
    it('contains only PointIntervalRelations', function () {
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
    it('contains only BasicPointIntervalRelation', function () {
      BASIC_RELATIONS.forEach(ar => {
        ar.should.be.instanceof(BasicPointIntervalRelation)
      })
    })
    it('is the exported static', function () {
      BASIC_RELATIONS.should.equal(BasicPointIntervalRelation.BASIC_RELATIONS_VALUES)
    })
    it('has the basic relation at the position of its ordinal', function () {
      BASIC_RELATIONS.forEach((br, i) => {
        br.ordinal().should.equal(i)
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
  describe('#uncertainty', function () {
    it('returns NaN for EMPTY', function () {
      EMPTY.uncertainty().should.be.NaN()
    })
    BASIC_RELATIONS.forEach(br => {
      it(`returns 0 for ${br.representation}`, function () {
        br.uncertainty().should.equal(0)
      })
    })
    it('returns 1 for FULL', function () {
      FULL.uncertainty().should.equal(1)
    })
    // MUDO test others, see post
  })
})
