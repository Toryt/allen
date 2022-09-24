import {
  NR_OF_RELATIONS as BIT_PATTERN_NR_OF_RELATIONS,
  AFTER_BIT_PATTERN,
  BEFORE_BIT_PATTERN,
  BEGINS_BIT_PATTERN,
  EMPTY_BIT_PATTERN,
  ENDS_BIT_PATTERN,
  FULL_BIT_PATTERN,
  IN_BIT_PATTERN,
  PointIntervalRelationBitPattern,
  pointIntervalRelationBitPatterns,
  isBasicPointIntervalRelationBitPattern
} from './pointIntervalRelationBitPattern'
import assert from 'assert'

/**
 * Support for reasoning about relations between time points and time intervals, and constraints on those
 * relationships. **We strongly advise to use this class when working with relations between time points and time
 * intervals. Reasoning about relations between time points and time intervals is treacherously difficult.**
 *
 * When working with time points and time intervals, we often want to express constraints (invariants) that limit
 * acceptable combinations. Expressing this correctly proves extremely difficult in practice. Falling back to working
 * with isolated begin and end dates, and reasoning about their relations with the time point, in practice proves to be
 * even much more difficult and error-prone.
 *
 * This class is developed following the example of {@link TimeIntervalRelation Allen relations}.
 *
 * ### Quick overview
 *
 * We find that there are 5 _basic relations_ possible between a point in time and a definite time interval:
 *
 * - `t` is {@link BEFORE} `I` ([&lt;]{@link BEFORE})
 *
 *   ![before](https://github.com/jandppw/ppwcode-recovered-from-google-code/blob/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval/doc-files/PointIntervalRelation-before.png?raw=true|width=300)
 *
 * - `t` {@link BEGINS} `I` ([=[&lt;]{@link BEGINS})
 *
 *   ![begins](https://github.com/jandppw/ppwcode-recovered-from-google-code/blob/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval/doc-files/PointIntervalRelation-begins.png?raw=true|width=300)
 *
 * - `t` is {@link IN} `I` ([&gt;&lt;]{@link IN})
 *
 *   ![in](https://github.com/jandppw/ppwcode-recovered-from-google-code/blob/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval/doc-files/PointIntervalRelation-in.png?raw=true|width=300)
 *
 * - `t` {@link ENDS} `I` ([=[&gt;]{@link ENDS})
 *
 *   ![ends](https://github.com/jandppw/ppwcode-recovered-from-google-code/blob/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval/doc-files/PointIntervalRelation-ends.png?raw=true|width=300)
 *
 * - `t` is {@link AFTER} `I` ([&gt;]{@link AFTER})
 *
 *   ![after](https://github.com/jandppw/ppwcode-recovered-from-google-code/blob/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval/doc-files/PointIntervalRelation-after.png?raw=true|width=300)
 *
 * These basic relations between a point and an interval are similar to `<`, `=`, and `>` between 2 points.
 *
 * When reasoning about the relationship between time points and time intervals however, like when comparing time
 * instances, we also often employ indeterminate relations, such as `t (<, =<[) I` (`t` is {@link BEFORE} `I`, or
 * {@link BEGINS} `I`). This is comparable to reasoning with `≤`, `≥`, and `≠`  with time instances.
 *
 * For time intervals, given 5 basic relations, we get 32 (= 2<sup>5</sup>) possible _general relations_. This includes
 * the [empty relationship]{@link EMPTY} for algebraic reasons, and the [full relationship]{@link FULL} (comparable
 * to `< ⋁ = ⋁ >` with time instances), which expresses the maximum uncertainty about the relation between a point in
 * time and time intervals.
 *
 * ### Interval constraints
 *
 * Point-interval relations will most often be used in business code to _constrain_ relations between time points and
 * time intervals. This is notoriously, treacherously difficult. It is for this reason that you should use code like
 * this, that at least forces you to think things trough, and tries to offers tools to ease reasoning. The idiom to do
 * this is explained next.
 *
 * First we need to determine the relation we want to uphold (`condition`). E.g., we want to assert that given a point
 * in time `t` does not fall before a time interval `I` is fully started. The relationship that expresses this is
 *
 * ```
 * condition = (<, =<[)
 * ```
 *
 * Next, we want to determine the relationship between `t` and `I` as precisely as possible. If `I` is completely
 * determined, i.e., neither its start nor its end is `undefined`, the result will be a
 * [basic relation]{@link BASIC_RELATIONS}. Otherwise, the result will be a less certain relation. To determine this
 * relationship, use {@link #pointIntervalRelation(Date, TimeInterval)}.
 *
 * The idiom for the assertion we want to express is then:
 *
 * ```ts
 * pointIntervalRelation(t, I).implies(condition)
 * ```
 *
 * This is often the form of an invariant. Note that this can fail, on the one hand because the actual relation is
 * unacceptable, but also because _we cannot be 100% sure that the actual relationship satisfies the condition_.
 *
 * In our example, we would have:
 *
 * ```ts
 * pointIntervalRelation(t, I).implies(or(BEFORE, BEGINS))
 * ```
 *
 * If the actual relation results in {@link IN} (`(><)`), for example, the constraint is clearly not satisfied. If the
 * actual relation results in `(<, ><)`, it means that it is possible that the relation is satisfied, but there is also
 * a chance that it is not.
 *
 * In code then, we often want to throw an exception to interrupt an algorithm that would violate the invariant. The
 * idiom for this is usually of the form:
 *
 * ```ts
 * ...
 * Date t = ...;
 * Interval i = ...;
 * PointIntervalRelation condition = ...;
 * PointIntervalRelation actual = pointIntervalRelation(t, i);
 * if (!actual.implies(condition)) {
 *   throw new ....
 * }
 * ...
 * ```
 *
 * In our example, this would become
 *
 * ```ts
 * ...
 * Date t = ...;
 * TimeInterval i = ...;
 * if (!pointIntervalRelation(t, i).implies(or(BEFORE, BEGINS)) {
 *   throw new ....
 * }
 * ...
 * ```
 *
 * **Note that in general `!actual.implies(condition)` is _not equivalent_ to `actual.implies(condition.complement())`
 * (see {@link #complement()}).** In our example this is already clear. If the actual relation results in `(><)`, both
 * expressions evaluate to `true`:
 *
 * ```ts
 *     !pointIntervalRelation(t, i).implies(or(BEFORE, BEGINS))
 * === !IN.implies(or(PointIntervalRelation, PointIntervalRelation))
 * === !false
 * === true
 *
 *     pointIntervalRelation(t, i).implies(or(BEFORE, BEGINS).complement())
 * === IN.implies(or(BEFORE, BEGINS).complement())
 * === IN.implies(or(IN, ENDS, AFTER))
 * === true
 * ```
 *
 * But in the case where the actual relation results in `(<, ><)`, they do not:
 *
 * ```ts
 *     !pointIntervalRelation(t, i).implies(or(BEFORE, BEGINS))
 * === !or(BEFORE, IN).implies(or(BEFORE, BEGINS))
 * === !false
 * === true
 *
 *     pointIntervalRelation(t, i).implies(or(BEFORE, BEGINS).complement())
 * === or(BEFORE, IN).implies(or(BEFORE, BEGINS).complement())
 * === or(BEFORE, IN).implies(or(IN, ENDS, AFTER))
 * === false
 * ```
 *
 * `!pointIntervalRelation(t, i).implies(or(BEFORE, BEGINS))` expresses that [we want to throw an exception if] _it is
 * not guaranteed that `t` is before `i` is fully started_.
 * `pointIntervalRelation(t, i).implies(or(BEFORE, BEGINS).complement())` expresses that [we want to throw an exception
 * if] _it is guaranteed that `t` is after `i` is fully started_. **These 2 phrases are not equivalent.**
 *
 * Consider an `undefined` start for `i`. When `t` is before the end of `i`, we cannot know whether `t` is before, equal
 * to, or after the start of `i`.
 *
 * ```ts
 * pointIntervalRelation(t, i) === or(BEFORE, STARTS, IN)
 * ```
 *
 * With `!pointIntervalRelation(t, i).implies(or(BEFORE, BEGINS))` we would throw an exception. `t` could be
 * {@link BEFORE} `i`, or {@link START} `i`, which would be ok, but `t` could also be {@link IN} `i`, which is not ok.
 * It is not guaranteed that `t` is before `i` is fully started. With
 * `pointIntervalRelation(t, i).implies(or(BEFORE, BEGINS).complement())` we would not throw an exception. `t` could be
 * {@link IN} `i`, which would not be ok, but it could also be {@link BEFORE} `i`, or {@link START} `i`, and so it is
 * _not guaranteed_ that `t` is after `i` is fully started.
 *
 * ### Reasoning with unknown but constrained begin and end dates
 *
 * In time intervals, the start or end can be `undefined`. The semantics of this is in general that the start date,
 * respectively the end date, is unknown. Comparing such an interval with a point in time results in a relatively broad
 * time point-interval relation, expressing an amount of uncertainty.
 *
 * In several use cases however, we do not know a definite start or end date, but we do know that the start or end date
 * have constraints. E.g., consider contracts that have a definite start date, but are open-ended. The contract interval
 * thus is incompletely known. However, since at the moment of our reasoning no definite end date is set, we know that
 * the end date is at least later than `now`. In comparing this contract interval with another interval, this constraint
 * can be of use to limit the extent, i.e., the uncertainty, of the point-interval relation. The same applies, e.g.,
 * with contracts that will start once payment is received. Since it is not received yet at the moment of our
 * evaluation, we know that the start date is at least later than or equal to `now`.
 *
 * In such cases, the interval object `I` we are focusing on can be interpreted in another way. Suppose we are comparing
 * `I` with a point in time `t`. We are actually not interested in `pointIntervalRelation(t, I)`, but rather in
 * `pointIntervalRelation(t, IConstrained)`. Sadly, there is no easy syntax (or code) to express `IConstrained`. What we
 * can express is an `IDeterminate`, where the border times are filled out in place of the unknown start or end.
 * `pointIntervalRelation(t, IDeterminate)` can be calculated, and will be much less uncertain than
 * `pointIntervalRelation(t, I)`. If we now can determine the Allen relation from `IDeterminate` to `IConstrained`, we
 * can find `pointIntervalRelation(t, IConstrained)` as:
 *
 * ```ts
 * pointIntervalRelation(t, IConstrained) ===
 *   compose(pointIntervalRelation(t, IDeterminate), allenRelation(IDeterminate, IConstrained))
 * ```
 *
 * The point-interval relation from an interval we are focusing on with constrained semantics to a determinate interval
 * is a constant that can be determined by reasoning. E.g., for our open-ended contract, that lasts at least longer than
 * today (`IConstrained = [I.start, > now[`, supposing `I.start ≤ yesterday`), we can say that its relation to the
 * determinate interval `IDeterminate = [I.start, now[` is {@link TimeIntervalRelation#STARTS} (`(s)`). Suppose
 * `pointIntervalRelation(t, IDeterminate)` is {@link IN} (`(><)`) (say `t` is `yesterday`). We can now say that
 * `pointIntervalRelation(t, IConstrained) === (s).(><) === (><). The comparison of the indeterminate interval with `t`,
 * `pointIntervalRelation(t, I), would have resulted in:
 *
 * ```
 *     pointIntervalRelation(t, I)
 * === pointIntervalRelation(yesterday, [I.start, undefined[)
 * === (>< =[> >)
 * ```
 *
 * which is much less certain than `(><)`.
 *
 * Be aware that in a number of cases, the non-determinate character of `I` doesn't matter. If you suppose in the
 * previous example that `pointIntervalRelation(t, IDeterminate) == (>)` (say `t` is next year),
 * `pointIntervalRelation(t, IConstrained) == (s).(>) == (>< =[> >)`. The comparison of the indeterminate interval with
 * `t`, `pointIntervalRelation(t, I)`, in this case, results in the same point-interval relation:
 *
 * ```
 *     pointIntervalRelation(t, I)
 * === pointIntervalRelation(nextYear, [I.start, undefined[)
 * === (>< =[> >)
 * ```
 *
 * ### About the code
 *
 * We have chosen to introduce a full-featured type for working with point-interval relations, to make encapsulation as
 * good as possible. This has a slight performance overhead, but we believe that this is worth it, considering the
 * immense complexity of reasoning about relations between points in time and time intervals.
 *
 * Point-interval relations follow the ‘32-fold singleton pattern’. All possible instances are created when this module
 * is loaded, and it is impossible for a user to create new instances. This means that reference equality (‘`===`’) can
 * can be used to compare point-interval relations, Instances are to be obtained using the constants this module offers,
 * or using the combination methods {@link #or(PointIntervalRelation...)},
 * {@link #and(PointIntervalRelation...)}, {@link #compose(PointIntervalRelation, TimeIntervalRelation)}, and
 * {@link #min(PointIntervalRelation, PointIntervalRelation)}, and the unary method {@link #complement()}. Also,
 * a PointIntervalRelation can be determined [based on a point in time and a time
 * interval]{@link #pointIntervalRelation(Date, TimeInterval)}. {@link VALUES} lists all possible point-interval
 * relations.
 *
 * All methods in this class are _O(n)_, i.e., work in constant time, although
 * {@link #compose(PointIntervalRelation, TimeIntervalRelation)} takes a significant longer constant time than the other
 * methods.
 */
export class PointIntervalRelation {
  /* Implementation note:

     Point-interval relations are implemented as a 5-bit bit pattern, stored in the 5 least significant bits of an
     integer number.

     Each of those 5 bits represents a basic relation, being in the general relation (`1`) or not being in the general
     relation (`0`).

     The order of the basic relations in the bit pattern is important for some algorithms. There is some trickery
     involved. */

  /*


    /!*<section name="basic relations">*!/
    //------------------------------------------------------------------

    private final static int EMPTY_BIT_PATTERN   =  0;   // 00000
    private final static int BEFORE_BIT_PATTERN  =  1;   // 00001 <
    private final static int BEGINS_BIT_PATTERN  =  2;   // 00010 =[<
    private final static int IN_BIT_PATTERN      =  4;   // 00100 ><
    private final static int ENDS_BY_BIT_PATTERN =  8;   // 01000 =[>
    private final static int AFTER_BIT_PATTERN   = 16;   // 10000 >
    private final static int FULL_BIT_PATTERN    = 31;   // 11111 < =[< >< =[> >

    /!**
     * This empty relation is not a true time point-interval relation. It does not express a
     * relational condition between intervals. Yet, it is needed for
     * consistencey with some operations on time point-interval relations.
     *!/
    @Invars(@Expression("for (PointIntervalRelation basic : BASIC_RELATIONS) {! EMPTY.impliedBy(basic)}"))
    public final static PointIntervalRelation EMPTY = VALUES[EMPTY_BIT_PATTERN];

    /!**
     * <p>A <strong>basic</strong> time point-interval relation that says that a point in time
     * <var>t</var> <dfn>comes before</dfn> an interval <var>I</var>, i.e., the
     * <var>t</var> is before the begin of <var>I</var>:</p>
     * <pre>
     *   (I.begin != null) &amp;&amp; (t &lt; I2.begin)
     * </pre>
     * <img style="text-align: center;" src="doc-files/PointIntervalRelation-before.png">
     * <p>The short representation of this time point-interval relation is
     *   &quot;<code><strong>&lt;</strong></code>&quot;.</p>
     *!/
    public final static PointIntervalRelation BEFORE = VALUES[BEFORE_BIT_PATTERN];

    /!**
     * <p>A <strong>basic</strong> time point-interval relation that says that a point in time
     * <var>t</var> <dfn>begins</dfn> an interval <var>I</var>, i.e., the
     * <var>t</var> is the begin of <var>I</var>:</p>
     * <pre>
     *   (I.begin != null) &amp;&amp; (t == I2.begin)
     * </pre>
     * <img style="text-align: center;" src="doc-files/PointIntervalRelation-begins.png">
     * <p>The short representation of this time point-interval relation is
     *   &quot;<code><strong>=[&lt;</strong></code>&quot;.</p>
     *!/
    public final static PointIntervalRelation BEGINS = VALUES[BEGINS_BIT_PATTERN];

    /!**
     * <p>A <strong>basic</strong> time point-interval relation that says that a point in time
     * <var>t</var> <dfn>falls in</dfn> an interval <var>I</var>, i.e., the
     * <var>t</var> is after the begin of <var>I</var> and before the end of <var>I</var>:</p>
     * <pre>
     *   (I.begin != null) &amp;&amp; (I.end != null) &amp;&amp; (t &gt; I2.begin) &amp;&amp; (t &lt; I2.end)
     * </pre>
     * <img style="text-align: center;" src="doc-files/PointIntervalRelation-in.png">
     * <p>The short representation of this time point-interval relation is
     *   &quot;<code><strong>&gt;&lt;</strong></code>&quot;.</p>
     *!/
    public final static PointIntervalRelation IN = VALUES[IN_BIT_PATTERN];

    /!**
     * <p>A <strong>basic</strong> time point-interval relation that says that a point in time
     * <var>t</var> <dfn>ends</dfn> an interval <var>I</var>, i.e., the
     * <var>t</var> is the end of <var>I</var>:</p>
     * <pre>
     *   (I.end != null) &amp;&amp; (t == I2.end)
     * </pre>
     * <img style="text-align: center;" src="doc-files/PointIntervalRelation-ends.png">
     * <p>The short representation of this time point-interval relation is
     *   &quot;<code><strong>=[&gt;</strong></code>&quot;.</p>
     *!/
    public final static PointIntervalRelation ENDS = VALUES[ENDS_BY_BIT_PATTERN];

    /!**
     * <p>A <strong>basic</strong> time point-interval relation that says that a point in time
     * <var>t</var> <dfn>comes after</dfn> an interval <var>I</var>, i.e., the
     * <var>t</var> is after the end of <var>I</var>:</p>
     * <pre>
     *   (I.end != null) &amp;&amp; (t &gt; I2.end)
     * </pre>
     * <img style="text-align: center;" src="doc-files/PointIntervalRelation-after.png">
     * <p>The short representation of this time point-interval relation is
     *   &quot;<code><strong>&gt;</strong></code>&quot;.</p>
     *!/
    public final static PointIntervalRelation AFTER = VALUES[AFTER_BIT_PATTERN];

    /!**
     * The full time point-interval relation, which expresses that nothing definite can be
     * said about the relationship between a time point and a time interval.
     *!/
    @Invars(@Expression("FULL == or(BEFORE, BEGINS, IN, ENDS, AFTER"))
    public final static PointIntervalRelation FULL = VALUES[FULL_BIT_PATTERN];

    /!**
     * The set of all 5 basic time point-interval relations. That they are presented here in
     * a particular order, is a pleasant side note, but in general not relevant
     * for the user.
     *!/
    @Invars({
        @Expression("for (BasicRelation br : BASIC_RELATIONS) {BASIC_RELATIONS[br.basicRelationOrdinal()] == br}"),
        @Expression("BASIC_RELATIONS[ 0] == BEFORE"),
        @Expression("BASIC_RELATIONS[ 1] == BEGINS"),
        @Expression("BASIC_RELATIONS[ 2] == IN"),
        @Expression("BASIC_RELATIONS[ 3] == ENDS"),
        @Expression("BASIC_RELATIONS[ 4] == AFTER")
    })
    public final static PointIntervalRelation[] BASIC_RELATIONS = {BEFORE, BEGINS, IN, ENDS, AFTER};

    private final static String[] BASIC_CODES = {"<", "=[<", "><", "=[>", ">"};

    /!*</section>*!/



    /!*<section name="secondary relations">*!/
    //------------------------------------------------------------------

    /!**
     * A non-basic time point-interval relation that is often handy to use, which expresses that a time point <var>t</var>
     * and an interval <var>I</var> are concurrent in some way.
     * Thus, <var>t</var> does <em>not</em> come before <var>I</var>, <var>t</var> is not the end time of <var>I</var>,
     * and <var>t</var> does <em>not</em> come after <var>I</var> (remember that we define time intervals as right half-open).
     *!/
    @Invars(@Expression("CONCURS_WITH == or(BEGINS, IN)"))
    public final static PointIntervalRelation CONCURS_WITH = or(BEGINS, IN);

    /!**
     * A non-basic time point-interval relation that is often handy to use, which expresses that a time point <var>t</var>
     * is earlier than an interval <var>I</var> ends:
     * <pre>
     *   (I.end != null) && (t &lt; I.end)
     * </pre>.
     * This relation is introduced because it is the possible result of the composition of 2 basic relations.
     *!/
    @Invars(@Expression("BEFORE_END == or(BEFORE, BEGINS, IN)"))
    public static final PointIntervalRelation BEFORE_END = or(BEFORE, BEGINS, IN);

    /!**
     * A non-basic time point-interval relation that is often handy to use, which expresses that a time point <var>t</var>
     * is later than an interval <var>I</var> begins:
     * <pre>
     *   (I.begin != null) && (t &gt; I.begin)
     * </pre>.
     * This relation is introduced because it is the possible result of the composition of 2 basic relations.
     *!/
    @Invars(@Expression("AFTER_BEGIN == or(IN, ENDS, AFTER)"))
    public static final PointIntervalRelation AFTER_BEGIN = or(IN, ENDS, AFTER);

    /!*</section>*!/



    /!*<section name="n-ary operations">*!/
    //------------------------------------------------------------------

    /!**
     * The main factory method for PointIntervalRelations. Although this is intended to create
     * any disjunction of the basic relations, you can use any relation in the argument
     * list. This is the union of all time point-interval relations in {@code gr}, when they are considered
     * as sets of basic relations.
     *!/
    @MethodContract(post = {
        @Expression("for (PointIntervalRelation br : BASIC_RELATIONS) {exists (PointIntervalRelation tir : _gr) {tir.impliedBy(br)} ?? result.impliedBy(br)}")
    })
    public static PointIntervalRelation or(PointIntervalRelation... gr) {
    int acc = EMPTY_BIT_PATTERN;
    for (PointIntervalRelation tir : gr) {
    acc |= tir.$bitPattern;
}
return VALUES[acc];
}

/!**
 * The conjunction of the time point-interval relations in {@code gr}.
 * This is the intersection of all time point-interval relations in {@code gr}, when they are considered
 * as sets of basic relations.
 *!/
@MethodContract(post = {
    @Expression("for (PointIntervalRelation br : BASIC_RELATIONS) {for (PointIntervalRelation tir : _gr) {tir.impliedBy(br)} ?? result.impliedBy(br)}")
})
public static PointIntervalRelation and(PointIntervalRelation... gr) {
    int acc = FULL_BIT_PATTERN;
    for (PointIntervalRelation tir : gr) {
        acc &= tir.$bitPattern;
    }
    return VALUES[acc];
}

/!**
 * Remove basic relations in {@code gr2} from {@code gr1}.
 *!/
@MethodContract(
    pre  = {
        @Expression("_base != null"),
        @Expression("_term != null")
    },
    post = @Expression("for (PointIntervalRelation br : BASIC_RELATIONS) {br.implies(result) ?? br.implies(_base) && ! br.implies(_term)}")
)
public static PointIntervalRelation min(PointIntervalRelation base, PointIntervalRelation term) {
    assert preArgumentNotNull(base, "base");
    assert preArgumentNotNull(term, "term");
    int xor = base.$bitPattern ^ term.$bitPattern;
    int min = base.$bitPattern & xor;
    return VALUES[min];
}

/!**
 * This matrix holds the compositions of basic time point-interval relations with Allen relations. These are part
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

/!**
 * The relation of {@code t} with {@code i} with the lowest possible {@link #uncertainty()}.
 * {@code null} as {@link TimeInterval#getBegin()} or {@link TimeInterval#getEnd()} is considered
 * as unknown, and thus is not used to restrict the relation more, leaving it with
 * more {@link #uncertainty()}.
 *
 * @mudo contract
 *!/
public static PointIntervalRelation timePointIntervalRelation(Date t, TimeInterval i) {
    if (t == null) {
        return FULL;
    }
    Date iBegin = i.getBegin();
    Date iEnd = i.getEnd();
    PointIntervalRelation result = FULL;
    if (iBegin != null) {
        if (t.before(iBegin)) {
            return BEFORE;
        }
        else if (t.equals(iBegin)) {
            return BEGINS;
        }
        else {
            assert t.after(iBegin);
            result = min(result, BEFORE);
            result = min(result, BEGINS);
        }
    }
    if (iEnd != null) {
        if (t.before(iEnd)) {
            result = min(result, ENDS);
            result = min(result, AFTER);
        }
        else if (t.equals(iEnd)) {
            return ENDS;
        }
        else {
            assert t.after(iEnd);
            return AFTER;
        }
    }
    return result;
}

/!*</section>*!/



/!*construction>*!/
//------------------------------------------------------------------
*/

  /**
   * All possible time point-interval relations.
   @Invars({
    @Expression("VALUES != null"),
    @Expression("for (PointIntervalRelation tir : VALUES) {tir != null}"),
    @Expression("for (int i : 0 .. VALUES.length) {for (int j : i + 1 .. VALUES.length) {VALUES[i] != VALUES[j]}}"),
    @Expression("for (PointIntervalRelation tir) {VALUES.contains(tir)}")
})
   */
  public static readonly VALUES: readonly PointIntervalRelation[] = Object.freeze(
    pointIntervalRelationBitPatterns.map(bitPattern => new PointIntervalRelation(bitPattern))
  )

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
  private constructor (bitPattern: PointIntervalRelationBitPattern) {
    assert(bitPattern >= EMPTY_BIT_PATTERN)
    assert(bitPattern <= FULL_BIT_PATTERN)
    this.bitPattern = bitPattern
  }

  public invariants: ((this: PointIntervalRelation) => boolean)[] = [
    () => this.bitPattern >= EMPTY_BIT_PATTERN,
    () => this.bitPattern <= FULL_BIT_PATTERN
  ]

  public isBasic (): this is BasicPointIntervalRelation {
    return isBasicPointIntervalRelationBitPattern(this.bitPattern)
  }

  /*
/!*<section name="instance operations">*!/
//------------------------------------------------------------------

/!**
 * An ordinal for basic relations.
 *!/
@Basic(pre    = @Expression("isBasic()"),
    invars = {@Expression("result >= 0"), @Expression("result < 5")})
public int basicRelationOrdinal() {
    /!*
     * This is the bit position, 0-based, in the 13-bit bit pattern, of the bit
     * representing this as basic relation.
     *!/
    assert pre(isBasic());
    return Integer.numberOfTrailingZeros($bitPattern);
}

/!**
 * This is a basic time point-interval relation.
 *!/
@MethodContract(post = @Expression("BASIC_RELATIONS.contains(this)"))
public final boolean isBasic() {
    return isBasicBitPattern($bitPattern);
}

/!**
 * A basic relation is expressed by a single bit in the bit pattern.
 *!/
private static boolean isBasicBitPattern(int bitPattern) {
//    return Integer.bitCount($bitPattern) == 1;
    /!* http://graphics.stanford.edu/~seander/bithacks.html
     * Determining if an integer is a power of 2
     * unsigned int v; // we want to see if v is a power of 2
     * bool f;         // the result goes here
     * f = (v & (v - 1)) == 0;
     *
     * Note that 0 is incorrectly considered a power of 2 here. To remedy this, use:
     * f = !(v & (v - 1)) && v;
     *!/
    return ((bitPattern & (bitPattern - 1)) == 0) && (bitPattern != 0);
}

/!**
 * A measure about the uncertainty this time point-interval relation expresses.
 * This is the fraction of the 5 basic relations that imply this general relation.
 * {@link FULL} is complete uncertainty, and returns {@code 1}.
 * A basic relation is complete certainty, and returns {@code 0}.
 * The {@link #EMPTY empty} relation has no meaningful uncertainty. This method returns
 * {@link Float#NaN} as value for {@link EMPTY}.
 *!/
@MethodContract(post = {
    @Expression("this != EMPTY ? result == count (PointIntervalRelation br : BASIC_RELATIONS) {br.implies(this)} - 1) / 4"),
    @Expression("this == EMPTY ? result == Float.NaN")
})
public float uncertainty() {
    int count = Integer.bitCount($bitPattern);
    if (count == 0) {
        return Float.NaN;
    }
    count--;
    float result = count / 4.0F;
    return result;
}

/!**
 * <p>The complement of an time point-interval relation is the logic negation of the condition the time point-interval relation expresses.
 *   The complement of a basic time point-interval relation is the disjunction of all the other basic time point-interval relations.
 *   The complement of a general time point-interval relation is the disjunction of all basic time point-interval relations that are
 *   not implied by the general time point-interval relation.</p>
 * <p>This method is key to validating semantic constraints on time intervals, using the following idiom:</p>
 * <pre>
 *   ...
 *   Date t1 = ...;
 *   Date t2 = ...;
 *   PointIntervalRelation condition = ...;
 *   PointIntervalRelation actual = timePointIntervalRelation(t1, t2);
 *   if (! actual.implies(condition)) {
 *     throw new ....
 *   }
 *   ...
 * </pre>
 * <p><strong>Be aware that the complement has in general not the same meaning as a logic negation.</strong>
 *   For a basic relation <var>br</var> and a general time point-interval relation <var>cond</var>, it is true that</p>
 * <p><code><var>br</var>.implies(<var>cond</var>)</code> &hArr;
 *   <code>! <var>br</var>.implies(<var>cond</var>.complement())</code></p>
 * <p><strong>This is however not so for non-basic, and thus general time point-interval relations</strong>, as the following
 *   counterexample proofs. Suppose a condition is that, for a general relation <var>gr</var>:</p>
 * <pre><var>gr</var>.implies(<var>cond</var>)</pre>
 * <p>Suppose <code><var>gr</var> == (=[&lt; &gt;&lt;)</code>. Then we can rewrite in the following way:</p>
 * <p>&nbsp;&nbsp;&nbsp;<code><var>gr</var>.implies(<var>cond</var>)</code><br />
 *   &hArr; <code>(=[&lt; &gt;&lt;).implies(<var>cond</var>)</code><br />
 *   &hArr; <code>(=[&lt; &gt;&lt;) &sube; <var>cond</var></code><br />
 *   &hArr; <code>(=[&lt; &isin; <var>cond</var>) && (&gt;&lt; &isin; <var>cond</var>)</code></p>
 * <p>From the definition of the complement, it follows that, for a basic relation <var>br</var> and a general
 *   relation <var>GR</var> as set</p>
 * <p><code>br &isin; GR</code> &hArr; <code>br &notin; GR.complement()</code></p>
 * <p>Thus:</p>
 * <p>&hArr; <code>(=[&lt; &notin; <var>cond</var>.complement()) && (&gt;&lt; &notin; <var>cond</var>.complement())</code><br />
 *   &hArr; <code>! ((=[&lt; &isin; <var>cond</var>.complement()) || (&gt;&lt; &isin; <var>cond</var>.complement())</code> (1)</p>
 * <p>While, from the other side:</p>
 * <p>&nbsp;&nbsp;&nbsp;<code>! <var>gr</var>.implies(<var>cond</var>.complement())</code><br />
 *   &hArr; <code>! (=[&lt; &gt;&lt;).implies(<var>cond</var>.complement())</code><br />
 *   &hArr; <code>! (=[&lt; &gt;&lt;) &sube; (<var>cond</var>.complement())</code><br />
 *   &hArr; <code>! ((=[&lt; &isin; <var>cond</var>.complement()) && (&gt;&lt; &isin; <var>cond</var>.complement())</code> (2)</p>
 * <p>It is clear that (1) is incompatible with (2), except for the case where the initial relation is basic.</p>
 * <p>In the reverse case, for a basic relation <var>br</var> and a general time point-interval relation <var>actual</var>, nothing
 *   special can be said about the complement of <var>actual</var>, as the following reasoning illustrates:</p>
 * <p>&nbsp;&nbsp;&nbsp;<code><var>actual</var>.implies(<var>br</var>)</code><br />
 *   &hArr;<code><var>actual</var> &sube; <var>br</var></code><br />
 *   &hArr;<code><var>actual</var> &sube; (<var>br</var>)</code><br />
 *   &hArr;<code><var>actual</var> == (<var>br</var>) || <var>actual</var> == &empty;</code><br />
 *   &hArr;<code><var>actual</var>.complement() == (<var>br</var>).complement() || <var>actual</var>.complement() == FULL</code> (3)</p>
 * <p>From the other side:</p>
 * <p>&nbsp;&nbsp;&nbsp;<code>! <var>actual</var>.complement().implies(<var>br</var>)</code><br />
 *   &hArr;<code>! (<var>actual</var>.complement() &sube; <var>br</var>)</code><br />
 *   &hArr;<code>! (<var>actual</var>.complement() &sube; (<var>br</var>))</code><br />
 *   &hArr;<code>! (<var>actual</var>.complement() == (<var>br</var>) || <var>actual</var>.complement() == &empty;)</code><br />
 *   &hArr;<code><var>actual</var>.complement() != (<var>br</var>) && <var>actual</var>.complement() != &empty;</code> (4)</p>
 * <p>It is clear that (3) expresses something completely different then (4), and this effect is obviously even stronger with
 *   non-basic relations.</p>
 * <p>Note that it is exactly this counter-intuitivity that makes reasoning with time intervals so difficult.</p>
 *!/
@MethodContract(post = {
    @Expression("for (PointIntervalRelation br : BASIC_RELATIONS) {" +
        "(impliedBy(br) ?? ! complement().impliedBy(br)) && (! impliedBy(br) ?? complement().impliedBy(br))" +
        "}")
})
public final PointIntervalRelation complement() {
    /!*
     * implemented as the XOR of the FULL bit pattern with this bit pattern;
     * this simply replaces 0 with 1 and 1 with 0.
     *!/
    int full = FULL.$bitPattern;
    int result = full ^ $bitPattern;
    return VALUES[result];
}

/!**
 * Is {@code this} implied by {@code gr}? In other words, when considering the relations as a set
 * of basic relations, is {@code this} a superset of {@code gr} (considering equality as also acceptable)?
 *!/
@Basic(
    pre = @Expression("_gr != null"),
    invars = {
        @Expression("impliedBy(this)"),
        @Expression("basic ? for (PointIntervalRelation br : BASIC_RELATIONS) : {br != this ? ! impliedBy(br)}"),
        @Expression("for (PointIntervalRelation gr) {impliedBy(gr) == for (PointIntervalRelation br : BASIC_RELATIONS) : {gr.impliedBy(br) ? impliedBy(br)}")
    }
)
public final boolean impliedBy(PointIntervalRelation gr) {
    assert preArgumentNotNull(gr, "gr");
    return ($bitPattern & gr.$bitPattern) == gr.$bitPattern;
}

/!**
 * Does {@code this} imply {@code gr}? In other words, when considering the relations as a set
 * of basic relations, is {@code this} a subset of {@code gr} (considering equality as also acceptable)?
 *!/
@Basic(
    pre = @Expression("_gr != null"),
    invars = @Expression("_gr.impliedBy(this)")
)
public final boolean implies(PointIntervalRelation gr) {
    assert preArgumentNotNull(gr, "gr");
    return (gr.$bitPattern & $bitPattern) == $bitPattern;
}

/!*</section>*!/



@Override
public final int hashCode() {
    /!*
     * this returns the internal representation of this object: it is a way for people
     * that know about the implementation to see the bit pattern of this time point-interval relation
     *!/
    return $bitPattern;
}

/!**
 * This returns a representation of the time point-interval relation in the most used short notation (&lt; =[&lt; &gt;&lt; =[&gt; &gt;).
 *!/
@Override
public String toString() {
    StringBuilder result = new StringBuilder();
    result.append("(");
    if (isBasic()) {
        result.append(BASIC_CODES[basicRelationOrdinal()]);
    }
    else {
        boolean first = true;
        for (int i = 0; i < BASIC_CODES.length; i++) {
            if (impliedBy(BASIC_RELATIONS[i])) {
                result.append(BASIC_CODES[i]);
                if (first) {
                    result.append(" ");
                    first = false;
                }
            }
        }
    }
    result.append(")");
    return result.toString();
}
*/
}

/**
 * The total number of possible time point-interval relations **= 32**
 * (i.e., <code>2<sup>5</sup></code>).
 */
export const NR_OF_RELATIONS: number = BIT_PATTERN_NR_OF_RELATIONS

/**
 * This empty relation is not a true point-interval relation. It does not express a relational condition between
 * intervals. Yet, it is needed for consistency with some operations on point-interval relations.
 *
 * @Invars(@Expression("for (PointIntervalRelation basic : BASIC_RELATIONS) {! EMPTY.impliedBy(basic)}"))
 */
export const EMPTY: PointIntervalRelation = PointIntervalRelation.VALUES[EMPTY_BIT_PATTERN]

/**
 * A **basic** point-interval relation that says that a point in time `t` _comes before_ an interval `I`, i.e., `t`
 * is before the begin of `I`:
 *
 * ```
 * (I.from != undefined) && (t < I.from)
 * ```
 *
 * ![before](https://github.com/jandppw/ppwcode-recovered-from-google-code/blob/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval/doc-files/PointIntervalRelation-before.png?raw=true)
 *
 * The short representation of this time point-interval relation is `'<'`.
 */
export const BEFORE: PointIntervalRelation = PointIntervalRelation.VALUES[BEFORE_BIT_PATTERN]

/**
 * A **basic** point-interval relation that says that a point in time `t` _begins_ an interval `I`, i.e., `t` is the
 * start of `I`:
 *
 * ```
 * (I.from != undefined) && (t = I.from)
 * ```
 *
 * ![begins](https://github.com/jandppw/ppwcode-recovered-from-google-code/blob/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval/doc-files/PointIntervalRelation-begins.png?raw=true)
 *
 * The short representation of this time point-interval relation is `'=[<'`.
 */
export const BEGINS: PointIntervalRelation = PointIntervalRelation.VALUES[BEGINS_BIT_PATTERN]

/**
 * A **basic** point-interval relation that says that a point in time `t` _is in_ an interval `I`, i.e., `t` is after
 * the start of `I` and before the end of `I`:
 *
 * ```
 * (I.from != undefined) && (I.until != undefined) && (t > I.from) && (t < I.until)
 * ```
 *
 * ![in](https://github.com/jandppw/ppwcode-recovered-from-google-code/blob/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval/doc-files/PointIntervalRelation-in.png?raw=true)
 *
 * The short representation of this time point-interval relation is `'><'`.
 */
export const IN: PointIntervalRelation = PointIntervalRelation.VALUES[IN_BIT_PATTERN]

/**
 * A **basic** point-interval relation that says that a point in time `t` _ends_ an interval `I`, i.e., `t` is the end
 * of `I`:
 *
 * ```
 * (I.until != undefined) && (t = I.until)
 * ```
 *
 * ![ends](https://github.com/jandppw/ppwcode-recovered-from-google-code/blob/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval/doc-files/PointIntervalRelation-ends.png?raw=true)
 *
 * The short representation of this time point-interval relation is `'=[>'`.
 */
export const ENDS: PointIntervalRelation = PointIntervalRelation.VALUES[ENDS_BIT_PATTERN]

/**
 * A **basic** point-interval relation that says that a point in time `t` _comes after_ an interval `I`, i.e., `t` is
 * after the end of `I`:
 *
 * ```
 * (I.until != undefined) && (t > I.until)
 * ```
 *
 * ![after](https://github.com/jandppw/ppwcode-recovered-from-google-code/blob/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval/doc-files/PointIntervalRelation-after.png?raw=true)
 *
 * The short representation of this time point-interval relation is `'>'`.
 */
export const AFTER: PointIntervalRelation = PointIntervalRelation.VALUES[AFTER_BIT_PATTERN]

/**
 * The full time point-interval relation, which expresses that nothing definite can be said about the relationship
 * between a time point and a time interval.
 *
 * @Invars(@Expression("FULL == or(BEFORE, BEGINS, IN, ENDS, AFTER"))
 */
export const FULL: PointIntervalRelation = PointIntervalRelation.VALUES[FULL_BIT_PATTERN]

/**
 * The set of all 5 basic time point-interval relations. That they are presented here in a particular order, is a
 * pleasant side note, but in general not relevant for the user.
 *
@Invars({
    @Expression("for (BasicRelation br : BASIC_RELATIONS) {BASIC_RELATIONS[br.basicRelationOrdinal()] == br}"),
    @Expression("BASIC_RELATIONS[ 0] == BEFORE"),
    @Expression("BASIC_RELATIONS[ 1] == BEGINS"),
    @Expression("BASIC_RELATIONS[ 2] == IN"),
    @Expression("BASIC_RELATIONS[ 3] == ENDS"),
    @Expression("BASIC_RELATIONS[ 4] == AFTER")
})
 */
export const BASIC_RELATIONS: readonly PointIntervalRelation[] = Object.freeze([BEFORE, BEGINS, IN, ENDS, AFTER])

export const BASIC_CODES: readonly String[] = Object.freeze(['<', '=[<', '><', '=[>', '>'])
