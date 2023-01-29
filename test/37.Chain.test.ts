/*
 Copyright © 2022 – 2023 by Jan Dockx

 Licensed under the Apache License, Version 2.0 (the “License”);
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an “AS IS” BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* eslint-env mocha */

import { type Comparator } from '../src/Comparator'
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'
import { type Chain, chainToGaplessLeftDefiniteSequence, isChain } from '../src/Chain'
import { stuffWithUndefined } from './_stuff'
import { inspect } from 'util'
import { type ChainInterval, compareChainIntervals } from '../src/ChainInterval'
import { type Interval } from '../src/Interval'
import { isSequence, type SequenceOptions } from '../src/isSequence'
import assert from 'assert'
import should from 'should'
import { type TypeFor, type TypeRepresentation } from '../src'

describe('Chain', function () {
  describe('isChain', function () {
    function generateTests<T> (label: string, ptr: TypeRepresentation, points: T[], compareFn?: Comparator<T>): void {
      function callIt (cis: unknown): boolean {
        return compareFn === undefined || compareFn === null ? isChain(cis, ptr) : isChain(cis, ptr, compareFn)
      }

      describe(label, function () {
        it('returns true for the empty collection', function () {
          callIt([]).should.be.true()
        })
        it('returns true for a singleton', function () {
          callIt([{ start: points[0] }]).should.be.true()
        })
        it('returns true for an ordered chain', function () {
          callIt([{ start: points[0] }, { start: points[1] }, { start: points[2] }]).should.be.true()
        })
        it('returns true for an unordered chain', function () {
          callIt([{ start: points[0] }, { start: points[4] }, { start: points[2] }]).should.be.true()
        })
        it('returns false when there is an element that is not a ChainInterval', function () {
          callIt([{ start: points[0] }, { notAstart: 'this is not a start' }, { start: points[2] }]).should.be.false()
        })
        it('returns false when the first element is repeated', function () {
          callIt([
            { start: points[0] },
            { start: points[1] },
            { start: points[0] },
            { start: points[2] }
          ]).should.be.false()
        })
        it('returns false when an element is repeated', function () {
          callIt([
            { start: points[0] },
            { start: points[1] },
            { start: points[2] },
            { start: points[1] }
          ]).should.be.false()
        })
        it('returns false for a collection with an aberrant start', function () {
          callIt([
            { start: points[0] },
            { start: label === 'numbers' ? 'a string' : 4533452 },
            { start: points[2] }
          ]).should.be.false()
        })
        describe('bogus', function () {
          stuffWithUndefined
            .filter(s => !Array.isArray(s) || s.length > 0)
            .forEach(s => {
              it(`returns false for ${inspect(s)}`, function () {
                callIt(s).should.be.false()
              })
            })
        })
      })
    }

    generateTests('numbers', 'number', sixNumbers)
    generateTests('string', 'string', sixStrings)
    generateTests('dates', Date, sixDates)
    generateTests(
      'symbols',
      'symbol',
      generateSixSymbols('compare chain intervals'),
      (s1: symbol, s2: symbol): number => (s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0)
    )
  })
  describe('chainToGaplessLeftDefiniteSequence', function () {
    function generateTests<TR extends TypeRepresentation> (
      label: string,
      ptr: TR,
      points: Array<TypeFor<TR>>,
      compareFn?: Comparator<TypeFor<TR>>
    ): void {
      const sequenceOptions: SequenceOptions<TypeFor<TR>> = { gaps: false, leftDefinite: true, ordered: true }
      if (compareFn !== undefined && compareFn !== null) {
        sequenceOptions.compareFn = compareFn
      }

      function callIt (cis: Chain<TypeFor<TR>>): ReadonlyArray<Readonly<Interval<TypeFor<TR>>>> {
        return compareFn === undefined || compareFn === null
          ? chainToGaplessLeftDefiniteSequence(cis)
          : chainToGaplessLeftDefiniteSequence(cis, compareFn)
      }

      describe(label, function () {
        it('returns the expected sequence for the empty collection', function () {
          const chain: any[] = []
          assert(isChain<TR>(chain, ptr, compareFn))
          const result = callIt(chain)
          isSequence<TypeFor<TR>>(result, sequenceOptions).should.be.true()
          result.length.should.equal(chain.length)
        })
        it('returns the expected sequence for a singleton', function () {
          const chain: any[] = [{ start: points[0] }]
          assert(isChain<TR>(chain, ptr, compareFn))
          const result = callIt(chain)
          isSequence<TypeFor<TR>>(result, sequenceOptions).should.be.true()
          result.length.should.equal(chain.length)
          should(Object.getPrototypeOf(result[0])).equal(chain[0])
        })
        it('returns the expected sequence for an ordered chain', function () {
          const chain: any[] = [{ start: points[0] }, { start: points[1] }, { start: points[2] }]
          assert(isChain<TR>(chain, ptr, compareFn))
          const result = callIt(chain)
          isSequence<TypeFor<TR>>(result, sequenceOptions).should.be.true()
          result.length.should.equal(chain.length)
          result.forEach((ci, index) => {
            should(Object.getPrototypeOf(ci)).equal(chain[index])
          })
        })
        it('returns the expected sequence for an unordered chain', function () {
          const chain: any[] = [{ start: points[0] }, { start: points[4] }, { start: points[2] }]
          assert(isChain<TR>(chain, ptr, compareFn))
          const result = callIt(chain)
          isSequence<TypeFor<TR>>(result, sequenceOptions).should.be.true()
          result.length.should.equal(chain.length)
          const sorted = chain.sort((ci1: ChainInterval<TypeFor<TR>>, ci2: ChainInterval<TypeFor<TR>>) =>
            compareChainIntervals(ci1, ci2, compareFn)
          )
          result.forEach((ci, index) => {
            should(Object.getPrototypeOf(ci)).equal(sorted[index])
          })
        })
      })
    }

    generateTests('numbers', 'number', sixNumbers)
    generateTests('string', 'string', sixStrings)
    generateTests('dates', Date, sixDates)
    generateTests(
      'symbols',
      'symbol',
      generateSixSymbols('compare chain intervals'),
      (s1: symbol, s2: symbol): number => (s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0)
    )
  })
})
