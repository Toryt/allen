/* eslint-env mocha */

import { LetterAlias, TimeIntervalRelation } from '../src/TimeIntervalRelation'
import {
  IntervalIntervalRelationBitPattern,
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
} from '../src/intervalIntervalRelationBitPattern'
import 'should'

function testBasicRelation (
  name: string,
  br: TimeIntervalRelation,
  bp: IntervalIntervalRelationBitPattern,
  visualAlias: TimeIntervalRelation,
  letterAlias: LetterAlias
): void {
  describe(name, function () {
    it('is a TimeIntervalRelation', function () {
      br.should.be.instanceof(TimeIntervalRelation)
    })
    it('has the expected bit pattern', function () {
      br.bitPattern.should.equal(bp)
    })
    it('has the correct visual alias', function () {
      visualAlias.should.equal(br)
    })
    it(`has ${letterAlias} as letter alias`, function () {
      TimeIntervalRelation[letterAlias].should.equal(br)
    })
  })
}

describe('TimeIntervalRelations', function () {
  describe('VALUES', function () {
    it('is an array', function () {
      TimeIntervalRelation.VALUES.should.be.an.Array()
    })
    it('contains the exact amount of instances', function () {
      TimeIntervalRelation.VALUES.length.should.equal(NR_OF_RELATIONS)
    })
    it('contains only TimeIntervalRelations', function () {
      TimeIntervalRelation.VALUES.forEach(ar => {
        ar.should.be.instanceof(TimeIntervalRelation)
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
        TimeIntervalRelation.EMPTY.should.be.instanceof(TimeIntervalRelation)
      })
      it('has bit pattern 0', function () {
        TimeIntervalRelation.EMPTY.bitPattern.should.equal(EMPTY_BIT_PATTERN)
      })
      it('is not implied by anything', function () {
        TimeIntervalRelation.VALUES.filter(ar => ar !== TimeIntervalRelation.EMPTY).forEach(ar => {
          TimeIntervalRelation.EMPTY.impliedBy(ar).should.be.false()
        })
      })
    })
    testBasicRelation(
      'PRECEDES',
      TimeIntervalRelation.PRECEDES,
      PRECEDES_BIT_PATTERN,
      TimeIntervalRelation['br-[[〈〈'],
      'p'
    )
    testBasicRelation('MEETS', TimeIntervalRelation.MEETS, MEETS_BIT_PATTERN, TimeIntervalRelation['br-[《〈'], 'm')
    testBasicRelation(
      'OVERLAPS',
      TimeIntervalRelation.OVERLAPS,
      OVERLAPS_BIT_PATTERN,
      TimeIntervalRelation['br-[〈[〈'],
      'o'
    )
    testBasicRelation(
      'FINISHED_BY',
      TimeIntervalRelation.FINISHED_BY,
      FINISHED_BY_BIT_PATTERN,
      TimeIntervalRelation['br-[〈《'],
      'F'
    )
    testBasicRelation(
      'CONTAINS',
      TimeIntervalRelation.CONTAINS,
      CONTAINS_BIT_PATTERN,
      TimeIntervalRelation['br-[〈〈['],
      'D'
    )
    testBasicRelation('STARTS', TimeIntervalRelation.STARTS, STARTS_BIT_PATTERN, TimeIntervalRelation['br-《[〈'], 's')
    testBasicRelation('EQUALS', TimeIntervalRelation.EQUALS, EQUALS_BIT_PATTERN, TimeIntervalRelation['br-《《'], 'e')
    testBasicRelation(
      'STARTED_BY',
      TimeIntervalRelation.STARTED_BY,
      STARTED_BY_BIT_PATTERN,
      TimeIntervalRelation['br-《〈['],
      'S'
    )
    testBasicRelation('DURING', TimeIntervalRelation.DURING, DURING_BIT_PATTERN, TimeIntervalRelation['br-〈[[〈'], 'd')
    testBasicRelation(
      'FINISHES',
      TimeIntervalRelation.FINISHES,
      FINISHES_BIT_PATTERN,
      TimeIntervalRelation['br-〈[《'],
      'f'
    )
    testBasicRelation(
      'OVERLAPPED_BY',
      TimeIntervalRelation.OVERLAPPED_BY,
      OVERLAPPED_BY_BIT_PATTERN,
      TimeIntervalRelation['br-〈[〈['],
      'O'
    )
    testBasicRelation('MET_BY', TimeIntervalRelation.MET_BY, MET_BY_BIT_PATTERN, TimeIntervalRelation['br-〈《['], 'M')
    testBasicRelation(
      'PRECEDED_BY',
      TimeIntervalRelation.PRECEDED_BY,
      PRECEDED_BY_BIT_PATTERN,
      TimeIntervalRelation['br-〈〈[['],
      'P'
    )
    describe('FULL', function () {
      it('is a TimeIntervalRelation', function () {
        TimeIntervalRelation.FULL.should.be.instanceof(TimeIntervalRelation)
      })
      it('has bit pattern 0', function () {
        TimeIntervalRelation.FULL.bitPattern.should.equal(FULL_BIT_PATTERN)
      })
      it('is implied by everything', function () {
        TimeIntervalRelation.VALUES.forEach(ar => {
          TimeIntervalRelation.FULL.impliedBy(ar).should.be.true()
        })
      })
    })
  })
  describe('BASIC_RELATIONS', function () {
    it('is an array', function () {
      TimeIntervalRelation.BASIC_RELATIONS.should.be.an.Array()
    })
    it('has 13 entries', function () {
      // MUDO generalize 13
      TimeIntervalRelation.BASIC_RELATIONS.length.should.equal(13)
    })
    it('contains only TimeIntervalRelations', function () {
      TimeIntervalRelation.BASIC_RELATIONS.forEach(ar => {
        ar.should.be.instanceof(TimeIntervalRelation)
      })
    })
    it('has the basic relation at the position of its ordinal', function () {
      TimeIntervalRelation.BASIC_RELATIONS.forEach(br => {
        TimeIntervalRelation.BASIC_RELATIONS[br.basicRelationOrdinal()].should.equal(br)
      })
    })
  })
})
