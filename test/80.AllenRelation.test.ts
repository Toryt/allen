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
import { generateRelationTests } from './_generateRelationTests'
import { AllenRelation } from '../src/AllenRelation'
import { Interval } from '../src/Interval'
import { ltCompare } from '../src/ltCompare'
import { intervalToString } from './_intervalToString'
import { generateSixSymbols, sixArrays, sixDates, sixNumbers, sixStrings } from './_pointCases'

describe('AllenRelation', function () {
  generateRelationTests<AllenRelation>(
    'AllenRelation',
    AllenRelation,
    [
      { name: 'PRECEDES', representation: 'p' },
      { name: 'MEETS', representation: 'm' },
      { name: 'OVERLAPS', representation: 'o' },
      { name: 'FINISHED_BY', representation: 'F' },
      { name: 'CONTAINS', representation: 'D' },
      { name: 'STARTS', representation: 's' },
      { name: 'EQUALS', representation: 'e' },
      { name: 'STARTED_BY', representation: 'S' },
      { name: 'DURING', representation: 'd' },
      { name: 'FINISHES', representation: 'f' },
      { name: 'OVERLAPPED_BY', representation: 'O' },
      { name: 'MET_BY', representation: 'M' },
      { name: 'PRECEDED_BY', representation: 'P' }
    ],
    [
      { name: 'CONCURS_WITH', representation: 'oFDseSdfO' },
      { name: 'STARTS_EARLIER', representation: 'pmoFD' },
      { name: 'START_TOGETHER', representation: 'seS' },
      { name: 'STARTS_LATER', representation: 'dfOMP' },
      { name: 'STARTS_IN', representation: 'dfO' },
      { name: 'STARTS_EARLIER_AND_ENDS_EARLIER', representation: 'pmo' },
      { name: 'STARTS_LATER_AND_ENDS_LATER', representation: 'OMP' },
      { name: 'ENDS_EARLIER', representation: 'pmosd' },
      { name: 'ENDS_IN', representation: 'osd' },
      { name: 'END_TOGETHER', representation: 'Fef' },
      { name: 'ENDS_LATER', representation: 'DSOMP' },
      { name: 'CONTAINS_START', representation: 'oFD' },
      { name: 'CONTAINS_END', representation: 'DSO' }
    ],
    false // there are 67108864; it takes hours to test all combinations
  )

  describe('#converse', function () {
    it('the converse of each basic relation is at the same index in the reversed BASIC_RELATIONS array', function () {
      const lastIndex = AllenRelation.NR_OF_BITS - 1
      AllenRelation.BASIC_RELATIONS.forEach((br, i) => {
        br.converse().should.equal(AllenRelation.BASIC_RELATIONS[lastIndex - i])
      })
    })
    it('the converse of each relation is implied by the converse of all basic relations that are implied by it', function () {
      AllenRelation.RELATIONS.forEach(gr => {
        const result = gr.converse()
        AllenRelation.BASIC_RELATIONS.forEach(br => {
          if (gr.impliedBy(br)) {
            result.impliedBy(br.converse()).should.be.true()
          }
        })
      })
    })
    it('each relation is implied by all basic relations whose converse are implied by the relations converse', function () {
      AllenRelation.RELATIONS.forEach(gr => {
        const result = gr.converse()
        AllenRelation.BASIC_RELATIONS.forEach(br => {
          if (result.impliedBy(br.converse())) {
            gr.impliedBy(br).should.be.true()
          }
        })
      })
    })
    it('all relations are their own converse‘s converse', function () {
      AllenRelation.RELATIONS.forEach(gr => {
        gr.converse().converse().should.equal(gr)
      })
    })
  })

  describe('#compose', function () {
    function validateCompose (ar1: AllenRelation, ar2: AllenRelation, result: AllenRelation): void {
      AllenRelation.BASIC_RELATIONS.forEach((br1: AllenRelation) => {
        if (br1.implies(ar1)) {
          AllenRelation.BASIC_RELATIONS.forEach((br2: AllenRelation) => {
            if (br2.implies(ar2)) {
              result.impliedBy(AllenRelation.BASIC_COMPOSITIONS[br1.ordinal()][br2.ordinal()])
            }
          })
        }
      })
    }

    it('composes basic relations as expected', function () {
      AllenRelation.BASIC_RELATIONS.forEach((bar1: AllenRelation) => {
        AllenRelation.BASIC_RELATIONS.forEach((bar2: AllenRelation) => {
          validateCompose(bar1, bar2, bar1.compose(bar2))
        })
      })
    })

    // these are 67108864 validations, which takes about a lifetime
    // it('composes relations as expected', function () {
    //   const nrOfTests = AllenRelation.RELATIONS.length * AllenRelation.RELATIONS.length
    //   console.log(`starting ${nrOfTests} verifications`)
    //   AllenRelation.RELATIONS.forEach((ar1: AllenRelation) => {
    //     AllenRelation.RELATIONS.forEach((ar2: AllenRelation) => {
    //       validateCompose(ar1, ar2, ar1.compose(ar2))
    //     })
    //   })
    // })
    it('composes some relations as expected', function () {
      function testACombination (nr1: number, nr2: number): void {
        const ar1: AllenRelation = AllenRelation.RELATIONS[nr1]
        const ar: AllenRelation = AllenRelation.RELATIONS[nr2]
        validateCompose(ar1, ar, ar1.compose(ar))
      }

      testACombination(0, 8191)
      testACombination(0, 6568)
      testACombination(3, 342)
      testACombination(13, 128)
      testACombination(2048, 444)
      testACombination(3333, 1024)
      testACombination(4885, 3884)
      testACombination(6788, 6788)
      testACombination(8191, 0)
    })
  })
  describe('relation', function () {
    interface TestIntervals<T> {
      i1: Interval<T>
      i2: Interval<T>
    }

    interface NonDegenerateTestIntervals<T> extends TestIntervals<T> {
      relation: AllenRelation
    }

    /**
     * Given 4 points, in order, create relevant intervals to test, and the expected relations.
     *
     * When `i1` and `i2` are swapped, we expect the `converse` relation.
     */
    function createIntervals<T> (pts: T[]): Array<NonDegenerateTestIntervals<T>> {
      return [
        /* all indefinite */
        { i1: {}, i2: {}, relation: AllenRelation.fullRelation<AllenRelation>() },

        /* 1 definite */
        { i1: { start: pts[0] }, i2: {}, relation: AllenRelation.fullRelation<AllenRelation>() },
        { i1: { end: pts[0] }, i2: {}, relation: AllenRelation.fullRelation<AllenRelation>() },
        { i1: {}, i2: { start: pts[0] }, relation: AllenRelation.fullRelation<AllenRelation>() },
        { i1: {}, i2: { end: pts[0] }, relation: AllenRelation.fullRelation<AllenRelation>() },

        /* 2 definite */
        { i1: { start: pts[0], end: pts[1] }, i2: {}, relation: AllenRelation.fullRelation<AllenRelation>() },

        { i1: { start: pts[1] }, i2: { start: pts[0] }, relation: AllenRelation.fromString<AllenRelation>('dfOMP') },
        { i1: { start: pts[1] }, i2: { start: pts[1] }, relation: AllenRelation.fromString<AllenRelation>('seS') },
        {
          i1: { start: pts[1] },
          i2: { start: pts[2] },
          relation: AllenRelation.fromString<AllenRelation>('dfOMP').converse()
        },

        { i1: { start: pts[1] }, i2: { end: pts[0] }, relation: AllenRelation.fromString<AllenRelation>('P') },
        { i1: { start: pts[1] }, i2: { end: pts[1] }, relation: AllenRelation.fromString<AllenRelation>('M') },
        {
          i1: { start: pts[1] },
          i2: { end: pts[2] },
          relation: AllenRelation.fromString<AllenRelation>('pmoFDseSdfO')
        },

        {
          i1: { end: pts[1] },
          i2: { start: pts[0] },
          relation: AllenRelation.fromString<AllenRelation>('oFDseSdfOMP')
        },
        { i1: { end: pts[1] }, i2: { start: pts[1] }, relation: AllenRelation.fromString<AllenRelation>('m') },
        { i1: { end: pts[1] }, i2: { start: pts[2] }, relation: AllenRelation.fromString<AllenRelation>('p') },

        { i1: { end: pts[1] }, i2: { end: pts[0] }, relation: AllenRelation.fromString<AllenRelation>('DSOMP') },
        { i1: { end: pts[1] }, i2: { end: pts[1] }, relation: AllenRelation.fromString<AllenRelation>('Fef') },
        { i1: { end: pts[1] }, i2: { end: pts[2] }, relation: AllenRelation.fromString<AllenRelation>('pmosd') },

        { i1: {}, i2: { start: pts[0], end: pts[1] }, relation: AllenRelation.fullRelation<AllenRelation>() },

        /* 3 definite */
        // i1 start indefinite
        {
          i1: { end: pts[1] },
          i2: { start: pts[2], end: pts[3] },
          relation: AllenRelation.fromString<AllenRelation>('p')
        },
        {
          i1: { end: pts[1] },
          i2: { start: pts[1], end: pts[3] },
          relation: AllenRelation.fromString<AllenRelation>('m')
        },
        {
          i1: { end: pts[2] },
          i2: { start: pts[1], end: pts[3] },
          relation: AllenRelation.fromString<AllenRelation>('osd')
        },
        {
          i1: { end: pts[3] },
          i2: { start: pts[2], end: pts[3] },
          relation: AllenRelation.fromString<AllenRelation>('Fef')
        },
        {
          i1: { end: pts[3] },
          i2: { start: pts[1], end: pts[2] },
          relation: AllenRelation.fromString<AllenRelation>('DSOMP')
        },
        // i1 end indefinite
        {
          i1: { start: pts[0] },
          i2: { start: pts[2], end: pts[3] },
          relation: AllenRelation.fromString<AllenRelation>('pmoFD')
        },
        {
          i1: { start: pts[0] },
          i2: { start: pts[0], end: pts[3] },
          relation: AllenRelation.fromString<AllenRelation>('seS')
        },
        {
          i1: { start: pts[1] },
          i2: { start: pts[0], end: pts[3] },
          relation: AllenRelation.fromString<AllenRelation>('dfO')
        },
        {
          i1: { start: pts[1] },
          i2: { start: pts[0], end: pts[1] },
          relation: AllenRelation.fromString<AllenRelation>('M')
        },
        {
          i1: { start: pts[2] },
          i2: { start: pts[0], end: pts[1] },
          relation: AllenRelation.fromString<AllenRelation>('P')
        },
        // i2 start indefinite
        {
          i1: { start: pts[0], end: pts[1] },
          i2: { end: pts[3] },
          relation: AllenRelation.fromString<AllenRelation>('pmosd')
        },
        {
          i1: { start: pts[0], end: pts[3] },
          i2: { end: pts[3] },
          relation: AllenRelation.fromString<AllenRelation>('Fef')
        },
        {
          i1: { start: pts[0], end: pts[3] },
          i2: { end: pts[2] },
          relation: AllenRelation.fromString<AllenRelation>('DSO')
        },
        {
          i1: { start: pts[1], end: pts[2] },
          i2: { end: pts[1] },
          relation: AllenRelation.fromString<AllenRelation>('M')
        },
        {
          i1: { start: pts[2], end: pts[3] },
          i2: { end: pts[1] },
          relation: AllenRelation.fromString<AllenRelation>('P')
        },
        // i2 end indefinite
        {
          i1: { start: pts[0], end: pts[1] },
          i2: { start: pts[2] },
          relation: AllenRelation.fromString<AllenRelation>('p')
        },
        {
          i1: { start: pts[0], end: pts[1] },
          i2: { start: pts[1] },
          relation: AllenRelation.fromString<AllenRelation>('m')
        },
        {
          i1: { start: pts[0], end: pts[2] },
          i2: { start: pts[1] },
          relation: AllenRelation.fromString<AllenRelation>('oFD')
        },
        {
          i1: { start: pts[0], end: pts[1] },
          i2: { start: pts[0] },
          relation: AllenRelation.fromString<AllenRelation>('seS')
        },
        {
          i1: { start: pts[1], end: pts[2] },
          i2: { start: pts[0] },
          relation: AllenRelation.fromString<AllenRelation>('dfOMP')
        },

        /* 4 definite → 13 basic relations */
        { i1: { start: pts[0], end: pts[1] }, i2: { start: pts[2], end: pts[3] }, relation: AllenRelation.PRECEDES },
        { i1: { start: pts[0], end: pts[1] }, i2: { start: pts[1], end: pts[3] }, relation: AllenRelation.MEETS },
        { i1: { start: pts[0], end: pts[2] }, i2: { start: pts[1], end: pts[3] }, relation: AllenRelation.OVERLAPS },
        { i1: { start: pts[0], end: pts[3] }, i2: { start: pts[2], end: pts[3] }, relation: AllenRelation.FINISHED_BY },
        { i1: { start: pts[0], end: pts[3] }, i2: { start: pts[1], end: pts[2] }, relation: AllenRelation.CONTAINS },
        { i1: { start: pts[0], end: pts[1] }, i2: { start: pts[0], end: pts[3] }, relation: AllenRelation.STARTS },
        { i1: { start: pts[0], end: pts[1] }, i2: { start: pts[0], end: pts[1] }, relation: AllenRelation.EQUALS },
        { i1: { start: pts[0], end: pts[3] }, i2: { start: pts[0], end: pts[2] }, relation: AllenRelation.STARTED_BY },
        { i1: { start: pts[1], end: pts[2] }, i2: { start: pts[0], end: pts[3] }, relation: AllenRelation.DURING },
        { i1: { start: pts[1], end: pts[3] }, i2: { start: pts[0], end: pts[3] }, relation: AllenRelation.FINISHES },
        {
          i1: { start: pts[1], end: pts[3] },
          i2: { start: pts[0], end: pts[2] },
          relation: AllenRelation.OVERLAPPED_BY
        },
        { i1: { start: pts[1], end: pts[2] }, i2: { start: pts[0], end: pts[1] }, relation: AllenRelation.MET_BY },
        { i1: { start: pts[2], end: pts[3] }, i2: { start: pts[0], end: pts[1] }, relation: AllenRelation.PRECEDED_BY },

        /* test with null */
        { i1: { start: null }, i2: { end: pts[0] }, relation: AllenRelation.fullRelation<AllenRelation>() }
      ]
    }

    function createDegenerateIntervals<T> (pts: T[]): Array<TestIntervals<T>> {
      return [
        /* test with 1 empty interval (converse for swapped parameters) */
        { i1: { start: pts[0], end: pts[0] }, i2: { start: pts[2], end: pts[3] } },
        { i1: { start: pts[0], end: pts[0] }, i2: { start: pts[0], end: pts[3] } },
        { i1: { start: pts[1], end: pts[1] }, i2: { start: pts[0], end: pts[3] } },
        { i1: { start: pts[3], end: pts[3] }, i2: { start: pts[1], end: pts[3] } },
        { i1: { start: pts[3], end: pts[3] }, i2: { start: pts[0], end: pts[1] } },

        /* 2 empty intervals */
        { i1: { start: pts[0], end: pts[0] }, i2: { start: pts[2], end: pts[2] } },
        // meets, overlaps, finished by, contains, starts, is impossible when both are degenerate
        { i1: { start: pts[0], end: pts[0] }, i2: { start: pts[0], end: pts[0] } },
        // started by, during, finishes, overlapped by, met_by is impossible when both are degenerate
        { i1: { start: pts[3], end: pts[3] }, i2: { start: pts[0], end: pts[0] } }
      ]
    }

    /**
     * The 26 possible results:
     */
    const possibleResults: AllenRelation[] = AllenRelation.BASIC_RELATIONS.concat([
      AllenRelation.fromString<AllenRelation>('pmoFDseSdfO'),
      AllenRelation.fromString<AllenRelation>('pmoFD'),
      AllenRelation.fromString<AllenRelation>('pmosd'),
      AllenRelation.fromString<AllenRelation>('osd'),
      AllenRelation.fromString<AllenRelation>('oFD'),
      AllenRelation.fromString<AllenRelation>('seS'),
      AllenRelation.fromString<AllenRelation>('Fef'),
      AllenRelation.fromString<AllenRelation>('dfO'),
      AllenRelation.fromString<AllenRelation>('DSO'),
      AllenRelation.fromString<AllenRelation>('DSOMP'),
      AllenRelation.fromString<AllenRelation>('dfOMP'),
      AllenRelation.fromString<AllenRelation>('oFDseSdfOMP'),
      AllenRelation.fullRelation<AllenRelation>()
    ])

    function generateTests<T> (label: string, pts: T[], compareFn?: (a1: T, a2: T) => number): void {
      type BasicRelationDefinition = (i1: Interval<T>, i2: Interval<T>) => boolean

      function isDefinite (t: T | undefined | null): t is T {
        return t !== undefined && t !== null
      }

      function compare (
        t1: T | undefined | null,
        c: '<' | '=' | '>',
        t2: T | undefined | null,
        indefiniteOk?: boolean
      ): boolean {
        const compare = compareFn ?? ltCompare

        if (!isDefinite(t1) || !isDefinite(t2)) {
          return indefiniteOk === true
        }

        const comparison = compare(t1, t2)

        return c === '<' ? comparison < 0 : c === '=' ? comparison === 0 : comparison > 0
      }

      const basicRelationDefinition: Array<[br: AllenRelation, definition: BasicRelationDefinition]> = [
        [AllenRelation.PRECEDES, (i1, i2) => compare(i1.end, '<', i2.start)],
        [AllenRelation.MEETS, (i1, i2) => compare(i1.end, '=', i2.start)],
        [
          AllenRelation.OVERLAPS,
          (i1, i2) => compare(i1.start, '<', i2.start) && compare(i2.start, '<', i1.end) && compare(i1.end, '<', i2.end)
        ],
        [AllenRelation.FINISHED_BY, (i1, i2) => compare(i1.start, '<', i2.start) && compare(i1.end, '=', i2.end)],
        [AllenRelation.CONTAINS, (i1, i2) => compare(i1.start, '<', i2.start) && compare(i2.end, '<', i1.end)],
        [AllenRelation.STARTS, (i1, i2) => compare(i1.start, '=', i2.start) && compare(i1.end, '<', i2.end)],
        [AllenRelation.EQUALS, (i1, i2) => compare(i1.start, '=', i2.start) && compare(i1.end, '=', i2.end)],
        [AllenRelation.STARTED_BY, (i1, i2) => compare(i1.start, '=', i2.start) && compare(i2.end, '<', i1.end)],
        [AllenRelation.DURING, (i1, i2) => compare(i2.start, '<', i1.start) && compare(i1.end, '<', i2.end)],
        [AllenRelation.FINISHES, (i1, i2) => compare(i2.start, '<', i1.start) && compare(i1.end, '=', i2.end)],
        [
          AllenRelation.OVERLAPPED_BY,
          (i1, i2) => compare(i2.start, '<', i1.start) && compare(i1.start, '<', i2.end) && compare(i2.end, '<', i1.end)
        ],
        [AllenRelation.MET_BY, (i1, i2) => compare(i1.start, '=', i2.end)],
        [AllenRelation.PRECEDED_BY, (i1, i2) => compare(i2.end, '<', i1.start)]
      ]

      function callIt (i1: Interval<T>, i2: Interval<T>): AllenRelation {
        return compareFn !== undefined && compareFn !== null
          ? AllenRelation.relation(i1, i2, compareFn)
          : AllenRelation.relation(i1, i2)
      }

      describe(label, function () {
        describe('non-degenerate', function () {
          createIntervals<T>(pts).forEach((ti: NonDegenerateTestIntervals<T>) => {
            const i1: Interval<T> = ti.i1
            const i2: Interval<T> = ti.i2
            const relation: AllenRelation = ti.relation

            function shouldNotViolateBasicRelationDefinitions (
              i1: Interval<T>,
              i2: Interval<T>,
              result: AllenRelation
            ): void {
              possibleResults.includes(relation)
              basicRelationDefinition.forEach(([br, def]) => {
                if (result.implies(br)) {
                  def(i1, i2).should.be.true()
                } else {
                  if (def(i1, i2)) {
                    console.log(br.toString())
                  }
                  def(i1, i2).should.be.false()
                }
              })
            }

            it(`relation(${intervalToString(i1)}, ${intervalToString(
              i2
            )}) = ${relation.toString()} (and converse for swapped arguments)`, function () {
              const straight = callIt(i1, i2)
              const reversed = callIt(i2, i1)
              straight.should.equal(relation)
              reversed.should.equal(relation.converse())
              shouldNotViolateBasicRelationDefinitions(i1, i2, straight)
              shouldNotViolateBasicRelationDefinitions(i2, i1, reversed)
            })
          })
        })
        describe('degenerate', function () {
          createDegenerateIntervals<T>(pts).forEach((ti: TestIntervals<T>) => {
            const i1: Interval<T> = ti.i1
            const i2: Interval<T> = ti.i2

            it(`relation(${intervalToString(i1)}, ${intervalToString(i2)}) and relation(${intervalToString(
              i2
            )}, ${intervalToString(i1)}) should throw`, function () {
              callIt.bind(undefined, i1, i2).should.throw()
              callIt.bind(undefined, i2, i1).should.throw()
            })
          })
        })
      })
    }

    generateTests<number>('number', sixNumbers)
    generateTests<string>('string', sixStrings)
    generateTests<Date>('Date', sixDates)
    generateTests('compare', sixArrays, (c1: number[], c2: number[]): number =>
      c1[0] < c2[0] ? -1 : c1[0] > c2[0] ? +1 : 0
    )
    generateTests<symbol>(
      'symbol with compare',
      generateSixSymbols('allen relation'),
      (s1: Symbol, s2: Symbol): number => (s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0)
    )
  })
})
