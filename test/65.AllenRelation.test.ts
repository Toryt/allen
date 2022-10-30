/* eslint-env mocha */

import { NR_OF_RELATIONS as BITPATTERN_NR_OF_RELATIONS } from '../src/allenRelationBitPattern'
import { NR_OF_RELATIONS, AllenRelation, BasicAllenRelation } from '../src/AllenRelation'
import 'should'

function testBasicRelation (
  name: string,
  br: BasicAllenRelation,
  ordinal: unknown /* MUDO */,
  representation: string
): void {
  describe(name, function () {
    // MUDO
    console.log(ordinal, representation)
    it('is a BasicAllenRelation', function () {
      br.should.be.instanceof(BasicAllenRelation)
    })
    // it(`has ${ordinal} as ordinal`, function () {
    //   br.ordinal().should.equal(ordinal)
    // })
    // it('has an integer ordinal [0, 13[', function () {
    //   const o = br.ordinal()
    //   Number.isInteger(o).should.be.true()
    //   o.should.be.greaterThanOrEqual(0)
    //   o.should.be.lessThan(NR_OF_BITS)
    // })
    // it(`has ${BASIC_ALLEN_RELATION_REPRESENTATIONS[ordinal]} as representation`, function () {
    //   br.representation.should.equal(BASIC_ALLEN_RELATION_REPRESENTATIONS[ordinal])
    // })
    // it('is in BASIC_RELATIONS at the position of its ordinal', function () {
    //   BasicAllenRelation.BASIC_RELATIONS[br.ordinal()].should.equal(br)
    // })
    // it(`has '${representation}' as representation`, function () {
    //   br.representation.should.equal(representation)
    //   br.representation.should.equal(BASIC_ALLEN_RELATION_REPRESENTATIONS[br.ordinal()])
    // })
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
      // it('has the basic relation at the position of its ordinal', function () {
      //   BasicAllenRelation.BASIC_RELATIONS.forEach((br, i) => {
      //     br.ordinal().should.equal(i)
      //   })
      // })
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
  })
  describe('VALUES', function () {
    it('is an array', function () {
      AllenRelation.VALUES.should.be.an.Array()
    })
    it('contains the exact amount of instances', function () {
      AllenRelation.VALUES.length.should.equal(NR_OF_RELATIONS)
    })
    it('contains only TimeIntervalRelations', function () {
      AllenRelation.VALUES.forEach(ar => {
        ar.should.be.instanceof(AllenRelation)
      })
    })
    // MUDO
    // it('does not contain duplicates', function () {
    //   // optimized to avoid quadratic time
    //   VALUES.forEach((ar, i) => {
    //     ar.bitPattern.should.equal(i)
    //   })
    // })
  })
  describe('special relations', function () {
    // describe('EMPTY', function () {
    //   it('is an AllenRelation', function () {
    //     AllenRelation.EMPTY.should.be.instanceof(AllenRelation)
    //   })
    // it('has bit pattern 0', function () {
    //   AllenRelation.EMPTY.bitPattern.should.equal(EMPTY_BIT_PATTERN)
    // })
    // it('is not implied by anything', function () {
    //   AllenRelation.VALUES.filter(ar => ar !== AllenRelation.EMPTY).forEach(ar => {
    //     AllenRelation.EMPTY.impliedBy(ar).should.be.false()
    //   })
    // })
  })
  describe('FULL', function () {
    it('is an AllenRelation', function () {
      AllenRelation.FULL.should.be.instanceof(AllenRelation)
    })
    // it('has bit pattern 0', function () {
    //   AllenRelation.FULL.bitPattern.should.equal(FULL_BIT_PATTERN)
    // })
    it('is implied by everything', function () {
      AllenRelation.VALUES.forEach(ar => {
        AllenRelation.FULL.impliedBy(ar).should.be.true()
      })
    })
  })
})
