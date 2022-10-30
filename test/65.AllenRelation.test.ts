/* eslint-env mocha */

import { NR_OF_BITS, NR_OF_RELATIONS as BITPATTERN_NR_OF_RELATIONS } from '../src/allenRelationBitPattern'
import {
  NR_OF_RELATIONS,
  AllenRelation,
  BasicAllenRelation,
  BASIC_ALLEN_RELATION_REPRESENTATIONS,
  EMPTY,
  FULL
} from '../src/AllenRelation'
import 'should'
import { generateRelationTests } from './_generateRelationTests'

function testBasicRelation (name: string, br: BasicAllenRelation, ordinal: number, representation: string): void {
  describe(name, function () {
    it('is a BasicAllenRelation', function () {
      br.should.be.instanceof(BasicAllenRelation)
    })
    it(`has ${ordinal} as ordinal`, function () {
      br.ordinal().should.equal(ordinal)
    })
    it('has an integer ordinal [0, 13[', function () {
      const o = br.ordinal()
      Number.isInteger(o).should.be.true()
      o.should.be.greaterThanOrEqual(0)
      o.should.be.lessThan(NR_OF_BITS)
    })
    it(`has ${BASIC_ALLEN_RELATION_REPRESENTATIONS[ordinal]} as representation`, function () {
      br.representation.should.equal(BASIC_ALLEN_RELATION_REPRESENTATIONS[ordinal])
    })
    it('is in BASIC_RELATIONS at the position of its ordinal', function () {
      BasicAllenRelation.BASIC_RELATIONS[br.ordinal()].should.equal(br)
    })
    it(`has '${representation}' as representation`, function () {
      br.representation.should.equal(representation)
      br.representation.should.equal(BASIC_ALLEN_RELATION_REPRESENTATIONS[br.ordinal()])
    })
  })
}

describe('AllenRelation', function () {
  describe('NR_OF_RELATIONS', function () {
    it('should pass through allenRelationBitPattern.NR_OF_RELATIONS', function () {
      NR_OF_RELATIONS.should.equal(BITPATTERN_NR_OF_RELATIONS)
    })
  })
  describe('BasicAllenRelation', function () {
    describe('BASIC_RELATIONS', function () {
      it('is an array', function () {
        BasicAllenRelation.BASIC_RELATIONS.should.be.an.Array()
      })
      it('has 13 entries', function () {
        BasicAllenRelation.BASIC_RELATIONS.length.should.equal(13)
      })
      it('contains only BasicAllenRelations', function () {
        BasicAllenRelation.BASIC_RELATIONS.forEach(br => {
          br.should.be.instanceof(BasicAllenRelation)
        })
      })
      it('has no duplicates, and this is a basis', function () {
        BasicAllenRelation.BASIC_RELATIONS.forEach((br1, i1) => {
          BasicAllenRelation.BASIC_RELATIONS.forEach((br2, i2) => {
            if (i1 < i2) {
              br1.should.not.equal(br2)
              // MUDO
              // br1.implies(br2).should.be.false()
              // br2.implies(br1).should.be.false()
            }
          })
        })
      })
      it('has the basic relation at the position of its ordinal', function () {
        BasicAllenRelation.BASIC_RELATIONS.forEach((br, i) => {
          br.ordinal().should.equal(i)
        })
      })
    })
    testBasicRelation('PRECEDES', BasicAllenRelation.PRECEDES, 0, 'p')
    testBasicRelation('MEETS', BasicAllenRelation.MEETS, 1, 'm')
    testBasicRelation('OVERLAPS', BasicAllenRelation.OVERLAPS, 2, 'o')
    testBasicRelation('FINISHED_BY', BasicAllenRelation.FINISHED_BY, 3, 'F')
    testBasicRelation('CONTAINS', BasicAllenRelation.CONTAINS, 4, 'D')
    testBasicRelation('STARTS', BasicAllenRelation.STARTS, 5, 's')
    testBasicRelation('EQUALS', BasicAllenRelation.EQUALS, 6, 'e')
    testBasicRelation('STARTED_BY', BasicAllenRelation.STARTED_BY, 7, 'S')
    testBasicRelation('DURING', BasicAllenRelation.DURING, 8, 'd')
    testBasicRelation('FINISHES', BasicAllenRelation.FINISHES, 9, 'f')
    testBasicRelation('OVERLAPPED_BY', BasicAllenRelation.OVERLAPPED_BY, 10, 'O')
    testBasicRelation('MET_BY', BasicAllenRelation.MET_BY, 11, 'M')
    testBasicRelation('PRECEDED_BY', BasicAllenRelation.PRECEDED_BY, 12, 'P')
    describe('RELATIONS', function () {
      it('is an array', function () {
        BasicAllenRelation.RELATIONS.should.be.an.Array()
      })
      it('contains the exact amount of instances', function () {
        BasicAllenRelation.RELATIONS.length.should.equal(NR_OF_RELATIONS)
      })
      it('contains only PointIntervalRelations', function () {
        BasicAllenRelation.RELATIONS.forEach(gr => {
          gr.should.be.instanceof(AllenRelation)
        })
      })
      it('does not contain duplicates', function () {
        /* IDEA A naive implementation iterates 67 108 864 times, and takes several minutes. This is optimized using a
           Set. */
        const gathering = new Set<AllenRelation>()

        BasicAllenRelation.RELATIONS.forEach((gr, i) => {
          gathering.size.should.equal(i)
          gathering.has(gr).should.be.false()
          gathering.add(gr)
        })
      })
      it('contains all basic relations', function () {
        BasicAllenRelation.BASIC_RELATIONS.forEach(br => {
          BasicAllenRelation.RELATIONS.includes(br)
        })
      })
    })
  })
  describe('special relations', function () {
    describe('EMPTY', function () {
      it('is an AllenRelation', function () {
        EMPTY.should.be.instanceof(AllenRelation)
      })
      it('is not implied by anything', function () {
        BasicAllenRelation.RELATIONS.filter(ar => ar !== EMPTY).forEach(ar => {
          EMPTY.impliedBy(ar).should.be.false()
        })
      })
    })
    describe('FULL', function () {
      it('is an AllenRelation', function () {
        FULL.should.be.instanceof(AllenRelation)
      })
      it('is implied by everything', function () {
        BasicAllenRelation.RELATIONS.forEach(ar => {
          FULL.impliedBy(ar).should.be.true()
        })
      })
    })
  })

  generateRelationTests(
    'AllenRelation',
    NR_OF_BITS,
    BasicAllenRelation,
    [
      { name: 'PRECEDES', basicRelation: BasicAllenRelation.PRECEDES, representation: 'p' },
      { name: 'MEETS', basicRelation: BasicAllenRelation.MEETS, representation: 'm' },
      { name: 'OVERLAPS', basicRelation: BasicAllenRelation.OVERLAPS, representation: 'o' },
      { name: 'FINISHED_BY', basicRelation: BasicAllenRelation.FINISHED_BY, representation: 'F' },
      { name: 'CONTAINS', basicRelation: BasicAllenRelation.CONTAINS, representation: 'D' },
      { name: 'STARTS', basicRelation: BasicAllenRelation.STARTS, representation: 's' },
      { name: 'EQUALS', basicRelation: BasicAllenRelation.EQUALS, representation: 'e' },
      { name: 'STARTED_BY', basicRelation: BasicAllenRelation.STARTED_BY, representation: 'S' },
      { name: 'DURING', basicRelation: BasicAllenRelation.DURING, representation: 'd' },
      { name: 'FINISHES', basicRelation: BasicAllenRelation.FINISHES, representation: 'f' },
      { name: 'OVERLAPPED_BY', basicRelation: BasicAllenRelation.OVERLAPPED_BY, representation: 'O' },
      { name: 'MET_BY', basicRelation: BasicAllenRelation.MET_BY, representation: 'M' },
      { name: 'PRECEDED_BY', basicRelation: BasicAllenRelation.PRECEDED_BY, representation: 'P' }
    ],
    AllenRelation
  )
})
