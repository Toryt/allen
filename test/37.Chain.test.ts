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
import { isChain } from '../src/Chain'

describe('Chain', function () {
  describe('isChain', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: SafeComparator<T>) {
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
      })
    }

    generateTests('numbers', sixNumbers)
    generateTests('string', sixStrings)
    generateTests('dates', sixDates)
    generateTests('symbols', generateSixSymbols('compare chain intervals'), (s1: Symbol, s2: Symbol): number =>
      s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0
    )
  })
  describe('isChain', function () {})
})
