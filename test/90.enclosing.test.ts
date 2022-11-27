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
import { isEnclosing, isMinimalEnclosing, minimalEnclosing } from '../src/enclosing'
import { AllenRelation } from '../src/AllenRelation'
import { Interval } from '../src/Interval'
import { ltCompare } from '../src/ltCompare'
import assert, { ok } from 'assert'
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'

const sixSymbols = generateSixSymbols('enclosing')

describe('enclosing', function () {
  describe('isEnclosing', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: (a1: T, a2: T) => number): void {
      function callIt (i: Interval<T>, is: Array<Interval<T>>): boolean {
        return compareFn !== undefined && compareFn !== null ? isEnclosing(i, is, compareFn) : isEnclosing(i, is)
      }

      describe(label, function () {
        const aCollection = [
          { start: points[2], end: points[4] },
          { start: points[1], end: points[3] },
          { start: points[2], end: points[3] },
          { start: points[1], end: points[3] }, // deliberate duplicate
          { start: points[1], end: points[4] }
        ]

        it('itself encloses itself as singleton', function () {
          const itself = { start: points[0], end: points[1] }
          callIt(itself, [itself]).should.be.true()
        })
        it('returns true for the empty set of `is`', function () {
          const itself = { start: points[0], end: points[1] }
          callIt(itself, []).should.be.true()
        })
        it('returns true when all intervals in `is` are enclosed by `i`', function () {
          callIt({ start: points[0], end: points[5] }, aCollection).should.be.true()
        })
        it('returns true when all intervals in `is` are right-minimally enclosed by `i`', function () {
          callIt({ start: points[0], end: points[4] }, aCollection).should.be.true()
        })
        it('returns true when all intervals in `is` are left-minimally enclosed by `i`', function () {
          callIt({ start: points[1], end: points[5] }, aCollection).should.be.true()
        })
        it('returns true when all intervals in `is` are minimally enclosed by `i`', function () {
          callIt({ start: points[1], end: points[4] }, aCollection).should.be.true()
        })
        it('returns false when some intervals in `is` are not enclosed by `i`', function () {
          callIt({ start: points[2], end: points[5] }, aCollection).should.be.false()
        })
        it('returns false when `i` is left indefinite', function () {
          callIt({ end: points[4] }, aCollection).should.be.false()
        })
        it('returns false when `i` is right indefinite', function () {
          callIt({ start: points[0] }, aCollection).should.be.false()
        })
        it('returns false when `i` is fully indefinite', function () {
          callIt({}, aCollection).should.be.false()
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
          callIt({ start: points[2], end: points[3] }, [
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

    generateTests<number>('number', sixNumbers)
    generateTests<string>('string', sixStrings)
    generateTests<Date>('Date', sixDates)
    generateTests<symbol>('symbol', sixSymbols, (s1: Symbol, s2: Symbol): number =>
      s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0
    )
  })

  interface EnclosingCase<T> {
    label: string
    is: Array<Interval<T>>
    expected: Interval<T>
  }

  function generateEnclosingCases<T> (points: T[]): Array<EnclosingCase<T>> {
    // expected.start < index 2, expected.end > index 3
    return [
      { label: 'empty collection', is: [], expected: {} },
      {
        label: 'singleton of fully definite interval',
        is: [{ start: points[1], end: points[4] }],
        expected: { start: points[1], end: points[4] }
      },
      {
        label: 'collection 1 with fully definite intervals',
        is: [
          { start: points[2], end: points[4] },
          { start: points[1], end: points[3] },
          { start: points[2], end: points[3] }
        ],
        expected: { start: points[1], end: points[4] }
      },
      {
        label: 'collection 2 with fully definite intervals',
        is: [
          { start: points[2], end: points[3] },
          { start: points[0], end: points[1] },
          { start: points[2], end: points[4] }
        ],
        expected: { start: points[0], end: points[4] }
      },
      {
        label: 'collection with fully definite intervals, including the result',
        is: [
          { start: points[2], end: points[4] },
          { start: points[0], end: points[5] },
          { start: points[2], end: points[3] },
          { start: points[0], end: points[4] }
        ],
        expected: { start: points[0], end: points[5] }
      },
      {
        label: 'collection with some left-indefinite intervals',
        is: [
          { start: points[2], end: points[3] },
          { end: points[1] },
          { end: points[5] },
          { start: points[0], end: points[2] }
        ],
        expected: { end: points[5] }
      },
      {
        label: 'collection with some right-indefinite intervals',
        is: [
          { start: points[2], end: points[4] },
          { start: points[0], end: points[1] },
          { start: points[2] },
          { start: points[0] }
        ],
        expected: { start: points[0] }
      },
      {
        label: 'collection with some fully indefinite intervals',
        is: [{ start: points[2], end: points[4] }, { start: points[0], end: points[1] }, {}, { start: points[0] }],
        expected: {}
      },
      {
        label: 'collection with only fully indefinite intervals',
        is: [{}, {}, {}, {}],
        expected: {}
      }
    ]
  }

  describe('isMinimalEnclosing', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: (a1: T, a2: T) => number): void {
      // function compare (t1: T, t2: T): number {
      //   return compareFn !== undefined && compareFn !== null ? compareFn(t1, t2) : ltCompare(t1, t2)
      // }

      function callIt (i: Interval<T>, is: Array<Interval<T>>): boolean {
        return compareFn !== undefined && compareFn !== null
          ? isMinimalEnclosing(i, is, compareFn)
          : isMinimalEnclosing(i, is)
      }

      const enclosingCases: Array<EnclosingCase<T>> = generateEnclosingCases(points)

      describe(label, function () {
        enclosingCases.forEach((c: EnclosingCase<T>) => {
          if (c.expected.start !== undefined && c.expected.end !== undefined) {
            it(`returns true for ${c.label} with the enclosing interval`, function () {
              callIt(c.expected, c.is).should.be.true()
            })
            it(`returns false for ${c.label} with a left-indefinite enclosing interval`, function () {
              const i = { end: c.expected.end }
              callIt(i, c.is).should.be.false()
            })
            it(`returns false for ${c.label} with a right-indefinite enclosing interval`, function () {
              const i = { start: c.expected.start }
              callIt(i, c.is).should.be.false()
            })
            it(`returns false for ${c.label} with a fully indefinite enclosing interval`, function () {
              const i = {}
              callIt(i, c.is).should.be.false()
            })
            it(`returns false for ${c.label} with a fully definite enclosing interval that starts too late`, function () {
              const i = { start: points[2], end: c.expected.end }
              callIt(i, c.is).should.be.false()
            })
            it(`returns false for ${c.label} with a fully definite enclosing interval that ends too early`, function () {
              const i = { start: c.expected.start, end: points[3] }
              callIt(i, c.is).should.be.false()
            })
          } else {
            it(`returns false for ${c.label} because the enclosing interval is not definite`, function () {
              callIt(c.expected, c.is).should.be.false()
            })
            it(`returns false for ${c.label} because there are indefinite intervals`, function () {
              const i = { start: points[0], end: points[4] }
              callIt(i, c.is).should.be.false()
            })
          }
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
  describe('minimalEnclosing', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: (a1: T, a2: T) => number): void {
      function compare (t1: T, t2: T): number {
        return compareFn !== undefined && compareFn !== null ? compareFn(t1, t2) : ltCompare(t1, t2)
      }

      function callIt (is: Array<Interval<T>>): Interval<T> {
        return compareFn !== undefined && compareFn !== null ? minimalEnclosing(is, compareFn) : minimalEnclosing(is)
      }

      function callIsMinimalEnclosing (i: Interval<T>, is: Array<Interval<T>>): boolean {
        return compareFn !== undefined && compareFn !== null
          ? isMinimalEnclosing(i, is, compareFn)
          : isMinimalEnclosing(i, is)
      }

      const enclosingCases: Array<EnclosingCase<T>> = generateEnclosingCases(points)

      describe(label, function () {
        enclosingCases.forEach((c: EnclosingCase<T>) => {
          it(`returns the expected result for the ${c.label}`, function () {
            const result = callIt(c.is)

            result.should.be.ok()
            c.is.forEach(i => AllenRelation.relation(result, i, compareFn).implies(AllenRelation.ENCLOSES))

            const resultStart = result.start
            assert(resultStart !== null)
            const resultEnd = result.end
            assert(resultEnd !== null)

            if (resultStart !== undefined) {
              c.is.forEach(i => {
                ok(i.start)
                compare(resultStart, i.start).should.be.lessThanOrEqual(0)
              })
              ok(c.expected.start)
              compare(resultStart, c.expected.start).should.equal(0)
            } else {
              if (c.is.length > 0) {
                c.is.some(i => i.start === undefined || i.start === null).should.be.true()
              }
              should(c.expected.start).be.undefined()
            }
            if (resultEnd !== undefined) {
              c.is.forEach(i => {
                ok(i.end)
                compare(i.end, resultEnd).should.be.lessThanOrEqual(0)
              })
              ok(c.expected.end)
              compare(resultEnd, c.expected.end).should.equal(0)
            } else {
              if (c.is.length > 0) {
                c.is.some(i => i.end === undefined || i.end === null).should.be.true()
              }
              should(c.expected.end).be.undefined()
            }
            if (resultStart !== undefined && resultEnd !== undefined) {
              callIsMinimalEnclosing(result, c.is).should.be.true()
            } else {
              callIsMinimalEnclosing(result, c.is).should.be.false()
            }
          })
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
