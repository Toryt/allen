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
import { isSequence, SequenceOptions } from '../src/sequence'
import { AllenRelation, Comparator, ltCompare } from '../src'
import assert from 'assert'
import { intervalToString } from './_intervalToString'

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
  { label: 'left- and rightDefinite', optionsBase: { leftDefinite: true, rightDefinite: true } },
  { label: 'ordered', optionsBase: { ordered: true } },
  { label: 'ordered, leftDefinite', optionsBase: { ordered: true, leftDefinite: true } },
  { label: 'ordered, rightDefinite', optionsBase: { ordered: true, rightDefinite: true } },
  {
    label: 'ordered, left- and rightDefinite',
    optionsBase: { ordered: true, leftDefinite: true, rightDefinite: true }
  },
  { label: 'must touch', optionsBase: { gaps: false } },
  { label: 'leftDefinite, must touch', optionsBase: { leftDefinite: true, gaps: false } },
  { label: 'rightDefinite, must touch', optionsBase: { rightDefinite: true, gaps: false } },
  {
    label: 'left- and rightDefinite, must touch',
    optionsBase: { leftDefinite: true, rightDefinite: true, gaps: false }
  },
  { label: 'ordered, must touch', optionsBase: { ordered: true, gaps: false } },
  { label: 'ordered, leftDefinite, must touch', optionsBase: { ordered: true, leftDefinite: true, gaps: false } },
  {
    label: 'ordered, rightDefinite, must touch',
    optionsBase: { ordered: true, rightDefinite: true, gaps: false }
  },
  {
    label: 'ordered, left- and rightDefinite, must touch',
    optionsBase: { ordered: true, leftDefinite: true, rightDefinite: true, gaps: false }
  },
  { label: 'separate', optionsBase: { gaps: true } },
  { label: 'leftDefinite, separate', optionsBase: { leftDefinite: true, gaps: true } },
  { label: 'rightDefinite, separate', optionsBase: { rightDefinite: true, gaps: true } },
  {
    label: 'left- and rightDefinite, separate',
    optionsBase: { leftDefinite: true, rightDefinite: true, gaps: true }
  },
  { label: 'ordered, separate', optionsBase: { ordered: true, gaps: true } },
  { label: 'ordered, leftDefinite, separate', optionsBase: { ordered: true, leftDefinite: true, gaps: true } },
  {
    label: 'ordered, rightDefinite, separate',
    optionsBase: { ordered: true, rightDefinite: true, gaps: true }
  },
  {
    label: 'ordered, left- and rightDefinite, separate',
    optionsBase: { ordered: true, leftDefinite: true, rightDefinite: true, gaps: true }
  }
]

describe('sequence', function () {
  function generateSequenceTests<T> (
    callIt: (is: Array<Interval<T>>, optionsBase: OptionsBase | undefined) => boolean,
    points: T[]
  ): void {
    optionCases.forEach(({ label, optionsBase }: OptionCase) => {
      const ordered: boolean = optionsBase?.ordered ?? false
      const leftDefinite: boolean = optionsBase?.leftDefinite ?? false
      const rightDefinite: boolean = optionsBase?.rightDefinite ?? false
      const dontCareAboutGaps: boolean = optionsBase?.gaps === undefined
      // MUDO const cannotTouch: boolean = optionsBase?.separate !== undefined && optionsBase.separate
      const mustTouch: boolean = optionsBase?.gaps !== undefined && !optionsBase.gaps
      describe(label, function () {
        it('returns true for the empty collection', function () {
          callIt([], optionsBase).should.be.true()
        })
        it('returns true for a singleton collection with a fully definite interval', function () {
          callIt([{ start: points[2], end: points[4] }], optionsBase).should.be.true()
        })
        it(`returns ${
          leftDefinite ? 'false' : 'true'
        } for a singleton collection with a left-indefinite interval`, function () {
          callIt([{ end: points[4] }], optionsBase).should.equal(!leftDefinite)
        })
        it(`returns ${
          rightDefinite ? 'false' : 'true'
        } for a singleton collection with a right-indefinite interval`, function () {
          callIt([{ start: points[2] }], optionsBase).should.equal(!rightDefinite)
        })
        it(`returns ${
          leftDefinite || rightDefinite ? 'false' : 'true'
        } for a singleton collection with a fully indefinite interval`, function () {
          callIt([{}], optionsBase).should.equal(!leftDefinite && !rightDefinite)
        })
        it(`returns ${
          dontCareAboutGaps ? 'true' : 'false'
        } for an ordered sequence of 4 fully definite intervals, with a gap`, function () {
          callIt(
            [
              { start: points[0], end: points[1] },
              { start: points[1], end: points[2] },
              { start: points[3], end: points[4] },
              { start: points[4], end: points[5] }
            ],
            optionsBase
          ).should.equal(dontCareAboutGaps)
        })
        it(`returns ${
          dontCareAboutGaps || mustTouch ? 'true' : 'false'
        } for an ordered sequence of 3 fully definite intervals, without a gap`, function () {
          callIt(
            [
              { start: points[0], end: points[1] },
              { start: points[1], end: points[2] },
              { start: points[2], end: points[3] }
            ],
            optionsBase
          ).should.equal(dontCareAboutGaps || mustTouch)
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
          !ordered && dontCareAboutGaps ? 'true' : 'false'
        } for an unordered sequence of 4 fully definite intervals, with a gap`, function () {
          callIt(
            [
              { start: points[0], end: points[1] },
              { start: points[3], end: points[4] },
              { start: points[1], end: points[2] },
              { start: points[4], end: points[5] }
            ],
            optionsBase
          ).should.equal(!ordered && dontCareAboutGaps)
        })
        it(`returns ${
          !ordered && (dontCareAboutGaps || mustTouch) ? 'true' : 'false'
        } for an unordered sequence of 3 fully definite intervals, without a gap`, function () {
          callIt(
            [
              { start: points[2], end: points[3] },
              { start: points[0], end: points[1] },
              { start: points[1], end: points[2] }
            ],
            optionsBase
          ).should.equal(!ordered && (dontCareAboutGaps || mustTouch))
        })
        it(`returns ${
          dontCareAboutGaps ? 'true' : 'false'
        } for an ordered sequence of 4 fully definite intervals, with a gap`, function () {
          callIt(
            [
              { start: points[0], end: points[1] },
              { start: points[1], end: points[2] },
              { start: points[3], end: points[4] },
              { start: points[4], end: points[5] }
            ],
            optionsBase
          ).should.equal(dontCareAboutGaps)
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
          !leftDefinite && dontCareAboutGaps ? 'true' : 'false'
        } for an ordered sequence that starts with a left-indefinite interval, with a gap`, function () {
          callIt(
            [{ end: points[1] }, { start: points[1], end: points[2] }, { start: points[3], end: points[4] }],
            optionsBase
          ).should.equal(!leftDefinite && dontCareAboutGaps)
        })
        it(`returns ${
          !leftDefinite && (dontCareAboutGaps || mustTouch) ? 'true' : 'false'
        } for an ordered sequence that starts with a left-indefinite interval, without a gap`, function () {
          callIt(
            [{ end: points[1] }, { start: points[1], end: points[2] }, { start: points[2], end: points[4] }],
            optionsBase
          ).should.equal(!leftDefinite && (dontCareAboutGaps || mustTouch))
        })
        it(`returns ${
          !rightDefinite && dontCareAboutGaps ? 'true' : 'false'
        } for an ordered sequence that ends with a right-indefinite interval, with a gap`, function () {
          callIt(
            [{ start: points[0], end: points[1] }, { start: points[1], end: points[2] }, { start: points[3] }],
            optionsBase
          ).should.equal(!rightDefinite && dontCareAboutGaps)
        })
        it(`returns ${
          !rightDefinite && (dontCareAboutGaps || mustTouch) ? 'true' : 'false'
        } for an ordered sequence that ends with a right-indefinite interval, without a gap`, function () {
          callIt(
            [{ start: points[0], end: points[1] }, { start: points[1], end: points[2] }, { start: points[2] }],
            optionsBase
          ).should.equal(!rightDefinite && (dontCareAboutGaps || mustTouch))
        })
        it(`returns ${
          !leftDefinite && !rightDefinite && dontCareAboutGaps ? 'true' : 'false'
        } for an ordered sequence that starts and ends with a half-indefinite interval, with a gap`, function () {
          callIt(
            [{ end: points[1] }, { start: points[1], end: points[2] }, { start: points[3] }],
            optionsBase
          ).should.equal(!leftDefinite && !rightDefinite && dontCareAboutGaps)
        })
        it(`returns ${
          !leftDefinite && !rightDefinite && (dontCareAboutGaps || mustTouch) ? 'true' : 'false'
        } for an ordered sequence that starts and ends with a half-indefinite interval, without a gap`, function () {
          callIt(
            [{ end: points[1] }, { start: points[1], end: points[2] }, { start: points[2] }],
            optionsBase
          ).should.equal(!leftDefinite && !rightDefinite && (dontCareAboutGaps || mustTouch))
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

  describe('isSequence', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: (a1: T, a2: T) => number): void {
      function callIt (is: Array<Interval<T>>, optionsBase: OptionsBase | undefined): boolean {
        const options: SequenceOptions<T> | undefined =
          optionsBase === undefined
            ? compareFn === undefined || compareFn === null
              ? undefined
              : { compareFn }
            : /* prettier-ignore */ compareFn === undefined || compareFn === null
              ? optionsBase
              : { ...optionsBase, compareFn }
        const result = options === undefined ? isSequence(is) : isSequence(is, options)
        const compare = compareFn !== undefined && compareFn !== null ? compareFn : ltCompare
        const EARLIER = AllenRelation.fromString<AllenRelation>('mp')
        // the definition, split in parts
        if (is.length <= 0) {
          result.should.be.true()
        } else {
          if ((optionsBase?.leftDefinite ?? false) && (is[0].start === undefined || is[0].start === null)) {
            result.should.be.false()
          }
          if (
            (optionsBase?.rightDefinite ?? false) &&
            (is[is.length - 1].end === undefined || is[is.length - 1].end === null)
          ) {
            result.should.be.false()
          }
          const first: Interval<T> = is.reduce(
            (acc: Interval<T>, j: Interval<T>) => (AllenRelation.relation(acc, j, compare).implies(EARLIER) ? acc : j),
            is[0]
          )
          is.forEach((i: Interval<T>, index: number) => {
            if (
              optionsBase?.ordered === true &&
              index !== 0 &&
              i.start !== undefined &&
              i.start !== null &&
              !hasSmallerStart(is[index - 1], i, compare)
            ) {
              result.should.be.false()
            } else {
              const expected =
                optionsBase?.gaps !== undefined && optionsBase.gaps
                  ? AllenRelation.IS_SEPARATE_FROM
                  : AllenRelation.DOES_NOT_CONCUR_WITH
              is.forEach((j: Interval<T>) => {
                const ij: AllenRelation = AllenRelation.relation(i, j, compare)
                if (i !== j && !ij.implies(expected)) {
                  result.should.be.false()
                }
              })
              if (
                optionsBase?.gaps === false &&
                i !== first &&
                // must have a predecessor
                !is.some((j: Interval<T>) => AllenRelation.relation(j, i, compare).implies(AllenRelation.MEETS))
              ) {
                result.should.be.false()
              }
            }
          })
        }
        should(result).equal(
          (is.length <= 0 ||
            ((!(optionsBase?.leftDefinite ?? false) || (is[0].start !== undefined && is[0].start !== null)) &&
              (!(optionsBase?.rightDefinite ?? false) ||
                (is[is.length - 1].end !== undefined && is[is.length - 1].end !== null)))) &&
            is.every(
              (i: Interval<T>, index: number) =>
                (!(optionsBase?.ordered ?? false) || index === 0 || hasSmallerStart(is[index - 1], i, compare)) &&
                is.every(
                  (j: Interval<T>) =>
                    i === j ||
                    AllenRelation.relation(i, j, compare).implies(
                      optionsBase?.gaps !== undefined && optionsBase.gaps
                        ? AllenRelation.IS_SEPARATE_FROM
                        : AllenRelation.DOES_NOT_CONCUR_WITH
                    )
                ) &&
                (optionsBase?.gaps === undefined ||
                  optionsBase.gaps ||
                  is.length <= 1 ||
                  // is first
                  i ===
                    is.reduce(
                      (acc: Interval<T>, j: Interval<T>) =>
                        AllenRelation.relation(acc, j, compare).implies(EARLIER) ? acc : j,
                      is[0]
                    ) ||
                  // must have a predecessor
                  is.some((j: Interval<T>) => AllenRelation.relation(j, i, compare).implies(AllenRelation.MEETS)))
            )
        )

        return result
      }

      describe(label, function () {
        generateSequenceTests(callIt, points)
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
