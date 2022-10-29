import {
  NR_OF_RELATIONS as BIT_PATTERN_NR_OF_RELATIONS,
  EMPTY_BIT_PATTERN,
  FULL_BIT_PATTERN,
  PointIntervalRelationBitPattern,
  pointIntervalRelationBitPatterns,
  isBasicPointIntervalRelationBitPattern,
  basicPointIntervalRelationBitPatterns,
  NR_OF_BITS,
  numberToPointIntervalRelationBitPattern
} from './pointIntervalRelationBitPattern'
import assert, { ok } from 'assert'
import { Interval, isInterval } from './Interval'
import { Comparator } from './comparator'
import { commonTypeRepresentation } from './typeRepresentation'
import { isLTComparableOrIndefinite, ltCompare } from './ltCompare'

const haveCommonType: string = 't, i.start and i.end must be of a common type'

/**
 * Support for reasoning about relations between points and intervals, and constraints on those relations.
 *
 * **We strongly advise to use this class when working with relations between points and intervals. Reasoning about
 * relations between points and intervals is treacherously difficult.**
 *
 * ### About the code
 *
 * We have chosen to introduce a full-featured type for working with point – interval relations, to make encapsulation
 * as good as possible. This has a slight performance overhead, but we believe that this is worth it, considering the
 * immense complexity of reasoning about relations between points and intervals.
 *
 * Point – interval relations follow the ‘32-fold enumeration pattern’. All possible instances are created when this
 * module is loaded, and it is impossible for a user to create new instances. This means that reference equality
 * (‘`===`’) can be used to compare point – interval relations, Instances are obtained using the constants this module
 * offers, or using
 *
 * - the combination methods
 *   - {@link or},
 *   - {@link and},
 *   - {@link min},
 *   - {@link compose}, and // MUDO make instance method?
 * - the unary method {@link complement}.
 *
 * A `PointIntervalRelation` can be determined based on a point and an interval with {@link pointIntervalRelation}. // MUDO move to AllenRelation?
 *
 * Basic point — interval relations are instances of the subclass {@link BasicPointIntervalRelation}. For technical
 * reasons, {@link BasicPointIntervalRelation.VALUES}, the lists all possible point – interval relations, is a static
 * property of that class, not this.
 *
 * All methods in this class are _O(n)_, i.e., work in constant time, although {@link compose} takes a significant
 * longer constant time than the other methods.
 */
export class PointIntervalRelation {
  /* Implementation note:

     point – interval relations are implemented as a 5-bit bit pattern, stored in the 5 least significant bits of an
     integer number.

     Each of those 5 bits represents a basic relation, being in the general relation (`1`) or not being in the general
     relation (`0`), where the relation is thought of as a set of basic relations.

     The order of the basic relations in the bit pattern is important for some algorithms. There is some trickery
     involved. */

  /**
   * Only the 5 lowest bits are used. The other (32 - 5 = 27 bits) are 0.
   *
   * @private
   */
  public readonly bitPattern: PointIntervalRelationBitPattern

  /**
   * There is only 1 constructor, that constructs the wrapper object
   * around the bitpattern. This is used exclusively in {@link VALUES} initialization code.
   */
  protected constructor (bitPattern: PointIntervalRelationBitPattern) {
    assert(bitPattern >= EMPTY_BIT_PATTERN)
    assert(bitPattern <= FULL_BIT_PATTERN)
    this.bitPattern = bitPattern
  }

  public isBasic (): this is BasicPointIntervalRelation {
    return isBasicPointIntervalRelationBitPattern(this.bitPattern)
  }

  /**
   * A measure about the uncertainty this point – interval relation expresses.
   *
   * This is the fraction of the 5 basic relations that imply this general relation. {@link FULL} is complete
   * uncertainty, and returns `1`. A basic relation is complete certainty, and returns `0`.
   *
   * The {@link EMPTY} relation has no meaningful uncertainty. This method returns `NaN` as value for {@link EMPTY}.
   *
   * @returns this === EMPTY ? NaN : BASIC_RELATIONS.reduce((acc, br) => br.implies(this) ? acc + 1 : acc, -1) / 4
   */
  uncertainty (): number {
    function bitCount (n: number): number {
      let count = 0
      while (n > 0) {
        n &= n - 1
        count++
      }
      return count
    }

    const count = bitCount(this.bitPattern)
    if (count === 0) {
      return NaN
    }
    return (count - 1) / (NR_OF_BITS - 1)
  }

  /**
   * Is `this` implied by `gr`?
   *
   * In other words, when considering the relations as a set of basic relations, is `this` a superset of `gr`
   * (considering equality as also acceptable)?
   *
   * @basic
   * @pre !!gr
   * @invar this.impliedBy(this)
   * @invar !this.isBasic() || BASIC_RELATIONS.every(br => br === this || !this.impliedBy(br)),
   * @returns BASIC_RELATIONS.every(br => !gr.impliedBy(br) || this.impliedBy(br))
   */
  impliedBy (gr: PointIntervalRelation): boolean {
    ok(gr)
    assert(gr instanceof PointIntervalRelation)

    return (this.bitPattern & gr.bitPattern) === gr.bitPattern
  }

  /**
   * Does `this` imply `gr`?
   *
   * In other words, when considering the relations as a set of basic relations, is `this` a subset of `gr` (considering
   * equality as also acceptable)?
   *
   * @pre !!gr
   * @returns gr.impliedBy(this)
   */
  implies (gr: PointIntervalRelation): boolean {
    ok(gr)
    assert(gr instanceof PointIntervalRelation)

    return (gr.bitPattern & this.bitPattern) === this.bitPattern
  }

  /**
   * The complement of a point – interval relation is the logic negation of the condition the point – interval relation
   * expresses.
   *
   * The complement of a basic point – interval relation is the disjunction of all the other basic point – interval
   * relations. The complement of a general point – interval relation is the disjunction of all basic point – interval
   * relations that are not implied by the general point – interval relation.
   *
   * This method is key to validating semantic constraints on time intervals, using the following idiom:
   *
   * ```ts
   * ...
   * T t = ...;
   * Interval<T> i = ...;
   * PointIntervalRelation condition = ...;
   * PointIntervalRelation actual = pointIntervalRelation(t, i);
   * if (!actual.implies(condition)) {
   *   throw new ....
   * }
   * ...
   * ```
   *
   * The complement of the complement of a general point – interval relation is the orginal general point – interval
   * relation.
   *
   * ```
   * gr.complement().complement() = gr
   * ```
   *
   * **Be aware that the complement has in general a different meaning than a logic negation.** For a basic relation
   * `br` and a general point – interval relation `condition`, it is true that
   *
   * ```
   * (br ⇒ condition) ⇔ ¬ (br.implies(condition.complement())
   * ```
   *
   * **This is however not so for non-basic, and thus general point – interval relations**, as the following
   * counterexample proofs. Suppose a condition is that, for a general relation `gr`:
   *
   * ```
   * gr.implies(condition)
   * ```
   *
   * Suppose `gr = (bi)`. Then we can rewrite in the following way:
   *
   * ```
   *   gr ⇒ condition
   * ⇔ (bi) ⇒ condition
   * ⇔ {b, i} ⊆ condition
   * ⇔ b ∈ condition ∧ i ∈ condition
   * ```
   *
   * From the definition of the complement, it follows that, for a basic relation `br` and a general relation `gr` as
   * set
   *
   * ```
   * br ∈ gr ⇔ br ∉ gr.complement()
   * ```
   *
   * Thus:
   *
   * ```
   * ⇔ b ∉ condition.complement() ∧ i ∉ condition.complement()
   * ⇔ ¬(b ∈ condition.complement() ∨ i ∈ condition.complement()) (1)
   * ```
   *
   * While, from the other side:
   *
   * ```
   *   ¬(gr ⇒ condition.complement())
   * ⇔ ¬((bi) ⇒ condition.complement())
   * ⇔ ¬({b, i} ⊆ condition.complement())
   * ⇔ ¬(b ∈ condition.complement() ∧ i ∈ condition.complement()) (2)
   * ```
   *
   * It is clear that _(1)_ is incompatible with _(2)_, except for the case where the initial relation is basic.
   *
   * In the reverse case, for a basic relation `br` and a general point – interval relation `actual`, nothing special can
   * be said about the complement of `actual`, as the following reasoning illustrates:
   *
   * ```
   *   actual ⇒ br
   * ⇔ actual ⊆ br
   * ⇔ actual = br || actual = ∅
   * ⇔ actual.complement() = br.complement() ∨ actual.complement() = FULL (3)
   * ```
   *
   * From the other side:
   *
   * ```
   *   ¬(actual.complement() ⇒ br)
   * ⇔ ¬(actual.complement() ⊆ br)
   * ⇔ ¬(actual.complement() = br ∨ actual.complement = ∅)
   * ⇔ actual.complement() ≠ br ∧ actual.complement ≠ ∅ (4)
   * ```
   *
   * It is clear that _(3)_ expresses something completely different from _(4)_, and this effect is even stronger with
   * non-basic relations.
   *
   * Note that it is exactly this counter-intuitivity that makes reasoning with time intervals so difficult.
   *
   * @returns BASIC_RELATIONS.every(br => this.impliedBy(br) === !result.impliedBy(br))
   */
  complement (): PointIntervalRelation {
    /*
     * implemented as the XOR of the FULL bit pattern with this bit pattern;
     * this simply replaces 0 with 1 and 1 with 0.
     */
    return BasicPointIntervalRelation.VALUES[FULL_BIT_PATTERN ^ this.bitPattern]
  }

  /**
   * @return BASIC_RELATIONS.every(br => result.impliedBy(br) === this.impliedBy(br) && !gr.impliedBy(br))
   */
  min (gr: PointIntervalRelation): PointIntervalRelation {
    /* e.g.,
       this 10011 01100
         gr 11011 00101
        xor 01000 01001
        and 00000 01000 */
    const xor = this.bitPattern ^ gr.bitPattern
    const min = this.bitPattern & xor
    return BasicPointIntervalRelation.VALUES[min]
  }

  /**
   * A representation of the point – interval relation in the used short notation (`'b'`, `'c'`,`'i'`, `'t'`, `'a'`).
   */
  toString (): string {
    return `(${BasicPointIntervalRelation.BASIC_RELATIONS.reduce((acc: string[], br) => {
      if (this.impliedBy(br)) {
        acc.push(br.representation)
      }
      return acc
    }, []).join('')})`
  }

  /**
   * The main factory method for `PointIntervalRelations`.
   *
   * This is the union of all point – interval relations in {@code gr}, when they are considered as sets of basic
   *
   * relations.
   * Although this is intended to create any disjunction of the basic relations, you can use any relation in the
   * argument list.
   *
   * @result BASIC_RELATIONS.every(br => result.impliedBy(br) === gr.some(gr => gr.impliedBy(br)))
   */
  public static or (...gr: PointIntervalRelation[]): PointIntervalRelation {
    return BasicPointIntervalRelation.VALUES[
      gr.reduce(
        (acc: PointIntervalRelationBitPattern, grr): PointIntervalRelationBitPattern =>
          numberToPointIntervalRelationBitPattern(acc | grr.bitPattern),
        EMPTY_BIT_PATTERN
      )
    ]
  }

  /**
   * The conjunction of the point – interval relations in `gr`.
   * This is the intersection of all point – interval relations in `gr`, when they are considered as sets of basic
   * relations.
   *
   * @result BASIC_RELATIONS.every(br => result.impliedBy(br) === gr.every(gr => gr.impliedBy(br)))
   */
  public static and (...gr: PointIntervalRelation[]): PointIntervalRelation {
    return BasicPointIntervalRelation.VALUES[
      gr.reduce(
        (acc: PointIntervalRelationBitPattern, grr: PointIntervalRelation): PointIntervalRelationBitPattern =>
          numberToPointIntervalRelationBitPattern(acc & grr.bitPattern),
        FULL_BIT_PATTERN
      )
    ]
  }

  /**
   * Pick the PointIntervalRelation described by the string.
   *
   * The letters do not need to be in order. There can be meaningless letters. Letters can be duplicated.
   *
   * @returns VALUES.find(pir =>
   *            pir.toString()
   *               .filter(l => BASIC_POINT_INTERVAL_RELATION_REPRESENTATIONS.includes(l))
   *               .every(l => s.includes(l))
   */
  public static relation (s: string): PointIntervalRelation {
    let result = EMPTY
    if (s.includes('b')) {
      result = or(result, BasicPointIntervalRelation.BEFORE)
    }
    if (s.includes('c')) {
      result = or(result, BasicPointIntervalRelation.COMMENCES)
    }
    if (s.includes('i')) {
      result = or(result, BasicPointIntervalRelation.IN)
    }
    if (s.includes('t')) {
      result = or(result, BasicPointIntervalRelation.TERMINATES)
    }
    if (s.includes('a')) {
      result = or(result, BasicPointIntervalRelation.AFTER)
    }
    return result
  }

  /*
/!**
 * This matrix holds the compositions of basic point – interval relations with Allen relations. These are part
 * of the given semantics, and cannot be calculated. See {@link #compose(PointIntervalRelation, TimeIntervalRelation)}.
 *!/
public final static PointIntervalRelation[][] BASIC_COMPOSITIONS =
    {
{BEFORE, BEFORE, BEFORE, BEFORE, BEFORE, BEFORE, BEFORE, BEFORE, BEFORE_END, BEFORE_END, BEFORE_END, BEFORE_END, FULL},
{BEFORE, BEFORE, BEFORE, BEFORE, BEFORE, BEGINS, BEGINS, BEGINS, IN, IN, IN, ENDS, AFTER},
{BEFORE, BEFORE, BEFORE_END, BEFORE_END, FULL, IN, IN, AFTER_BEGIN, IN, IN, AFTER_BEGIN, AFTER, AFTER},
{BEFORE, BEGINS, IN, ENDS, AFTER, IN, ENDS, AFTER, IN, ENDS, AFTER, AFTER, AFTER},
{FULL, AFTER_BEGIN, AFTER_BEGIN, AFTER, AFTER, AFTER_BEGIN, AFTER, AFTER, AFTER_BEGIN, AFTER, AFTER, AFTER, AFTER}
};

/!**
 * <p>Given a point in time <code><var>t</var></code> and 2 time intervals <code><var>I1</var></code>, <code><var>I2</var></code>,
 *   given <code>tpir = timePointIntervalRelation(<var>t</var>, <var>I1</var>)</code> and
 *   <code>ar == allenRelation(<var>I1</var>, <var>I2</var>)</code>,
 *   <code>compose(tpir, ar) == timePointIntervalRelation(<var>t</var>, <var>I2</var>)</code>.</p>
 *!/
@MethodContract(
    pre  = {
        @Expression("_tpir != null"),
        @Expression("_ar != null")
    },
    post = {
        @Expression("for (PointIntervalRelation bTpir : BASIC_RELATIONS) {for (TimeIntervalRelation bAr: TimeIntervalRelation.BASIC_RELATIONS) {" +
            "bTpir.implies(_tpir) && bAr.implies(_ar) ? result.impliedBy(BASIC_COMPOSITIONS[btPir.basicRelationOrdinal()][bAr.basicRelationOrdinal()])" +
            "}}")
    })
public static PointIntervalRelation compose(PointIntervalRelation tpir, TimeIntervalRelation ar) {
    assert preArgumentNotNull(tpir, "tpir");
    assert preArgumentNotNull(ar, "ar");
    PointIntervalRelation acc = EMPTY;
    for (PointIntervalRelation bTpir : BASIC_RELATIONS) {
        if (tpir.impliedBy(tpir)) {
            for (TimeIntervalRelation bAr : TimeIntervalRelation.BASIC_RELATIONS) {
                if (ar.impliedBy(bAr)) {
                    acc = or(acc, BASIC_COMPOSITIONS[bTpir.basicRelationOrdinal()][bAr.basicRelationOrdinal()]);
                }
            }
        }
    }
    return acc;
}
*/

  /**
   * The relation of `t` with `i` with the lowest possible {@link uncertainty}.
   *
   * `undefined` as start or end of `i` is considered as ‘unknown’, and thus is not used to restrict the relation more,
   * leaving it with more {@link uncertainty}.
   */
  static pointIntervalRelation<T> (t: T | undefined, i: Interval<T>, compareFn?: Comparator<T>): PointIntervalRelation {
    assert(
      (isLTComparableOrIndefinite(t) && isLTComparableOrIndefinite(i.start) && isLTComparableOrIndefinite(i.end)) ||
        compareFn !== undefined,
      '`compareFn` is mandatory when `t`, `i.start` or `i.end` is a `symbol` or `NaN`'
    )

    const cType = commonTypeRepresentation(t, i.start, i.end)

    assert(cType !== false, haveCommonType)
    assert(cType === undefined || isInterval(i, cType, compareFn))

    if (t === undefined || t === null) {
      return FULL
    }

    const compare: Comparator<T> = compareFn ?? ltCompare
    let result = FULL
    if (i.start !== undefined && i.start !== null) {
      const tToStart = compare(t, i.start)
      if (tToStart < 0) {
        return BasicPointIntervalRelation.BEFORE
      } else if (tToStart === 0) {
        return BasicPointIntervalRelation.COMMENCES
      } else {
        // assert(tToStart > 0)
        result = result.min(BasicPointIntervalRelation.BEFORE).min(BasicPointIntervalRelation.COMMENCES)
      }
    }
    if (i.end !== undefined && i.end !== null) {
      const tToEnd = compare(t, i.end)
      if (tToEnd < 0) {
        result = result.min(BasicPointIntervalRelation.TERMINATES).min(BasicPointIntervalRelation.AFTER)
      } else if (tToEnd === 0) {
        return BasicPointIntervalRelation.TERMINATES
      } else {
        // assert(tToEnd > 0)
        return BasicPointIntervalRelation.AFTER
      }
    }
    return result
  }
}

export const BASIC_POINT_INTERVAL_RELATION_REPRESENTATIONS = Object.freeze(['b', 'c', 'i', 't', 'a'] as const)
export type BasicPointIntervalRelationRepresentation = typeof BASIC_POINT_INTERVAL_RELATION_REPRESENTATIONS[number]

/**
 * The total number of possible point – interval relations **= 32**
 * (i.e., <code>2<sup>5</sup></code>).
 */
export const NR_OF_RELATIONS: number = BIT_PATTERN_NR_OF_RELATIONS

export class BasicPointIntervalRelation extends PointIntervalRelation {
  public readonly representation: BasicPointIntervalRelationRepresentation

  /**
   * There is only 1 constructor, that constructs the wrapper object
   * around the bitpattern. This is used exclusively in {@link BASIC_RELATIONS} initialization code.
   */
  private constructor (bitPattern: PointIntervalRelationBitPattern) {
    assert(bitPattern >= EMPTY_BIT_PATTERN)
    assert(bitPattern <= FULL_BIT_PATTERN)

    super(bitPattern)
    this.representation = BASIC_POINT_INTERVAL_RELATION_REPRESENTATIONS[this.ordinal()]
  }

  /**
   * An ordinal for basic relations (zero-based).
   */
  public ordinal (): number {
    /*
     * This is the bit position, 0-based, in the 5-bit bit pattern, of the bit
     * representing this as basic relation.
     *
     * See https://www.geeksforgeeks.org/position-of-rightmost-set-bit/
     */
    return Math.log2(this.bitPattern & -this.bitPattern)
  }

  /**
   * All possible basic point interval relations
   */
  public static readonly BASIC_RELATIONS: readonly BasicPointIntervalRelation[] = Object.freeze(
    basicPointIntervalRelationBitPatterns.map(bitPattern => new BasicPointIntervalRelation(bitPattern))
  )

  /**
   * A _basic_ point – interval relation that says that a point `t` _comes before_ an interval `I`, i.e., `t` is before
   * the start of `I`:
   *
   * ```
   * (t ≠ undefined) && (I.start ≠ undefined) && (t < I.start)
   * ```
   *
   * ![before](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/PointIntervalRelation-before.png)
   *
   * The short representation of this point – interval relation is `b`.
   */
  public static readonly BEFORE: BasicPointIntervalRelation = BasicPointIntervalRelation.BASIC_RELATIONS[0]

  /**
   * A _basic_ point – interval relation that says that a point `t` _commences_ an interval `I`, i.e., `t` is the start of
   * `I`:
   *
   * ```
   * (t ≠ undefined) && (I.start ≠ undefined) && (t = I.start)
   * ```
   *
   * ![commences](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/PointIntervalRelation-commences.png)
   *
   * The short representation of this point – interval relation is `c`.
   */
  public static readonly COMMENCES: BasicPointIntervalRelation = BasicPointIntervalRelation.BASIC_RELATIONS[1]

  /**
   * A _basic_ point – interval relation that says that a point `t` _is in_ an interval `I`, i.e., `t` is after the start
   * of `I` and before the end of `I`:
   *
   * ```
   * (t ≠ undefined) && (I.start ≠ undefined) && (I.end ≠ undefined) && (I.start < t) && (t < I.end)
   * ```
   *
   * ![in](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/PointIntervalRelation-in.png)
   *
   * The short representation of this point – interval relation is `i`.
   */
  public static readonly IN: BasicPointIntervalRelation = BasicPointIntervalRelation.BASIC_RELATIONS[2]

  /**
   * A _basic_ point – interval relation that says that a point `t` _terminates_ an interval `I`, i.e., `t` is the end of
   * `I`:
   *
   * ```
   * (t ≠ undefined) && (I.end ≠ undefined) && (t = I.end)
   * ```
   *
   * ![ends](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/PointIntervalRelation-terminates.png)
   *
   * The short representation of this point – interval relation is `t`.
   */
  public static readonly TERMINATES: BasicPointIntervalRelation = BasicPointIntervalRelation.BASIC_RELATIONS[3]

  /**
   * A _basic_ point – interval relation that says that a point `t` _comes after_ an interval `I`, i.e., `t` is after the
   * end of `I`:
   *
   * ```
   * (t ≠ undefined) && (I.until ≠ undefined) && (t > I.end)
   * ```
   *
   * ![after](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/PointIntervalRelation-after.png)
   *
   * The short representation of this point – interval relation is `a`.
   */
  public static readonly AFTER: BasicPointIntervalRelation = BasicPointIntervalRelation.BASIC_RELATIONS[4]

  /**
   * All possible point – interval relations.
   @Invars({
    @Expression("VALUES != null"),
    @Expression("for (PointIntervalRelation tir : VALUES) {tir != null}"),
    @Expression("for (int i : 0 .. VALUES.length) {for (int j : i + 1 .. VALUES.length) {VALUES[i] != VALUES[j]}}"),
    @Expression("for (PointIntervalRelation tir) {VALUES.contains(tir)}")
})
   */
  public static readonly VALUES: readonly PointIntervalRelation[] = Object.freeze(
    pointIntervalRelationBitPatterns.map(bitPattern =>
      isBasicPointIntervalRelationBitPattern(bitPattern)
        ? BasicPointIntervalRelation.BASIC_RELATIONS[Math.log2(bitPattern & -bitPattern)]
        : new PointIntervalRelation(bitPattern)
    )
  )
}

/**
 * This empty relation is not a true point – interval relation. It does not express a relational condition between
 * intervals. Yet, it is needed for consistency with some operations on point – interval relations.
 *
 * ### Invariants
 *
 * ```
 * BasicPointIntervalRelation.BASIC_RELATIONS.every(basic => !EMPTY.impliedBy(basic))
 * ```
 */
export const EMPTY: PointIntervalRelation = BasicPointIntervalRelation.VALUES[EMPTY_BIT_PATTERN]

/**
 * The full point – interval relation, which expresses that nothing definite can be said about the relation between a
 * point and an interval.
 *
 * ### Invariants
 *
 * ```
 * BasicPointIntervalRelation.BASIC_RELATIONS.every(basic => FULL.impliedBy(basic))
 * ```
 */
export const FULL: PointIntervalRelation = BasicPointIntervalRelation.VALUES[FULL_BIT_PATTERN]

export const or = PointIntervalRelation.or
export const and = PointIntervalRelation.and
