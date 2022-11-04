/*
 Copyright © 2022 by Jan Dockx

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* eslint-env mocha */

import should from 'should'
import { stuffWithUndefined } from './_stuff'
import { inspect } from 'util'
import {
  largestNrOfBits,
  nrOfRelations,
  EMPTY_BIT_PATTERN,
  fullBitPattern,
  relationBitPatterns,
  isRelationBitPattern,
  basicRelationBitPatterns,
  isBasicRelationBitPattern,
  reverse,
  bitCount,
  largestBitInteger
} from '../src/bitPattern'

const nrOfBitsCases = [0, 1, 2, 5, 13, largestNrOfBits]
const bitCountCases = [0, 1, 3, 5, 13, 17, 978562897, largestBitInteger - 1, largestBitInteger]

describe('bitPattern', function () {
  it('EMPTY_BIT_PATTERN is 0', function () {
    EMPTY_BIT_PATTERN.should.equal(0)
  })
  nrOfBitsCases.forEach(nrOfBits => {
    describe(`${nrOfBits} bits`, function () {
      describe('nrOfRelations', function () {
        it(`returns 2^${nrOfBits}`, function () {
          const result = nrOfRelations(nrOfBits)
          Number.isInteger(result).should.be.true()
          Math.log2(result).should.equal(nrOfBits)
        })
      })
      describe('fullbitPattern', function () {
        it(`returns 2^${nrOfBits} - 1, and is all 1's`, function () {
          const result = fullBitPattern(nrOfBits)
          Number.isInteger(result).should.be.true()
          Math.log2(result + 1).should.equal(nrOfBits)
          const s = result.toString(2).split('')
          if (nrOfBits <= 0) {
            s.length.should.equal(1)
            s[0].should.equal('0')
          } else {
            s.length.should.equal(nrOfBits)
            s.forEach(b => {
              b.should.equal('1')
            })
          }
        })
      })
      describe('relation bit patterns', function () {
        before(function () {
          this['relationBitPatterns'] = relationBitPatterns(nrOfBits)
          this['basicRelationBitPatterns'] = basicRelationBitPatterns(nrOfBits)
        })

        describe('relationBitPatterns', function () {
          it('is an array', function () {
            const rbps: number[] = this['relationBitPatterns']
            rbps.should.be.an.Array()
          })
          it('contains the exact amount of numbers', function () {
            const rbps: number[] = this['relationBitPatterns']
            rbps.length.should.equal(nrOfRelations(nrOfBits))
          })
          it(`each element has at most ${nrOfBits} its`, function () {
            const rbps: number[] = this['relationBitPatterns']
            rbps.forEach(bp => {
              const s = bp.toString(2).split('')
              if (bp === 0) {
                s.length.should.equal(1)
                s[0].should.equal('0')
              } else {
                s.length.should.be.lessThanOrEqual(nrOfBits)
              }
            })
          })
          it('contains the pattern of the index at each location', function () {
            const rbps: number[] = this['relationBitPatterns']
            rbps.forEach((bp, i) => {
              should(bp).equal(i)
            })
          })
        })
        describe('isRelationBitPattern', function () {
          it('returns true for all bit patterns', function () {
            const rbps: number[] = this['relationBitPatterns']
            rbps.forEach(bp => {
              isRelationBitPattern(nrOfBits, bp).should.be.true()
            })
          })

          stuffWithUndefined
            .filter(s => s !== 0 && s !== 1)
            .forEach(s => {
              it(`returns false for ${JSON.stringify(s)}`, function () {
                isRelationBitPattern(nrOfBits, s).should.be.false()
              })
            })
        })

        describe('basicRelationBitPatterns', function () {
          it('is an array', function () {
            const brbps: number[] = this['basicRelationBitPatterns']
            brbps.should.be.an.Array()
          })
          it('contains the exact amount of numbers', function () {
            const brbps: number[] = this['basicRelationBitPatterns']
            brbps.length.should.equal(nrOfBits)
          })
          it('each elemant has 1 1-bit', function () {
            const brbps: number[] = this['basicRelationBitPatterns']
            brbps.forEach(bp => {
              const s = bp.toString(2).split('')
              s.length.should.be.lessThanOrEqual(nrOfBits)
              s.filter(d => d === '1').length.should.equal(1)
            })
          })
          it('contains the pattern of the index at each location', function () {
            const brbps: number[] = this['basicRelationBitPatterns']
            brbps.forEach((bp, i) => {
              should(bp).equal(Math.pow(2, i))
            })
          })
        })
        describe('isBasicRelationBitPattern', function () {
          it('returns true for all basic patterns', function () {
            const brbps: number[] = this['basicRelationBitPatterns']
            brbps.forEach(bbp => {
              isBasicRelationBitPattern(nrOfBits, bbp).should.be.true()
            })
          })
          it('returns false for all non-basic bit patterns', function () {
            const rbps: number[] = this['relationBitPatterns']
            const brbps: number[] = this['basicRelationBitPatterns']
            rbps
              .filter(bp => !brbps.map(bbp => bbp).includes(bp))
              .forEach(nonBasicBitPattern => {
                isBasicRelationBitPattern(nrOfBits, nonBasicBitPattern).should.be.false()
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
              nrOfRelations(nrOfBits) + 1,
              Math.pow(2, largestNrOfBits + 2)
            ])
            .forEach(s => {
              it(`returns false for ${inspect(s)}`, function () {
                isBasicRelationBitPattern(nrOfBits, s).should.be.false()
              })
            })
        })
        describe('reverse', function () {
          it('reserves EMPTY to EMPTY', function () {
            reverse(nrOfBits, EMPTY_BIT_PATTERN).should.equal(EMPTY_BIT_PATTERN)
          })
          it('reserves FULL to FULL', function () {
            const FULL = fullBitPattern(nrOfBits)
            reverse(nrOfBits, FULL).should.equal(FULL)
          })
          it('reverses the bitPattern correctly', function () {
            this.timeout(5000)

            function bits (n: number): string[] {
              const result = n.toString(2).split('')
              while (result.length < nrOfBits) {
                result.unshift('0')
              }
              return result
            }

            const rbps: number[] = this['relationBitPatterns']
            rbps.forEach(bitPattern => {
              const sBp = bits(bitPattern)
              const result = reverse(nrOfBits, bitPattern)
              const sR = bits(result)
              sR.should.deepEqual(sBp.reverse())
            })
          })
          it('the reverse of the reverse of a bitPattern is the bitPattern', function () {
            const rbps: number[] = this['relationBitPatterns']
            rbps.forEach(bitPattern => {
              reverse(nrOfBits, reverse(nrOfBits, bitPattern)).should.equal(bitPattern)
            })
          })
        })
      })
    })
  })
  describe('bitCount', function () {
    bitCountCases.forEach(n => {
      it(`works for ${n}`, function () {
        const result = bitCount(n)
        Number.isInteger(result).should.be.true()
        result.should.be.greaterThanOrEqual(0)
        const s = n.toString(2).split('')
        result.should.equal(s.filter(d => d === '1').length)
      })
    })
  })
})
