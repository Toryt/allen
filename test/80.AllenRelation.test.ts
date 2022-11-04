/*
 Copyright © 2022 by Jan Dockx

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

/* eslint-env mocha */

import { AllenRelation } from '../src/AllenRelation'
import 'should'
import { generateRelationTests } from './_generateRelationTests'

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
})
