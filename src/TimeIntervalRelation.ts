import {
  AllenRelationBitPattern,
  intervalIntervalRelationBitPatterns,
  CONTAINS_BIT_PATTERN,
  DURING_BIT_PATTERN,
  EMPTY_BIT_PATTERN,
  EQUALS_BIT_PATTERN,
  FINISHED_BY_BIT_PATTERN,
  FINISHES_BIT_PATTERN,
  FULL_BIT_PATTERN,
  isBasicIntervalIntervalRelationBitPattern,
  MEETS_BIT_PATTERN,
  MET_BY_BIT_PATTERN,
  OVERLAPPED_BY_BIT_PATTERN,
  OVERLAPS_BIT_PATTERN,
  PRECEDED_BY_BIT_PATTERN,
  PRECEDES_BIT_PATTERN,
  STARTED_BY_BIT_PATTERN,
  STARTS_BIT_PATTERN
} from './allenRelationBitPattern'
import assert from 'assert'

export type LetterAlias = 'p' | 'm' | 'o' | 'F' | 'D' | 's' | 'e' | 'S' | 'd' | 'f' | 'O' | 'M' | 'P'

export class TimeIntervalRelation {
  /**
   * All possible time interval relations.
   *
   * @invar Array.isArray(VALUES)
   * @invar VALUES.length = NR_OF_RELATIONS
   * @invar VALUES.every(ar => ar instanceof TimeIntervalRelation)
   * @invar VALUES.every((ar1, i1) => VALUES.every((ar2, i2) => i1 < i2 || ar1 !== ar2)
   * @invar ∀ ar: !(ar instanceof TimeIntervalRelation) || VALUES.includes(ar)
   */
  static VALUES: readonly TimeIntervalRelation[] = intervalIntervalRelationBitPatterns.map(
    bitPattern => new TimeIntervalRelation(bitPattern)
  )

  /**
   * This empty relation is not a true time interval relation. It does not express a
   * relational condition between intervals. Yet, it is needed for
   * consistency with some operations on time interval relations.
   *
   * The converse of the empty relation is the empty relation itself.
   *
   * @type {TimeIntervalRelation}
   * @invar BASIC_RELATIONS.every(br = !EMPTY.impliedBy(br))
   */
  static readonly EMPTY: TimeIntervalRelation = TimeIntervalRelation.VALUES[EMPTY_BIT_PATTERN]

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>precedes</dfn> an interval <var>I2</var>, i.e., the
   * end of <var>I1</var> is before the begin of <var>I2</var>:
   *
   * ```
   * (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I1.end &lt; I2.begin)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-precedes.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>p</strong></code>&quot;.
   *
   * The converse of this relation is {@link #PRECEDED_BY}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly PRECEDES: TimeIntervalRelation = TimeIntervalRelation.VALUES[PRECEDES_BIT_PATTERN]

  static readonly p: TimeIntervalRelation = TimeIntervalRelation.PRECEDES
  static readonly 'br-[[〈〈': TimeIntervalRelation = TimeIntervalRelation.PRECEDES

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>meets</dfn> an interval <var>I2</var>, i.e., the end
   * of <var>I1</var> is the begin of <var>I2</var>:
   *
   * ```
   * (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I1.end == I2.begin)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-meets.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>m</strong></code>&quot;.
   *
   * The converse of this relation is {@link #MET_BY}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly MEETS: TimeIntervalRelation = TimeIntervalRelation.VALUES[MEETS_BIT_PATTERN]

  static readonly m: TimeIntervalRelation = TimeIntervalRelation.MEETS
  static readonly 'br-[《〈': TimeIntervalRelation = TimeIntervalRelation.MEETS

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>overlaps</dfn> an interval <var>I2</var>, i.e., the
   * begin of <var>I1</var> is earlier than the begin of <var>I2</var>, and
   * the end of <var>I1</var> is later than the begin of <var>I2</var> and
   * earlier than the end of <var>I2</var>:
   * ```
   * (I1.begin != null) &amp;&amp; (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I2.end != null) &amp;&amp;
   *   (I1.begin &lt; I2.begin) &amp;&amp; (I1.end &gt; I2.begin) &amp;&amp; (I1.end &lt; I2.end)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-overlaps.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>o</strong></code>&quot;.
   *
   * The converse of this relation is {@link #OVERLAPPED_BY}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly OVERLAPS: TimeIntervalRelation = TimeIntervalRelation.VALUES[OVERLAPS_BIT_PATTERN]

  static readonly o: TimeIntervalRelation = TimeIntervalRelation.OVERLAPS
  static readonly 'br-[〈[〈': TimeIntervalRelation = TimeIntervalRelation.OVERLAPS

  /**
   * <A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>is finished by</dfn> an interval <var>I2</var>, i.e.,
   * the begin of <var>I1</var> is earlier than the begin of <var>I2</var>,
   * and the end of <var>I1</var> is the end of <var>I2</var>:
   *
   * ```
   * (I1.begin != null) &amp;&amp; (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I2.end != null) &amp;&amp;
   *   (I1.begin &lt; I2.begin) &amp;&amp; (I1.end == I2.end)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-finishedBy.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>F</strong></code>&quot;.
   *
   * The converse of this relation is {@link #FINISHED_BY}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly FINISHED_BY: TimeIntervalRelation = TimeIntervalRelation.VALUES[FINISHED_BY_BIT_PATTERN]

  static readonly F: TimeIntervalRelation = TimeIntervalRelation.FINISHED_BY
  static readonly 'br-[〈《': TimeIntervalRelation = TimeIntervalRelation.FINISHED_BY

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>contains</dfn> an interval <var>I2</var>, i.e., the
   * begin of <var>I1</var> is earlier than the begin of <var>I2</var>, and
   * the end of <var>I1</var> is later than the end of <var>I2</var>:
   *
   * ```
   * (I1.begin != null) &amp;&amp; (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I2.end != null) &amp;&amp;
   *   (I1.begin &lt; I2.begin) &amp;&amp; (I1.end &gt; I2.end)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-contains.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>D</strong></code>&quot;.
   *
   * The converse of this relation is {@link #DURING}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly CONTAINS: TimeIntervalRelation = TimeIntervalRelation.VALUES[CONTAINS_BIT_PATTERN]

  static readonly D: TimeIntervalRelation = TimeIntervalRelation.CONTAINS
  static readonly 'br-[〈〈[': TimeIntervalRelation = TimeIntervalRelation.CONTAINS

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>starts</dfn> an interval <var>I2</var>, i.e., the
   * begin of <var>I1</var> is the begin of <var>I2</var>, and the end of
   * <var>I1</var> is earlier than the end of <var>I2</var>:
   *
   * ```
   * (I1.begin != null) &amp;&amp; (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I2.end != null) &amp;&amp;
   *   (I1.begin == I2.begin) &amp;&amp; (I1.end &lt; I2.end)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-starts.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>s</strong></code>&quot;.
   *
   * The converse of this relation is {@link #STARTED_BY}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly STARTS: TimeIntervalRelation = TimeIntervalRelation.VALUES[STARTS_BIT_PATTERN]

  static readonly s: TimeIntervalRelation = TimeIntervalRelation.STARTS
  static readonly 'br-《[〈': TimeIntervalRelation = TimeIntervalRelation.STARTS

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>is equal to</dfn> an interval <var>I2</var>, i.e., the
   * begin of <var>I1</var> is the begin of <var>I2</var>, and the end of
   * <var>I1</var> is the end of <var>I2</var>:
   *
   * ```
   * (I1.begin != null) &amp;&amp; (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I2.end != null) &amp;&amp;
   *   (I1.begin == I2.begin) &amp;&amp; (I1.end == I2.end)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-equals.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>e</strong></code>&quot;.
   *
   * The converse of this relation is itself.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly EQUALS: TimeIntervalRelation = TimeIntervalRelation.VALUES[EQUALS_BIT_PATTERN]

  static readonly e: TimeIntervalRelation = TimeIntervalRelation.EQUALS
  static readonly 'br-《《': TimeIntervalRelation = TimeIntervalRelation.EQUALS

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>is started by</dfn> an interval <var>I2</var>, i.e.,
   * the begin of <var>I1</var> is the begin of <var>I2</var>, and the end of
   * <var>I1</var> is later than the end of <var>I2</var>:
   *
   * ```
   * (I1.begin != null) &amp;&amp; (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I2.end != null) &amp;&amp;
   *   (I1.begin == I2.begin) &amp;&amp; (I1.end &gt; I2.end)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-startedBy.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>S</strong></code>&quot;.
   *
   * The converse of this relation is {@link #STARTS}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly STARTED_BY: TimeIntervalRelation = TimeIntervalRelation.VALUES[STARTED_BY_BIT_PATTERN]

  static readonly S: TimeIntervalRelation = TimeIntervalRelation.STARTED_BY
  static readonly 'br-《〈[': TimeIntervalRelation = TimeIntervalRelation.STARTED_BY

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>is during</dfn> an interval <var>I2</var>, i.e., the
   * begin of <var>I1</var> is later than the begin of <var>I2</var>, and the
   * end of <var>I1</var> is earlier than the end of <var>I2</var>:
   *
   * ```
   * (I1.begin != null) &amp;&amp; (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I2.end != null) &amp;&amp;
   *   (I1.begin &gt; I2.begin) &amp;&amp; (I1.end &lt; I2.end)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-during.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>d</strong></code>&quot;.
   *
   * The converse of this relation is {@link #CONTAINS}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly DURING: TimeIntervalRelation = TimeIntervalRelation.VALUES[DURING_BIT_PATTERN]

  static readonly d: TimeIntervalRelation = TimeIntervalRelation.DURING
  static readonly 'br-〈[[〈': TimeIntervalRelation = TimeIntervalRelation.DURING

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>finishes</dfn> an interval <var>I2</var>, i.e., the
   * begin of <var>I1</var> is later than the begin of <var>I2</var>, and the
   * end of <var>I1</var> is the end of <var>I2</var>:
   *
   * ```
   * (I1.begin != null) &amp;&amp; (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I2.end != null) &amp;&amp;
   *   (I1.begin &gt; I2.begin) &amp;&amp; (I1.end == I2.end)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-finishes.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>f</strong></code>&quot;.
   *
   * The converse of this relation is {@link #FINISHES}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly FINISHES: TimeIntervalRelation = TimeIntervalRelation.VALUES[FINISHES_BIT_PATTERN]

  static readonly f: TimeIntervalRelation = TimeIntervalRelation.FINISHES
  static readonly 'br-〈[《': TimeIntervalRelation = TimeIntervalRelation.FINISHES

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>is overlapped by</dfn> an interval <var>I2</var>,
   * i.e., the begin of <var>I1</var> is later than the begin of <var>I2</var>
   * and earlier than the end of <var>I2</var>, and the end of <var>I1</var>
   * is later than the end of <var>I2</var>:
   *
   * ```
   * (I1.begin != null) &amp;&amp; (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I2.end != null) &amp;&amp;
   *   (I1.begin &gt; I2.begin) &amp;&amp; (I1.begin &lt; I2.end) &amp;&amp; (I1.end &gt; I2.end)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-overlappedBy.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>O</strong></code>&quot;.
   * The converse of this relation is {@link #OVERLAPS}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly OVERLAPPED_BY: TimeIntervalRelation = TimeIntervalRelation.VALUES[OVERLAPPED_BY_BIT_PATTERN]

  static readonly O: TimeIntervalRelation = TimeIntervalRelation.OVERLAPPED_BY
  static readonly 'br-〈[〈[': TimeIntervalRelation = TimeIntervalRelation.OVERLAPPED_BY

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>is met by</dfn> an interval <var>I2</var>, i.e., the
   * begin of <var>I1</var> is the end of <var>I2</var>:
   *
   * ```
   * (I1.begin != null) &amp;&amp; (I2.end != null) &amp;&amp; (I1.begin == I2.end)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-metBy.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>M</strong></code>&quot;.
   *
   * The converse of this relation is {@link #MEETS}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly MET_BY: TimeIntervalRelation = TimeIntervalRelation.VALUES[MET_BY_BIT_PATTERN]

  static readonly M: TimeIntervalRelation = TimeIntervalRelation.MET_BY
  static readonly 'br-〈《[': TimeIntervalRelation = TimeIntervalRelation.MET_BY

  /**
   * A <strong>basic</strong> time interval relation that says that an interval
   * <var>I1</var> <dfn>is preceded by</dfn> an interval <var>I2</var>, i.e.,
   * the begin of <var>I1</var> is later than the end of <var>I2</var>:
   *
   * ```
   * (I1.begin != null) &amp;&amp; (I2.end != null) &amp;&amp; (I1.begin &gt; I2.end)
   * ```
   *
   * <img style="text-align: center;" src="doc-files/AllenRelation-precededBy.png">
   *
   * The conventional short representation of this Allen relation is &quot;<code><strong>P</strong></code>&quot;.
   *
   * The converse of this relation is {@link #PRECEDES}.
   *
   * @type {TimeIntervalRelation}
   */
  static readonly PRECEDED_BY: TimeIntervalRelation = TimeIntervalRelation.VALUES[PRECEDED_BY_BIT_PATTERN]

  static readonly P: TimeIntervalRelation = TimeIntervalRelation.PRECEDED_BY
  static readonly 'br-〈〈[[': TimeIntervalRelation = TimeIntervalRelation.PRECEDED_BY

  /**
   * The full time interval relation, which expresses that nothing definite can be
   * said about the relationship between 2 periods.
   *
   * The converse of this relation is the relation itself.
   *
   * @type {TimeIntervalRelation}
   * @invar FULL === or(PRECEDES, MEETS, OVERLAPS, FINISHED_BY, CONTAINS, STARTS, EQUALS, STARTED_BY, DURING, FINISHES, OVERLAPPED_BY, MET_BY, PRECEDED_BY)
   */
  static readonly FULL: TimeIntervalRelation = TimeIntervalRelation.VALUES[FULL_BIT_PATTERN]

  // noinspection GrazieInspection
  /**
   * The set of all 13 basic time interval relations.
   *
   * That they are presented here in a particular order, is a pleasant side note, but in general not relevant
   * for the user. The list is ordered, first on the first interval beginning
   * before the second (<code><var>I1</var>.begin [&lt;, ==, &gt;]
   * <var>I2</var>.begin</code>) and secondly on the first interval ending
   * before the second (<var><code>I1</code></var><code>.end [&lt;, ==, &gt;]
   * <var>I2</var>.end</code>).
   *
   * @type {TimeIntervalRelation[]}
   * @invar BASIC_RELATIONS.length = 13
   * @invar BASIC_RELATIONS.every(br => BASIC_RELATIONS[br.basicRelationOrdinal()] === br)
   * @invar BASIC_RELATIONS[ 0] == PRECEDES
   * @invar BASIC_RELATIONS[ 1] == MEETS
   * @invar BASIC_RELATIONS[ 2] == OVERLAPS
   * @invar BASIC_RELATIONS[ 3] == FINISHED_BY
   * @invar BASIC_RELATIONS[ 4] == CONTAINS
   * @invar BASIC_RELATIONS[ 5] == STARTS
   * @invar BASIC_RELATIONS[ 6] == EQUALS
   * @invar BASIC_RELATIONS[ 7] == STARTED_BY
   * @invar BASIC_RELATIONS[ 8] == DURING
   * @invar BASIC_RELATIONS[ 9] == FINISHES
   * @invar BASIC_RELATIONS[10] == OVERLAPPED_BY
   * @invar BASIC_RELATIONS[11] == MET_BY
   * @invar BASIC_RELATIONS[12] == PRECEDED_BY
   */
  static readonly BASIC_RELATIONS: readonly TimeIntervalRelation[] = [
    TimeIntervalRelation.PRECEDES,
    TimeIntervalRelation.MEETS,
    TimeIntervalRelation.OVERLAPS,
    TimeIntervalRelation.FINISHED_BY,
    TimeIntervalRelation.CONTAINS,
    TimeIntervalRelation.STARTS,
    TimeIntervalRelation.EQUALS,
    TimeIntervalRelation.STARTED_BY,
    TimeIntervalRelation.DURING,
    TimeIntervalRelation.FINISHES,
    TimeIntervalRelation.OVERLAPPED_BY,
    TimeIntervalRelation.MET_BY,
    TimeIntervalRelation.PRECEDED_BY
  ]

  public readonly bitPattern: AllenRelationBitPattern

  private constructor (bitpattern: AllenRelationBitPattern) {
    /**
     * Only the 13 lowest bits are used. The other (32 - 13 = 19 bits) are 0.
     */
    this.bitPattern = bitpattern
  }

  /**
   * This is a basic time interval relation.
   *
   * @post BASIC_RELATIONS.contains(this)
   */
  isBasic (): boolean {
    return isBasicIntervalIntervalRelationBitPattern(this.bitPattern)
  }

  /**
   * An ordinal for basic relations.
   *
   * @basic
   * @pre this.isBasic()
   * @return {number} result ≥ 0 && result < 13
   */
  basicRelationOrdinal (): number {
    assert(this.isBasic())

    /*
     * This is the bit position, 0-based, in the 13-bit bit pattern, of the bit
     * representing this as basic relation.
     *
     * See https://www.geeksforgeeks.org/position-of-rightmost-set-bit/
     */
    return Math.log2(this.bitPattern & -this.bitPattern)
  }

  /**
   * Is `this` implied by `gr`?
   *
   * In other words, when considering the relations as a set
   * of basic relations, is `this` a superset of `gr` (considering equality as also acceptable)?
   *
   * @basic
   * @pre gr instanceof TimeInterval
   * @invar this.impliedBy(this)
   * @invar !this.isBasic() || BASIC_RELATIONS.every(br => br === this || !this.impliedBy(br))
   * @invar VALUES.every(gr => this.impliedBy(gr) === BASIC_RELATIONS.every(br => !gr.impliedBy(br) || this.impliedBy(br)))
   * @return {boolean}
   */
  impliedBy (gr: TimeIntervalRelation): boolean {
    return (this.bitPattern & gr.bitPattern) === gr.bitPattern
  }
}
