/* eslint-env mocha */

import { NR_OF_RELATIONS as BITPATTERN_NR_OF_RELATIONS } from '../src/pointIntervalRelationBitPattern'
import { NR_OF_RELATIONS, PointIntervalRelation } from '../src/PointIntervalRelation'
import 'should'

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
})
