/* eslint-env mocha */

import 'should'
import { nrOfRelations } from '../src/bitPattern'
import { Relation, RelationConstructor } from '../src/Relation'

export interface BasicRelationExpectations {
  name: string
  representation: string
}

export function generateRelationTests<R extends Relation> (
  relationName: string,
  RConstructor: RelationConstructor<R>,
  basicRelationConstants: BasicRelationExpectations[],
  fullCombinationTest: boolean
): void {
  const EMPTY: R = RConstructor.emptyRelation()
  const FULL: R = RConstructor.fullRelation()

  interface RCombination {
    r1: R
    r2: R
  }

  before(function () {
    this['to'] = Math.max(Math.pow(2, 2 * RConstructor.NR_OF_BITS) / 1e3, 1e3)
    this.timeout(this['to'])

    this['sparseBrCombinations'] = RConstructor.BASIC_RELATIONS.reduce(
      (acc1: RCombination[], br1: R, i: number) =>
        RConstructor.BASIC_RELATIONS.slice(i + 1).reduce((acc2: RCombination[], br2: R) => {
          acc2.push({ r1: br1, r2: br2 })
          return acc2
        }, acc1),
      []
    )

    this[
      'grCombinations'
    ] = /* prettier-ignore */ fullCombinationTest
      ? RConstructor.RELATIONS.reduce(
        (acc1: RCombination[], gr1: R) =>
          RConstructor.RELATIONS.reduce((acc2: RCombination[], gr2: R) => {
            acc2.push({ r1: gr1, r2: gr2 })
            return acc2
          }, acc1),
        []
      )
      : RConstructor.RELATIONS.map((r1, i) => ({
        r1,
        r2: RConstructor.RELATIONS[RConstructor.RELATIONS.length - i - 1]
      }))
  })
  describe('nr of test cases', function () {
    it('sparse basic relations', function () {
      // console.log(this['sparseBrCombinations'].length)
      const expected = ((RConstructor.NR_OF_BITS - 1) * RConstructor.NR_OF_BITS) / 2
      this['sparseBrCombinations'].length.should.equal(expected)
    })
    it('relation combinations', function () {
      // console.log(`${this['grCombinations'].length as number} (timeout: ${this['to'] as number})`)
      const expected = fullCombinationTest
        ? Math.pow(2, 2 * RConstructor.NR_OF_BITS)
        : nrOfRelations(RConstructor.NR_OF_BITS)
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
    it(`${
      fullCombinationTest ? 'all' : ''
    } relation combinations are implied by each other or not as expected`, function () {
      this.timeout(this['to'])

      const combinations: RCombination[] = this['grCombinations']
      combinations.forEach(({ r1, r2 }) => {
        const expected = RConstructor.BASIC_RELATIONS.every(br => !r2.impliedBy(br) || r1.impliedBy(br))
        r1.impliedBy(r2).should.equal(expected)
      })
    })
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
    it(`for ${
      fullCombinationTest ? 'all' : ''
    } relation combinations \`r1\`, \`r2\`, \`r1.implies(r2) === r2.impliedBy(r1)\``, function () {
      this.timeout(this['to'])

      const combinations: RCombination[] = this['grCombinations']
      combinations.forEach(({ r1, r2 }) => {
        r1.implies(r2).should.equal(r2.impliedBy(r1))
      })
    })
  })
  describe('#converse', function () {
    it('the converse of each relation is implied by the converse of all basic relations that are implied by it', function () {
      RConstructor.RELATIONS.forEach(gr => {
        const result = gr.converse()
        RConstructor.BASIC_RELATIONS.forEach(br => {
          if (gr.impliedBy(br)) {
            result.impliedBy(br.converse()).should.be.true()
          }
        })
      })
    })
    it('each relation is implied by all basic relations whose converse are implied by the relations converse', function () {
      RConstructor.RELATIONS.forEach(gr => {
        const result = gr.converse()
        RConstructor.BASIC_RELATIONS.forEach(br => {
          if (result.impliedBy(br.converse())) {
            gr.impliedBy(br)
              .should.be.true()
              .should.be.true()
          }
        })
      })
    })
    it('all relations are their own converse‘s converse', function () {
      RConstructor.RELATIONS.forEach(gr => {
        gr.converse()
          .converse()
          .should.equal(gr)
      })
    })
    it('the converse of each basic relation is at the same index in the reversed BASIC_RELATIONS array', function () {
      const lastIndex = RConstructor.NR_OF_BITS - 1
      RConstructor.BASIC_RELATIONS.forEach((br, i) => {
        br.converse().should.equal(RConstructor.BASIC_RELATIONS[lastIndex - i])
      })
    })
    it('the converse of each relation is at the same index in the reversed RELATIONS array', function () {
      const lastIndex = nrOfRelations(RConstructor.NR_OF_BITS) - 1
      RConstructor.RELATIONS.forEach((br, i) => {
        br.converse().should.equal(RConstructor.RELATIONS[lastIndex - i])
      })
    })
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
  describe('#min', function () {
    function check (ra: R, rb: R): void {
      const result = ra.min(rb)
      RConstructor.BASIC_RELATIONS.forEach(br =>
        result.impliedBy(br).should.equal(ra.impliedBy(br) && !rb.impliedBy(br))
      )
    }
    it(`for ${
      fullCombinationTest ? 'all' : ''
    } relation combinations \`r1\`, \`r2\`, \`r1.min(r2)\` has the basic relations of \`r1\` that are not implied by \`r2\`, and vice versa`, function () {
      this.timeout(this['to'])

      const combinations: RCombination[] = this['grCombinations']
      combinations.forEach(({ r1, r2 }) => {
        check(r1, r2)
        check(r2, r1)
      })
    })
  })
  describe('or', function () {
    it(`for ${
      fullCombinationTest ? 'all' : ''
    } relation combinations, \`or\` has the basic relations of both`, function () {
      this.timeout(this['to'])

      const combinations: RCombination[] = this['grCombinations']
      combinations.forEach(({ r1, r2 }) => {
        const args: R[] = [r1, r2]
        const result = RConstructor.or(...args)
        RConstructor.BASIC_RELATIONS.forEach(br => result.impliedBy(br).should.equal(args.some(gr => gr.impliedBy(br))))
      })
    })
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
    it(`for ${
      fullCombinationTest ? 'all' : ''
    } relation combinations, \`and\` has the common basic relations`, function () {
      this.timeout(this['to'])

      const combinations: RCombination[] = this['grCombinations']
      combinations.forEach(({ r1, r2 }) => {
        const args: R[] = [r1, r2]
        const result = RConstructor.and(...args)
        RConstructor.BASIC_RELATIONS.forEach(br =>
          result.impliedBy(br).should.equal(args.every(gr => gr.impliedBy(br)))
        )
      })
    })
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
