import {
  NR_OF_RELATIONS as BIT_PATTERN_NR_OF_RELATIONS,
  allenRelationBitPatterns,
  EMPTY_BIT_PATTERN,
  FULL_BIT_PATTERN,
  isBasicAllenRelationBitPattern,
  basicAllenRelationBitPatterns
} from './allenRelationBitPattern'
import assert from 'assert'

/**
 * Support for reasoning about Allen relations, i.e., relations between intervals, and constraints on those relations.
 *
 * **We strongly advise to use this class when working with relations between intervals. Reasoning about relations
 * between intervals is treacherously difficult.**
 *
 * ### About the code
 *
 * We have chosen to introduce a full-featured type for working with interval relations, although they are just bit
 * patterns in essence, to make encapsulation as good as possible. This has a slight performance overhead, but we
 * believe that this is worth it, considering the immense complexity of reasoning about relations between intervals.
 *
 * Allen relations follow the ‘8192-fold enumeration pattern’. All possible instances are created when this module is
 * loaded, and it is impossible for a user to create new instances. This means that reference equality (‘`===`’) can be
 * used to compare Allen relations. Instances are obtained using the constants this module offers, or using
 *
 * - the combination methods
 *   - {@link or},
 *   - {@link and},
 *   - {@link min},
 *   - {@link compose}, and // MUDO make instance method?
 * - the unary method {@link complement}.
 * // MUDO missing one!
 *
 * Basic Allen relations are instances of the subclass {@link BasicAllenRelation}. For technical reasons,
 * {@link BasicAllenRelation.RELATIONS}, the lists all possible Allen relations, is a static property of that class, not
 * this.
 *
 * All instance methods in this class are _O(1)_, i.e., work in constant time, and all static methods are _O(n)_, i.e.,
 * work in linear time.
 */
export class AllenRelation {
  /* Implementation note:

     Allen relations are implemented as a 13-bit bit pattern, stored in the 13 least significant bits of an integer
     number.

     Each of those 13 bits represents a basic relation, being in the general relation (`1`) or not being in the general
     relation (`0`), where the relation is thought of as a set of basic relations.

     The order of the basic relations in the bit pattern is important for some algorithms. There is some trickery
     involved. */

  /**
   * Only the 5 lowest bits are used. The other (32 - 5 = 27 bits) are 0.
   */
  protected readonly bitPattern: number

  protected constructor (bitpattern: number) {
    /**
     * Only the 13 lowest bits are used. The other (32 - 13 = 19 bits) are 0.
     */
    this.bitPattern = bitpattern
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
  impliedBy (gr: AllenRelation): boolean {
    return (this.bitPattern & gr.bitPattern) === gr.bitPattern
  }
}

/**
 * The total number of possible Allen relations **= 8192**
 * (i.e., <code>2<sup>13</sup></code>).
 */
export const NR_OF_RELATIONS: number = BIT_PATTERN_NR_OF_RELATIONS

export const BASIC_ALLEN_RELATION_REPRESENTATIONS = Object.freeze([
  'p',
  'm',
  'o',
  'F',
  'D',
  's',
  'e',
  'S',
  'd',
  'f',
  'O',
  'M',
  'P'
] as const)
export type BasicAllenRelationRepresentation = typeof BASIC_ALLEN_RELATION_REPRESENTATIONS[number]

export class BasicAllenRelation extends AllenRelation {
  /**
   * ### Invariants
   *
   * ```
   * this.representation === BASIC_ALLEN_RELATION_REPRESENTATIONS[this.ordinal()]
   */
  public readonly representation: BasicAllenRelationRepresentation

  /**
   * There is only 1 constructor, that constructs the wrapper object
   * around the bitpattern. This is used exclusively in {@link BASIC_RELATIONS} initialization code.
   */
  private constructor (bitPattern: number) {
    assert(bitPattern >= EMPTY_BIT_PATTERN)
    assert(bitPattern <= FULL_BIT_PATTERN)

    super(bitPattern)
    this.representation = BASIC_ALLEN_RELATION_REPRESENTATIONS[this.ordinal()]
  }

  /**
   * An ordinal for basic relations (zero-based).
   *
   * ### Invariants
   *
   * ```
   * BASIC_RELATIONS[this.ordinal()] === this
   * ```
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
   * All possible basic Allen relations.
   *
   * This is a _basis_ for all Allen relations.
   *
   * That they are presented here in a particular order, is a pleasant side note, but in general not relevant for the
   * user. The list is ordered, first on the first interval beginning before the second (`I1.start [< = >] I2.start`)
   * and secondly on the first interval ending before the second (`I1.end [< = >] I2.end`).
   *
   * ### Invariants
   *
   * ```
   * Array.isArray(BASIC_RELATIONS)
   * BASIC_RELATIONS.length === 13
   * BASIC_RELATIONS.every(br => br instanceof BasicAllenRelation)
   * BASIC_RELATIONS.every((br1, i1) =>
   *   BASIC_RELATIONS.every((br2, i2) => i2 <= i1 || br1 !== br2 && !br1.implies(br2) && !br2.implies(br1)))
   * BASIC_RELATIONS[ 0] == PRECEDES
   * BASIC_RELATIONS[ 1] == MEETS
   * BASIC_RELATIONS[ 2] == OVERLAPS
   * BASIC_RELATIONS[ 3] == FINISHED_BY
   * BASIC_RELATIONS[ 4] == CONTAINS
   * BASIC_RELATIONS[ 5] == STARTS
   * BASIC_RELATIONS[ 6] == EQUALS
   * BASIC_RELATIONS[ 7] == STARTED_BY
   * BASIC_RELATIONS[ 8] == DURING
   * BASIC_RELATIONS[ 9] == FINISHES
   * BASIC_RELATIONS[10] == OVERLAPPED_BY
   * BASIC_RELATIONS[11] == MET_BY
   * BASIC_RELATIONS[12] == PRECEDED_BY
   * ```
   *
   * There are no other `BasicAllenRelation`s than the instances of this array.
   */
  public static readonly BASIC_RELATIONS: readonly BasicAllenRelation[] = Object.freeze(
    basicAllenRelationBitPatterns.map(bitPattern => new BasicAllenRelation(bitPattern))
  )

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
   * The converse of this relation is {@link PRECEDED_BY}.
   */
  static readonly PRECEDES: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[0]
  // Bit pattern: 1 = '0000000000001'

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
   * The converse of this relation is {@link MET_BY}.
   */
  static readonly MEETS: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[1]
  // Bit pattern: 2 = '0000000000010'

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
   * The converse of this relation is {@link OVERLAPPED_BY}.
   */
  static readonly OVERLAPS: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[2]
  // Bit pattern: 4 = '0000000000100'

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
   * The converse of this relation is {@link FINISHED_BY}.
   */
  static readonly FINISHED_BY: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[3]
  // Bit pattern: 8 = '0000000001000'

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
   * The converse of this relation is {@link DURING}.
   */
  static readonly CONTAINS: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[4]
  // Bit pattern: 16 = '0000000010000'

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
   * The converse of this relation is {@link STARTED_BY}.
   */
  static readonly STARTS: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[5]
  // Bit pattern: 32 = '0000000100000'

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
   */
  static readonly EQUALS: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[6]
  // Bit pattern: 64 = '0000001000000'

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
   * The converse of this relation is {@link STARTS}.
   */
  static readonly STARTED_BY: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[7]
  // Bit pattern: 128 = '0000010000000'

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
   * The converse of this relation is {@link CONTAINS}.
   */
  static readonly DURING: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[8]
  // Bit pattern: 256 = '0000100000000'

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
   * The converse of this relation is {@link FINISHES}.
   */
  static readonly FINISHES: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[9]
  // Bit pattern: 512 = '0001000000000'

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
   * The converse of this relation is {@link OVERLAPS}.
   */
  static readonly OVERLAPPED_BY: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[10]
  // Bit pattern: 1024 = '0010000000000'

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
   * The converse of this relation is {@link MEETS}.
   */
  static readonly MET_BY: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[11]
  // Bit pattern: 2048 = '0100000000000'

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
   * The converse of this relation is {@link PRECEDES}.
   */
  static readonly PRECEDED_BY: BasicAllenRelation = BasicAllenRelation.BASIC_RELATIONS[12]
  // Bit pattern: 4069 = '1000000000000'

  /**
   * All possible Allen relations.
   *
   * ### Invariants
   *
   * ```
   * Array.isArray(RELATIONS)
   * RELATIONS.length === NR_OF_RELATIONS
   * RELATIONS.every(gr => gr instanceof AllenRelation)
   * RELATIONS.every((gr1, i1) => RELATIONS.every((gr2, i2) => i2 <= i1 || gr1 !== gr2))
   * BASIC_RELATIONS.every(br => RELATIONS.includes(br))
   * ```
   *
   * There are no other `AllenRelation`s than the instances of this array.
   */
  public static readonly RELATIONS: readonly AllenRelation[] = Object.freeze(
    allenRelationBitPatterns.map(bitPattern =>
      isBasicAllenRelationBitPattern(bitPattern)
        ? BasicAllenRelation.BASIC_RELATIONS[Math.log2(bitPattern & -bitPattern)]
        : new AllenRelation(bitPattern)
    )
  )
}

/**
 * This empty relation is not a true Allen relation. It does not express a relational condition between intervals. Yet,
 * it is needed for consistency with some operations on Allen interval relations.
 *
 * The converse of this relation is the relation itself.
 *
 * ### Invariants
 *
 * ```
 * BasicAllenRelation.RELATIONS.every(gr => gr === EMPTY || !EMPTY.impliedBy(gr))
 * ```
 */
export const EMPTY: AllenRelation = BasicAllenRelation.RELATIONS[EMPTY_BIT_PATTERN]
// Bit pattern: 0 = '0000000000000'

/**
 * The full Allen relation, which expresses that nothing definite can be said about the relation between 2 intervals.
 *
 * The converse of this relation is the relation itself.
 *
 * ### Invariants
 *
 * ```
 * BasicAllenRelation.RELATIONS.every(gr => FULL.impliedBy(gr))
 * FULL === or(PRECEDES, MEETS, OVERLAPS, FINISHED_BY, CONTAINS, STARTS, EQUALS, STARTED_BY, DURING, FINISHES, OVERLAPPED_BY, MET_BY, PRECEDED_BY)
 * ```
 */
export const FULL: AllenRelation = BasicAllenRelation.RELATIONS[FULL_BIT_PATTERN]
// Bit pattern: 31 = '11111'
