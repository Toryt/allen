import { Relation } from './Relation'
import { basicRelationBitPatterns, relationBitPatterns } from './bitPattern'

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

  /* region basic relations */
  // -------------------------------------------------------------------------------------------------------------------

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

  /* endregion */

  /* region secondary relations */
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * and an interval <var>I2</var> are concurrent in some way.
   * Thus, <var>I1</var> does <em>not</em> precede <var>I2</var>, <var>I1</var> does <em>not</em> meet <var>I2</var>,
   * <var>I1</var> is <em>not</em> met be <var>I2</var>, and <var>I1</var> is <em>not</em> preceded by <var>I2</var>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("CONCURS_WITH == or(OVERLAPS, FINISHED_BY, CONTAINS, STARTS, EQUALS, STARTED_BY, DURING, FINISHES, OVERLAPPED_BY)"))
   */
  static readonly CONCURS_WITH: AllenRelation = AllenRelation.or(
    AllenRelation.OVERLAPS,
    AllenRelation.FINISHED_BY,
    AllenRelation.CONTAINS,
    AllenRelation.STARTS,
    AllenRelation.EQUALS,
    AllenRelation.STARTED_BY,
    AllenRelation.DURING,
    AllenRelation.FINISHES,
    AllenRelation.OVERLAPPED_BY
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * begins earlier than an interval <var>I2</var> begins:
   * <pre>
   *   (I1.begin != null) && (I2.begin != null) && (I1.begin &lt; I2.begin)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("STARTS_EARLIER == or(PRECEDES, MEETS, OVERLAPS, FINISHED_BY, CONTAINS)"))
   */
  static readonly STARTS_EARLIER: AllenRelation = AllenRelation.or(
    AllenRelation.PRECEDES,
    AllenRelation.MEETS,
    AllenRelation.OVERLAPS,
    AllenRelation.FINISHED_BY,
    AllenRelation.CONTAINS
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * and an interval <var>I2</var> begin at the same time:
   * <pre>
   *   (I1.begin != null) && (I2.begin != null) && (I1.begin == I2.begin)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("START_TOGETHER == or(STARTS, EQUALS, STARTED_BY)"))
   */
  static readonly START_TOGETHER: AllenRelation = AllenRelation.or(
    AllenRelation.STARTS,
    AllenRelation.EQUALS,
    AllenRelation.STARTED_BY
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * begins later than an interval <var>I2</var> begins:
   * <pre>
   *   (I1.begin != null) && (I2.begin != null) && (I1.begin &gt; I2.begin)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("STARTS_LATER == or(DURING, FINISHES, OVERLAPPED_BY, MET_BY, PRECEDED_BY)"))
   */
  static readonly STARTS_LATER: AllenRelation = AllenRelation.or(
    AllenRelation.DURING,
    AllenRelation.FINISHES,
    AllenRelation.OVERLAPPED_BY,
    AllenRelation.MET_BY,
    AllenRelation.PRECEDED_BY
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * begins inside an interval <var>I2</var>:
   * <pre>
   *   (I1.begin != null) && (I2.begin != null) && (I2.end != null) && (I1.begin &gt; I2.begin) && (I1.begin &lt; I2.end)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("STARTS_IN == or(DURING, FINISHES, OVERLAPPED_BY)"))
   */
  static readonly STARTS_IN: AllenRelation = AllenRelation.or(
    AllenRelation.DURING,
    AllenRelation.FINISHES,
    AllenRelation.OVERLAPPED_BY
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * begins earlier and ends earlier than an interval <var>I2</var> begins and ends:
   * <pre>
   *   (I1.begin != null) && (I2.begin != null) && (I1.end != null) && (I2.end != null) && (I1.begin &lt; I2.begin) && (I1.end &lt; I2.end)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("STARTS_EARLIER_AND_ENDS_EARLIER == or(PRECEDES, MEETS, OVERLAPS)"))
   */
  static readonly STARTS_EARLIER_AND_ENDS_EARLIER: AllenRelation = AllenRelation.or(
    AllenRelation.PRECEDES,
    AllenRelation.MEETS,
    AllenRelation.OVERLAPS
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * begins later and ends later than an interval <var>I2</var> begins and ends:
   * <pre>
   *   (I1.begin != null) && (I2.begin != null) && (I1.end != null) && (I2.end != null) && (I1.begin &gt; I2.begin) && (I1.end &gt; I2.end)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("STARTS_LATER_AND_ENDS_LATER == or(OVERLAPPED_BY, MET_BY, PRECEDED_BY)"))
   */
  static readonly STARTS_LATER_AND_ENDS_LATER: AllenRelation = AllenRelation.or(
    AllenRelation.OVERLAPPED_BY,
    AllenRelation.MET_BY,
    AllenRelation.PRECEDED_BY
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * ends earlier than an interval <var>I2</var> ends:
   * <pre>
   *   (I1.end != null) && (I2.end != null) && (I1.end &lt; I2.end)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("ENDS_EARLIER == or(PRECEDES, MEETS, OVERLAPS, STARTS, DURING)"))
   */
  static readonly ENDS_EARLIER: AllenRelation = AllenRelation.or(
    AllenRelation.PRECEDES,
    AllenRelation.MEETS,
    AllenRelation.OVERLAPS,
    AllenRelation.STARTS,
    AllenRelation.DURING
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * ends inside an interval <var>I2</var>:
   * <pre>
   *   (I1.end != null) && (I2.begin != null) && (I2.end != null) && (I1.end &gt; I2.begin) && (I1.end &lt; I2.end)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("ENDS_IN == or(OVERLAPS, STARTS, DURING)"))
   */
  static readonly ENDS_IN: AllenRelation = AllenRelation.or(
    AllenRelation.OVERLAPS,
    AllenRelation.STARTS,
    AllenRelation.DURING
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * and an interval <var>I2</var> end at the same time.
   * <pre>
   *   (I1.end != null) && (I2.end != null) && (I1.end == I2.end)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("END_TOGETHER == or(FINISHED_BY, EQUALS, FINISHES)"))
   */
  static readonly END_TOGETHER: AllenRelation = AllenRelation.or(
    AllenRelation.FINISHED_BY,
    AllenRelation.EQUALS,
    AllenRelation.FINISHES
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * ends later than an interval <var>I2</var> ends:
   * <pre>
   *   (I1.end != null) && (I2.end != null) && (I1.end &gt; I2.end)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("ENDS_LATER == or(CONTAINS, STARTED_BY, OVERLAPPED_BY, MET_BY, PRECEDED_BY)"))
   */
  static readonly ENDS_LATER: AllenRelation = AllenRelation.or(
    AllenRelation.CONTAINS,
    AllenRelation.STARTED_BY,
    AllenRelation.OVERLAPPED_BY,
    AllenRelation.MET_BY,
    AllenRelation.PRECEDED_BY
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * contains the begin of an interval <var>I2</var>:
   * <pre>
   *   (I1.begin != null) && (I1.end != null) && (I2.begin != null) && (I1.begin &lt; I2.begin) && (I1.end &gt; I2.begin)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("CONTAINS_START == or(OVERLAPS, FINISHED_BY, CONTAINS)"))
   */
  static readonly CONTAINS_START: AllenRelation = AllenRelation.or(
    AllenRelation.OVERLAPS,
    AllenRelation.FINISHED_BY,
    AllenRelation.CONTAINS
  )

  /**
   * A non-basic time interval relation that is often handy to use, which expresses that an interval <var>I1</var>
   * contains the end of an interval <var>I2</var>:
   * <pre>
   *   (I1.begin != null) && (I1.end != null) && (I2.end != null) && (I1.begin &lt; I2.end) && (I1.end &gt; I2.end)
   * </pre>.
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
  @Invars(@Expression("CONTAINS_END == or(CONTAINS, STARTED_BY, OVERLAPPED_BY)"))
   */
  static readonly CONTAINS_END: AllenRelation = AllenRelation.or(
    AllenRelation.CONTAINS,
    AllenRelation.STARTED_BY,
    AllenRelation.OVERLAPPED_BY
  )

  /* endregion */

  /**
   * This matrix holds the compositions of basic interval relations. These are part of the given semantics, and cannot
   * be calculated. See {@link compose}.
   */
  static readonly BASIC_COMPOSITIONS: AllenRelation[][] = [
    [
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.fullRelation()
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.MEETS,
      AllenRelation.MEETS,
      AllenRelation.MEETS,
      AllenRelation.ENDS_IN,
      AllenRelation.ENDS_IN,
      AllenRelation.ENDS_IN,
      AllenRelation.END_TOGETHER,
      AllenRelation.ENDS_LATER
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.STARTS_EARLIER_AND_ENDS_EARLIER,
      AllenRelation.STARTS_EARLIER_AND_ENDS_EARLIER,
      AllenRelation.STARTS_EARLIER,
      AllenRelation.OVERLAPS,
      AllenRelation.OVERLAPS,
      AllenRelation.CONTAINS_START,
      AllenRelation.ENDS_IN,
      AllenRelation.ENDS_IN,
      AllenRelation.CONCURS_WITH,
      AllenRelation.CONTAINS_END,
      AllenRelation.ENDS_LATER
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.MEETS,
      AllenRelation.OVERLAPS,
      AllenRelation.FINISHED_BY,
      AllenRelation.CONTAINS,
      AllenRelation.OVERLAPS,
      AllenRelation.FINISHED_BY,
      AllenRelation.CONTAINS,
      AllenRelation.ENDS_IN,
      AllenRelation.END_TOGETHER,
      AllenRelation.CONTAINS_END,
      AllenRelation.CONTAINS_END,
      AllenRelation.ENDS_LATER
    ],
    [
      AllenRelation.STARTS_EARLIER,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONTAINS,
      AllenRelation.CONTAINS,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONTAINS,
      AllenRelation.CONTAINS,
      AllenRelation.CONCURS_WITH,
      AllenRelation.CONTAINS_END,
      AllenRelation.CONTAINS_END,
      AllenRelation.CONTAINS_END,
      AllenRelation.ENDS_LATER
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.STARTS_EARLIER_AND_ENDS_EARLIER,
      AllenRelation.STARTS_EARLIER_AND_ENDS_EARLIER,
      AllenRelation.STARTS_EARLIER,
      AllenRelation.STARTS,
      AllenRelation.STARTS,
      AllenRelation.START_TOGETHER,
      AllenRelation.DURING,
      AllenRelation.DURING,
      AllenRelation.STARTS_IN,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.MEETS,
      AllenRelation.OVERLAPS,
      AllenRelation.FINISHED_BY,
      AllenRelation.CONTAINS,
      AllenRelation.STARTS,
      AllenRelation.EQUALS,
      AllenRelation.STARTED_BY,
      AllenRelation.DURING,
      AllenRelation.FINISHES,
      AllenRelation.OVERLAPPED_BY,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.STARTS_EARLIER,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONTAINS,
      AllenRelation.CONTAINS,
      AllenRelation.START_TOGETHER,
      AllenRelation.STARTED_BY,
      AllenRelation.STARTED_BY,
      AllenRelation.STARTS_IN,
      AllenRelation.OVERLAPPED_BY,
      AllenRelation.OVERLAPPED_BY,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.fullRelation(),
      AllenRelation.DURING,
      AllenRelation.DURING,
      AllenRelation.STARTS_LATER,
      AllenRelation.DURING,
      AllenRelation.DURING,
      AllenRelation.STARTS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.MEETS,
      AllenRelation.ENDS_IN,
      AllenRelation.END_TOGETHER,
      AllenRelation.ENDS_LATER,
      AllenRelation.DURING,
      AllenRelation.FINISHES,
      AllenRelation.STARTS_LATER_AND_ENDS_LATER,
      AllenRelation.DURING,
      AllenRelation.FINISHES,
      AllenRelation.STARTS_LATER_AND_ENDS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.STARTS_EARLIER,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONCURS_WITH,
      AllenRelation.CONTAINS_END,
      AllenRelation.ENDS_LATER,
      AllenRelation.STARTS_IN,
      AllenRelation.OVERLAPPED_BY,
      AllenRelation.STARTS_LATER_AND_ENDS_LATER,
      AllenRelation.STARTS_IN,
      AllenRelation.OVERLAPPED_BY,
      AllenRelation.STARTS_LATER_AND_ENDS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.STARTS_EARLIER,
      AllenRelation.START_TOGETHER,
      AllenRelation.STARTS_IN,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.STARTS_IN,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.STARTS_IN,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.fullRelation(),
      AllenRelation.STARTS_LATER,
      AllenRelation.STARTS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.STARTS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.STARTS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY
    ]
  ]

  /**
 * <p>Given 3 time intervals <code><var>I1</var></code>, <code><var>I2</var></code> and <code><var>I3</var></code>,
 *   given <code>gr1 == timeIntervalRelation(<var>I1</var>, <var>I2</var>)</code> and <code>gr2 ==
 *   timeIntervalRelation(<var>I2</var>, <var>I3</var>)</code>, <code>compose(gr1, gr2) == timeIntervalRelation(<var>I1</var>,
 *   <var>I3</var>)</code>.</p>
 * <p>Although this method is still, like most other methods in this class, of constant time (<em>O(n)</em>), it
 *   takes a significant longer constant time, namely ~ 13<sup>2</sup>. During unit tests we saw that 100 000 calls
 *   take over a second on a 2.4GHz dual core processor.</p>
@MethodContract(
    pre  = {
      @Expression("_gr1 != null"),
      @Expression("_gr2 != null")
    },
    post = {
      @Expression("for (TimeIntervalRelation br1 : BASIC_RELATIONS) {for (TimeIntervalRelation br2: BASIC_RELATIONS) {" +
          "br1.implies(_gr1) && br2.implies(_gr2) ? result.impliedBy(BASIC_COMPOSITIONS[br1.basicRelationOrdinal()][br2.basicRelationOrdinal()])" +
          "}}")
    })
 */
  static compose (ar1: AllenRelation, ar2: AllenRelation): AllenRelation {
    // assert preArgumentNotNull(gr1, "gr1");
    // assert preArgumentNotNull(gr2, "gr2");

    return AllenRelation.BASIC_RELATIONS.reduce(
      (acc1: AllenRelation, br1: AllenRelation) =>
        ar1.impliedBy(br1)
          ? AllenRelation.BASIC_RELATIONS.reduce(
              (acc2: AllenRelation, br2: AllenRelation) =>
                ar2.impliedBy(br2)
                  ? AllenRelation.or(acc2, AllenRelation.BASIC_COMPOSITIONS[br1.ordinal()][br2.ordinal()])
                  : acc2,
              acc1
            )
          : acc1,
      AllenRelation.emptyRelation()
    )
  }
}
