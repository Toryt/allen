import 'should'
import { basicRelationBitPatterns, relationBitPatterns } from '../src/bitPattern'
import { Relation } from '../src/Relation'

class E extends Relation {
  public static readonly NR_OF_BITS = 3
  public static readonly BASIC_REPRESENTATIONS = Object.freeze(['x', 'y', 'z'] as const)

  public static readonly RELATIONS: readonly E[] = Object.freeze(
    relationBitPatterns(this.NR_OF_BITS).map(bitPattern => new E(bitPattern))
  )

  public static readonly BASIC_RELATIONS: readonly E[] = Object.freeze(
    basicRelationBitPatterns(this.NR_OF_BITS).map(bitPattern => E.RELATIONS[bitPattern])
  )

  extraMethod (): number {
    return 4
  }
}

describe('usage', function () {
  it('has a typed EMPTY', function () {
    const EMPTY: E = E.emptyRelation<E>()
    EMPTY.toString().should.equal('()')
  })
  it('has a typed FULL', function () {
    const FULL = E.fullRelation<E>()
    FULL.toString().should.equal('(xyz)')
  })
  it('has typed basic relations', function () {
    const basicRelations: readonly E[] = E.BASIC_RELATIONS
    const X: E = basicRelations[0]
    X.ordinal().should.equal(0)
  })
  it('has typed relations', function () {
    const relations: readonly E[] = E.RELATIONS
    const X: E = relations[1]
    X.ordinal().should.equal(0)
  })
  it('supports converse', function () {
    const relations = E.RELATIONS
    const one: E = relations[2]
    const result: E = one.converse()
    result.should.be.instanceof(E)
  })
  it('supports complement', function () {
    const relations = E.RELATIONS
    const one: E = relations[2]
    const result: E = one.complement()
    result.should.be.instanceof(E)
  })
  it('supports implied by', function () {
    const relations = E.RELATIONS
    const one: E = relations[3]
    const other = relations[5]
    one.impliedBy(other).should.be.a.Boolean()
  })
  it('supports implies', function () {
    const relations = E.RELATIONS
    const one = relations[3]
    const other: E = relations[5]
    const typedOne: E = one
    typedOne.implies(other).should.be.a.Boolean()
  })
  it('supports min', function () {
    const relations = E.RELATIONS
    const one = relations[3]
    const other = relations[5]
    const third = relations[7]
    const result1 = one.min(other)
    result1.should.be.instanceof(E)
    const result2 = third.min(result1)
    result2.should.be.instanceof(E)
    const result3: E = result1.min(third)
    result3.should.be.instanceof(E)
  })
  it('supports or', function () {
    const relations = E.RELATIONS
    const one = relations[3]
    const other = relations[5]
    const third = relations[7]
    const result1 = E.or(one, other)
    result1.should.be.instanceof(E)
    const result2: E = E.or(result1, third)
    result2.should.be.instanceof(E)
  })
  it('supports and', function () {
    const relations = E.RELATIONS
    const one = relations[3]
    const other = relations[5]
    const third = relations[7]
    const result1: E = E.and(one, other)
    result1.should.be.instanceof(E)
    const result2: E = E.and(third, result1)
    result2.should.be.instanceof(E)
  })
  it('supports fromString', function () {
    const result: E = E.fromString<E>('xy')
    result.should.be.instanceof(E)
  })
  it('supports extraMethod', function () {
    const relations = E.RELATIONS
    const one = relations[3]
    one.extraMethod().should.be.ok()
  })
})