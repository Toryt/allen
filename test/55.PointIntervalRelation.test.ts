/* eslint-env mocha */

import { NR_OF_BITS, NR_OF_RELATIONS as BITPATTERN_NR_OF_RELATIONS } from '../src/pointIntervalRelationBitPattern'
import { NR_OF_RELATIONS, PointIntervalRelation, EMPTY, FULL } from '../src/PointIntervalRelation'
import 'should'
import { Interval } from '../src/Interval'
import { inspect } from 'util'
import { intervalToString } from './_intervalToString'

function testBasicRelation (name: string, br: PointIntervalRelation, ordinal: number, representation: string): void {
  describe(name, function () {
    it('is a basic PointIntervalRelation', function () {
      br.isBasic().should.be.true()
    })
    it(`has ${ordinal} as ordinal`, function () {
      br.ordinal().should.equal(ordinal)
    })
    it('has an integer ordinal [0, 5[', function () {
      const o = br.ordinal()
      Number.isInteger(o).should.be.true()
      o.should.be.greaterThanOrEqual(0)
      o.should.be.lessThan(NR_OF_BITS)
    })
    it('is in BASIC_RELATIONS at the position of its ordinal', function () {
      PointIntervalRelation.BASIC_RELATIONS[br.ordinal()].should.equal(br)
    })
    it(`has '${representation}' as representation`, function () {
      br.toString().should.equal(`(${representation})`)
      br.toString().should.equal(`(${PointIntervalRelation.BASIC_REPRESENTATIONS[ordinal]})`)
    })
  })
}

describe('PointIntervalRelation', function () {
  describe('NR_OF_RELATIONS', function () {
    it('should pass through pointIntervalRelationBitPattern.NR_OF_RELATIONS', function () {
      NR_OF_RELATIONS.should.equal(BITPATTERN_NR_OF_RELATIONS)
    })
  })
  describe('BasicPointIntervalRelation', function () {
    describe('BASIC_RELATIONS', function () {
      it('is an array', function () {
        PointIntervalRelation.BASIC_RELATIONS.should.be.an.Array()
      })
      it('has 5 entries', function () {
        PointIntervalRelation.BASIC_RELATIONS.length.should.equal(5)
      })
      it('contains only basic PointIntervalRelations', function () {
        PointIntervalRelation.BASIC_RELATIONS.forEach(br => {
          br.isBasic().should.be.true()
        })
      })
      it('has no duplicates, and this is a basis', function () {
        PointIntervalRelation.BASIC_RELATIONS.forEach((br1, i1) => {
          PointIntervalRelation.BASIC_RELATIONS.forEach((br2, i2) => {
            if (i1 < i2) {
              br1.should.not.equal(br2)
              br1.implies(br2).should.be.false()
              br2.implies(br1).should.be.false()
            }
          })
        })
      })
      it('has the basic relation at the position of its ordinal', function () {
        PointIntervalRelation.BASIC_RELATIONS.forEach((br, i) => {
          br.ordinal().should.equal(i)
        })
      })
    })
    testBasicRelation('BEFORE', PointIntervalRelation.BEFORE, 0, 'b')
    testBasicRelation('COMMENCES', PointIntervalRelation.COMMENCES, 1, 'c')
    testBasicRelation('IN', PointIntervalRelation.IN, 2, 'i')
    testBasicRelation('TERMINATES', PointIntervalRelation.TERMINATES, 3, 't')
    testBasicRelation('AFTER', PointIntervalRelation.AFTER, 4, 'a')
    describe('RELATIONS', function () {
      it('is an array', function () {
        PointIntervalRelation.RELATIONS.should.be.an.Array()
      })
      it('contains the exact amount of instances', function () {
        PointIntervalRelation.RELATIONS.length.should.equal(NR_OF_RELATIONS)
      })
      it('contains only PointIntervalRelations, which report as !isBasic and has NaN as ordinal, unless they are basic', function () {
        PointIntervalRelation.RELATIONS.forEach(gr => {
          gr.should.be.instanceof(PointIntervalRelation)
          if (!(PointIntervalRelation.BASIC_RELATIONS as readonly PointIntervalRelation[]).includes(gr)) {
            gr.isBasic().should.be.false()
            gr.ordinal().should.be.NaN()
          }
        })
      })
      it('does not contain duplicates', function () {
        PointIntervalRelation.RELATIONS.forEach((gr1, i1) => {
          PointIntervalRelation.RELATIONS.forEach((gr2, i2) => {
            if (i1 < i2) {
              gr1.should.not.equal(gr2)
            }
          })
        })
      })
      it('contains all basic relations', function () {
        PointIntervalRelation.BASIC_RELATIONS.forEach(br => {
          PointIntervalRelation.RELATIONS.includes(br)
        })
      })
    })
  })
  describe('special relations', function () {
    describe('EMPTY', function () {
      it('is a PointIntervalRelation', function () {
        EMPTY.should.be.instanceof(PointIntervalRelation)
      })
      it('is not implied by anything', function () {
        PointIntervalRelation.RELATIONS.filter(gr => gr !== EMPTY).forEach(gr => {
          EMPTY.impliedBy(gr).should.be.false()
        })
      })
    })
    describe('FULL', function () {
      it('is a PointIntervalRelation', function () {
        FULL.should.be.instanceof(PointIntervalRelation)
      })
      it('is implied by everything', function () {
        PointIntervalRelation.RELATIONS.forEach(gr => {
          FULL.impliedBy(gr).should.be.true()
        })
      })
    })
  })
  // isBasic is a basic inspector, and cannot be tested sensibly in isolation, but is tested as invariant
  // ordinal is a basic inspector, and cannot be tested sensibly in isolation, but is tested as invariant
  describe('#uncertainty', function () {
    it('returns NaN for EMPTY', function () {
      EMPTY.uncertainty().should.be.NaN()
    })
    PointIntervalRelation.BASIC_RELATIONS.forEach(br => {
      it(`returns 0 for ${br.toString()}`, function () {
        br.uncertainty().should.equal(0)
      })
    })
    it('returns 1 for FULL', function () {
      FULL.uncertainty().should.equal(1)
    })

    PointIntervalRelation.RELATIONS.forEach(gr => {
      if (gr !== EMPTY) {
        const expected =
          PointIntervalRelation.BASIC_RELATIONS.reduce((acc, br) => (br.implies(gr) ? acc + 1 : acc), -1) / 4
        it(`${gr.toString()} has uncertainty ${expected}`, function () {
          gr.uncertainty().should.equal(expected)
        })
      }
    })
  })
  describe('#impliedBy', function () {
    PointIntervalRelation.RELATIONS.forEach(gr => {
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
    PointIntervalRelation.BASIC_RELATIONS.forEach(br1 => {
      PointIntervalRelation.BASIC_RELATIONS.forEach(br2 => {
        if (br1 !== br2) {
          it(`${br1.toString()} is not implied by ${br2.toString()}`, function () {
            br1.impliedBy(br2).should.be.false()
          })
        }
      })
      it(`${br1.toString()} is implied by EMPTY`, function () {
        br1.impliedBy(EMPTY).should.be.true()
      })
      it(`${br1.toString()} is not implied by FULL`, function () {
        br1.impliedBy(FULL).should.be.false()
      })
    })
    PointIntervalRelation.RELATIONS.forEach(gr1 => {
      PointIntervalRelation.RELATIONS.forEach(gr2 => {
        const expected = PointIntervalRelation.BASIC_RELATIONS.every(br => !gr2.impliedBy(br) || gr1.impliedBy(br))

        it(`should return ${gr1.toString()}.impliedBy(${gr2.toString()}) as ${expected.toString()}`, function () {
          gr1.impliedBy(gr2).should.equal(expected)
        })
      })
    })
  })
  describe('#implies', function () {
    PointIntervalRelation.RELATIONS.forEach(gr => {
      it(`EMPTY implies ${gr.toString()}`, function () {
        EMPTY.implies(gr).should.be.true()
      })
    })
    PointIntervalRelation.BASIC_RELATIONS.forEach(br1 => {
      PointIntervalRelation.BASIC_RELATIONS.forEach(br2 => {
        if (br1 !== br2) {
          it(`${br1.toString()} does not imply ${br2.toString()}`, function () {
            br1.implies(br2).should.be.false()
          })
        }
      })
      it(`${br1.toString()} does not imply EMPTY`, function () {
        br1.implies(EMPTY).should.be.false()
      })
      it(`${br1.toString()} implies FULL`, function () {
        br1.implies(FULL).should.be.true()
      })
    })
    PointIntervalRelation.RELATIONS.forEach(gr1 => {
      PointIntervalRelation.RELATIONS.forEach(gr2 => {
        it(`${gr1.toString()}.implies(${gr2.toString()}) === ${gr2.toString()}.impliedBy(${gr1.toString()})`, function () {
          gr1.implies(gr2).should.equal(gr2.impliedBy(gr1))
        })
      })
    })
  })
  describe('#complement', function () {
    PointIntervalRelation.RELATIONS.forEach(gr => {
      it(`the complement of ${gr.toString()} is implied by the basic relations that are not implied by it`, function () {
        const result = gr.complement()
        PointIntervalRelation.BASIC_RELATIONS.forEach(br => {
          gr.impliedBy(br).should.equal(!result.impliedBy(br))
        })
      })
      it(`the complement of the complement if ${gr.toString()} is ${gr.toString()}`, function () {
        const result = gr.complement().complement()
        result.should.equal(gr)
      })
    })
  })
  describe('#min', function () {
    PointIntervalRelation.RELATIONS.forEach(gr1 => {
      PointIntervalRelation.RELATIONS.forEach(gr2 => {
        it(`${gr1.toString()}.min(${gr2.toString()}) has the basic relations of ${gr1.toString()} that are not implied by ${gr2.toString()}`, function () {
          const result = gr1.min(gr2)
          PointIntervalRelation.BASIC_RELATIONS.forEach(br =>
            result.impliedBy(br).should.equal(gr1.impliedBy(br) && !gr2.impliedBy(br))
          )
        })
      })
    })
  })
  describe('or', function () {
    PointIntervalRelation.RELATIONS.forEach(gr1 => {
      PointIntervalRelation.RELATIONS.forEach(gr2 => {
        it(`or(${gr1.toString()}, ${gr2.toString()}) has the basic relations of both`, function () {
          const args = [gr1, gr2]
          const result = PointIntervalRelation.or(...args)
          PointIntervalRelation.BASIC_RELATIONS.forEach(br =>
            result.impliedBy(br).should.equal(args.some(gr => gr.impliedBy(br)))
          )
        })
      })
    })
    it('the or of all basic point relations is FULL', function () {
      const result = PointIntervalRelation.or(...PointIntervalRelation.BASIC_RELATIONS)
      result.should.equal(FULL)
    })
    it('the or of all point relations is FULL', function () {
      const result = PointIntervalRelation.or(...PointIntervalRelation.RELATIONS)
      result.should.equal(FULL)
    })
  })
  describe('and', function () {
    PointIntervalRelation.RELATIONS.forEach(gr1 => {
      PointIntervalRelation.RELATIONS.forEach(gr2 => {
        it(`and(${gr1.toString()}, ${gr2.toString()}) has the common basic relations`, function () {
          const args = [gr1, gr2]
          const result = PointIntervalRelation.and(...args)
          PointIntervalRelation.BASIC_RELATIONS.forEach(br =>
            result.impliedBy(br).should.equal(args.every(gr => gr.impliedBy(br)))
          )
        })
      })
    })
    it('the and of all basic point relations is EMPTY', function () {
      const result = PointIntervalRelation.and(...PointIntervalRelation.BASIC_RELATIONS)
      result.should.equal(EMPTY)
    })
    it('the and of all point relations is FULL', function () {
      const result = PointIntervalRelation.and(...PointIntervalRelation.RELATIONS)
      result.should.equal(EMPTY)
    })
  })
  describe('fromString', function () {
    PointIntervalRelation.RELATIONS.forEach(gr => {
      const representation = gr.toString()
      it(`recognizes ${representation} correctly`, function () {
        const result = PointIntervalRelation.fromString(representation)
        result.should.equal(gr)
      })
    })
  })
  describe('relation', function () {
    const fivePoints = [-6, -4.983458, -1, 2, Math.PI]
    const fiveStrings = ['a smallest', 'b less small', 'c medium', 'd larger', 'e largest']

    function generatePointIntervalRelationTests<T> (
      label: string,
      interval: Interval<T>,
      points: T[],
      expected: PointIntervalRelation[],
      compare?: (a1: T, a2: T) => number
    ): void {
      function callIt<T> (t: T | undefined, i: Interval<T>): PointIntervalRelation {
        return compare != null
          ? /* prettier-ignore */ PointIntervalRelation.relation(
            t as Parameters<typeof compare>[0],
            (i as unknown) as Interval<Parameters<typeof compare>[0]>,
            compare
          )
          : PointIntervalRelation.relation(t, i)
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
        it('returns FULL for `null`', function () {
          const result = callIt(null, interval)
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
        const ita = PointIntervalRelation.fromString('ita')
        const bci = PointIntervalRelation.fromString('bci')
        generatePointIntervalRelationTests(
          'fully qualified',
          { start: points[1], end: points[3] },
          points,
          [
            PointIntervalRelation.BEFORE,
            PointIntervalRelation.COMMENCES,
            PointIntervalRelation.IN,
            PointIntervalRelation.TERMINATES,
            PointIntervalRelation.AFTER
          ],
          compare
        )
        generatePointIntervalRelationTests(
          'unkown end',
          { start: points[1], end: undefined },
          points,
          [PointIntervalRelation.BEFORE, PointIntervalRelation.COMMENCES, ita, ita, ita],
          compare
        )
        generatePointIntervalRelationTests(
          'unknown start',
          { start: undefined, end: points[3] },
          points,
          [bci, bci, bci, PointIntervalRelation.TERMINATES, PointIntervalRelation.AFTER],
          compare
        )
      })
    }

    generateAllPointIntervalRelationTests('number', fivePoints)
    generateAllPointIntervalRelationTests('string', fiveStrings)
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
    generateAllPointIntervalRelationTests(
      'symbol',
      fiveStrings.map(s => Symbol(s)),
      (s1: Symbol, s2: Symbol): number => (s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0)
    )
  })
})
