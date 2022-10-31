import assert from 'assert'
import { Interval, isInterval } from './Interval'
import { Comparator } from './comparator'
import { commonTypeRepresentation } from './typeRepresentation'
import { isLTComparableOrIndefinite, ltCompare } from './ltCompare'
import { Relation } from './Relation'
import { basicRelationBitPatterns, relationBitPatterns } from './relationBitPattern'

const haveCommonType: string = 't, i.start and i.end must be of a common type'

/**
 * Support for reasoning about relations between points and intervals, and constraints on those relations.
 *
 * **We strongly advise to use this class when working with relations between points and intervals. Reasoning about
 * relations between points and intervals is treacherously difficult.**
 */
export class PointIntervalRelation extends Relation<5> {
  public static readonly NR_OF_BITS = 5
  public static readonly BASIC_REPRESENTATIONS = Object.freeze(['b', 'c', 'i', 't', 'a'] as const)

  /**
   * All possible point – interval relations.
   *
   * ### Invariants
   *
   * ```
   * Array.isArray(RELATIONS)
   * RELATIONS.length === NR_OF_RELATIONS
   * RELATIONS.every(gr => gr instanceof PointIntervalRelation)
   * RELATIONS.every((gr1, i1) => RELATIONS.every((gr2, i2) => i2 <= i1 || gr1 !== gr2))
   * ```
   *
   * There are no other `PointIntervalRelation`s than the instances of this array.
   */
  public static readonly RELATIONS: readonly PointIntervalRelation[] = Object.freeze(
    relationBitPatterns(this.NR_OF_BITS).map(bitPattern => new PointIntervalRelation(bitPattern))
  )

  /**
   * All possible basic point – interval relations.
   *
   * This is a _basis_ for all point – interval relation.
   *
   * ### Invariants
   *
   * ```
   * Array.isArray(BASIC_RELATIONS)
   * BASIC_RELATIONS.length === 5
   * BASIC_RELATIONS.every(br => br instanceof PointIntervalRelation)
   * BASIC_RELATIONS.every(br => RELATIONS.includes(br))
   * BASIC_RELATIONS.every((br1, i1) =>
   *   BASIC_RELATIONS.every((br2, i2) => i2 <= i1 || br1 !== br2 && !br1.implies(br2) && !br2.implies(br1)))
   * ```
   *
   * There are no other basic `PointIntervalRelation`s than the instances of this array.
   */
  public static readonly BASIC_RELATIONS: readonly PointIntervalRelation[] = Object.freeze(
    basicRelationBitPatterns(this.NR_OF_BITS).map(bitPattern => PointIntervalRelation.RELATIONS[bitPattern])
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
  public static readonly BEFORE: PointIntervalRelation = PointIntervalRelation.BASIC_RELATIONS[0]
  // Bit pattern: 1 = '00001'

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
  public static readonly COMMENCES: PointIntervalRelation = PointIntervalRelation.BASIC_RELATIONS[1]
  // Bit pattern: 2 = '00010'

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
  public static readonly IN: PointIntervalRelation = PointIntervalRelation.BASIC_RELATIONS[2]
  // Bit pattern: 4 = '00100'

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
  public static readonly TERMINATES: PointIntervalRelation = PointIntervalRelation.BASIC_RELATIONS[3]
  // Bit pattern: 8 = '01000'

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
  public static readonly AFTER: PointIntervalRelation = PointIntervalRelation.BASIC_RELATIONS[4]
  // Bit pattern: 16 = '10000'

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
   * `undefined` as `i.start` or `i.end` is considered as ‘unknown’ 🤷, and thus is not used to restrict the relation
   * more, leaving it with more {@link uncertainty}.
   *
   * This method is key to validating semantic constraints on time intervals, using the following idiom:
   *
   * ```ts
   * ...
   * T t = ...;
   * Interval<T> i = ...;
   * PointIntervalRelation condition = ...;
   * PointIntervalRelation actual = relation(t, i);
   * if (!actual.implies(condition)) {
   *   throw new ....
   * }
   * ...
   * ```
   */
  static relation<T> (t: T | undefined, i: Interval<T>, compareFn?: Comparator<T>): PointIntervalRelation {
    assert(
      (isLTComparableOrIndefinite(t) && isLTComparableOrIndefinite(i.start) && isLTComparableOrIndefinite(i.end)) ||
        compareFn !== undefined,
      '`compareFn` is mandatory when `t`, `i.start` or `i.end` is a `symbol` or `NaN`'
    )

    const cType = commonTypeRepresentation(t, i.start, i.end)

    assert(cType !== false, haveCommonType)
    assert(cType === undefined || isInterval(i, cType, compareFn))

    if (t === undefined || t === null) {
      return PointIntervalRelation.fullRelation()
    }

    const compare: Comparator<T> = compareFn ?? ltCompare
    let result = PointIntervalRelation.fullRelation()
    if (i.start !== undefined && i.start !== null) {
      const tToStart = compare(t, i.start)
      if (tToStart < 0) {
        return PointIntervalRelation.BEFORE
      } else if (tToStart === 0) {
        return PointIntervalRelation.COMMENCES
      } else {
        // assert(tToStart > 0)
        result = result.min(PointIntervalRelation.BEFORE).min(PointIntervalRelation.COMMENCES)
      }
    }
    if (i.end !== undefined && i.end !== null) {
      const tToEnd = compare(t, i.end)
      if (tToEnd < 0) {
        result = result.min(PointIntervalRelation.TERMINATES).min(PointIntervalRelation.AFTER)
      } else if (tToEnd === 0) {
        return PointIntervalRelation.TERMINATES
      } else {
        // assert(tToEnd > 0)
        return PointIntervalRelation.AFTER
      }
    }
    return result
  }
}
