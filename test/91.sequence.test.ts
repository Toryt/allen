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
import { isOrderedSequence, isSequence, SequenceOptions } from '../src/sequence'
import { AllenRelation, Comparator, ltCompare } from '../src'
import assert from 'assert'

const sixSymbols = generateSixSymbols('enclosing')

function hasSmallerStart<T> (i1: Interval<T>, i2: Interval<T>, compare: Comparator<T>): boolean {
  assert(i2.start !== undefined && i2.start !== null)

  if (i1.start === undefined || i1.start === null) {
    return true
  }
  return compare(i1.start, i2.start) < 0
}

type OptionsBase = Omit<SequenceOptions<any>, 'compareFn'>

interface OptionCase {
  label: string
  optionsBase?: OptionsBase
}

const optionCases: OptionCase[] = [
  { label: 'no extra options' },
  { label: 'leftDefinite', optionsBase: { leftDefinite: true } },
  { label: 'rightDefinite', optionsBase: { rightDefinite: true } },
  { label: 'left- and rightDefinite', optionsBase: { leftDefinite: true, rightDefinite: true } }
]

describe('sequence', function () {
  function generateSequenceTests<T> (
    callIt: (is: Array<Interval<T>>, optionsBase: OptionsBase | undefined) => boolean,
    points: T[],
    unorderedOk: boolean
  ): void {
    optionCases.forEach(({ label, optionsBase }: OptionCase) => {
      describe(label, function () {
        it('returns true for the empty collection', function () {
          callIt([], optionsBase).should.be.true()
        })
        it('returns true for a singleton collection with a fully definite interval', function () {
          callIt([{ start: points[2], end: points[4] }], optionsBase).should.be.true()
        })
        it.only(`returns ${
          optionsBase?.leftDefinite ? 'false' : 'true'
        } for a singleton collection with a left-indefinite interval`, function () {
          callIt([{ end: points[4] }], optionsBase).should.equal(!optionsBase?.leftDefinite)
        })
        it(`returns ${
          optionsBase?.rightDefinite ? 'false' : 'true'
        } for a singleton collection with a right-indefinite interval`, function () {
          callIt([{ start: points[2] }], optionsBase)
            .should.equal(!optionsBase?.rightDefinite)
            .be.true()
        })
        it(`returns ${
          optionsBase?.leftDefinite || optionsBase?.rightDefinite ? 'false' : 'true'
        } for a singleton collection with a fully indefinite interval`, function () {
          callIt([{}], optionsBase).should.equal(!optionsBase?.leftDefinite && !optionsBase?.rightDefinite)
        })
        it('returns true for an ordered sequence of 4 fully definite intervals, with a gap', function () {
          callIt(
            [
              { start: points[0], end: points[1] },
              { start: points[1], end: points[2] },
              { start: points[3], end: points[4] },
              { start: points[4], end: points[5] }
            ],
            optionsBase
          ).should.be.true()
        })
        it('returns true for an ordered sequence of 3 fully definite intervals, without a gap', function () {
          callIt(
            [
              { start: points[0], end: points[1] },
              { start: points[1], end: points[2] },
              { start: points[2], end: points[3] }
            ],
            optionsBase
          ).should.be.true()
        })
        it('returns false for an ordered sequence of 4 fully definite intervals with a duplicate', function () {
          callIt(
            [
              { start: points[0], end: points[1] },
              { start: points[1], end: points[2] },
              { start: points[1], end: points[2] },
              { start: points[4], end: points[5] }
            ],
            optionsBase
          ).should.be.false()
        })
        it('returns false for an ordered sequence of fully definite intervals with a concurrent interval', function () {
          callIt(
            [
              { start: points[0], end: points[1] },
              { start: points[1], end: points[4] },
              { start: points[1], end: points[2] },
              { start: points[4], end: points[5] }
            ],
            optionsBase
          ).should.be.false()
        })
        it(`returns ${
          unorderedOk ? 'true' : 'false'
        } for an unordered sequence of 4 fully definite intervals, with a gap`, function () {
          callIt(
            [
              { start: points[0], end: points[1] },
              { start: points[3], end: points[4] },
              { start: points[1], end: points[2] },
              { start: points[4], end: points[5] }
            ],
            optionsBase
          ).should.equal(unorderedOk)
        })
        it(`returns ${
          unorderedOk ? 'true' : 'false'
        } for an unordered sequence of 3 fully definite intervals, without a gap`, function () {
          callIt(
            [
              { start: points[2], end: points[3] },
              { start: points[0], end: points[1] },
              { start: points[1], end: points[2] }
            ],
            optionsBase
          ).should.equal(unorderedOk)
        })
        it('returns true for an ordered sequence of 4 fully definite intervals, with a gap', function () {
          callIt(
            [
              { start: points[0], end: points[1] },
              { start: points[1], end: points[2] },
              { start: points[3], end: points[4] },
              { start: points[4], end: points[5] }
            ],
            optionsBase
          ).should.be.true()
        })
        it('returns false when intervals concur, and are out of order', function () {
          callIt(
            [
              { start: points[3], end: points[4] },
              { start: points[0], end: points[2] },
              { start: points[4], end: points[5] },
              { start: points[1], end: points[3] }
            ],
            optionsBase
          ).should.be.false()
        })
        it(`returns ${
          optionsBase?.leftDefinite ? 'false' : 'true'
        } for an ordered sequence of that starts with a left-indefinite interval, with a gap`, function () {
          callIt(
            [{ end: points[1] }, { start: points[1], end: points[2] }, { start: points[3], end: points[4] }],
            optionsBase
          ).should.equal(!optionsBase?.leftDefinite)
        })
        it(`returns ${
          optionsBase?.leftDefinite ? 'false' : 'true'
        } for an ordered sequence of that starts with a left-indefinite interval, without a gap`, function () {
          callIt(
            [{ end: points[1] }, { start: points[1], end: points[2] }, { start: points[2], end: points[4] }],
            optionsBase
          ).should.equal(!optionsBase?.leftDefinite)
        })
        it(`returns ${
          optionsBase?.rightDefinite ? 'false' : 'true'
        } for an ordered sequence of that ends with a right-indefinite interval, with a gap`, function () {
          callIt(
            [{ start: points[0], end: points[1] }, { start: points[1], end: points[2] }, { start: points[3] }],
            optionsBase
          ).should.equal(!optionsBase?.rightDefinite)
        })
        it(`returns ${
          optionsBase?.rightDefinite ? 'false' : 'true'
        } for an ordered sequence of that ends with a right-indefinite interval, without a gap`, function () {
          callIt(
            [{ start: points[0], end: points[1] }, { start: points[1], end: points[2] }, { start: points[2] }],
            optionsBase
          ).should.equal(!optionsBase?.rightDefinite)
        })
        it(`returns ${
          optionsBase?.leftDefinite || optionsBase?.rightDefinite ? 'false' : 'true'
        } for an ordered sequence of that starts and ends with a half-indefinite interval, with a gap`, function () {
          callIt(
            [{ end: points[1] }, { start: points[1], end: points[2] }, { start: points[3] }],
            optionsBase
          ).should.equal(!optionsBase?.leftDefinite && !optionsBase?.rightDefinite)
        })
        it(`returns ${
          optionsBase?.leftDefinite || optionsBase?.rightDefinite ? 'false' : 'true'
        } for an ordered sequence of that starts and ends with a half-indefinite interval, without a gap`, function () {
          callIt(
            [{ end: points[1] }, { start: points[1], end: points[2] }, { start: points[3] }],
            optionsBase
          ).should.equal(!optionsBase?.leftDefinite && !optionsBase?.rightDefinite)
        })
        it('returns false for a collection that contains a left-indefinite interval in the middle', function () {
          callIt(
            [{ start: points[0], end: points[1] }, { end: points[2] }, { start: points[2], end: points[3] }],
            optionsBase
          ).should.be.false()
        })
        it('returns false for a collection that contains a right-indefinite interval in the middle', function () {
          callIt(
            [
              { start: points[0], end: points[1] },
              { start: points[1], end: points[2] },
              { start: points[2] },
              { start: points[3], end: points[4] }
            ],
            optionsBase
          ).should.be.false()
        })
        it('returns false for a collection that contains 2 left-indefinite intervals', function () {
          callIt([{ end: points[1] }, { end: points[2] }], optionsBase).should.be.false()
        })
        it('returns false for a collection that contains a right-indefinite interval with the same definite start as a previous one', function () {
          callIt([{ start: points[0], end: points[1] }, { start: points[0] }], optionsBase).should.be.false()
        })
        it('returns false for a collection that contains a right-indefinite interval with the same definite start as a later one', function () {
          callIt([{ start: points[0] }, { start: points[0], end: points[1] }], optionsBase).should.be.false()
        })
        it('returns false for a collection that contains 2 right-indefinite intervals with the same definite start', function () {
          callIt([{ start: points[0] }, { start: points[0] }], optionsBase).should.be.false()
        })
      })
    })
  }

  describe('isOrderedSequence', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: (a1: T, a2: T) => number): void {
      function callIt (is: Array<Interval<T>>, optionsBase: OptionsBase | undefined): boolean {
        const options: SequenceOptions<T> | undefined =
          optionsBase === undefined
            ? compareFn === undefined || compareFn === null
              ? undefined
              : { compareFn }
            : compareFn === undefined || compareFn === null
            ? optionsBase
            : { ...optionsBase, compareFn }
        const result = options === undefined ? isOrderedSequence(is) : isOrderedSequence(is, options)
        const compare = compareFn !== undefined && compareFn !== null ? compareFn : ltCompare
        should(result).equal(
          is.every(
            (j: Interval<T>, index: number) =>
              index === 0 ||
              (AllenRelation.relation(j, is[index - 1], compare).implies(AllenRelation.DOES_NOT_CONCUR_WITH) &&
                hasSmallerStart(is[index - 1], j, compare))
          )
        )
        return result
      }

      describe(label, function () {
        generateSequenceTests(callIt, points, false)
      })
    }

    generateTests<number>('number', sixNumbers)
    generateTests<string>('string', sixStrings)
    generateTests<Date>('Date', sixDates)
    generateTests<symbol>('symbol', sixSymbols, (s1: Symbol, s2: Symbol): number =>
      s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0
    )
  })
  describe('isSequence', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: (a1: T, a2: T) => number): void {
      function callIt (is: Array<Interval<T>>, optionsBase: OptionsBase | undefined): boolean {
        const options: SequenceOptions<T> | undefined =
          optionsBase === undefined
            ? compareFn === undefined || compareFn === null
              ? undefined
              : { compareFn }
            : compareFn === undefined || compareFn === null
            ? optionsBase
            : { ...optionsBase, compareFn }
        const result = options === undefined ? isSequence(is) : isSequence(is, options)
        const compare = compareFn !== undefined && compareFn !== null ? compareFn : ltCompare
        should(result).equal(
          is.every((i: Interval<T>) =>
            is.every(
              (j: Interval<T>) =>
                i === j || AllenRelation.relation(i, j, compare).implies(AllenRelation.DOES_NOT_CONCUR_WITH)
            )
          )
        )
        return result
      }

      describe(label, function () {
        generateSequenceTests(callIt, points, true)
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
