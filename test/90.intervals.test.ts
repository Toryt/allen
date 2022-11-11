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
import { ENCLOSES, isEnclosing } from '../src/intervals'
import { AllenRelation, Interval } from '../src'

const fivePoints = [-6, -4.983458, -1, 2, Math.PI]
const fiveStrings = [
  'a smallest i point',
  'b less small i point',
  'c medium i point',
  'd larger i point',
  'e largest i point'
]
const fiveDates = [
  new Date(2006, 9, 3, 19, 49, 34, 848),
  new Date(2011, 9, 3, 19, 49, 34, 848),
  new Date(2015, 9, 3, 19, 49, 34, 848),
  new Date(2018, 9, 3, 19, 49, 34, 848),
  new Date(2022, 9, 3, 19, 49, 34, 848)
]
const fiveSymbols = fiveStrings.map(s => Symbol(s))

describe('intervals', function () {
  describe('ENCLOSES', function () {
    it('is an AllenRelation', function () {
      should(ENCLOSES).be.an.instanceof(AllenRelation)
    })
    it('is FDeS', function () {
      ENCLOSES.toString().should.equal('(FDeS)')
    })
  })
  describe('isEnclosing', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: (a1: T, a2: T) => number) {
      function callIt (i: Interval<T>, is: Interval<T>[]): boolean {
        return compareFn !== undefined && compareFn !== null ? isEnclosing(i, is, compareFn) : isEnclosing(i, is)
      }

      describe(label, function () {
        it('itself encloses itself as singleton', function () {
          const itself = { start: points[0], end: points[1] }
          callIt(itself, [itself]).should.be.true()
        })
        // it('returns true when all intervals in `is` are enclosed by `i`')
      })
    }

    generateTests<number>('number', fivePoints)
    generateTests<string>('string', fiveStrings)
    generateTests<Date>('Date', fiveDates)
    generateTests<symbol>('symbol', fiveSymbols)
  })
})
