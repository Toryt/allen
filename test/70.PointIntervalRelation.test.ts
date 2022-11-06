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
import { PointIntervalRelation } from '../src/PointIntervalRelation'
import { Interval } from '../src/Interval'
import { inspect } from 'util'
import { intervalToString } from './_intervalToString'
import { generateRelationTests } from './_generateRelationTests'
import { AllenRelation } from '../src/AllenRelation'
import { ltCompare } from '../src'

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
    // these are 262144 validations, which takes about a minute
    // it('composes relations as expected', function () {
    //   const nrOfTests = PointIntervalRelation.RELATIONS.length * AllenRelation.RELATIONS.length
    //   console.log(`starting ${nrOfTests} verifications`)
    //   PointIntervalRelation.RELATIONS.forEach((pir: PointIntervalRelation) => {
    //     AllenRelation.RELATIONS.forEach((ar: AllenRelation) => {
    //       validateCompose(pir, ar, pir.compose(ar))
    //     })
    //   })
    // })
    it('composes some relations as expected', function () {
      function testACombination (pirNr: number, arNumber: number): void {
        const pir: PointIntervalRelation = PointIntervalRelation.RELATIONS[pirNr]
        const ar: AllenRelation = AllenRelation.RELATIONS[arNumber]
        validateCompose(pir, ar, pir.compose(ar))
      }

      testACombination(0, 0)
      testACombination(0, 6568)
      testACombination(3, 342)
      testACombination(13, 128)
      testACombination(16, 444)
      testACombination(23, 1024)
      testACombination(31, 3884)
      testACombination(31, 6788)
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
      compareFn?: (a1: T, a2: T) => number
    ): void {
      function callIt (t: T | undefined | null, i: Interval<T>): PointIntervalRelation {
        return compareFn !== undefined && compareFn !== null
          ? /* prettier-ignore */ PointIntervalRelation.relation(t, i, compareFn)
          : PointIntervalRelation.relation(t, i)
      }

      type BasicRelationDefinition = (t: T, i: Interval<T>) => boolean

      function isDefinite (t: T | undefined | null): t is T {
        return t !== undefined && t !== null
      }

      function compare (t1: T, c: '<' | '=' | '>', t2: T | undefined | null): boolean {
        const compare = compareFn ?? ltCompare

        if (!isDefinite(t2)) {
          return false
        }

        const comparison = compare(t1, t2)

        return c === '<' ? comparison < 0 : c === '=' ? comparison === 0 : comparison > 0
      }

      const basicRelationDefinition: Array<[br: PointIntervalRelation, definition: BasicRelationDefinition]> = [
        [PointIntervalRelation.BEFORE, (t: T, i: Interval<T>) => !isDefinite(t) || compare(t, '<', i.start)],
        [PointIntervalRelation.COMMENCES, (t: T, i: Interval<T>) => !isDefinite(t) || compare(t, '=', i.start)],
        [
          PointIntervalRelation.IN,
          (t: T, i: Interval<T>) => !isDefinite(t) || (compare(t, '>', i.start) && compare(t, '<', i.end))
        ],
        [
          PointIntervalRelation.TERMINATES,
          (t: T, i: Interval<T>) => !isDefinite(t) || (compare(t, '=', i.end) && i.start !== i.end)
        ],
        [PointIntervalRelation.AFTER, (t: T, i: Interval<T>) => !isDefinite(t) || compare(t, '>', i.end)]
      ]

      function shouldNotViolateBasicRelationDefinitions (t: T, result: PointIntervalRelation): void {
        basicRelationDefinition.forEach(([br, def]) => {
          if (result.implies(br)) {
            def(t, interval).should.be.true()
          } else {
            if (def(t, interval)) {
              console.log(br.toString())
            }
            def(t, interval).should.be.false()
          }
        })
      }

      describe(`${label} — ${intervalToString(interval)}`, function () {
        expected.forEach((exp, i) => {
          it(`returns ${exp.toString()} for ${inspect(points[i])}`, function () {
            const result = callIt(points[i], interval)
            result.should.equal(exp)
            shouldNotViolateBasicRelationDefinitions(points[i], result)
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
        generatePointIntervalRelationTests(
          'degenerate interval',
          { start: points[1], end: points[1] },
          [points[0], points[1], points[2]],
          [PointIntervalRelation.BEFORE, PointIntervalRelation.COMMENCES, PointIntervalRelation.AFTER],
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
