/* eslint-env mocha */

import {
  intervalIntervalRelationBitPatterns,
  NR_OF_RELATIONS,
  PRECEDES_BIT_PATTERN,
  MEETS_BIT_PATTERN,
  OVERLAPS_BIT_PATTERN,
  FINISHED_BY_BIT_PATTERN,
  CONTAINS_BIT_PATTERN,
  STARTS_BIT_PATTERN,
  EQUALS_BIT_PATTERN,
  STARTED_BY_BIT_PATTERN,
  DURING_BIT_PATTERN,
  FINISHES_BIT_PATTERN,
  OVERLAPPED_BY_BIT_PATTERN,
  MET_BY_BIT_PATTERN,
  PRECEDED_BY_BIT_PATTERN,
  EMPTY_BIT_PATTERN,
  FULL_BIT_PATTERN,
  isBasicIntervalIntervalRelationBitPattern,
  isIntervalIntervalRelationBitPattern
} from '../src/allenRelationBitPattern'
import should from 'should'
import { stuffWithUndefined } from './_stuff'
import { inspect } from 'util'

interface PatternCase {
  name: string
  value: number
}

const basicPatterns: PatternCase[] = [
  { name: 'PRECEDES_BIT_PATTERN', value: PRECEDES_BIT_PATTERN },
  { name: 'MEETS_BIT_PATTERN', value: MEETS_BIT_PATTERN },
  { name: 'OVERLAPS_BIT_PATTERN', value: OVERLAPS_BIT_PATTERN },
  { name: 'FINISHED_BY_BIT_PATTERN', value: FINISHED_BY_BIT_PATTERN },
  { name: 'CONTAINS_BIT_PATTERN', value: CONTAINS_BIT_PATTERN },
  { name: 'STARTS_BIT_PATTERN', value: STARTS_BIT_PATTERN },
  { name: 'EQUALS_BIT_PATTERN', value: EQUALS_BIT_PATTERN },
  { name: 'STARTED_BY_BIT_PATTERN', value: STARTED_BY_BIT_PATTERN },
  { name: 'DURING_BIT_PATTERN', value: DURING_BIT_PATTERN },
  { name: 'FINISHES_BIT_PATTERN', value: FINISHES_BIT_PATTERN },
  { name: 'OVERLAPPED_BY_BIT_PATTERN', value: OVERLAPPED_BY_BIT_PATTERN },
  { name: 'MET_BY_BIT_PATTERN', value: MET_BY_BIT_PATTERN },
  { name: 'PRECEDED_BY_BIT_PATTERN', value: PRECEDED_BY_BIT_PATTERN }
]

describe('allenRelationBitPattern', function () {
  describe('NR_OF_RELATIONS', function () {
    it('is an integer', function () {
      NR_OF_RELATIONS.should.be.a.Number()
      Number.isInteger(NR_OF_RELATIONS).should.be.true()
    })
    it('is 2^13', function () {
      NR_OF_RELATIONS.should.equal(8192)
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
  describe('intervalIntervalRelationBitPatterns', function () {
    it('is an array', function () {
      intervalIntervalRelationBitPatterns.should.be.an.Array()
    })
    it('contains the exact amount of numbers', function () {
      intervalIntervalRelationBitPatterns.length.should.equal(NR_OF_RELATIONS)
    })
    it('contains the pattern of the index at each location', function () {
      intervalIntervalRelationBitPatterns.forEach((_, i) => {
        should(intervalIntervalRelationBitPatterns[i]).equal(i)
      })
    })
  })
  describe('isIntervalIntervalRelationBitPattern', function () {
    it('returns true for all bit patterns', function () {
      intervalIntervalRelationBitPatterns.forEach(bp => {
        isIntervalIntervalRelationBitPattern(bp).should.be.true()
      })
    })

    stuffWithUndefined
      .filter(s => s !== 0 && s !== 1)
      .forEach(s => {
        it(`returns false for ${JSON.stringify(s)}`, function () {
          isIntervalIntervalRelationBitPattern(s).should.be.false()
        })
      })
  })
  describe('isBasicIntervalIntervalRelationBitPattern', function () {
    basicPatterns.forEach(bbp => {
      it(`returns true for ${bbp.name}`, function () {
        isBasicIntervalIntervalRelationBitPattern(bbp.value).should.be.true()
      })
    })
    it('returns false for all non-basic bit patterns', function () {
      intervalIntervalRelationBitPatterns
        .filter(bp => !basicPatterns.map(bbp => bbp.value).includes(bp))
        .forEach(nonBasicBitPattern => {
          isBasicIntervalIntervalRelationBitPattern(nonBasicBitPattern).should.be.false()
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
        Math.pow(2, 14)
      ])
      .forEach(s => {
        it(`returns false for ${inspect(s)}`, function () {
          isBasicIntervalIntervalRelationBitPattern(s).should.be.false()
        })
      })
  })
})
