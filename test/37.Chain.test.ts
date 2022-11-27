/*
 Copyright © 2022 by Jan Dockx

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

import 'should'
import { SafeComparator } from '../src/Comparator'
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'
import { Chain, chainToGaplessLeftDefiniteSequence, isChain } from '../src/Chain'
import { stuffWithUndefined } from './_stuff'
import { inspect } from 'util'
import { Interval, isSequence, SequenceOptions } from '../src'
import assert from 'assert'

describe('Chain', function () {
  describe('isChain', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: SafeComparator<T>): void {
      function callIt (cis: unknown): boolean {
        return compareFn === undefined || compareFn === null ? isChain(cis) : isChain(cis, compareFn)
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

    generateTests('numbers', sixNumbers)
    generateTests('string', sixStrings)
    generateTests('dates', sixDates)
    generateTests('symbols', generateSixSymbols('compare chain intervals'), (s1: Symbol, s2: Symbol): number =>
      s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0
    )
  })
  describe('chainToGaplessLeftDefiniteSequence', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: SafeComparator<T>): void {
      function callIt (cis: Chain<T>): ReadonlyArray<Interval<T>> {
        return compareFn === undefined || compareFn === null
          ? chainToGaplessLeftDefiniteSequence(cis)
          : chainToGaplessLeftDefiniteSequence(cis, compareFn)
      }

      const sequenceOptions: SequenceOptions<T> = { leftDefinite: true, ordered: true, gaps: false }
      if (compareFn !== undefined && compareFn !== null) {
        sequenceOptions.compareFn = compareFn
      }

      describe(label, function () {
        it('returns the expected sequence for the empty collection', function () {
          const empty: any[] = []
          assert(isChain<T>(empty))
          const result = callIt(empty)
          isSequence<T>(result, sequenceOptions).should.be.true()
        })
        it('returns the expected sequence for a singleton', function () {
          const singleton: any[] = [[{ start: points[0] }]]
          assert(isChain<T>(singleton))
          const result = callIt(singleton)
          isSequence<T>(result, sequenceOptions).should.be.true()
        })
        it('returns the expected sequence for an ordered chain', function () {
          const orderedChain: any[] = [{ start: points[0] }, { start: points[1] }, { start: points[2] }]
          assert(isChain<T>(orderedChain))
          const result = callIt(orderedChain)
          isSequence<T>(result, sequenceOptions).should.be.true()
        })
        it('returns the expected sequence for an unordered chain', function () {
          const unorderedChain: any[] = [{ start: points[0] }, { start: points[4] }, { start: points[2] }]
          assert(isChain<T>(unorderedChain))
          const result = callIt(unorderedChain)
          isSequence<T>(result, sequenceOptions).should.be.true()
        })
      })
    }

    generateTests('numbers', sixNumbers)
    generateTests('string', sixStrings)
    generateTests('dates', sixDates)
    generateTests('symbols', generateSixSymbols('compare chain intervals'), (s1: Symbol, s2: Symbol): number =>
      s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0
    )
  })
})
