/*
 Copyright © 2022 – 2023 by Jan Dockx
 
 Licensed under the Apache License, Version 2.0 (the “License”);
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an “AS IS” BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* eslint-env mocha */

import 'should'
import { nrOfRelations, relationBitPatterns } from '../src/bitPattern'
import { type Relation, type RelationConstructor } from '../src/Relation'

export interface RelationExpectations {
  name: string
  representation: string
}

export function generateRelationTests<R extends Relation>(
  relationName: string,
  RConstructor: RelationConstructor<R>,
  basicRelationConstants: RelationExpectations[],
  secondaryRelationConstants: RelationExpectations[],
  fullCombinationTest: boolean
): void {
  const allRelations: readonly R[] = relationBitPatterns(RConstructor.NR_OF_BITS).map(bitPattern =>
    RConstructor.generalRelation(bitPattern)
  )
  const EMPTY: R = RConstructor.emptyRelation()
  const FULL: R = RConstructor.fullRelation()

  interface RCombination {
    r1: R
    r2: R
  }

  function relationConstant(brName: string): R {
    return (RConstructor as any)[brName]
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

    this['grCombinations'] = fullCombinationTest
      ? allRelations.reduce(
          (acc1: RCombination[], gr1: R) =>
            allRelations.reduce((acc2: RCombination[], gr2: R) => {
              acc2.push({ r1: gr1, r2: gr2 })
              return acc2
            }, acc1),
          []
        )
      : allRelations.map((r1, i) => ({
          r1,
          r2: allRelations[allRelations.length - i - 1]
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
  describe('basic relations', function () {
    basicRelationConstants.forEach(({ name, representation }, i) => {
      describe(name, function () {
        it(`${name} is a static property of ${relationName}`, function () {
          RConstructor.should.have.property(name)
        })
        it(`${name} is a ${relationName}`, function () {
          relationConstant(name).should.be.instanceof(RConstructor)
        })
        it(`is a basic ${relationName}`, function () {
          relationConstant(name).isBasic().should.be.true()
        })
        it(`has ${i} as ordinal`, function () {
          relationConstant(name).ordinal().should.equal(i)
        })
        it(`has an integer ordinal [0, ${RConstructor.NR_OF_BITS}[`, function () {
          const o = relationConstant(name).ordinal()
          Number.isInteger(o).should.be.true()
          o.should.be.greaterThanOrEqual(0)
          o.should.be.lessThan(RConstructor.NR_OF_BITS)
        })
        it('is in BASIC_RELATIONS at the position of its ordinal', function () {
          RConstructor.BASIC_RELATIONS[relationConstant(name).ordinal()].should.equal(relationConstant(name))
        })
        it(`has '${representation}' as representation`, function () {
          relationConstant(name).toString().should.equal(`(${representation})`)
          relationConstant(name).toString().should.equal(`(${RConstructor.BASIC_REPRESENTATIONS[i]})`)
        })
      })
    })
  })

  describe('RELATIONS', function () {
    // it('is an array', function () {
    //   allRelations.should.be.an.Array()
    // })
    // it('contains the exact amount of instances', function () {
    //   allRelations.length.should.equal(nrOfRelations(RConstructor.NR_OF_BITS))
    // })
    it(`contains only ${relationName}s, which report as !isBasic and has NaN as ordinal, unless they are basic`, function () {
      allRelations.forEach(gr => {
        gr.should.be.instanceof(RConstructor)
        if (!RConstructor.BASIC_RELATIONS.includes(gr)) {
          gr.isBasic().should.be.false()
          gr.ordinal().should.be.NaN()
        }
      })
    })
    it('does not contain duplicates', function () {
      /* NOTE: A naive implementation iterates 67 108 864 times, and takes several minutes. This is optimized using a
               Set. */
      const gathering = new Set<R>()

      allRelations.forEach((gr, i) => {
        gathering.size.should.equal(i)
        gathering.has(gr).should.be.false()
        gathering.add(gr)
      })
    })
    it('contains all basic relations', function () {
      RConstructor.BASIC_RELATIONS.forEach(br => {
        allRelations.includes(br)
      })
    })
  })
  describe('special relations', function () {
    describe('EMPTY', function () {
      it(`is a ${relationName}`, function () {
        EMPTY.should.be.instanceof(RConstructor)
      })
      it('is not implied by anything', function () {
        allRelations.forEach(gr => {
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
        allRelations.forEach(gr => {
          FULL.impliedBy(gr).should.be.true()
        })
      })
    })
  })
  describe('secondary relations', function () {
    secondaryRelationConstants.forEach(({ name, representation }) => {
      it(`${name} is the expected relation, represented by ${representation}`, function () {
        const r: R = relationConstant(name)
        const expected = RConstructor.fromString(representation)
        r.should.equal(expected)
        r.toString().should.equal(`(${representation})`)
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
      allRelations.forEach(gr => {
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
      allRelations.forEach(gr => {
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
      allRelations.forEach(gr => {
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
  describe('#complement', function () {
    it('the complement of each relation is implied by all basic relations that are not implied by it', function () {
      allRelations.forEach(gr => {
        const result = gr.complement()
        RConstructor.BASIC_RELATIONS.forEach(br => {
          gr.impliedBy(br).should.equal(!result.impliedBy(br))
        })
      })
    })
    it('all relations are their own complement‘s complement', function () {
      allRelations.forEach(gr => {
        gr.complement().complement().should.equal(gr)
      })
    })
  })
  describe('#min', function () {
    function check(ra: R, rb: R): void {
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
      const result = RConstructor.or(...allRelations)
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
      const result = RConstructor.and(...allRelations)
      result.should.equal(EMPTY)
    })
  })
  describe('fromString', function () {
    it('each relation can be found with its own toString', function () {
      allRelations.forEach(gr => {
        RConstructor.fromString(gr.toString()).should.equal(gr)
      })
    })
  })
}
