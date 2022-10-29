/* eslint-env mocha */

import {
  NR_OF_BITS,
  NR_OF_RELATIONS as BITPATTERN_NR_OF_RELATIONS,
  PointIntervalRelationBitPattern,
  EMPTY_BIT_PATTERN,
  BEFORE_BIT_PATTERN,
  COMMENCES_BIT_PATTERN,
  IN_BIT_PATTERN,
  TERMINATES_BIT_PATTERN,
  AFTER_BIT_PATTERN,
  FULL_BIT_PATTERN
} from '../src/pointIntervalRelationBitPattern'
import {
  NR_OF_RELATIONS,
  PointIntervalRelation,
  BasicPointIntervalRelation,
  EMPTY,
  FULL,
  BASIC_POINT_INTERVAL_RELATION_REPRESENTATIONS,
  or,
  and
} from '../src/PointIntervalRelation'
import 'should'
import { Interval } from '../src/Interval'
import { inspect } from 'util'

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
    it('has an integer ordinal [0, 5[', function () {
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
    it('is in BASIC_RELATIONS at the position of its ordinal', function () {
      BasicPointIntervalRelation.BASIC_RELATIONS[pir.ordinal()].should.equal(pir)
    })
  })
}

describe('PointIntervalRelations', function () {
  describe('NR_OF_RELATIONS', function () {
    it('should pass through pointIntervalRelationBitPattern.NR_OF_RELATIONS', function () {
      NR_OF_RELATIONS.should.equal(BITPATTERN_NR_OF_RELATIONS)
    })
  })
  describe('BasicPointIntervalRelation', function () {
    describe('BASIC_RELATIONS', function () {
      it('is an array', function () {
        BasicPointIntervalRelation.BASIC_RELATIONS.should.be.an.Array()
      })
      it('has 5 entries', function () {
        BasicPointIntervalRelation.BASIC_RELATIONS.length.should.equal(5)
      })
      it('contains only BasicPointIntervalRelation', function () {
        BasicPointIntervalRelation.BASIC_RELATIONS.forEach(br => {
          br.should.be.instanceof(BasicPointIntervalRelation)
        })
      })
      it('has no duplicates, and this is a basis', function () {
        BasicPointIntervalRelation.BASIC_RELATIONS.forEach((br1, i1) => {
          BasicPointIntervalRelation.BASIC_RELATIONS.forEach((br2, i2) => {
            if (i1 < i2) {
              br1.should.not.equal(br2)
              br1.implies(br2).should.be.false()
              br2.implies(br1).should.be.false()
            }
          })
        })
      })
      it('has the basic relation at the position of its ordinal', function () {
        BasicPointIntervalRelation.BASIC_RELATIONS.forEach((br, i) => {
          br.ordinal().should.equal(i)
        })
      })
    })
    testBasicRelation('BEFORE', BasicPointIntervalRelation.BEFORE, BEFORE_BIT_PATTERN, 0)
    testBasicRelation('COMMENCES', BasicPointIntervalRelation.COMMENCES, COMMENCES_BIT_PATTERN, 1)
    testBasicRelation('IN', BasicPointIntervalRelation.IN, IN_BIT_PATTERN, 2)
    testBasicRelation('TERMINATES', BasicPointIntervalRelation.TERMINATES, TERMINATES_BIT_PATTERN, 3)
    testBasicRelation('AFTER', BasicPointIntervalRelation.AFTER, AFTER_BIT_PATTERN, 4)
    describe('RELATIONS', function () {
      it('is an array', function () {
        BasicPointIntervalRelation.RELATIONS.should.be.an.Array()
      })
      it('contains the exact amount of instances', function () {
        BasicPointIntervalRelation.RELATIONS.length.should.equal(NR_OF_RELATIONS)
      })
      it('contains only PointIntervalRelations', function () {
        BasicPointIntervalRelation.RELATIONS.forEach(gr => {
          gr.should.be.instanceof(PointIntervalRelation)
        })
      })
      it('does not contain duplicates', function () {
        BasicPointIntervalRelation.RELATIONS.forEach((gr1, i1) => {
          BasicPointIntervalRelation.RELATIONS.forEach((gr2, i2) => {
            if (i1 < i2) {
              gr1.should.not.equal(gr2)
            }
          })
        })
      })
      it('contains all basic relations', function () {
        BasicPointIntervalRelation.BASIC_RELATIONS.forEach(br => {
          BasicPointIntervalRelation.RELATIONS.includes(br)
        })
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
  describe('#uncertainty', function () {
    it('returns NaN for EMPTY', function () {
      EMPTY.uncertainty().should.be.NaN()
    })
    BasicPointIntervalRelation.BASIC_RELATIONS.forEach(br => {
      it(`returns 0 for ${br.representation}`, function () {
        br.uncertainty().should.equal(0)
      })
    })
    it('returns 1 for FULL', function () {
      FULL.uncertainty().should.equal(1)
    })

    BasicPointIntervalRelation.RELATIONS.forEach(pir => {
      if (pir !== EMPTY) {
        const expected =
          BasicPointIntervalRelation.BASIC_RELATIONS.reduce((acc, br) => (br.implies(pir) ? acc + 1 : acc), -1) / 4
        it(`${pir.toString()} has uncertainty ${expected}`, function () {
          pir.uncertainty().should.equal(expected)
        })
      }
    })
  })
  describe('#impliedBy', function () {
    BasicPointIntervalRelation.RELATIONS.forEach(gr => {
      if (gr === EMPTY) {
        it('EMPTY is implied by itself', function () {
          EMPTY.impliedBy(gr).should.be.true()
        })
      } else {
        it(`EMPTY is not implied by ${gr.toString()}`, function () {
          EMPTY.impliedBy(gr).should.be.false()
        })
      }
    })
    BasicPointIntervalRelation.BASIC_RELATIONS.forEach(br1 => {
      BasicPointIntervalRelation.BASIC_RELATIONS.forEach(br2 => {
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
    BasicPointIntervalRelation.RELATIONS.forEach(gr1 => {
      BasicPointIntervalRelation.RELATIONS.forEach(gr2 => {
        const expected = BasicPointIntervalRelation.BASIC_RELATIONS.every(br => !gr2.impliedBy(br) || gr1.impliedBy(br))

        it(`should return ${gr1.toString()}.impliedBy(${gr2.toString()}) as ${expected.toString()}`, function () {
          gr1.impliedBy(gr2).should.equal(expected)
        })
      })
    })
  })
  describe('#implies', function () {
    BasicPointIntervalRelation.RELATIONS.forEach(gr => {
      it(`EMPTY implies ${gr.toString()}`, function () {
        EMPTY.implies(gr).should.be.true()
      })
    })
    BasicPointIntervalRelation.BASIC_RELATIONS.forEach(br1 => {
      BasicPointIntervalRelation.BASIC_RELATIONS.forEach(br2 => {
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
    BasicPointIntervalRelation.RELATIONS.forEach(gr1 => {
      BasicPointIntervalRelation.RELATIONS.forEach(gr2 => {
        it(`${gr1.toString()}.implies(${gr2.toString()}) === ${gr2.toString()}.impliedBy(${gr1.toString()})`, function () {
          gr1.implies(gr2).should.equal(gr2.impliedBy(gr1))
        })
      })
    })
  })
  describe('#complement', function () {
    BasicPointIntervalRelation.RELATIONS.forEach(pir => {
      it(`the complement of ${pir.toString()} is implied by the basic relations that are not implied by it`, function () {
        const result = pir.complement()
        console.log(result.toString())
        BasicPointIntervalRelation.BASIC_RELATIONS.forEach(br => {
          pir.impliedBy(br).should.equal(!result.impliedBy(br))
        })
      })
      it(`the complement of the complement if ${pir.toString()} is ${pir.toString()}`, function () {
        const result = pir.complement().complement()
        result.should.equal(pir)
      })
    })
  })
  describe('#min', function () {
    BasicPointIntervalRelation.RELATIONS.forEach(pir1 => {
      BasicPointIntervalRelation.RELATIONS.forEach(pir2 => {
        it(`${pir1.toString()}.min(${pir2.toString()}) has the basic relations of ${pir1.toString()} that are not implied by ${pir2.toString()}`, function () {
          const result = pir1.min(pir2)
          console.log(result.toString())
          BasicPointIntervalRelation.BASIC_RELATIONS.forEach(br =>
            result.impliedBy(br).should.equal(pir1.impliedBy(br) && !pir2.impliedBy(br))
          )
        })
      })
    })
  })
  describe('or', function () {
    BasicPointIntervalRelation.RELATIONS.forEach(pir1 => {
      BasicPointIntervalRelation.RELATIONS.forEach(pir2 => {
        it(`or(${pir1.toString()}, ${pir2.toString()}) has the basic relations of both`, function () {
          const args = [pir1, pir2]
          const result = or(...args)
          console.log(result.toString())
          BasicPointIntervalRelation.BASIC_RELATIONS.forEach(br =>
            result.impliedBy(br).should.equal(args.some(gr => gr.impliedBy(br)))
          )
        })
      })
    })
    it('the or of all basic point relations is FULL', function () {
      const result = or(...BasicPointIntervalRelation.BASIC_RELATIONS)
      result.should.equal(FULL)
    })
    it('the or of all point relations is FULL', function () {
      const result = or(...BasicPointIntervalRelation.RELATIONS)
      result.should.equal(FULL)
    })
  })
  describe('and', function () {
    BasicPointIntervalRelation.RELATIONS.forEach(pir1 => {
      BasicPointIntervalRelation.RELATIONS.forEach(pir2 => {
        it(`and(${pir1.toString()}, ${pir2.toString()}) has the common basic relations`, function () {
          const args = [pir1, pir2]
          const result = and(...args)
          console.log(result.toString())
          BasicPointIntervalRelation.BASIC_RELATIONS.forEach(br =>
            result.impliedBy(br).should.equal(args.every(gr => gr.impliedBy(br)))
          )
        })
      })
    })
    it('the and of all basic point relations is EMPTY', function () {
      const result = and(...BasicPointIntervalRelation.BASIC_RELATIONS)
      result.should.equal(EMPTY)
    })
    it('the and of all point relations is FULL', function () {
      const result = and(...BasicPointIntervalRelation.RELATIONS)
      result.should.equal(EMPTY)
    })
  })
  describe('relation', function () {
    BasicPointIntervalRelation.RELATIONS.forEach(pir => {
      const representation = pir.toString()
      it(`recognizes ${representation} correctly`, function () {
        const result = PointIntervalRelation.relation(representation)
        result.should.equal(pir)
      })
    })
  })
  describe('pointIntervalRelation', function () {
    const fivePoints = [-6, -4.983458, -1, 2, Math.PI]

    function generatePointIntervalRelationTests<T> (
      label: string,
      interval: Interval<T>,
      points: T[],
      expected: PointIntervalRelation[],
      compare?: (a1: T, a2: T) => number
    ): void {
      function callIt<T> (t: T | undefined, i: Interval<T>): PointIntervalRelation {
        return compare != null
          ? /* prettier-ignore */ PointIntervalRelation.pointIntervalRelation(
            t as Parameters<typeof compare>[0],
            (i as unknown) as Interval<Parameters<typeof compare>[0]>,
            compare
          )
          : PointIntervalRelation.pointIntervalRelation(t, i)
      }

      function intervalToString (i: Interval<T>): string {
        function valueToString (v: T | undefined | null): string {
          if (typeof v === 'string') {
            return v
          }
          if (typeof v === 'number' || v instanceof Date) {
            return v.toString()
          }
          return inspect(v)
        }

        return `[${valueToString(i.start)}, ${valueToString(i.end)}[`
      }

      describe(`${label} — ${intervalToString(interval)}`, function () {
        expected.forEach((exp, i) => {
          it(`returns ${exp.toString()} for ${inspect(points[i])}`, function () {
            const result = callIt(points[i], interval)
            result.should.equal(exp)
          })
        })
        it('returns FULL for `undefined`', function () {
          const result = callIt(undefined, interval)
          result.should.equal(FULL)
        })
      })
    }

    function generateAllPointIntervalRelationTests<T> (
      label: string,
      points: T[],
      compare?: (a1: T, a2: T) => number
    ): void {
      describe(label, function () {
        const ita = PointIntervalRelation.relation('ita')
        const bci = PointIntervalRelation.relation('bci')
        generatePointIntervalRelationTests(
          'fully qualified',
          { start: points[1], end: points[3] },
          points,
          [
            BasicPointIntervalRelation.BEFORE,
            BasicPointIntervalRelation.COMMENCES,
            BasicPointIntervalRelation.IN,
            BasicPointIntervalRelation.TERMINATES,
            BasicPointIntervalRelation.AFTER
          ],
          compare
        )
        generatePointIntervalRelationTests(
          'unkown until',
          { start: points[1], end: undefined },
          points,
          [BasicPointIntervalRelation.BEFORE, BasicPointIntervalRelation.COMMENCES, ita, ita, ita],
          compare
        )
        generatePointIntervalRelationTests(
          'unknown from',
          { start: undefined, end: points[3] },
          points,
          [bci, bci, bci, BasicPointIntervalRelation.TERMINATES, BasicPointIntervalRelation.AFTER],
          compare
        )
      })
    }

    generateAllPointIntervalRelationTests('number', fivePoints)
    generateAllPointIntervalRelationTests('string', ['a smallest', 'b less small', 'c medium', 'd larger', 'e largest'])
    generateAllPointIntervalRelationTests('Date', [
      new Date(2006, 9, 3, 19, 49, 34, 848),
      new Date(2011, 9, 3, 19, 49, 34, 848),
      new Date(2015, 9, 3, 19, 49, 34, 848),
      new Date(2018, 9, 3, 19, 49, 34, 848),
      new Date(2022, 9, 3, 19, 49, 34, 848)
    ])
    generateAllPointIntervalRelationTests(
      'compare',
      fivePoints.map(p => [p]),
      (c1: number[], c2: number[]): number => (c1[0] < c2[0] ? -1 : c1[0] > c2[0] ? +1 : 0)
    )
  })
})
