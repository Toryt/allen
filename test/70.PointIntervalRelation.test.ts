/* eslint-env mocha */

import 'should'
import { PointIntervalRelation } from '../src/PointIntervalRelation'
import { Interval } from '../src/Interval'
import { inspect } from 'util'
import { intervalToString } from './_intervalToString'
import { generateRelationTests } from './_generateRelationTests'
import { AllenRelation } from '../src/AllenRelation'

describe('PointIntervalRelation', function () {
  generateRelationTests<PointIntervalRelation>(
    'PointIntervalRelation',
    PointIntervalRelation,
    [
      { name: 'BEFORE', representation: 'b' },
      { name: 'COMMENCES', representation: 'c' },
      { name: 'IN', representation: 'i' },
      { name: 'TERMINATES', representation: 't' },
      { name: 'AFTER', representation: 'a' }
    ],
    [
      { name: 'CONCURS_WITH', representation: 'ci' },
      { name: 'BEFORE_END', representation: 'bci' },
      { name: 'AFTER_BEGIN', representation: 'ita' }
    ],
    true
  )

  describe('compose', function () {
    function validateCompose (pir: PointIntervalRelation, ar: AllenRelation, result: PointIntervalRelation): void {
      PointIntervalRelation.BASIC_RELATIONS.forEach((bpir: PointIntervalRelation) => {
        if (bpir.implies(pir)) {
          AllenRelation.BASIC_RELATIONS.forEach((bar: AllenRelation) => {
            if (bar.implies(ar)) {
              result.impliedBy(PointIntervalRelation.BASIC_COMPOSITIONS[bpir.ordinal()][bar.ordinal()]).should.be.true()
            }
          })
        }
      })
    }

    it('composes basic relations as expected', function () {
      PointIntervalRelation.BASIC_RELATIONS.forEach((bpir: PointIntervalRelation) => {
        AllenRelation.BASIC_RELATIONS.forEach((bar: AllenRelation) => {
          validateCompose(bpir, bar, bpir.compose(bar))
        })
      })
    })
  })

  describe('relation', function () {
    const fivePoints = [-6, -4.983458, -1, 2, Math.PI]
    const fiveStrings = ['a smallest', 'b less small', 'c medium', 'd larger', 'e largest']

    function generatePointIntervalRelationTests<T> (
      label: string,
      interval: Interval<T>,
      points: T[],
      expected: PointIntervalRelation[],
      compare?: (a1: T, a2: T) => number
    ): void {
      function callIt<T> (t: T | undefined, i: Interval<T>): PointIntervalRelation {
        return compare != null
          ? /* prettier-ignore */ PointIntervalRelation.relation(
            t as Parameters<typeof compare>[0],
            (i as unknown) as Interval<Parameters<typeof compare>[0]>,
            compare
          )
          : PointIntervalRelation.relation(t, i)
      }

      describe(`${label} — ${intervalToString(interval)}`, function () {
        expected.forEach((exp, i) => {
          it(`returns ${exp.toString()} for ${inspect(points[i])}`, function () {
            const result = callIt(points[i], interval)
            result.should.equal(exp)
          })
        })
        it('returns FULL for `undefined`', function () {
          const result = callIt(undefined, interval)
          result.should.equal(PointIntervalRelation.fullRelation<PointIntervalRelation>())
        })
        it('returns FULL for `null`', function () {
          const result = callIt(null, interval)
          result.should.equal(PointIntervalRelation.fullRelation<PointIntervalRelation>())
        })
      })
    }

    function generateAllPointIntervalRelationTests<T> (
      label: string,
      points: T[],
      compare?: (a1: T, a2: T) => number
    ): void {
      describe(label, function () {
        const ita: PointIntervalRelation = PointIntervalRelation.fromString<PointIntervalRelation>('ita')
        const bci: PointIntervalRelation = PointIntervalRelation.fromString<PointIntervalRelation>('bci')
        generatePointIntervalRelationTests(
          'fully qualified',
          { start: points[1], end: points[3] },
          points,
          [
            PointIntervalRelation.BEFORE,
            PointIntervalRelation.COMMENCES,
            PointIntervalRelation.IN,
            PointIntervalRelation.TERMINATES,
            PointIntervalRelation.AFTER
          ],
          compare
        )
        generatePointIntervalRelationTests(
          'unkown end',
          { start: points[1], end: undefined },
          points,
          [PointIntervalRelation.BEFORE, PointIntervalRelation.COMMENCES, ita, ita, ita],
          compare
        )
        generatePointIntervalRelationTests(
          'unknown start',
          { start: undefined, end: points[3] },
          points,
          [bci, bci, bci, PointIntervalRelation.TERMINATES, PointIntervalRelation.AFTER],
          compare
        )
      })
    }

    generateAllPointIntervalRelationTests('number', fivePoints)
    generateAllPointIntervalRelationTests('string', fiveStrings)
    generateAllPointIntervalRelationTests('Date', [
      new Date(2006, 9, 3, 19, 49, 34, 848),
      new Date(2011, 9, 3, 19, 49, 34, 848),
      new Date(2015, 9, 3, 19, 49, 34, 848),
      new Date(2018, 9, 3, 19, 49, 34, 848),
      new Date(2022, 9, 3, 19, 49, 34, 848)
    ])
    generateAllPointIntervalRelationTests(
      'compare',
      fivePoints.map(p => [p]),
      (c1: number[], c2: number[]): number => (c1[0] < c2[0] ? -1 : c1[0] > c2[0] ? +1 : 0)
    )
    generateAllPointIntervalRelationTests(
      'symbol',
      fiveStrings.map(s => Symbol(s)),
      (s1: Symbol, s2: Symbol): number => (s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0)
    )
  })
})
