/* eslint-env mocha */

import { AllenRelation } from '../src/AllenRelation'
import 'should'
import { generateRelationTests } from './_generateRelationTests'
// import { PointIntervalRelation } from '../src/PointIntervalRelation'
// import { ok } from 'assert'

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
        gr.converse()
          .converse()
          .should.equal(gr)
      })
    })
  })

  // describe('#compose', function () {
  //   function validateCompose (ar1: AllenRelation, ar2: AllenRelation, result: AllenRelation): void {
  //     AllenRelation.BASIC_RELATIONS.forEach((br1: AllenRelation) => {
  //       if (br1.implies(ar1)) {
  //         AllenRelation.BASIC_RELATIONS.forEach((br2: AllenRelation) => {
  //           if (br2.implies(ar2)) {
  //             result.impliedBy(AllenRelation.BASIC_COMPOSITIONS[br1.ordinal()][br2.ordinal()])
  //           }
  //         })
  //       }
  //     })
  //   }
  //
  //   interface StartEnd {
  //     start: PointIntervalRelation
  //     end: PointIntervalRelation
  //   }
  //
  //   const basicAllenI1I2ToI2StartEnd: Map<AllenRelation, StartEnd> = new Map([
  //     [AllenRelation.PRECEDES, { start: PointIntervalRelation.AFTER, end: PointIntervalRelation.AFTER }],
  //     [AllenRelation.MEETS, { start: PointIntervalRelation.TERMINATES, end: PointIntervalRelation.AFTER }],
  //     [AllenRelation.OVERLAPS, { start: PointIntervalRelation.IN, end: PointIntervalRelation.AFTER }],
  //     [AllenRelation.FINISHED_BY, { start: PointIntervalRelation.IN, end: PointIntervalRelation.TERMINATES }],
  //     [AllenRelation.CONTAINS, { start: PointIntervalRelation.IN, end: PointIntervalRelation.IN }],
  //     [AllenRelation.STARTS, { start: PointIntervalRelation.COMMENCES, end: PointIntervalRelation.AFTER }],
  //     [AllenRelation.EQUALS, { start: PointIntervalRelation.COMMENCES, end: PointIntervalRelation.TERMINATES }],
  //     [AllenRelation.STARTED_BY, { start: PointIntervalRelation.COMMENCES, end: PointIntervalRelation.IN }],
  //     [AllenRelation.DURING, { start: PointIntervalRelation.BEFORE, end: PointIntervalRelation.AFTER }],
  //     [AllenRelation.FINISHES, { start: PointIntervalRelation.BEFORE, end: PointIntervalRelation.TERMINATES }],
  //     [AllenRelation.OVERLAPPED_BY, { start: PointIntervalRelation.BEFORE, end: PointIntervalRelation.IN }],
  //     [AllenRelation.MET_BY, { start: PointIntervalRelation.BEFORE, end: PointIntervalRelation.COMMENCES }],
  //     [AllenRelation.PRECEDED_BY, { start: PointIntervalRelation.BEFORE, end: PointIntervalRelation.BEFORE }]
  //   ])
  //
  //   const basicI1StartEndToAllenI1I2: Map<
  //     PointIntervalRelation,
  //     Map<PointIntervalRelation, AllenRelation | undefined>
  //   > = new Map([
  //     [
  //       PointIntervalRelation.BEFORE,
  //       new Map([
  //         [PointIntervalRelation.BEFORE, AllenRelation.PRECEDES],
  //         [PointIntervalRelation.COMMENCES, AllenRelation.MEETS],
  //         [PointIntervalRelation.IN, AllenRelation.OVERLAPS],
  //         [PointIntervalRelation.TERMINATES, AllenRelation.FINISHED_BY],
  //         [PointIntervalRelation.AFTER, AllenRelation.CONTAINS]
  //       ])
  //     ],
  //     [
  //       PointIntervalRelation.COMMENCES,
  //       new Map([
  //         [PointIntervalRelation.BEFORE, undefined],
  //         [PointIntervalRelation.COMMENCES, undefined],
  //         [PointIntervalRelation.IN, AllenRelation.STARTS],
  //         [PointIntervalRelation.TERMINATES, AllenRelation.EQUALS],
  //         [PointIntervalRelation.AFTER, AllenRelation.STARTED_BY]
  //       ])
  //     ],
  //     [
  //       PointIntervalRelation.IN,
  //       new Map([
  //         [PointIntervalRelation.BEFORE, undefined],
  //         [PointIntervalRelation.COMMENCES, undefined],
  //         [PointIntervalRelation.IN, AllenRelation.DURING],
  //         [PointIntervalRelation.TERMINATES, AllenRelation.FINISHES],
  //         [PointIntervalRelation.AFTER, AllenRelation.OVERLAPPED_BY]
  //       ])
  //     ],
  //     [
  //       PointIntervalRelation.TERMINATES,
  //       new Map([
  //         [PointIntervalRelation.BEFORE, undefined],
  //         [PointIntervalRelation.COMMENCES, undefined],
  //         [PointIntervalRelation.IN, undefined],
  //         [PointIntervalRelation.TERMINATES, undefined],
  //         [PointIntervalRelation.AFTER, AllenRelation.MET_BY]
  //       ])
  //     ],
  //     [
  //       PointIntervalRelation.AFTER,
  //       new Map([
  //         [PointIntervalRelation.BEFORE, undefined],
  //         [PointIntervalRelation.COMMENCES, undefined],
  //         [PointIntervalRelation.IN, undefined],
  //         [PointIntervalRelation.TERMINATES, undefined],
  //         [PointIntervalRelation.AFTER, AllenRelation.PRECEDED_BY]
  //       ])
  //     ]
  //   ])
  //
  //   function allenRelationToStartEnd (ar: AllenRelation) {
  //     return AllenRelation.BASIC_RELATIONS.reduce(
  //       (acc: StartEnd, bar: AllenRelation) => {
  //         if (!ar.implies(bar)) {
  //           return acc
  //         }
  //         const basicStartEnd = basicAllenI1I2ToI2StartEnd.get(bar)
  //         ok(basicStartEnd)
  //         console.log(bar)
  //         return {
  //           start: PointIntervalRelation.or(acc.start, basicStartEnd.start),
  //           end: PointIntervalRelation.or(acc.end, basicStartEnd.end)
  //         }
  //       },
  //       { start: PointIntervalRelation.emptyRelation(), end: PointIntervalRelation.emptyRelation() }
  //     )
  //   }
  //
  //   function expectedResult (ar1: AllenRelation, ar2: AllenRelation): AllenRelation | undefined {
  //     const { start: i1StartToI2, end: i1EndToI2 } = allenRelationToStartEnd(ar1.converse())
  //     return basicI1StartEndToAllenI1I2.get(i1StartToI2.compose(ar2))?.get(i1EndToI2.compose(ar2))
  //   }
  // })
})
