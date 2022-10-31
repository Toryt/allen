import { Relation, BasicRelation, BasicRelationConstructor } from '../src/Relation'
import assert from 'assert'

export interface BasicRelationExpectations<BRR extends string, BR extends BasicRelation<BRR>> {
  name: string
  basicRelation: BR
  representation: BRR
}

export function generateRelationTests<R extends Relation, BRR extends string, BR extends R & BasicRelation<BRR>> (
  relationName: string,
  NR_OF_BITS: number,
  BasicRelationConstructor: BasicRelationConstructor<R, BRR, BR>,
  basicRelationExpectations: Array<BasicRelationExpectations<BRR, BasicRelation<BRR>>>,
  RelationConstructor: Function
): void {
  const expectedNumberOfRelations: number = Math.pow(2, NR_OF_BITS)
  const BASIC_REPRESENTATIONS: readonly BRR[] = BasicRelationConstructor.BASIC_REPRESENTATIONS
  const BASIC_RELATIONS: readonly BR[] = BasicRelationConstructor.BASIC_RELATIONS
  const RELATIONS: readonly R[] = BasicRelationConstructor.RELATIONS
  const EMPTY: R = BasicRelationConstructor.EMPTY
  const FULL: R = BasicRelationConstructor.FULL

  assert(Array.isArray(BASIC_REPRESENTATIONS))

  describe(relationName, function () {
    describe(`Basic${relationName}`, function () {
      describe('BASIC_RELATIONS', function () {
        it('is an array', function () {
          BASIC_RELATIONS.should.be.an.Array()
        })
        it(`has ${NR_OF_BITS} entries`, function () {
          BASIC_RELATIONS.length.should.equal(NR_OF_BITS)
        })
        it(`contains only Basic${relationName}`, function () {
          BASIC_RELATIONS.forEach(br => {
            br.should.be.instanceof(BasicRelationConstructor)
          })
        })
        it('has no duplicates, and this is a basis', function () {
          BASIC_RELATIONS.forEach((br1, i1) => {
            BASIC_RELATIONS.forEach((br2, i2) => {
              if (i1 < i2) {
                br1.should.not.equal(br2)
                br1.implies(br2).should.be.false()
                br2.implies(br1).should.be.false()
              }
            })
          })
        })
        it('has the basic relation at the position of its ordinal', function () {
          BASIC_RELATIONS.forEach((br, i) => {
            br.ordinal().should.equal(i)
          })
        })
      })
      describe('basic relation constants', function () {
        it('has the expected number of constants', function () {
          basicRelationExpectations.length.should.equal(NR_OF_BITS)
        })
        basicRelationExpectations.forEach(
          ({ name, basicRelation, representation }: BasicRelationExpectations<BRR, BasicRelation<BRR>>, i: number) => {
            describe(name, function () {
              it(`is a Basic${relationName}`, function () {
                basicRelation.should.be.instanceof(BasicRelationConstructor)
              })
              it(`has ${i} as ordinal`, function () {
                basicRelation.ordinal().should.equal(i)
              })
              it(`has an integer ordinal [0, ${NR_OF_BITS}[`, function () {
                const o = basicRelation.ordinal()
                Number.isInteger(o).should.be.true()
                o.should.be.greaterThanOrEqual(0)
                o.should.be.lessThan(NR_OF_BITS)
              })
              it(`has ${BASIC_REPRESENTATIONS[i] as string} as representation`, function () {
                basicRelation.representation.should.equal(BASIC_REPRESENTATIONS[i])
              })
              it('is in BASIC_RELATIONS at the position of its ordinal', function () {
                BASIC_RELATIONS[basicRelation.ordinal()].should.equal(basicRelation)
              })
              it(`has '${representation}' as representation`, function () {
                basicRelation.representation.should.equal(representation)
                basicRelation.representation.should.equal(BASIC_REPRESENTATIONS[basicRelation.ordinal()])
              })
            })
          }
        )
      })
      describe('RELATIONS', function () {
        it('is an array', function () {
          RELATIONS.should.be.an.Array()
        })
        it('contains the exact amount of instances', function () {
          RELATIONS.length.should.equal(expectedNumberOfRelations)
        })
        it(`contains only ${relationName}s`, function () {
          RELATIONS.forEach(gr => {
            gr.should.be.instanceof(RelationConstructor)
          })
        })
        it('does not contain duplicates', function () {
          /* IDEA A naive implementation iterates 67 108 864 times, and takes several minutes. This is optimized using a
           Set. */
          const gathering = new Set<R>()

          RELATIONS.forEach((gr, i) => {
            gathering.size.should.equal(i)
            gathering.has(gr).should.be.false()
            gathering.add(gr)
          })
        })
        it('contains all basic relations', function () {
          BASIC_RELATIONS.forEach(br => {
            RELATIONS.includes(br)
          })
        })
      })
    })
    describe('special relations', function () {
      describe('EMPTY', function () {
        it(`is an ${relationName}`, function () {
          EMPTY.should.be.instanceof(RelationConstructor)
        })
        it('is not implied by anything', function () {
          RELATIONS.filter(ar => ar !== EMPTY).forEach(ar => {
            EMPTY.impliedBy(ar).should.be.false()
          })
        })
      })
      describe('FULL', function () {
        it(`is an ${relationName}`, function () {
          FULL.should.be.instanceof(RelationConstructor)
        })
        it('is implied by everything', function () {
          RELATIONS.forEach(ar => {
            FULL.impliedBy(ar).should.be.true()
          })
        })
      })
    })
  })
}
