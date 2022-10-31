import { Relation } from './Relation'
import { basicRelationBitPatterns, relationBitPatterns } from './relationBitPattern'

/**
 * Support for reasoning about Allen relations, i.e., relations between intervals, and constraints on those relations.
 *
 * **We strongly advise to use this class when working with relations between intervals. Reasoning about relations
 * between intervals is treacherously difficult.**
 */
export class AllenRelation extends Relation {
  public static readonly NR_OF_BITS = 13
  public static readonly BASIC_REPRESENTATIONS = Object.freeze([
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
   * ```
   *
   * There are no other `AllenRelation`s than the instances of this array.
   */
  public static readonly RELATIONS: readonly AllenRelation[] = Object.freeze(
    relationBitPatterns(this.NR_OF_BITS).map(bitPattern => new AllenRelation(bitPattern))
  )

  /**
   * All possible basic Allen relations.
   *
   * This is an _orthogonal basis_ for all Allen relations.
   *
   * ### Invariants
   *
   * ```
   * Array.isArray(BASIC_RELATIONS)
   * BASIC_RELATIONS.length === 5
   * BASIC_RELATIONS.every(br => br instanceof AllenRelation)
   * BASIC_RELATIONS.every(br => RELATIONS.includes(br))
   * BASIC_RELATIONS.every((br1, i1) =>
   *   BASIC_RELATIONS.every((br2, i2) => i2 <= i1 || br1 !== br2 && !br1.implies(br2) && !br2.implies(br1)))
   * ```
   *
   * There are no other basic `AllenRelation`s than the instances of this array.
   */
  public static readonly BASIC_RELATIONS: readonly AllenRelation[] = Object.freeze(
    basicRelationBitPatterns(this.NR_OF_BITS).map(bitPattern => AllenRelation.RELATIONS[bitPattern])
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
  static readonly PRECEDES: AllenRelation = AllenRelation.BASIC_RELATIONS[0]
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
  static readonly MEETS: AllenRelation = AllenRelation.BASIC_RELATIONS[1]
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
  static readonly OVERLAPS: AllenRelation = AllenRelation.BASIC_RELATIONS[2]
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
  static readonly FINISHED_BY: AllenRelation = AllenRelation.BASIC_RELATIONS[3]
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
  static readonly CONTAINS: AllenRelation = AllenRelation.BASIC_RELATIONS[4]
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
  static readonly STARTS: AllenRelation = AllenRelation.BASIC_RELATIONS[5]
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
  static readonly EQUALS: AllenRelation = AllenRelation.BASIC_RELATIONS[6]
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
  static readonly STARTED_BY: AllenRelation = AllenRelation.BASIC_RELATIONS[7]
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
  static readonly DURING: AllenRelation = AllenRelation.BASIC_RELATIONS[8]
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
  static readonly FINISHES: AllenRelation = AllenRelation.BASIC_RELATIONS[9]
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
  static readonly OVERLAPPED_BY: AllenRelation = AllenRelation.BASIC_RELATIONS[10]
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
  static readonly MET_BY: AllenRelation = AllenRelation.BASIC_RELATIONS[11]
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
  static readonly PRECEDED_BY: AllenRelation = AllenRelation.BASIC_RELATIONS[12]
  // Bit pattern: 4069 = '1000000000000'
}
