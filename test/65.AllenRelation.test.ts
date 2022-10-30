/* eslint-env mocha */

import { LetterAlias, AllenRelation } from '../src/AllenRelation'
import {
  CONTAINS_BIT_PATTERN,
  DURING_BIT_PATTERN,
  EMPTY_BIT_PATTERN,
  EQUALS_BIT_PATTERN,
  FINISHED_BY_BIT_PATTERN,
  FINISHES_BIT_PATTERN,
  FULL_BIT_PATTERN,
  MEETS_BIT_PATTERN,
  MET_BY_BIT_PATTERN,
  NR_OF_RELATIONS,
  OVERLAPPED_BY_BIT_PATTERN,
  OVERLAPS_BIT_PATTERN,
  PRECEDED_BY_BIT_PATTERN,
  PRECEDES_BIT_PATTERN,
  STARTED_BY_BIT_PATTERN,
  STARTS_BIT_PATTERN
} from '../src/allenRelationBitPattern'
import 'should'

function testBasicRelation (
  name: string,
  br: AllenRelation,
  bp: number,
  visualAlias: AllenRelation,
  letterAlias: LetterAlias
): void {
  describe(name, function () {
    it('is a TimeIntervalRelation', function () {
      br.should.be.instanceof(AllenRelation)
    })
    it('has the expected bit pattern', function () {
      br.bitPattern.should.equal(bp)
    })
    it('has the correct visual alias', function () {
      visualAlias.should.equal(br)
    })
    it(`has ${letterAlias} as letter alias`, function () {
      AllenRelation[letterAlias].should.equal(br)
    })
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
      it('is a TimeIntervalRelation', function () {
        AllenRelation.EMPTY.should.be.instanceof(AllenRelation)
      })
      it('has bit pattern 0', function () {
        AllenRelation.EMPTY.bitPattern.should.equal(EMPTY_BIT_PATTERN)
      })
      it('is not implied by anything', function () {
        AllenRelation.VALUES.filter(ar => ar !== AllenRelation.EMPTY).forEach(ar => {
          AllenRelation.EMPTY.impliedBy(ar).should.be.false()
        })
      })
    })
    testBasicRelation('PRECEDES', AllenRelation.PRECEDES, PRECEDES_BIT_PATTERN, AllenRelation['br-[[〈〈'], 'p')
    testBasicRelation('MEETS', AllenRelation.MEETS, MEETS_BIT_PATTERN, AllenRelation['br-[《〈'], 'm')
    testBasicRelation('OVERLAPS', AllenRelation.OVERLAPS, OVERLAPS_BIT_PATTERN, AllenRelation['br-[〈[〈'], 'o')
    testBasicRelation('FINISHED_BY', AllenRelation.FINISHED_BY, FINISHED_BY_BIT_PATTERN, AllenRelation['br-[〈《'], 'F')
    testBasicRelation('CONTAINS', AllenRelation.CONTAINS, CONTAINS_BIT_PATTERN, AllenRelation['br-[〈〈['], 'D')
    testBasicRelation('STARTS', AllenRelation.STARTS, STARTS_BIT_PATTERN, AllenRelation['br-《[〈'], 's')
    testBasicRelation('EQUALS', AllenRelation.EQUALS, EQUALS_BIT_PATTERN, AllenRelation['br-《《'], 'e')
    testBasicRelation('STARTED_BY', AllenRelation.STARTED_BY, STARTED_BY_BIT_PATTERN, AllenRelation['br-《〈['], 'S')
    testBasicRelation('DURING', AllenRelation.DURING, DURING_BIT_PATTERN, AllenRelation['br-〈[[〈'], 'd')
    testBasicRelation('FINISHES', AllenRelation.FINISHES, FINISHES_BIT_PATTERN, AllenRelation['br-〈[《'], 'f')
    testBasicRelation(
      'OVERLAPPED_BY',
      AllenRelation.OVERLAPPED_BY,
      OVERLAPPED_BY_BIT_PATTERN,
      AllenRelation['br-〈[〈['],
      'O'
    )
    testBasicRelation('MET_BY', AllenRelation.MET_BY, MET_BY_BIT_PATTERN, AllenRelation['br-〈《['], 'M')
    testBasicRelation(
      'PRECEDED_BY',
      AllenRelation.PRECEDED_BY,
      PRECEDED_BY_BIT_PATTERN,
      AllenRelation['br-〈〈[['],
      'P'
    )
    describe('FULL', function () {
      it('is a TimeIntervalRelation', function () {
        AllenRelation.FULL.should.be.instanceof(AllenRelation)
      })
      it('has bit pattern 0', function () {
        AllenRelation.FULL.bitPattern.should.equal(FULL_BIT_PATTERN)
      })
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
