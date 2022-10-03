# Point – Interval Relation

When working with time points and time intervals, we often want to express constraints (invariants) that limit
acceptable combinations. Expressing this correctly proves difficult in practice. Falling back to working with isolated
start and end dates, and reasoning about their relations with the time point, in practice proves to be even much more
difficult and error-prone.

Support for reasoning abouy point – interval relations is developed following the example of Allen interval – interval
relations.

## Quick overview

We find that there are 5 _basic relations_ possible between a point and a definite interval:

- `t` is `BEFORE` `I` (`b`)

  ![before](PointIntervalRelation-before.png)

- `t` `COMMENCES` `I` (`c`)

  ![begins](PointIntervalRelation-commences.png)

- `t` `IN` `I` (`i`)

  ![in](PointIntervalRelation-in.png)

- `t` `TERMINATES`I`(`t`)

  ![ends](PointIntervalRelation-terminates.png)

- `t` is `AFTER` `I` (`a`)

  ![after](PointIntervalRelation-after.png)

These basic relations between a point and an interval are similar to `<`, `=`, and `>` between 2 points.

When reasoning about the relationship between points and intervals however, like when comparing time instances, we also
often employ _indeterminate_ relations, such as `t (bc) I` (`t` is `BEFORE` `I`, or `COMMENCES` `I`). This is comparable
to reasoning with `≤`, `≥`, and `≠` with time instances.

For time intervals, given 5 basic relations, we get 32 (= 2<sup>5</sup>) possible _general relations_. This includes the
`EMPTY` relationship for algebraic reasons, and the `FULL` relationship (comparable to `< ⋁ = ⋁ >` with time instances),
which expresses the maximum uncertainty about the relation between a point in time and time intervals. `FULL` means you
are from Barcelona. The `EMPTY` relation is not a true point – interval relation. It does not express a relational
condition between a point and an intervals. It is needed for consistency with some algebraic operations on point –
interval relations.

## Interval constraints

Point – interval relations will most often be used in business code to _constrain_ relations between time points and
time intervals. This is notoriously, treacherously difficult. It is for this reason that you should use code like this,
that at least forces you to think things trough, and tries to offer tools to ease reasoning. The idiom to do this is
explained next.

First we need to determine the relation we want to uphold (`condition`). E.g., we want to assert that given a point in
time `t` does not fall before a time interval `I` is ‘fully started’. The relationship that expresses this is

```
condition = (bc)
```

Next, we want to determine the relationship between `t` and `I` as precisely as possible. If `I` is completely
determined, i.e., neither its start nor its end is `undefined`, the result will be a _basic relation_ (i.e.,
`(b)`,`(c)`, `(i)`, `(t)`, or `(a)`). Otherwise, the result will be a less certain relation. To determine this
relationship, use `pointIntervalRelation(T, Interval<T>)`.

The idiom for the assertion we want to express is then:

```ts
pointIntervalRelation(t, I).implies(condition)
```

This is often the form of an invariant.

Note that this can fail, on the one hand because the actual relation is unacceptable, but also because _we cannot be
100% sure that the actual relationship satisfies the condition_.

In our example, we would have:

```ts
pointIntervalRelation(t, I).implies(or(BEFORE, COMMENCES))
```

If the actual relation results in `IN` (`(i)`), for example, the constraint is clearly not satisfied. If the actual
relation results in `(bi)`, it means that it is possible that the relation is satisfied, but there is also a chance that
it is not.

In code then, we often want to throw an exception to interrupt an algorithm that would violate the invariant. The idiom
for this is usually of the form:

```ts
...
T t = ...;
Interval<T> i = ...;
PointIntervalRelation condition = ...;
PointIntervalRelation actual = pointIntervalRelation(t, i);
if (!actual.implies(condition)) {
  throw new ....
}
...
```

In our example, this would become

```ts
...
Date t = ...;
TimeInterval<Date> i = ...;
if (!pointIntervalRelation(t, i).implies(or(BEFORE, COMMENCES)) {
  throw new ....
}
...
```

**Note that in general `!actual.implies(condition)` is _not equivalent_ to `actual.implies(condition.complement())`.**

In our example this is already clear. If the actual relation results in `(i)`, both expressions evaluate to `true`:

```
  ¬(pointIntervalRelation(t, i) ⇒ (bc))
⇔ ¬((i) ⇒ (bc))
⇔ ¬false
⇔ true

  (pointIntervalRelation(t, i) ⇒ (bc).complement
⇔ ((i) ⇒ (bc).complement)
⇔ ((i) ⇒ (ita))
⇔ true
```

But in the case where the actual relation results in `(bi)`, they do not:

```
  ¬(pointIntervalRelation(t, i) ⇒ (bc))
⇔ ¬((bi) ⇒ (bc))
⇔ ¬false
⇔ true

  (pointIntervalRelation(t, i) ⇒ (bc).complement
⇔ ((bi) ⇒ (bc).complement)
⇔ ((bi) ⇒ (ita))
⇔ false
```

`!pointIntervalRelation(t, i).implies(or(BEFORE, COMMENCES))` expresses that [we want to throw an exception if] _it is
not guaranteed that `t` is before `i` is fully started_.
`pointIntervalRelation(t, i).implies(or(BEFORE, COMMENCES).complement())` expresses that [we want to throw an exception
if] _it is guaranteed that `t` is after `i` is fully started_. **These 2 phrases are not equivalent.**

Consider an `undefined` start for `i`. When `t` is before the end of `i`, we cannot know whether `t` is before, equal
to, or after the start of `i`.

```
pointIntervalRelation(t, i) = (bci)
```

With `!pointIntervalRelation(t, i).implies(or(BEFORE, COMMENCES))` we would throw an exception. `t` could be `BEFORE`
`i`, or commence `i`, which would be ok, but `t` could also be `IN` `i`, which is not ok. It is not guaranteed that `t`
is before `i` is fully started.

With `pointIntervalRelation(t, i).implies(or(BEFORE, COMMENCES).complement())` we would not throw an exception. `t`
could be `IN` `i`, which would not be ok, but it could also be `BEFORE` `i`, or commence `i`, and so it is _not
guaranteed_ that `t` is after `i` is fully started.

## Reasoning with unknown but constrained begin and end dates

In time intervals, the start or end can be `undefined`. The semantics of this is in general that the start date,
respectively the end date, is unknown. Comparing such an interval with a point in time results in a relatively broad
point – interval relation, expressing an amount of uncertainty.

In several use cases however, we do not know a _definite_ start or end date, but we do know that the start or end date
have constraints. E.g., consider contracts that have a definite start date, but are open-ended. The contract interval
thus is incompletely known. However, since at the moment of our reasoning no definite end date is set, we know that the
end date is at least later than `now`. In comparing this contract interval with a point in time, this constraint can be
of use to limit the extent, i.e., the uncertainty, of the point – interval relation. The same applies, e.g., with
contracts that will start once payment is received. Since it is not received yet at the moment of our evaluation, we
know that the start date is at least later than or equal to `now`.

In such cases, the interval object `I` we are focusing on can be interpreted in another way. Suppose we are comparing
`I` with a point in time `t`. We are actually not interested in `pointIntervalRelation(t, I)`, but rather in
`pointIntervalRelation(t, IConstrained)`. Sadly, there is no easy syntax (or code) to express `IConstrained`. What we
can express is an `IDeterminate`, where _the border times are filled out in place of the unknown start or end_.
`pointIntervalRelation(t, IDeterminate)` can be calculated, and will be much less uncertain than
`pointIntervalRelation(t, I)`. If we now can determine the Allen relation from `IDeterminate` to `IConstrained`, we can
find `pointIntervalRelation(t, IConstrained)` as:

```
pointIntervalRelation(t, IConstrained) =
  compose(pointIntervalRelation(t, IDeterminate), allenRelation(IDeterminate, IConstrained))
```

The point – interval relation from an interval we are focusing on with constrained semantics to a determinate interval
is a constant that can be determined by reasoning. E.g., for our open-ended contract, that lasts at least longer than
today (`IConstrained = [I.start, > now[`, supposing `I.start ≤ yesterday`), we can say that its relation to the
determinate interval `IDeterminate = [I.start, now[` is `(s)`. Suppose `pointIntervalRelation(t, IDeterminate)` is `(i)`
(say `t` is `yesterday`). We can now say that `pointIntervalRelation(t, IConstrained) = (s).(i) = (i)`. The comparison
of the indeterminate interval with`t`,`pointIntervalRelation(t, I)`, would have resulted in:

```
  pointIntervalRelation(t, I)
= pointIntervalRelation(yesterday, [I.start, undefined[)
= (ita)
```

which is much less certain than `(i)`.

Be aware that in a number of cases, the non-determinate character of `I` doesn't matter. If you suppose in the previous
example that `pointIntervalRelation(t, IDeterminate) = (a)` (say `t` is next year),
`pointIntervalRelation(t, IConstrained) = (s).(a) = (ita)`. The comparison of the indeterminate interval with `t`,
`pointIntervalRelation(t, I)`, in this case, results in the same point-interval relation:

```
  pointIntervalRelation(t, I)
= pointIntervalRelation(nextYear, [I.start, undefined[)
= (ita)
```

### About the code

We have chosen to introduce a full-featured type for working with point – interval relations, to make encapsulation as
good as possible. This has a slight performance overhead, but we believe that this is worth it, considering the immense
complexity of reasoning about relations between points in time and time intervals.

Point – interval relations follow the ‘32-fold singleton pattern’. All possible instances are created when this module
is loaded, and it is impossible for a user to create new instances. This means that reference equality (‘`===`’) can can
be used to compare point – interval relations, Instances are obtained using the constants this module offers, or using

- the combination methods
  - `PointIntervalRelation.or(PointIntervalRelation)`,
  - `or (...PointIntervalRelation)`,
  - `PointIntervalRelation.and(PointIntervalRelation)`,
  - `and(...PointIntervalRelation)`,
  - `PointIntervalRelation.min(PointIntervalRelation)`, and
  - `compose(PointIntervalRelation, TimeIntervalRelation)`, and // MUDO make instance method
- the unary method `PointIntervalRelation.complement()`.

A `PointIntervalRelation` can be determined based on a point in time and a time interval with
`pointIntervalRelation(Date, TimeInterval)`. // MUDO move to AllenRelation?

`BasicPointIntervalRelation.VALUES` lists all possible point – interval relations.

All methods in this class are _O(n)_, i.e., work in constant time, although
`compose(PointIntervalRelation, TimeIntervalRelation)` takes a significant longer constant time than the other methods.

// MUDO describe BasicTimeIntervalRelation
