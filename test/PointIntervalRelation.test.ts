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
  or,
  and
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
      it(`the complement of the complement if ${pir} is ${pir}`, function () {
        const result = pir.complement().complement()
        result.should.equal(pir)
      })
    })
  })
  describe('#min', function () {
    BasicPointIntervalRelation.VALUES.forEach(pir1 => {
      BasicPointIntervalRelation.VALUES.forEach(pir2 => {
        it(`${pir1}.min(${pir2}) has the basic relations of ${pir1} that are not implied by ${pir2}`, function () {
          const result = pir1.min(pir2)
          console.log(result.toString())
          BASIC_RELATIONS.forEach(br => result.impliedBy(br).should.equal(pir1.impliedBy(br) && !pir2.impliedBy(br)))
        })
      })
    })
  })
  describe('or', function () {
    BasicPointIntervalRelation.VALUES.forEach(pir1 => {
      BasicPointIntervalRelation.VALUES.forEach(pir2 => {
        it(`or(${pir1}, ${pir2}) has the basic relations of both`, function () {
          const args = [pir1, pir2]
          const result = or(...args)
          console.log(result.toString())
          BASIC_RELATIONS.forEach(br => result.impliedBy(br).should.equal(args.some(gr => gr.impliedBy(br))))
        })
      })
    })
    it('the or of all basic point relations is FULL', function () {
      const result = or(...BASIC_RELATIONS)
      result.should.equal(FULL)
    })
    it('the or of all point relations is FULL', function () {
      const result = or(...BasicPointIntervalRelation.VALUES)
      result.should.equal(FULL)
    })
  })
  describe('and', function () {
    BasicPointIntervalRelation.VALUES.forEach(pir1 => {
      BasicPointIntervalRelation.VALUES.forEach(pir2 => {
        it(`and(${pir1}, ${pir2}) has the common basic relations`, function () {
          const args = [pir1, pir2]
          const result = and(...args)
          console.log(result.toString())
          BASIC_RELATIONS.forEach(br => result.impliedBy(br).should.equal(args.every(gr => gr.impliedBy(br))))
        })
      })
    })
    it('the and of all basic point relations is EMPTY', function () {
      const result = and(...BASIC_RELATIONS)
      result.should.equal(EMPTY)
    })
    it('the and of all point relations is FULL', function () {
      const result = and(...BasicPointIntervalRelation.VALUES)
      result.should.equal(EMPTY)
    })
  })
  describe('pointIntervalRelation', function () {
    const fivePoints = [-6, -4.983458, -1, 2, Math.PI]

    class SomethingToCompare {
      public n: number

      constructor (n: number) {
        this.n = n
      }

      compare (other: SomethingToCompare): number {
        return this.n < other.n ? -1 : this.n > other.n ? +1 : 0
      }

      toString (): string {
        return `SomethingToCompare(${this.n})`
      }
    }

    const cases = [
      { type: 'number', points: fivePoints },
      { type: 'string', points: ['a smallest', 'b less small', 'c medium', 'd larger', 'e largest'] },
      {
        type: 'Date',
        points: [
          new Date(2006, 9, 3, 19, 49, 34, 848),
          new Date(2011, 9, 3, 19, 49, 34, 848),
          new Date(2015, 9, 3, 19, 49, 34, 848),
          new Date(2018, 9, 3, 19, 49, 34, 848),
          new Date(2022, 9, 3, 19, 49, 34, 848)
        ]
      },
      {
        type: 'HasCompare',
        points: fivePoints.map(p => new SomethingToCompare(p))
      }
      // {
      //   type: 'compare',
      //   points: fivePoints.map(p => [p]),
      //   comparator: (c1: number[], c2: number[]): number => (c1[0] < c2[0] ? -1 : c1[0] > c2[0] ? +1 : 0)
      // }
    ]

    cases.forEach(c => {
      describe(c.type, function () {
        const fullyQuantified = { start: c.points[1], end: c.points[3] }
        const expectedWithFullyQuantified = [BEFORE, BEGINS, IN, ENDS, AFTER]

        describe(`fully qualified — [${fullyQuantified.start}, ${fullyQuantified.end}[`, function () {
          expectedWithFullyQuantified.forEach((expected, i) => {
            it(`returns ${expected} for ${c.points[i]}`, function () {
              const result = PointIntervalRelation.pointIntervalRelation(c.points[i], fullyQuantified)
              result.should.equal(expected)
            })
          })
          it(`returns FULL for \`undefined\``, function () {
            const result = PointIntervalRelation.pointIntervalRelation(undefined, fullyQuantified)
            result.should.equal(FULL)
          })
        })
        const unknownEnd = { start: c.points[1], end: undefined }
        const expectedWithUnknownEnd = [
          BEFORE,
          BEGINS,
          PointIntervalRelation.relation('ita'),
          PointIntervalRelation.relation('ita'),
          PointIntervalRelation.relation('ita')
        ]
        describe(`unkown end — [${unknownEnd.start}, ${unknownEnd.end}[`, function () {
          expectedWithUnknownEnd.forEach((expected, i) => {
            it(`returns ${expected} for ${c.points[i]}`, function () {
              const result = PointIntervalRelation.pointIntervalRelation(c.points[i], unknownEnd)
              result.should.equal(expected)
            })
          })
          it(`returns FULL for \`undefined\``, function () {
            const result = PointIntervalRelation.pointIntervalRelation(undefined, unknownEnd)
            result.should.equal(FULL)
          })
        })
        const unknownStart = { start: undefined, end: c.points[3] }
        const expectedWithUnknownStart = [
          PointIntervalRelation.relation('bci'),
          PointIntervalRelation.relation('bci'),
          PointIntervalRelation.relation('bci'),
          ENDS,
          AFTER
        ]
        describe(`unkown start — [${unknownStart.start}, ${unknownStart.end}[`, function () {
          expectedWithUnknownStart.forEach((expected, i) => {
            it(`returns ${expected} for ${c.points[i]}`, function () {
              const result = PointIntervalRelation.pointIntervalRelation(c.points[i], unknownStart)
              result.should.equal(expected)
            })
          })
          it(`returns FULL for \`undefined\``, function () {
            const result = PointIntervalRelation.pointIntervalRelation(undefined, unknownStart)
            result.should.equal(FULL)
          })
        })
      })
    })
  })
})
