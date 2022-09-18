/* eslint-env mocha */

import {
  bitPatterns,
  BitPattern,
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
  isBasicBitPattern
} from '../src/bitPattern'
import Joi from 'joi'
import should from 'should'
import { stuffWithUndefined } from './stuff'

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

describe('bitPattern', function () {
  describe('NR_OF_RELATIONS', function () {
    it('is an integer', function () {
      NR_OF_RELATIONS.should.be.a.Number()
      Number.isInteger(NR_OF_RELATIONS).should.be.true()
    })
    it('is 2^13', function () {
      NR_OF_RELATIONS.should.equal(Math.pow(2, 13))
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
  describe('bitpatterns', function () {
    it('is an array', function () {
      bitPatterns.should.be.an.Array()
    })
    it('contains the exact amount of numbers', function () {
      bitPatterns.length.should.equal(NR_OF_RELATIONS)
    })
    it('contains the pattern of the index at each location', function () {
      bitPatterns.forEach((_, i) => {
        should(bitPatterns[i]).equal(i)
      })
    })
  })
  describe('BitPattern', function () {
    it('is a schema', function () {
      Joi.isSchema(BitPattern).should.be.true()
    })
    it('passes for all bit patterns', function () {
      bitPatterns.forEach(bp => {
        Joi.assert(bp, BitPattern)
      })
    })

    stuffWithUndefined
      .filter(s => !isBasicBitPattern(s))
      .forEach(s => {
        it(`fails for ${JSON.stringify(s)}`, function () {
          BitPattern.validate(s).should.have.property('error')
        })
      })
  })
  describe('isBasicBitPattern', function () {
    basicPatterns.forEach(bbp => {
      it(`returns true for ${bbp.name}`, function () {
        isBasicBitPattern(bbp.value).should.be.true()
      })
    })
    it('returns false for all non-basic bit patterns', function () {
      bitPatterns
        .filter(bp => !basicPatterns.map(bbp => bbp.value).includes(bp))
        .forEach(nonBasicBitPattern => {
          isBasicBitPattern(nonBasicBitPattern).should.be.false()
        })
    })
  })
})
