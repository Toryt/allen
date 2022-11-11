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
import { AllenRelation } from '../src/AllenRelation'
import { Interval } from '../src/Interval'

const sixPoints = [-6, -4.983458, -1, 2, Math.PI, 23455]
const sixStrings = [
  'a smallest i point',
  'b less small i point',
  'c medium i point',
  'd larger i point',
  'e largest i point',
  'f supper i point'
]
const sixDates = [
  new Date(2006, 9, 3, 19, 49, 34, 848),
  new Date(2011, 9, 3, 19, 49, 34, 848),
  new Date(2015, 9, 3, 19, 49, 34, 848),
  new Date(2018, 9, 3, 19, 49, 34, 848),
  new Date(2022, 9, 3, 19, 49, 34, 848),
  new Date(2048, 9, 3, 19, 49, 34, 848)
]
const sixSymbols = sixStrings.map(s => Symbol(s))

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
        const aCollection = [
          { start: points[2], end: points[4] },
          { start: points[1], end: points[1] },
          { start: points[1], end: points[3] },
          { start: points[2], end: points[3] },
          { start: points[3], end: points[3] },
          { start: points[1], end: points[3] }, // deliberate duplicate
          { start: points[1], end: points[4] }
        ]

        it('itself encloses itself as singleton', function () {
          const itself = { start: points[0], end: points[1] }
          callIt(itself, [itself]).should.be.true()
        })
        it('itself encloses itself as singleton when it is degenerate', function () {
          const itself = { start: points[0], end: points[0] }
          callIt(itself, [itself]).should.be.true()
        })
        it('returns true for the empty set of `is`', function () {
          const itself = { start: points[0], end: points[1] }
          callIt(itself, []).should.be.true()
        })
        it('returns true when all intervals in `is` are enclosed by `i` (with some degenerate intervals)', function () {
          callIt({ start: points[0], end: points[5] }, aCollection).should.be.true()
        })
        it('returns true when all intervals in `is` are right-minimally enclosed by `i` (with some degenerate intervals)', function () {
          callIt({ start: points[0], end: points[4] }, aCollection).should.be.true()
        })
        it('returns true when all intervals in `is` are left-minimally enclosed by `i` (with some degenerate intervals)', function () {
          callIt({ start: points[1], end: points[5] }, aCollection).should.be.true()
        })
        it('returns true when all intervals in `is` are minimally enclosed by `i` (with some degenerate intervals)', function () {
          callIt({ start: points[1], end: points[4] }, aCollection).should.be.true()
        })
        it('returns false when some intervals in `is` are not enclosed by `i` (with some degenerate intervals)', function () {
          callIt({ start: points[2], end: points[5] }, aCollection).should.be.false()
        })
        it('returns false when `i` is degenerate', function () {
          callIt({ start: points[2], end: points[5] }, aCollection).should.be.false()
        })
        it('returns false when `i` is fully indefinite', function () {
          callIt({}, aCollection).should.be.false()
        })
        it('returns false when `i` is left indefinite', function () {
          callIt({ end: points[4] }, aCollection).should.be.false()
        })
        it('returns false when `i` is right indefinite', function () {
          callIt({ start: points[0] }, aCollection).should.be.false()
        })
        it('returns false when `i` is indefinite, and there are indefinite intervals in `i`', function () {
          callIt({}, [
            { start: points[2], end: points[4] },
            { start: points[0], end: points[1] },
            { end: points[3] },
            { start: points[2], end: points[4] },
            { start: points[3] },
            { start: points[0], end: points[4] }
          ]).should.be.false()
        })
        it('returns false when `i` is definite, and there are indefinite intervals in `i`', function () {
          callIt({ start: points[2], end: points[2] }, [
            { start: points[2], end: points[4] },
            { start: points[0], end: points[1] },
            { end: points[3] },
            { start: points[2], end: points[4] },
            { start: points[3] },
            { start: points[0], end: points[4] }
          ]).should.be.false()
        })
      })
    }

    generateTests<number>('number', sixPoints)
    generateTests<string>('string', sixStrings)
    generateTests<Date>('Date', sixDates)
    generateTests<symbol>('symbol', sixSymbols, (s1: Symbol, s2: Symbol): number =>
      s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0
    )
  })
})
