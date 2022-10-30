/* eslint-env mocha */

import { BasicAllenRelation, AllenRelation } from '../src/AllenRelation'
import { NR_OF_RELATIONS } from '../src/allenRelationBitPattern'
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
    describe('EMPTY', function () {
      it('is an AllenRelation', function () {
        AllenRelation.EMPTY.should.be.instanceof(AllenRelation)
      })
      // it('has bit pattern 0', function () {
      //   AllenRelation.EMPTY.bitPattern.should.equal(EMPTY_BIT_PATTERN)
      // })
      it('is not implied by anything', function () {
        AllenRelation.VALUES.filter(ar => ar !== AllenRelation.EMPTY).forEach(ar => {
          AllenRelation.EMPTY.impliedBy(ar).should.be.false()
        })
      })
    })
    testBasicRelation('PRECEDES', AllenRelation.PRECEDES, AllenRelation['br-[[〈〈'], 'p')
    testBasicRelation('MEETS', AllenRelation.MEETS, AllenRelation['br-[《〈'], 'm')
    testBasicRelation('OVERLAPS', AllenRelation.OVERLAPS, AllenRelation['br-[〈[〈'], 'o')
    testBasicRelation('FINISHED_BY', AllenRelation.FINISHED_BY, AllenRelation['br-[〈《'], 'F')
    testBasicRelation('CONTAINS', AllenRelation.CONTAINS, AllenRelation['br-[〈〈['], 'D')
    testBasicRelation('STARTS', AllenRelation.STARTS, AllenRelation['br-《[〈'], 's')
    testBasicRelation('EQUALS', AllenRelation.EQUALS, AllenRelation['br-《《'], 'e')
    testBasicRelation('STARTED_BY', AllenRelation.STARTED_BY, AllenRelation['br-《〈['], 'S')
    testBasicRelation('DURING', AllenRelation.DURING, AllenRelation['br-〈[[〈'], 'd')
    testBasicRelation('FINISHES', AllenRelation.FINISHES, AllenRelation['br-〈[《'], 'f')
    testBasicRelation('OVERLAPPED_BY', AllenRelation.OVERLAPPED_BY, AllenRelation['br-〈[〈['], 'O')
    testBasicRelation('MET_BY', AllenRelation.MET_BY, AllenRelation['br-〈《['], 'M')
    testBasicRelation('PRECEDED_BY', AllenRelation.PRECEDED_BY, AllenRelation['br-〈〈[['], 'P')
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
  describe('BASIC_RELATIONS', function () {
    it('is an array', function () {
      AllenRelation.BASIC_RELATIONS.should.be.an.Array()
    })
    it('has 13 entries', function () {
      // MUDO generalize 13
      AllenRelation.BASIC_RELATIONS.length.should.equal(13)
    })
    it('contains only TimeIntervalRelations', function () {
      AllenRelation.BASIC_RELATIONS.forEach(ar => {
        ar.should.be.instanceof(AllenRelation)
      })
    })
    it('has the basic relation at the position of its ordinal', function () {
      AllenRelation.BASIC_RELATIONS.forEach(br => {
        AllenRelation.BASIC_RELATIONS[br.basicRelationOrdinal()].should.equal(br)
      })
    })
  })
})
