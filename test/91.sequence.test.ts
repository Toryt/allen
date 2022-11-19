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

import should from 'should'
import { Interval } from '../src/Interval'
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'
import { isSequence } from '../src/sequence'

const sixSymbols = generateSixSymbols('enclosing')

describe('sequence', function () {
  describe('isSequence', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: (a1: T, a2: T) => number): void {
      function callIt (is: Array<Interval<T>>): boolean {
        should(is).be.an.Array()
        return compareFn !== undefined && compareFn !== null ? isSequence(is, compareFn) : isSequence(is)
      }

      describe(label, function () {
        it('returns true for the empty collection', function () {
          callIt([]).should.be.true()
        })
        it('returns true for a singleton collection with a fully definite interval', function () {
          callIt([{ start: points[2], end: points[4] }]).should.be.true()
        })
        it('returns true for a singleton collection with a left-indefinite interval', function () {
          callIt([{ end: points[4] }]).should.be.true()
        })
        it('returns true for a singleton collection with a right-indefinite interval', function () {
          callIt([{ start: points[2] }]).should.be.true()
        })
        it('returns true for a singleton collection with a fully indefinite interval', function () {
          callIt([{}]).should.be.true()
        })
      })
    }

    generateTests<number>('number', sixNumbers)
    generateTests<string>('string', sixStrings)
    generateTests<Date>('Date', sixDates)
    generateTests<symbol>('symbol', sixSymbols, (s1: Symbol, s2: Symbol): number =>
      s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0
    )
  })
})
