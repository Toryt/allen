/* eslint-env mocha */

import {
  NR_OF_BITS,
  NR_OF_RELATIONS as BITPATTERN_NR_OF_RELATIONS,
  PointIntervalRelationBitPattern,
  EMPTY_BIT_PATTERN,
  BEFORE_BIT_PATTERN,
  BEGINS_BIT_PATTERN,
  IN_BIT_PATTERN,
  ENDS_BIT_PATTERN,
  AFTER_BIT_PATTERN,
  FULL_BIT_PATTERN
} from '../src/pointIntervalRelationBitPattern'
import {
  NR_OF_RELATIONS,
  PointIntervalRelation,
  BasicPointIntervalRelation,
  EMPTY,
  BEFORE,
  BEGINS,
  IN,
  ENDS,
  AFTER,
  FULL,
  BASIC_POINT_INTERVAL_RELATION_REPRESENTATIONS,
  BASIC_RELATIONS,
  or
} from '../src/PointIntervalRelation'
import 'should'

function testBasicRelation (
  name: string,
  pir: BasicPointIntervalRelation,
  pirbp: PointIntervalRelationBitPattern,
  ordinal: number
): void {
  describe(name, function () {
    it('is a BasicPointIntervalRelation', function () {
      pir.should.be.instanceof(BasicPointIntervalRelation)
    })
    it('has the expected bit pattern', function () {
      pir.bitPattern.should.equal(pirbp)
    })
    it(`has ${ordinal} as ordinal`, function () {
      pir.ordinal().should.equal(ordinal)
    })
    it(`has an integer ordinal [0, 5[`, function () {
      const o = pir.ordinal()
      Number.isInteger(o).should.be.true()
      o.should.be.greaterThanOrEqual(0)
      o.should.be.lessThan(NR_OF_BITS)
    })
    it('reports as a basic PointIntervalRelation', function () {
      pir.isBasic().should.be.true()
    })
    it(`has ${BASIC_POINT_INTERVAL_RELATION_REPRESENTATIONS[ordinal]} as representation`, function () {
      pir.representation.should.equal(BASIC_POINT_INTERVAL_RELATION_REPRESENTATIONS[ordinal])
    })
  })
}

describe('PointIntervalRelations', function () {
  describe('NR_OF_RELATIONS', function () {
    it('should pass through pointIntervalRelationBitPattern.NR_OF_RELATIONS', function () {
      NR_OF_RELATIONS.should.equal(BITPATTERN_NR_OF_RELATIONS)
    })
  })
  describe('VALUES', function () {
    it('is an array', function () {
      BasicPointIntervalRelation.VALUES.should.be.an.Array()
    })
    it('contains the exact amount of instances', function () {
      BasicPointIntervalRelation.VALUES.length.should.equal(NR_OF_RELATIONS)
    })
    it('contains only PointIntervalRelations', function () {
      BasicPointIntervalRelation.VALUES.forEach(ar => {
        ar.should.be.instanceof(PointIntervalRelation)
      })
    })
    it('does not contain duplicates', function () {
      // optimized to avoid quadratic time
      BasicPointIntervalRelation.VALUES.forEach((ar, i) => {
        ar.bitPattern.should.equal(i)
      })
    })
  })
  describe('special relations', function () {
    describe('EMPTY', function () {
      it('is a PointIntervalRelation', function () {
        EMPTY.should.be.instanceof(PointIntervalRelation)
      })
      it('has bit pattern 0', function () {
        EMPTY.bitPattern.should.equal(EMPTY_BIT_PATTERN)
      })
      // it('is not implied by anything', function () {
      //   PointIntervalRelation.VALUES.filter(ar => ar !== EMPTY).forEach(ar => {
      //     EMPTY.impliedBy(ar).should.be.false()
      //   })
      // })
    })
    describe('FULL', function () {
      it('is a PointIntervalRelation', function () {
        FULL.should.be.instanceof(PointIntervalRelation)
      })
      it('has bit pattern 5 1‘s', function () {
        FULL.bitPattern.should.equal(FULL_BIT_PATTERN)
      })
      // it('is implied by everything', function () {
      //   PointIntervalRelation.VALUES.forEach(ar => {
      //     FULL.impliedBy(ar).should.be.true()
      //   })
      // })
    })
  })
  describe('BASIC_RELATIONS', function () {
    it('is an array', function () {
      BASIC_RELATIONS.should.be.an.Array()
    })
    it('has 5 entries', function () {
      BASIC_RELATIONS.length.should.equal(5)
    })
    it('contains only BasicPointIntervalRelation', function () {
      BASIC_RELATIONS.forEach(ar => {
        ar.should.be.instanceof(BasicPointIntervalRelation)
      })
    })
    it('is the exported static', function () {
      BASIC_RELATIONS.should.equal(BasicPointIntervalRelation.BASIC_RELATIONS_VALUES)
    })
    it('has the basic relation at the position of its ordinal', function () {
      BASIC_RELATIONS.forEach((br, i) => {
        br.ordinal().should.equal(i)
      })
    })
  })
  describe('basic relations', function () {
    testBasicRelation('BEFORE', BEFORE, BEFORE_BIT_PATTERN, 0)
    testBasicRelation('BEGINS', BEGINS, BEGINS_BIT_PATTERN, 1)
    testBasicRelation('IN', IN, IN_BIT_PATTERN, 2)
    testBasicRelation('ENDS', ENDS, ENDS_BIT_PATTERN, 3)
    testBasicRelation('AFTER', AFTER, AFTER_BIT_PATTERN, 4)
  })
  describe('#uncertainty', function () {
    it('returns NaN for EMPTY', function () {
      EMPTY.uncertainty().should.be.NaN()
    })
    BASIC_RELATIONS.forEach(br => {
      it(`returns 0 for ${br.representation}`, function () {
        br.uncertainty().should.equal(0)
      })
    })
    it('returns 1 for FULL', function () {
      FULL.uncertainty().should.equal(1)
    })

    BasicPointIntervalRelation.VALUES.forEach(pir => {
      if (pir !== EMPTY) {
        const expected = BASIC_RELATIONS.reduce((acc, br) => (br.implies(pir) ? acc + 1 : acc), -1) / 4
        it(`${pir} has uncertainty ${expected}`, function () {
          pir.uncertainty().should.equal(expected)
        })
      }
    })
  })
  describe('#impliedBy', function () {
    BasicPointIntervalRelation.VALUES.forEach(gr => {
      if (gr === EMPTY) {
        it(`EMPTY is implied by itself`, function () {
          EMPTY.impliedBy(gr).should.be.true()
        })
      } else {
        it(`EMPTY is not implied by ${gr}`, function () {
          EMPTY.impliedBy(gr).should.be.false()
        })
      }
    })
    BASIC_RELATIONS.forEach(br1 => {
      BASIC_RELATIONS.forEach(br2 => {
        if (br1 === br2) {
          it(`${br1.representation} is implied by itself`, function () {
            br1.impliedBy(br2).should.be.true()
          })
        } else {
          it(`${br1.representation} is not implied by ${br2.representation}`, function () {
            br1.impliedBy(br2).should.be.false()
          })
        }
      })
    })
    BasicPointIntervalRelation.VALUES.forEach(gr1 => {
      BasicPointIntervalRelation.VALUES.forEach(gr2 => {
        const expected = BASIC_RELATIONS.every(br => !gr2.impliedBy(br) || gr1.impliedBy(br))

        it(`should return ${gr1}.impliedBy(${gr2}) as ${expected}`, function () {
          gr1.impliedBy(gr2).should.equal(expected)
        })
      })
    })
  })
  describe('#implies', function () {
    BasicPointIntervalRelation.VALUES.forEach(gr => {
      it(`EMPTY implies ${gr}`, function () {
        EMPTY.implies(gr).should.be.true()
      })
    })
    BASIC_RELATIONS.forEach(br1 => {
      BASIC_RELATIONS.forEach(br2 => {
        if (br1 === br2) {
          it(`${br1.representation} implies itself`, function () {
            br1.implies(br2).should.be.true()
          })
        } else {
          it(`${br1.representation} does not imply ${br2.representation}`, function () {
            br1.implies(br2).should.be.false()
          })
        }
      })
      it(`${br1.representation} does not imply EMPTY`, function () {
        br1.implies(EMPTY).should.be.false()
      })
      it(`${br1.representation} implies FULL`, function () {
        br1.implies(FULL).should.be.true()
      })
    })
    BasicPointIntervalRelation.VALUES.forEach(gr1 => {
      BasicPointIntervalRelation.VALUES.forEach(gr2 => {
        it(`${gr1}.implies(${gr2}) === ${gr2}.impliedBy(${gr1})`, function () {
          gr1.implies(gr2).should.equal(gr2.impliedBy(gr1))
        })
      })
    })
  })
  describe('#complement', function () {
    BasicPointIntervalRelation.VALUES.forEach(pir => {
      it(`the complement of ${pir} is implied by the basic relations that are not implied by it`, function () {
        const result = pir.complement()
        console.log(result.toString())
        BASIC_RELATIONS.forEach(br => {
          pir.impliedBy(br).should.equal(!result.impliedBy(br))
        })
      })
    })
  })
  describe('#or', function () {
    BasicPointIntervalRelation.VALUES.forEach(pir1 => {
      BasicPointIntervalRelation.VALUES.forEach(pir2 => {
        it(`${pir1}.or(${pir2}) has the basic relations of both`, function () {
          const result = pir1.or(pir2)
          console.log(result.toString())
          BASIC_RELATIONS.forEach(br => result.impliedBy(br).should.equal(pir1.impliedBy(br) || pir2.impliedBy(br)))
        })
      })
    })
  })
  describe('#and', function () {
    BasicPointIntervalRelation.VALUES.forEach(pir1 => {
      BasicPointIntervalRelation.VALUES.forEach(pir2 => {
        it(`${pir1}.or(${pir2}) has the common basic relations`, function () {
          const result = pir1.and(pir2)
          console.log(result.toString())
          BASIC_RELATIONS.forEach(br => result.impliedBy(br).should.equal(pir1.impliedBy(br) && pir2.impliedBy(br)))
        })
      })
    })
  })
  describe('#or', function () {
    BasicPointIntervalRelation.VALUES.forEach(pir1 => {
      BasicPointIntervalRelation.VALUES.forEach(pir2 => {
        BasicPointIntervalRelation.VALUES.forEach(pir3 => {
          it(`or(${pir1}, ${pir2}, ${pir3}) has the basic relations of all`, function () {
            const args = [pir1, pir2, pir3]
            const result = or(...args)
            console.log(result.toString())
            BASIC_RELATIONS.forEach(br => result.impliedBy(br).should.equal(args.some(gr => gr.impliedBy(br))))
          })
        })
      })
    })
  })
})
