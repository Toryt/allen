import assert from 'assert'
import {
  bitCount,
  EMPTY_BIT_PATTERN,
  fullBitPattern,
  isBasicRelationBitPattern,
  nrOfRelations,
  reverse
} from './bitPattern'

export interface RelationConstructor<R extends Relation> extends Function {
  /* region definitions */
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * ### Invariants
   *
   * ```ts
   * Number.isInteger(NR_OF_BITS)
   * 0 <= NR_OF_BITS
   * ```
   */
  readonly NR_OF_BITS: number

  readonly BASIC_REPRESENTATIONS: readonly string[]

  /**
   * All possible relations.
   *
   * ### Invariants
   *
   * ```
   * Array.isArray(RELATIONS)
   * RELATIONS.length === NR_OF_RELATIONS
   * RELATIONS.every(gr => gr instanceof R)
   * RELATIONS.every((gr1, i1) => RELATIONS.every((gr2, i2) => i2 <= i1 || gr1 !== gr2))
   * ```
   *
   * There are no other relations than the instances of this array.
   *
   * Realize as
   *
   * ```ts
   * public static readonly RELATIONS: readonly R[] = Object.freeze(
   *   relationBitPatterns(this.NR_OF_BITS).map(bitPattern => new R(bitPattern))
   * )
   * ```
   */
  readonly RELATIONS: readonly R[]

  /**
   * All possible basic relations.
   *
   * This is an _orthogonal basis_ for all relations.
   *
   * ### Invariants
   *
   * ```
   * Array.isArray(BASIC_RELATIONS)
   * BASIC_RELATIONS.length === NR_OF_BITS
   * BASIC_RELATIONS.every(br => br instanceof R)
   * BASIC_RELATIONS.every(br => RELATIONS.includes(br))
   * BASIC_RELATIONS.every((br1, i1) =>
   *   BASIC_RELATIONS.every((br2, i2) => i2 <= i1 || br1 !== br2 && !br1.implies(br2) && !br2.implies(br1)))
   * ```
   *
   * There are no other basic relations than the instances of this array.
   *
   * Realize as
   *
   * ```ts
   * public static readonly BASIC_RELATIONS: readonly R[] = Object.freeze(
   *   basicRelationBitPatterns(this.NR_OF_BITS).map(bitPattern => R.RELATIONS[bitPattern])
   * )
   * ```
   */
  readonly BASIC_RELATIONS: readonly R[]

  /* endregion */

  /* region special relations */
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * This empty relation is not a true relation. It does not express a relational condition. Yet, it is needed for
   * consistency with some operations on relations.
   *
   * ### Invariants
   *
   * ```
   * R.RELATIONS.every(gr => gr === empty() || !empty().impliedBy(gr))
   * ```
   */
  readonly emptyRelation: () => R
  // Bit pattern: 0 = '00000'

  /**
   * The full relation, which expresses that nothing definite can be said about the relation.
   *
   * ### Invariants
   *
   * ```
   * R.RELATIONS.every(gr => full().impliedBy(gr))
   * ```
   */
  readonly fullRelation: () => R

  /* endregion */

  /* region selection functions */
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * The main factory method for relations.
   *
   * This is the union of all relations in {@code gr}, when they are considered as sets of basic relations.
   *
   * Although this is intended to create any disjunction of the basic relations, you can use any relation in the
   * argument list.
   *
   * @result BASIC_RELATIONS.every(br => result.impliedBy(br) === gr.some(gr => gr.impliedBy(br)))
   */
  readonly or: (...gr: R[]) => R

  /**
   * The conjunction of the point – interval relations in `gr`.
   * This is the intersection of all point – interval relations in `gr`, when they are considered as sets of basic
   * relations.
   *
   * @result BASIC_RELATIONS.every(br => result.impliedBy(br) === gr.every(gr => gr.impliedBy(br)))
   */
  readonly and: (...gr: R[]) => R

  /**
   * Pick the relation described by the string.
   *
   * The letters do not need to be in order. There can be meaningless letters. Letters can be duplicated.
   *
   * @returns RELATIONS.find(gr =>
   *            gr.toString()
   *               .filter(l => BASIC_REPRESENTATIONS.includes(l))
   *               .every(l => s.includes(l))
   */
  readonly fromString: (s: string) => R

  /* endregion */
}

/**
 * Support for reasoning about relations, and constraints on those relations.
 *
 * ### About the code
 *
 * We have chosen to introduce full-featured types for working with relations, although they are just bit patterns in
 * essence, to make encapsulation as good as possible. This has a slight performance overhead, but we believe that this
 * is worth it, considering the immense complexity of reasoning about relations.
 *
 * Relations follow the ‘NR_OF_RELATIONS-fold enumeration pattern’. All possible instances are created when this a
 * specific relation module is loaded, and it is impossible for a user to create new instances. This means that
 * reference equality (‘`===`’) can be used to compare relations. Instances are obtained using the constants this module
 * offers, or using
 *
 * - the combination methods
 *   - {@link or},
 *   - {@link and},
 *   - {@link min}, and
 * - the unary methods
 *   - {@link complement}, and
 *   - {@link converse}.
 *   - `compose`
 *
 * All instance methods in this class are _O(1)_, i.e., work in constant time, and all static methods are _O(n)_, i.e.,
 * work in linear time.
 *
 * ### Subclasses
 *
 * Create a subclass for a specific type of `Relation`. In that class, add all properties of {@link RelationConstructor}
 * as `static` members.
 */
export class Relation {
  /* Implementation note:

     Relations are implemented as a NR_OF_BITS-bit bit pattern, stored in the least significant bits of an integer
     number.

     Each of those bits represents a basic relation, being in the general relation (`1`) or not being in the general
     relation (`0`), where the relation is thought of as a set of basic relations.

     The order of the basic relations in the bit pattern is important for some algorithms. There is some trickery
     involved. */

  /**
   * Only the NR_OF_BITS lowest bits are used. The other (32 - NR_OF_BITS) are 0.
   */
  protected readonly bitPattern: number

  protected typedConstructor (): RelationConstructor<this> {
    // this cast means that _each subclass_ **MUST** override BASIC_RELATIONS and RELATIONS
    return this.constructor as RelationConstructor<this>
  }

  protected nrOfBits (): number {
    return this.typedConstructor().NR_OF_BITS
  }

  /**
   * There is only 1 constructor, that constructs the wrapper object
   * around the bitpattern. This is used exclusively in {@link RelationConstructor.RELATIONS} initialization code.
   */
  protected constructor (bitPattern: number) {
    assert(bitPattern >= EMPTY_BIT_PATTERN)
    assert(bitPattern <= nrOfRelations(this.nrOfBits()) - 1)

    this.bitPattern = bitPattern
  }

  /* region instance methods */
  // -------------------------------------------------------------------------------------------------------------------

  public isBasic (): boolean {
    return isBasicRelationBitPattern(this.nrOfBits(), this.bitPattern)
  }

  /**
   * An ordinal for basic relations (zero-based).
   *
   * Returns `NaN` for other relations.
   *
   * ### Invariants
   *
   * ```
   * isBasic() || Number.isNaN(this.ordinal())
   * !isBasic() || BASIC_RELATIONS[this.ordinal()] === this
   * ```
   */
  public ordinal (): number {
    /*
     * This is the bit position, 0-based, in the NR_OF_BITS-bit bit pattern, of the bit representing this as basic
     * relation.
     *
     * See https://www.geeksforgeeks.org/position-of-rightmost-set-bit/
     */
    return this.isBasic() ? Math.log2(this.bitPattern & -this.bitPattern) : NaN
  }

  /**
   * A measure about the uncertainty this relation expresses.
   *
   * This is the fraction of the basic relations that imply this general relation. {@link fullRelation} is complete
   * uncertainty, and returns `1`. A {@link RelationConstructor.BASIC_RELATIONS basic relation} is complete certainty,
   * and returns `0`.
   *
   * The {@link emptyRelation} relation has no meaningful uncertainty. This method returns `NaN` as value for the
   * {@link emptyRelation}.
   *
   * @returns this === emptyRelation()
   *            ? NaN
   *            : BASIC_RELATIONS.reduce((acc, br) => br.implies(this) ? acc + 1 : acc, -1) / (NR_OF_BITS - 1)
   */
  uncertainty (): number {
    const count = bitCount(this.bitPattern)
    if (count === 0) {
      return NaN
    }
    return (count - 1) / (this.nrOfBits() - 1)
  }

  /**
   * Is `this` implied by `gr`?
   *
   * In other words, when considering the relations as a set of basic relations, is `this` a superset of `gr`
   * (considering equality as also acceptable)?
   *
   * Represented in documentation as `this ⊇ gr`.
   *
   * ### Preconditions
   *
   * ```
   * gr instanceof R
   * ```
   *
   * ### Invariants
   *
   * ```
   * this.impliedBy(emptyRelation())
   * fullRelation().impliedBy(this)
   * this.impliedBy(this)
   * !this.isBasic() || BASIC_RELATIONS.every(br => br === this || !this.impliedBy(br))
   * ```
   *
   * @returns `BASIC_RELATIONS.every(br => !gr.impliedBy(br) || this.impliedBy(br))`
   */
  impliedBy (gr: this): boolean {
    assert(gr instanceof this.typedConstructor())

    return (this.bitPattern & gr.bitPattern) === gr.bitPattern
  }

  /**
   * Does `this` imply `gr`?
   *
   * In other words, when considering the relations as a set of basic relations, is `this` a subset of `gr` (considering
   * equality as also acceptable)?
   *
   * Represented in documentation as `this ⊆ gr`.
   *
   * ### Preconditions
   *
   * ```
   * gr instanceof PointIntervalRelation
   * ```
   *
   * ### Invariants
   *
   * ```
   * emptyRelation().implies(this)
   * this.implies(fullRelation())
   * this.implies(this)
   * !this.isBasic() || BASIC_RELATIONS.every(br => br === this || !this.implies(br))
   * ```
   *
   * @returns `gr.impliedBy(this)`
   */
  implies (gr: this): boolean {
    assert(gr instanceof this.typedConstructor())

    return (gr.bitPattern & this.bitPattern) === this.bitPattern
  }

  /**
   * The _converse_ of a relation `x1 ⊡ x2` between to values of the same type `x1` and `x2` is the relation `x2 ⊡ x1`:
   *
   * ```ts
   * compare(x2, x3).converse() === compare(x1, x2)
   * ```
   *
   * This makes little sense if the relation is between values of different types.
   *
   * The converse of a basic relation is defined. The converse of a general relation _gr_ is the disjunction of the
   * converse relations of the basic relations that are implied by _gr_.
   *
   * ### Invariants
   *
   * ```ts
   * this.converse().converse() === this
   * this.converse() === BASIC_RELATIONS[NR_OF_BITS - this.ordinal()]
   * BASIC_RELATIONS.every(br => !this.impliedBy(br) || this.converse().impliedBy(br.converse()))
   * ```
   */
  converse (): this {
    /* Given the order in which the basic relations occur in the bit pattern, the converse is the reverse bit pattern
       (read the bit pattern from left to right instead of right to left). We need to add a `32 - NR_OF_BITS` bit shift
       to compensate for the fact that we store the `NR_OF_BITS` bit bitpattern in a 32 bit int. */
    return this.typedConstructor().RELATIONS[reverse(this.nrOfBits(), this.bitPattern)]
  }

  /**
   * The complement of a general relation is the disjunction of all basic relations that are not implied by the general
   * relation.
   *
   * The complement of a basic relation is the disjunction of all the other basic relations.
   *
   * The complement of the complement of a general relation is the orginal general relation.
   *
   * ```
   * gr.complement().complement() = gr
   * ```
   *
   * **Be aware that the complement has in general a different meaning than a logic negation.** For a basic relation
   * `br` and a general point – interval relation `condition`, it is true that
   *
   * ```
   * (br ⊆ condition) ⇔ (br ⊈ condition.complement)
   * ```
   *
   * **This is however not so for non-basic, and thus general relations**, as the following counterexample proofs.
   * Suppose a condition is that, for a general relation `gr`:
   *
   * ```
   * gr ⊆ condition
   * ```
   *
   * From the definition of the complement, it follows that, for a basic relation `br` and a general relation `gr` as
   * set
   *
   * ```
   * br ∈ gr ⇔ br ∉ gr.complement
   * ```
   *
   * Suppose `gr = (xy)`. Then we can rewrite in the following way:
   *
   * ```
   *   gr ⊆ condition
   * ⇔ (xy) ⊆ condition
   * ⇔ x ∈ condition ∧ y ∈ condition
   * ⇔ x ∉ condition.complement ∧ y ∉ condition.complement (1)
   * ```
   *
   * While, from the other side:
   *
   * ```
   *   gr ⊈ condition.complement
   * ⇔ (xy) ⊈ condition.complement
   * ⇔ ¬(x ∈ condition.complement ∧ y ∈ condition.complement)
   * ⇔ x ∉ condition.complement ∨ y ∉ condition.complement (2)
   * ```
   *
   * It is clear that _(1)_ is incompatible with _(2)_, except for the case where the initial relation is basic (x and
   * y would be equal in the above example).
   *
   * In the reverse case, for a basic relation `br` and a general relation `actual`, nothing special can be said about
   * the complement of `actual`, as the following reasoning illustrates:
   *
   * ```
   *   actual ⊆ br
   * ⇔ actual = br ∧ actual = ∅
   * ⇔ actual.complement = br.complement ∨ actual.complement = FULL (3)
   * ```
   *
   * From the other side:
   *
   * ```
   *   actual.complement ⊈ br
   * ⇔ actual.complement ≠ br ∧ actual.complement ≠ ∅ (4)
   * ```
   *
   * It is clear that _(3)_ expresses something completely different from _(4)_, and this effect is even stronger with
   * non-basic relations.
   *
   * Note that it is exactly this counter-intuitivity that makes reasoning with relations so difficult.
   *
   * @returns BASIC_RELATIONS.every(br => this.impliedBy(br) === !result.impliedBy(br))
   */
  complement (): this {
    /*
     * implemented as the XOR of the FULL bit pattern with this bit pattern;
     * this simply replaces 0 with 1 and 1 with 0.
     */
    return this.typedConstructor().RELATIONS[fullBitPattern(this.nrOfBits()) ^ this.bitPattern]
  }

  /**
   * @return BASIC_RELATIONS.every(br => result.impliedBy(br) === this.impliedBy(br) && !gr.impliedBy(br))
   */
  min (gr: this): this {
    /* e.g.,
       this 10011 01100
         gr 11011 00101
        xor 01000 01001
        and 00000 01000 */
    const xor = this.bitPattern ^ gr.bitPattern
    const min = this.bitPattern & xor
    return this.typedConstructor().RELATIONS[min]
  }

  /**
   * A representation of the relation in using BASIC_REPRESENTATIONS for basic relations.
   */
  toString (): string {
    return `(${this.typedConstructor()
      .BASIC_RELATIONS.reduce((acc: string[], br) => {
        if (this.impliedBy(br)) {
          acc.push(this.typedConstructor().BASIC_REPRESENTATIONS[br.ordinal()])
        }
        return acc
      }, [])
      .join('')})`
  }

  /* endregion */

  /* region special relations */
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * This empty relation is not a true relation. It does not express a relational condition. Yet, it is needed for
   * consistency with some operations on relations.
   *
   * ### Invariants
   *
   * ```
   * R.RELATIONS.every(gr => gr === emptyRelation() || !emptyRelation().impliedBy(gr))
   * ```
   */
  public static emptyRelation<R extends Relation> (this: RelationConstructor<R>): R {
    return this.RELATIONS[EMPTY_BIT_PATTERN]
  }

  /**
   * The full relation, which expresses that nothing definite can be said about the relation.
   *
   * ### Invariants
   *
   * ```
   * R.RELATIONS.every(gr => fullRelation().impliedBy(gr))
   * ```
   */
  public static fullRelation<R extends Relation> (this: RelationConstructor<R>): R {
    return this.RELATIONS[fullBitPattern(this.NR_OF_BITS)]
  }

  /* endregion */

  /* region selection functions */
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * The main factory method for relations.
   *
   * This is the union of all relations in {@code gr}, when they are considered as sets of basic relations.
   *
   * `or` is commutative and associative.
   *
   * Although this is intended to create any disjunction of the basic relations, you can use any relation in the
   * argument list.
   *
   * @result BASIC_RELATIONS.every(br => result.impliedBy(br) === gr.some(gr => gr.impliedBy(br)))
   */
  public static or<R extends Relation> (...gr: readonly R[]): R {
    // noinspection SuspiciousTypeOfGuard
    assert(gr.every(grr => grr instanceof this))

    return ((this as unknown) as RelationConstructor<R>).RELATIONS[
      gr.reduce((acc: number, grr): number => acc | grr.bitPattern, EMPTY_BIT_PATTERN)
    ]
  }

  /**
   * The conjunction of the point – interval relations in `gr`.
   * This is the intersection of all point – interval relations in `gr`, when they are considered as sets of basic
   * relations.
   *
   * `and` is commutative and associative.
   *
   * @result BASIC_RELATIONS.every(br => result.impliedBy(br) === gr.every(gr => gr.impliedBy(br)))
   */
  public static and<R extends Relation> (...gr: R[]): R {
    // noinspection SuspiciousTypeOfGuard
    assert(gr.every(grr => grr instanceof this))

    const typedThis = (this as unknown) as RelationConstructor<R>
    return typedThis.RELATIONS[
      gr.reduce((acc: number, grr: R): number => acc & grr.bitPattern, fullBitPattern(typedThis.NR_OF_BITS))
    ]
  }

  /**
   * Pick the relation described by the string.
   *
   * The letters do not need to be in order. There can be meaningless letters. Letters can be duplicated.
   *
   * @returns RELATIONS.find(gr =>
   *            gr.toString()
   *               .filter(l => BASIC_REPRESENTATIONS.includes(l))
   *               .every(l => s.includes(l))
   */
  public static fromString<R extends Relation> (this: RelationConstructor<R>, s: string): R {
    // noinspection SuspiciousTypeOfGuard
    assert(typeof s === 'string')

    return this.BASIC_REPRESENTATIONS.reduce((acc: R, brr: string, i: number): R => {
      return s.includes(brr) ? this.or(acc, this.BASIC_RELATIONS[i]) : acc
    }, this.emptyRelation())
  }

  /* endregion */
}
