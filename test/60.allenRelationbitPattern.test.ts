/* eslint-env mocha */

import should from 'should'
import { stuffWithUndefined } from './_stuff'
import { inspect } from 'util'
import {
  basicAllenRelationBitPatterns,
  allenRelationBitPatterns,
  NR_OF_BITS,
  NR_OF_RELATIONS,
  EMPTY_BIT_PATTERN,
  FULL_BIT_PATTERN,
  isBasicAllenRelationBitPattern,
  isAllenRelationBitPattern
} from '../src/allenRelationBitPattern'

interface PatternCase {
  name: string
  value: number
}

const basicPatterns: PatternCase[] = [
  { name: 'PRECEDES_BIT_PATTERN', value: 1 },
  { name: 'MEETS_BIT_PATTERN', value: 2 },
  { name: 'OVERLAPS_BIT_PATTERN', value: 4 },
  { name: 'FINISHED_BY_BIT_PATTERN', value: 8 },
  { name: 'CONTAINS_BIT_PATTERN', value: 16 },
  { name: 'STARTS_BIT_PATTERN', value: 32 },
  { name: 'EQUALS_BIT_PATTERN', value: 64 },
  { name: 'STARTED_BY_BIT_PATTERN', value: 128 },
  { name: 'DURING_BIT_PATTERN', value: 256 },
  { name: 'FINISHES_BIT_PATTERN', value: 512 },
  { name: 'OVERLAPPED_BY_BIT_PATTERN', value: 1024 },
  { name: 'MET_BY_BIT_PATTERN', value: 2048 },
  { name: 'PRECEDED_BY_BIT_PATTERN', value: 4096 }
]

describe('allenRelationBitPattern', function () {
  describe('NR_OF_BITS', function () {
    it('is an integer', function () {
      NR_OF_BITS.should.be.a.Number()
      Number.isInteger(NR_OF_BITS).should.be.true()
    })
    it('is 13', function () {
      NR_OF_BITS.should.equal(13)
    })
  })
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
  describe('basicAllenRelationBitPatterns', function () {
    it('is an array', function () {
      basicAllenRelationBitPatterns.should.be.an.Array()
    })
    it('contains the exact amount of numbers', function () {
      basicAllenRelationBitPatterns.length.should.equal(NR_OF_BITS)
    })
    it('contains the pattern of the index at each location', function () {
      basicAllenRelationBitPatterns.forEach((_, i) => {
        should(basicAllenRelationBitPatterns[i]).equal(Math.pow(2, i))
      })
    })
  })
  describe('allenRelationBitPatterns', function () {
    it('is an array', function () {
      allenRelationBitPatterns.should.be.an.Array()
    })
    it('contains the exact amount of numbers', function () {
      allenRelationBitPatterns.length.should.equal(NR_OF_RELATIONS)
    })
    it('contains the pattern of the index at each location', function () {
      allenRelationBitPatterns.forEach((_, i) => {
        should(allenRelationBitPatterns[i]).equal(i)
      })
    })
  })
  describe('isAllenRelationBitPattern', function () {
    it('returns true for all bit patterns', function () {
      allenRelationBitPatterns.forEach(bp => {
        isAllenRelationBitPattern(bp).should.be.true()
      })
    })

    stuffWithUndefined
      .filter(s => s !== 0 && s !== 1)
      .forEach(s => {
        it(`returns false for ${JSON.stringify(s)}`, function () {
          isAllenRelationBitPattern(s).should.be.false()
        })
      })
  })
  describe('isBasicAllenRelationBitPattern', function () {
    basicPatterns.forEach(bbp => {
      it(`returns true for ${bbp.name}`, function () {
        isBasicAllenRelationBitPattern(bbp.value).should.be.true()
      })
    })
    it('returns false for all non-basic bit patterns', function () {
      allenRelationBitPatterns
        .filter(bp => !basicPatterns.map(bbp => bbp.value).includes(bp))
        .forEach(nonBasicBitPattern => {
          isBasicAllenRelationBitPattern(nonBasicBitPattern).should.be.false()
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
          isBasicAllenRelationBitPattern(s).should.be.false()
        })
      })
  })
})
