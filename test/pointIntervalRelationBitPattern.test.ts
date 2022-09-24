/* eslint-env mocha */

import should from 'should'
import { stuffWithUndefined } from './stuff'
import { inspect } from 'util'
import {
  NR_OF_BITS,
  NR_OF_RELATIONS,
  AFTER_BIT_PATTERN,
  BEFORE_BIT_PATTERN,
  BEGINS_BIT_PATTERN,
  EMPTY_BIT_PATTERN,
  ENDS_BIT_PATTERN,
  FULL_BIT_PATTERN,
  IN_BIT_PATTERN,
  basicPointIntervalRelationBitPatterns,
  pointIntervalRelationBitPatterns,
  isPointIntervalRelationBitPattern,
  isBasicPointIntervalRelationBitPattern
} from '../src/pointIntervalRelationBitPattern'

interface PatternCase {
  name: string
  value: number
}

const basicPatterns: PatternCase[] = [
  { name: 'BEFORE_BIT_PATTERN', value: BEFORE_BIT_PATTERN },
  { name: 'BEGINS_BIT_PATTERN', value: BEGINS_BIT_PATTERN },
  { name: 'IN_BIT_PATTERN', value: IN_BIT_PATTERN },
  { name: 'ENDS_BIT_PATTERN', value: ENDS_BIT_PATTERN },
  { name: 'AFTER_BIT_PATTERN', value: AFTER_BIT_PATTERN }
]

describe('pointIntervalRelationBitPattern', function () {
  describe('NR_OF_BITS', function () {
    it('is an integer', function () {
      NR_OF_BITS.should.be.a.Number()
      Number.isInteger(NR_OF_BITS).should.be.true()
    })
    it('is 5', function () {
      NR_OF_BITS.should.equal(5)
    })
  })
  describe('NR_OF_RELATIONS', function () {
    it('is an integer', function () {
      NR_OF_RELATIONS.should.be.a.Number()
      Number.isInteger(NR_OF_RELATIONS).should.be.true()
    })
    it('is 2^13', function () {
      NR_OF_RELATIONS.should.equal(32)
    })
  })
  describe('basic patterns', function () {
    it('EMPTY_BIT_PATTERN is 0', function () {
      EMPTY_BIT_PATTERN.should.equal(0)
    })
    basicPatterns.forEach((bbp, i) => {
      it(`${bbp.name} is 2^${i}`, function () {
        bbp.value.should.equal(Math.pow(2, i))
      })
    })
    it('FULL_BIT_PATTERN is all ones', function () {
      FULL_BIT_PATTERN.should.equal(NR_OF_RELATIONS - 1)
    })
  })
  describe('basicPointIntervalRelationBitPatterns', function () {
    it('is an array', function () {
      basicPointIntervalRelationBitPatterns.should.be.an.Array()
    })
    it('contains the exact amount of numbers', function () {
      basicPointIntervalRelationBitPatterns.length.should.equal(NR_OF_BITS)
    })
    it('contains the pattern of the index at each location', function () {
      basicPointIntervalRelationBitPatterns.forEach((_, i) => {
        should(basicPointIntervalRelationBitPatterns[i]).equal(Math.pow(2, i))
      })
    })
  })
  describe('pointIntervalRelationBitPatterns', function () {
    it('is an array', function () {
      pointIntervalRelationBitPatterns.should.be.an.Array()
    })
    it('contains the exact amount of numbers', function () {
      pointIntervalRelationBitPatterns.length.should.equal(NR_OF_RELATIONS)
    })
    it('contains the pattern of the index at each location', function () {
      pointIntervalRelationBitPatterns.forEach((_, i) => {
        should(pointIntervalRelationBitPatterns[i]).equal(i)
      })
    })
  })
  describe('isPointIntervalRelationBitPattern', function () {
    it('returns true for all bit patterns', function () {
      pointIntervalRelationBitPatterns.forEach(bp => {
        isPointIntervalRelationBitPattern(bp).should.be.true()
      })
    })

    stuffWithUndefined
      .filter(s => s !== 0 && s !== 1)
      .forEach(s => {
        it(`returns false for ${JSON.stringify(s)}`, function () {
          isPointIntervalRelationBitPattern(s).should.be.false()
        })
      })
  })
  describe('isBasicPointIntervalRelationBitPattern', function () {
    basicPatterns.forEach(bbp => {
      it(`returns true for ${bbp.name}`, function () {
        isBasicPointIntervalRelationBitPattern(bbp.value).should.be.true()
      })
    })
    it('returns false for all non-basic bit patterns', function () {
      pointIntervalRelationBitPatterns
        .filter(bp => !basicPatterns.map(bbp => bbp.value).includes(bp))
        .forEach(nonBasicBitPattern => {
          isBasicPointIntervalRelationBitPattern(nonBasicBitPattern).should.be.false()
        })
    })

    stuffWithUndefined
      .filter(s => s !== 1)
      .concat([
        NaN,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.EPSILON,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        NR_OF_RELATIONS + 1,
        Math.pow(2, 6)
      ])
      .forEach(s => {
        it(`returns false for ${inspect(s)}`, function () {
          isBasicPointIntervalRelationBitPattern(s).should.be.false()
        })
      })
  })
})
