/* eslint-env mocha */

import 'should'
import { nrOfRelations } from '../src/relationBitPattern'
import { Relation, RelationConstructor } from '../src/Relation'

export interface BasicRelationExpectations {
  name: string
  representation: string
}

export function generateRelationTests<R extends Relation> (
  relationName: string,
  RConstructor: RelationConstructor<R>,
  basicRelationConstants: BasicRelationExpectations[]
): void {
  const EMPTY: R = RConstructor.emptyRelation()
  const FULL: R = RConstructor.fullRelation()

  interface RCombination {
    r1: R
    r2: R
  }

  before(function () {
    this.timeout(Math.pow(2, 2 * RConstructor.NR_OF_BITS) / 1e3)

    this['sparseBrCombinations'] = RConstructor.BASIC_RELATIONS.reduce(
      (acc1: RCombination[], br1: R, i: number) =>
        RConstructor.BASIC_RELATIONS.slice(i + 1).reduce((acc2: RCombination[], br2: R) => {
          acc2.push({ r1: br1, r2: br2 })
          return acc2
        }, acc1),
      []
    )

    this['grCombinations'] = RConstructor.RELATIONS.reduce(
      (acc1: RCombination[], gr1: R) =>
        RConstructor.RELATIONS.reduce((acc2: RCombination[], gr2: R) => {
          acc2.push({ r1: gr1, r2: gr2 })
          return acc2
        }, acc1),
      []
    )
  })
  describe('nr of test cases', function () {
    it('sparse basic relations', function () {
      console.log(this['sparseBrCombinations'].length)
      const expected = ((RConstructor.NR_OF_BITS - 1) * RConstructor.NR_OF_BITS) / 2
      this['sparseBrCombinations'].length.should.equal(expected)
    })
    it('all relation combinations', function () {
      console.log(this['grCombinations'].length)
      const expected = Math.pow(2, 2 * RConstructor.NR_OF_BITS)
      this['grCombinations'].length.should.equal(expected)
    })
  })
  describe('BASIC_RELATIONS', function () {
    it('is an array', function () {
      RConstructor.BASIC_RELATIONS.should.be.an.Array()
    })
    it(`has ${RConstructor.NR_OF_BITS} entries`, function () {
      RConstructor.BASIC_RELATIONS.length.should.equal(RConstructor.NR_OF_BITS)
    })
    it(`contains only basic ${relationName}s`, function () {
      RConstructor.BASIC_RELATIONS.forEach(br => {
        br.isBasic().should.be.true()
      })
    })
    it('has no duplicates, and this is a basis', function () {
      const combinations: RCombination[] = this['sparseBrCombinations']
      combinations.forEach(({ r1, r2 }) => {
        r1.should.not.equal(r2)
        r1.implies(r2).should.be.false()
        r2.implies(r1).should.be.false()
      })
    })
    it('has the basic relation at the position of its ordinal', function () {
      RConstructor.BASIC_RELATIONS.forEach((br, i) => {
        br.ordinal().should.equal(i)
      })
    })
  })
  basicRelationConstants.forEach(({ name, representation }, i) => {
    function basicRelation (brName: string): R {
      return (RConstructor as any)[brName]
    }

    describe(name, function () {
      it(`${name} is a static property of ${relationName}`, function () {
        RConstructor.should.have.property(name)
      })
      it(`${name} is a ${relationName}`, function () {
        basicRelation(name).should.be.instanceof(RConstructor)
      })
      it(`is a basic ${relationName}`, function () {
        basicRelation(name)
          .isBasic()
          .should.be.true()
      })
      it(`has ${i} as ordinal`, function () {
        basicRelation(name)
          .ordinal()
          .should.equal(i)
      })
      it(`has an integer ordinal [0, ${RConstructor.NR_OF_BITS}[`, function () {
        const o = basicRelation(name).ordinal()
        Number.isInteger(o).should.be.true()
        o.should.be.greaterThanOrEqual(0)
        o.should.be.lessThan(RConstructor.NR_OF_BITS)
      })
      it('is in BASIC_RELATIONS at the position of its ordinal', function () {
        RConstructor.BASIC_RELATIONS[basicRelation(name).ordinal()].should.equal(basicRelation(name))
      })
      it(`has '${representation}' as representation`, function () {
        basicRelation(name)
          .toString()
          .should.equal(`(${representation})`)
        basicRelation(name)
          .toString()
          .should.equal(`(${RConstructor.BASIC_REPRESENTATIONS[i]})`)
      })
    })
  })
  describe('RELATIONS', function () {
    it('is an array', function () {
      RConstructor.RELATIONS.should.be.an.Array()
    })
    it('contains the exact amount of instances', function () {
      RConstructor.RELATIONS.length.should.equal(nrOfRelations(RConstructor.NR_OF_BITS))
    })
    it(`contains only ${relationName}s, which report as !isBasic and has NaN as ordinal, unless they are basic`, function () {
      RConstructor.RELATIONS.forEach(gr => {
        gr.should.be.instanceof(RConstructor)
        if (!RConstructor.BASIC_RELATIONS.includes(gr)) {
          gr.isBasic().should.be.false()
          gr.ordinal().should.be.NaN()
        }
      })
    })
    it('does not contain duplicates', function () {
      /* IDEA A naive implementation iterates 67 108 864 times, and takes several minutes. This is optimized using a
         Set. */
      const gathering = new Set<R>()

      RConstructor.RELATIONS.forEach((gr, i) => {
        gathering.size.should.equal(i)
        gathering.has(gr).should.be.false()
        gathering.add(gr)
      })
    })
    it('contains all basic relations', function () {
      RConstructor.BASIC_RELATIONS.forEach(br => {
        RConstructor.RELATIONS.includes(br)
      })
    })
  })
  describe('special relations', function () {
    describe('EMPTY', function () {
      it(`is a ${relationName}`, function () {
        EMPTY.should.be.instanceof(RConstructor)
      })
      it('is not implied by anything', function () {
        RConstructor.RELATIONS.forEach(gr => {
          if (gr !== EMPTY) {
            EMPTY.impliedBy(gr).should.be.false()
          } else {
            EMPTY.impliedBy(gr).should.be.true()
          }
        })
      })
    })
    describe('FULL', function () {
      it(`is a ${relationName}`, function () {
        FULL.should.be.instanceof(RConstructor)
      })
      it('is implied by everything', function () {
        RConstructor.RELATIONS.forEach(gr => {
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
    it('returns 0 for each basic relation', function () {
      RConstructor.BASIC_RELATIONS.forEach(br => {
        br.uncertainty().should.equal(0)
      })
    })
    it('returns 1 for FULL', function () {
      FULL.uncertainty().should.equal(1)
    })
    it('has the expected uncertainty for all relations', function () {
      RConstructor.RELATIONS.forEach(gr => {
        if (gr !== EMPTY) {
          const expected =
            RConstructor.BASIC_RELATIONS.reduce((acc, br) => (br.implies(gr) ? acc + 1 : acc), -1) /
            (RConstructor.NR_OF_BITS - 1)
          gr.uncertainty().should.equal(expected)
        }
      })
    })
  })
  describe('#impliedBy', function () {
    it('no relations, except EMPTY, are implied by EMPTY', function () {
      RConstructor.RELATIONS.forEach(gr => {
        if (gr === EMPTY) {
          EMPTY.impliedBy(gr).should.be.true()
        } else {
          EMPTY.impliedBy(gr).should.be.false()
        }
      })
    })
    it('basic relations are not implied by each other', function () {
      const combinations: RCombination[] = this['sparseBrCombinations']
      combinations.forEach(({ r1, r2 }) => {
        r1.impliedBy(r2).should.be.false()
        r2.impliedBy(r1).should.be.false()
      })
    })
    it('all relations are implied by EMPTY', function () {
      RConstructor.BASIC_RELATIONS.forEach(br1 => {
        br1.impliedBy(EMPTY).should.be.true()
      })
    })
    it('no relation is implied by FULL', function () {
      RConstructor.BASIC_RELATIONS.forEach(br1 => {
        br1.impliedBy(FULL).should.be.false()
      })
    })
    //   RConstructor.RELATIONS.forEach(gr1 => {
    //     RConstructor.RELATIONS.forEach(gr2 => {
    //       const expected = RConstructor.BASIC_RELATIONS.every(br => !gr2.impliedBy(br) || gr1.impliedBy(br))
    //
    //       it(`should return ${gr1.toString()}.impliedBy(${gr2.toString()}) as ${expected.toString()}`, function () {
    //         gr1.impliedBy(gr2).should.equal(expected)
    //       })
    //     })
    //   })
  })
  describe('#implies', function () {
    it('EMPTY implies all relations', function () {
      RConstructor.RELATIONS.forEach(gr => {
        EMPTY.implies(gr).should.be.true()
      })
    })
    it('basic relations do not imply each other', function () {
      const combinations: RCombination[] = this['sparseBrCombinations']
      combinations.forEach(({ r1, r2 }) => {
        r1.implies(r2).should.be.false()
        r2.implies(r1).should.be.false()
      })
    })
    it('basic relations do not imply each other', function () {
      const combinations: RCombination[] = this['sparseBrCombinations']
      combinations.forEach(({ r1, r2 }) => {
        r1.implies(r2).should.be.false()
        r2.implies(r1).should.be.false()
      })
    })
    it('no relation implies EMPTY', function () {
      RConstructor.BASIC_RELATIONS.forEach(br1 => {
        br1.implies(EMPTY).should.be.false()
      })
    })
    it('all relations imply FULL', function () {
      RConstructor.BASIC_RELATIONS.forEach(br1 => {
        br1.implies(FULL).should.be.true()
      })
    })
    //   RConstructor.RELATIONS.forEach(gr1 => {
    //     RConstructor.RELATIONS.forEach(gr2 => {
    //       it(`${gr1.toString()}.implies(${gr2.toString()}) === ${gr2.toString()}.impliedBy(${gr1.toString()})`, function () {
    //         gr1.implies(gr2).should.equal(gr2.impliedBy(gr1))
    //       })
    //     })
    //   })
  })
  describe('#complement', function () {
    it('the complement of each relation is implied by all basic relations that are not implied by it', function () {
      RConstructor.RELATIONS.forEach(gr => {
        const result = gr.complement()
        RConstructor.BASIC_RELATIONS.forEach(br => {
          gr.impliedBy(br).should.equal(!result.impliedBy(br))
        })
      })
    })
    it('all relations are their own complement‘s complement', function () {
      RConstructor.RELATIONS.forEach(gr => {
        gr.complement()
          .complement()
          .should.equal(gr)
      })
    })
  })
  // describe('#min', function () {
  //   RConstructor.RELATIONS.forEach(gr1 => {
  //     RConstructor.RELATIONS.forEach(gr2 => {
  //       it(`${gr1.toString()}.min(${gr2.toString()}) has the basic relations of ${gr1.toString()} that are not implied by ${gr2.toString()}`, function () {
  //         const result = gr1.min(gr2)
  //         RConstructor.BASIC_RELATIONS.forEach(br =>
  //           result.impliedBy(br).should.equal(gr1.impliedBy(br) && !gr2.impliedBy(br))
  //         )
  //       })
  //     })
  //   })
  // })
  describe('or', function () {
    //   RConstructor.RELATIONS.forEach(gr1 => {
    //     RConstructor.RELATIONS.forEach(gr2 => {
    //       it(`or(${gr1.toString()}, ${gr2.toString()}) has the basic relations of both`, function () {
    //         const args = [gr1, gr2]
    //         const result = RConstructor.or(...args)
    //         RConstructor.BASIC_RELATIONS.forEach(br =>
    //           result.impliedBy(br).should.equal(args.some(gr => gr.impliedBy(br)))
    //         )
    //       })
    //     })
    //   })
    it('the or of all basic relations is FULL', function () {
      const result = RConstructor.or(...RConstructor.BASIC_RELATIONS)
      result.should.equal(FULL)
    })
    it('the or of all relations is FULL', function () {
      const result = RConstructor.or(...RConstructor.RELATIONS)
      result.should.equal(FULL)
    })
  })
  describe('and', function () {
    //   RConstructor.RELATIONS.forEach(gr1 => {
    //     RConstructor.RELATIONS.forEach(gr2 => {
    //       it(`and(${gr1.toString()}, ${gr2.toString()}) has the common basic relations`, function () {
    //         const args = [gr1, gr2]
    //         const result = RConstructor.and(...args)
    //         RConstructor.BASIC_RELATIONS.forEach(br =>
    //           result.impliedBy(br).should.equal(args.every(gr => gr.impliedBy(br)))
    //         )
    //       })
    //     })
    //   })
    it('the and of all basic relations is EMPTY', function () {
      const result = RConstructor.and(...RConstructor.BASIC_RELATIONS)
      result.should.equal(EMPTY)
    })
    it('the and of all relations is EMPTY', function () {
      const result = RConstructor.and(...RConstructor.RELATIONS)
      result.should.equal(EMPTY)
    })
  })
  describe('fromString', function () {
    it('each relation can be found with its own toString', function () {
      RConstructor.RELATIONS.forEach(gr => {
        RConstructor.fromString(gr.toString()).should.equal(gr)
      })
    })
  })
}
