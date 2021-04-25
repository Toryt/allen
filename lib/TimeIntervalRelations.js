const {
  EMPTY_BIT_PATTERN,
  PRECEDES_BIT_PATTERN,
  MEETS_BIT_PATTERN,
  OVERLAPS_BIT_PATTERN,
  FINISHED_BY_BIT_PATTERN,
  CONTAINS_BIT_PATTERN,
  STARTS_BIT_PATTERN,
  EQUALS_BIT_PATTERN,
  STARTED_BY_BIT_PATTERN,
  DURING_BIT_PATTERN
} = require('./bitPattern')
const { bitPatterns } = require('./bitPattern')
const { TimeIntervalRelation } = require('./TimeIntervalRelation')

/**
 * All possible time interval relations.
 *
 * @type {TimeIntervalRelation[]}
 * @invar Array.isArray(VALUES)
 * @invar VALUES.length = NR_OF_RELATIONS
 * @invar VALUES.every(ar => ar instanceof TimeIntervalRelation)
 * @invar VALUES.every((ar1, i1) => VALUES.every((ar2, i2) => i1 < i2 || ar1 !== ar2)
 * @invar ∀ ar: !(ar instanceof TimeIntervalRelation) || VALUES.includes(ar)
 */
const VALUES = bitPatterns.map(bitPattern => new TimeIntervalRelation(bitPattern))

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
const EMPTY = VALUES[EMPTY_BIT_PATTERN]

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
const PRECEDES = VALUES[PRECEDES_BIT_PATTERN]

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
const MEETS = VALUES[MEETS_BIT_PATTERN]

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
const OVERLAPS = VALUES[OVERLAPS_BIT_PATTERN]

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
FINISHED_BY = VALUES[FINISHED_BY_BIT_PATTERN]

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
const CONTAINS = VALUES[CONTAINS_BIT_PATTERN]

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
const STARTS = VALUES[STARTS_BIT_PATTERN]

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
const EQUALS = VALUES[EQUALS_BIT_PATTERN]

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
const STARTED_BY = VALUES[STARTED_BY_BIT_PATTERN]

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
const DURING = VALUES[DURING_BIT_PATTERN]

///**
// * <p>A <strong>basic</strong> time interval relation that says that an interval
// * <var>I1</var> <dfn>finishes</dfn> an interval <var>I2</var>, i.e., the
// * begin of <var>I1</var> is later than the begin of <var>I2</var>, and the
// * end of <var>I1</var> is the end of <var>I2</var>:</p>
// * <pre>
// *   (I1.begin != null) &amp;&amp; (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I2.end != null) &amp;&amp;
// *     (I1.begin &gt; I2.begin) &amp;&amp; (I1.end == I2.end)
// * </pre>
// * <img style="text-align: center;" src="doc-files/AllenRelation-finishes.png">
// * <p>The conventional short representation of this Allen relation is &quot;<code><strong>f</strong></code>&quot;.</p>
// * <p>The converse of this relation is {@link #FINISHES}.</p>
// */
//public final static TimeIntervalRelation FINISHES = VALUES[FINISHES_BIT_PATTERN];
//
///**
// * <p>A <strong>basic</strong> time interval relation that says that an interval
// * <var>I1</var> <dfn>is overlapped by</dfn> an interval <var>I2</var>,
// * i.e., the begin of <var>I1</var> is later than the begin of <var>I2</var>
// * and earlier than the end of <var>I2</var>, and the end of <var>I1</var>
// * is later than the end of <var>I2</var>:</p>
// * <pre>
// *   (I1.begin != null) &amp;&amp; (I1.end != null) &amp;&amp; (I2.begin != null) &amp;&amp; (I2.end != null) &amp;&amp;
// *     (I1.begin &gt; I2.begin) &amp;&amp; (I1.begin &lt; I2.end) &amp;&amp; (I1.end &gt; I2.end)
// * </pre>
// * <img style="text-align: center;" src="doc-files/AllenRelation-overlappedBy.png">
// * <p>The conventional short representation of this Allen relation is &quot;<code><strong>O</strong></code>&quot;.</p>
// * <p>The converse of this relation is {@link #OVERLAPS}.</p>
// */
//public final static TimeIntervalRelation OVERLAPPED_BY = VALUES[OVERLAPPED_BY_BIT_PATTERN];
//
///**
// * <p>A <strong>basic</strong> time interval relation that says that an interval
// * <var>I1</var> <dfn>is met by</dfn> an interval <var>I2</var>, i.e., the
// * begin of <var>I1</var> is the end of <var>I2</var>:</p>
// * <pre>
// *   (I1.begin != null) &amp;&amp; (I2.end != null) &amp;&amp; (I1.begin == I2.end)
// * </pre>
// * <img style="text-align: center;" src="doc-files/AllenRelation-metBy.png">
// * <p>The conventional short representation of this Allen relation is &quot;<code><strong>M</strong></code>&quot;.</p>
// * <p>The converse of this relation is {@link #MEETS}.</p>
// */
//public final static TimeIntervalRelation MET_BY = VALUES[MET_BY_BIT_PATTERN];
//
///**
// * <p>A <strong>basic</strong> time interval relation that says that an interval
// * <var>I1</var> <dfn>is preceded by</dfn> an interval <var>I2</var>, i.e.,
// * the begin of <var>I1</var> is later than the end of <var>I2</var>:</p>
// * <pre>
// *   (I1.begin != null) &amp;&amp; (I2.end != null) &amp;&amp; (I1.begin &gt; I2.end)
// * </pre>
// * <img style="text-align: center;" src="doc-files/AllenRelation-precededBy.png">
// * <p>The conventional short representation of this Allen relation is &quot;<code><strong>P</strong></code>&quot;.</p>
// * <p>The converse of this relation is {@link #PRECEDES}.</p>
// */
//public final static TimeIntervalRelation PRECEDED_BY = VALUES[PRECEDED_BY_BIT_PATTERN];
//
///**
// * The full time interval relation, which expresses that nothing definite can be
// * said about the relationship between 2 periods.
// * <p>The converse of this relation is the relation itself.
// */
//@Invars(@Expression("FULL == or(PRECEDES, MEETS, OVERLAPS, FINISHED_BY, CONTAINS, STARTS, EQUALS, STARTED_BY, DURING, FINISHES, OVERLAPPED_BY, MET_BY, PRECEDED_BY"))
//public final static TimeIntervalRelation FULL = VALUES[FULL_BIT_PATTERN];

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
const BASIC_RELATIONS = [
  PRECEDES,
  MEETS,
  OVERLAPS,
  FINISHED_BY,
  CONTAINS,
  STARTS,
  EQUALS,
  STARTED_BY,
  DURING
  //FINISHES,
  //OVERLAPPED_BY,
  //MET_BY,
  //PRECEDED_BY
]

module.exports = {
  VALUES,
  EMPTY,
  PRECEDES,
  MEETS,
  OVERLAPS,
  FINISHED_BY,
  CONTAINS,
  STARTS,
  EQUALS,
  STARTED_BY,
  DURING,
  BASIC_RELATIONS
}
