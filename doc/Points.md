# Points

## Summary

For this library, we need to be able to compare the `from` and the `until` of intervals with each other, and with
individual points. We require that all points we need to compare are of the same type, to avoid mistakes.

This library:

- does not compare values if one of the values is `undefined` or `null`
- never tests for equality with `===` or `==`
- compares values with the optional `compareFn` function parameter, if it is given
- if no `compareFn` function parameter is given, compares values with `<`
  - when `¬(a < b) ∧ ¬(b < a)`, `a` and `b` are considered equal
  - the library fails when one of the points to compare is `NaN`

## Reasoning

The type of points we want to compare has to have a [strict total order](https://en.wikipedia.org/wiki/Total¬_order) ⨀
(where the symbol ⨀ represents a generic operator) and equality. ⨀ has to be _irreflexive_, _transitive_, and
_connected_ (a.k.a. _total_):

|                   | definition                                 |
| ----------------- | ------------------------------------------ |
| irreflexive       | ∀ a ∈ T: ¬ (a ⨀ a)                         |
| transitive        | ∀ a, b, c ∈ T: (a ⨀ b) ∧ (b ⨀ c) ⇒ (a ⨀ c) |
| connected (total) | ∀ a, b ∈ T: a ≠ b ⇒ (a ⨀ b) ∨ (b ⨀ a)      |

### `<` in JavaScript

In JavaScript, `<` fullfils this requirement for all possible values, which might come as a surprise.

```ts
typeof < === (a: unknown, b: unknown) => boolean | undefined
```

#### Intuitive for `number`, `string`, `Date`

The `<` operator _mostly_ behaves intuitively when comparing:

- a `number` value with another `number` value
- a `string` value with another `string` value
- a `Date` value with another `Date` value

and most usages of this library should be restricted to values for points of those types.

JavaScript, however, allows comparison between _any_ 2 values of _any_ type, because of _type coercion_. The algorithm
is described at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than).

In this library, we only compare values of the same type, and the rest of this discussion is limited to that case.

- the comparison of two `number` values is intuitive, except for `NaN` values; when either value is `NaN`, the result is
  `undefined`
  ([ECMAScript®2023 Language Specification; 6.1.6.1.12 Number::lessThan (x, y)](https://tc39.es/ecma262/#sec-numeric-types-number-lessThan))

  ```ts
  < (a: number, b: number) => boolean | undefined
  ```

- the comparison of two `bigint` values is intuitive
  ([ECMAScript®2023 Language Specification; 6.1.6.2.12 BigInt::lessThan (x, y)](https://tc39.es/ecma262/#sec-numeric-types-bigint-lessThan))

  ```ts
  < (a: bigint, b: bigint) => boolean
  ```

- the comparison of two `string` values is intuitive; `''` is the smallest possible value

  ```ts
  < (a: string, b: string) => boolean
  ```

- `false < true`
  ```ts
  < (a: boolean, b: boolean) => boolean
  ```

It is a precondition that a point must never be `NaN`. There is no sensible behavior for this library in this case. The
library throws an exception when it encounters `NaN` as a point.

#### Don't know 🤷

This library never compares `undefined`. `null` is coerced to `0`, but this library will never compare `null` values.
These values represent _don't know 🤷_. We advise to use `undefined`, or not to have a `from` or `until` property
present in an interval to express this, and leave `null` well alone.

#### Objects and Symbols

What is left, is the comparison of `object`s (including arrays), and `symbol`s.

`object`s and `symbol`s are coerced to `number`s, `bigint`s, or `string`s (by `@@toPrimitive()`, `valueOf()`,
`toNumber()`, or`toString()` —
[ECMAScript®2023 Language Specification; 7.2.13 IsLessThan (x, y, LeftFirst)](https://tc39.es/ecma262/#sec-islessthan)).
This results in the expected primitive types, which behave intuitively, for wrapper objects (`Number`,
`BigInt`,`String`, `Boolean`), and in `number` for `Date` (ms since epoch).

All other `object`s do produce a comparison result, but this is hardly intuitive, unless you explicitly code a
`valueOf()` `toNumber()`, or `toString()` method. As a result of the coercion, all generic `objects`s are considered
equal (both `a < b` and `b < a` return `false`). Arrays are also objects, and comparison “works”, but via string
comparison. This gives weird results. E.g., `[1, 3] < [2, 3]` is `true`, but `[2] < [11]` is `false`.

Generic `symbol`s fail with a `TypeError`. JavaScript tries to convert the `symbol` to a `number`, and that is not
supported. It is a precondition that a point must never be a `symbol`. The library throws an exception when it
encounters a `symbol` as a point.

If you must use non-`Date` `object`s, arrays, or `symbol`s as representations of points, we advise to make the
comparison explicit with the optional `compareFn` parameter (see below).

### Equality

Comparing primitive values of the same type with `===` or `==` behaves intuitively.

Comparing `object`s, including `Date`s, with `===` or `==` is not guaranteed to give the expected results. Depending on
the way you use the `object`s, 2 different `object`s (`!==`) can represent the same point. The equality comparison
evaluates reference equality, not semantic equality.

Therefor, this library never compares values with the `===` or `==` (or `'!==`, or `!=`) operators. Instead, because the
order is connected (total), `object`s are considered equal when ¬(a < b) ∧ ¬(b < a):

```
  ∀ a, b ∈ T: a ≠ b ⇒ (a ⨀ b) ∨ (b ⨀ a)
⇔ ∀ a, b ∈ T: a = b ∨ ((a ⨀ b) ∨ (b ⨀ a))
⇔ ∀ a, b ∈ T: ((a ⨀ b) ∨ (b ⨀ a)) ∨ a = b
⇔ ∀ a, b ∈ T: ¬ ((a ⨀ b) ∨ (b ⨀ a)) ⇒ a = b
⇔ ∀ a, b ∈ T: (¬ (a ⨀ b) ∧ ¬ (b ⨀ a)) ⇒ a = b
```

### `compareFn<T>`

Operations that use comparison feature an optional function parameter `compare` that you should supply when the type of
the points is not `number`, `string`, or `Date` (or `bigint`), that compares two point values, and returns a `number`.

```ts
type compareFn<T> = (a: T, b: T) => number
```

The `compare` method and function have the traditional semantics, where

- a negative number is returned when `this`, respectively `a`, is considered smaller than `other`,respectively `b`,
- a positive number when `this`, respectively `a`, is considered larger than `other`,respectively `b`, and
- `0` when both objects are considered equal.

The function may never return `NaN`.

Note that it is the implementation's responsibility to make sure the order is connected (total).

|                   | definition                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------- |
| irreflexive       | ∀ `a` ∈ `T`: `compare(a, a) === 0`                                                           |
| transitive        | ∀ `a`, `b`, `c` ∈ `T`: `compare(a, b) < 0 && compare(b, c) < 0` ⇒ `compare(a, c) < 0`        |
| connected (total) | ∀ `a`, `b` ∈ `T`: `compare(a, b) !== 0` ⇒ `compare(a, b) < 0 &vert;&vert; compare(b, a) < 0` |
|                   | ∀ `a`, `b` ∈ `T`: `compare(a, b) < 0` ⇔ `compare(b, a) > 0`                                  |
|                   | ∀ `a`, `b` ∈ `T`: `!Number.isNaN(compare(a, b))`                                             |
