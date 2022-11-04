<!---
Copyright © 2022 by Jan Dockx

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Points and comparison

## Summary

For this library, we need to be able to compare the `start` and the `end` of intervals with each other, and with
individual _points_. We require that all points we need to compare are “of the same type”.

This library:

- does not compare values if one of the values is `undefined` or `null`; `undefined` and `null` values represent “don't
  know 🤷”.
- never tests for equality with `===` or `==`
- compares values with the optional `compareFn` function parameter, if it is given
- if no `compareFn` function parameter is given, compares values with `<`
  - when `¬(a < b) ∧ ¬(b < a)`, `a` and `b` are considered equal
  - we do not use `>`; `a > b` is calculated as `b < a`
- a `compareFn` function parameter is mandatory when one of the points to compare is `NaN` or a `symbol`

When `undefined` or `null` values are used as points, they represent “don't know 🤷”.

## Strict total order

To be able to compare points of a certain type, the type has to have a
[strict total order](https://en.wikipedia.org/wiki/Total¬_order) ⨀ (where the symbol ⨀ represents a generic operator). ⨀
has to be _irreflexive_, _transitive_, and _connected_ (a.k.a. _total_):

|                   | definition                                 |
| ----------------- | ------------------------------------------ |
| irreflexive       | ∀ a ∈ T: ¬ (a ⨀ a)                         |
| transitive        | ∀ a, b, c ∈ T: (a ⨀ b) ∧ (b ⨀ c) ⇒ (a ⨀ c) |
| connected (total) | ∀ a, b ∈ T: a ≠ b ⇒ (a ⨀ b) ∨ (b ⨀ a)      |

## `<` in JavaScript

In JavaScript, `<` fullfils this requirement technically for _almost_ all possible values out-of-the-box, which might
come as a surprise.

```ts
export type LTComparablePrimitive = number | bigint | string | boolean | Function

export type LTComparable = LTComparablePrimitive | Object

typeof < === (a: LTComparable, b: LTComparable) => boolean | undefined
```

JavaScript, allows `<` comparison between _any_ 2 values of _any_ type (except `symbol`s) because of _type coercion_,
and returns `true` or `false` (except when one of the values is, or is coerced to, `undefined` or `NaN`). The algorithm
is described at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than).

This library will never compare `null` or `undefined`. In this library, we only compare values of the same type, and the
rest of this discussion is limited to that case.

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

What is left, is the comparison of `object`s (including arrays), `function`s, and `symbol`s.

`object`s are coerced to `number`s, `bigint`s, or `string`s (by `@@toPrimitive()`, `valueOf()`, `toNumber()`,
or`toString()` —
[ECMAScript®2023 Language Specification; 7.2.13 IsLessThan (x, y, LeftFirst)](https://tc39.es/ecma262/#sec-islessthan)).
This results in the expected primitive types, which behave intuitively, for wrapper objects (`Number`,
`BigInt`,`String`, `Boolean`), and in `number` for `Date` (ms since epoch).

All other `object`s do produce a comparison result, but this is hardly intuitive, unless you explicitly code a
`@@toPrimitive()`, `valueOf()` `toNumber()`, or `toString()` method. As a result of the coercion, all generic `objects`s
are considered equal (both `a < b` and `b < a` return `false`). Arrays are also objects, and comparison “works”, but via
string comparison. This gives weird results. E.g., `[1, 3] < [2, 3]` is `true`, but `[2] < [11]` is `false`. `function`s
are comparable with `<`, and give more reasonable results out-of-the-box, because the source code is compared as a
string. The coercion can be manipulated by overriding `@@toPrimitive()`, `valueOf()` `toNumber()`, or `toString()`.

`symbol`s fail with a `TypeError`. JavaScript tries to coerce the `symbol`, and that is not supported. It is not
possbible to override the `@@toPrimitive()`, `valueOf()` `toNumber()`, or `toString()` method of a `symbol`. `symbols`
cannot be compared, nor be made to be comparable, with `<`.

## Equality

Comparing primitive values of the same type with `===` or `==` behaves intuitively.

Comparing `object`s, including `Date`s, with `===` or `==` is not guaranteed to give the expected results. Depending on
the way you use the `object`s, 2 different `object`s (`!==`) can represent the same point. The equality comparison
evaluates reference equality, not semantic equality.

Therefor, this library never compares values with the `===` or `==` (or `!==`, or `!=`) operators. Instead, because the
order is connected (total), `object`s are considered equal when `¬(a < b) ∧ ¬(b < a)`:

```
  ∀ a, b ∈ T: a ≠ b ⇒ (a ⨀ b) ∨ (b ⨀ a)
⇔ ∀ a, b ∈ T: a = b ∨ ((a ⨀ b) ∨ (b ⨀ a))
⇔ ∀ a, b ∈ T: ((a ⨀ b) ∨ (b ⨀ a)) ∨ a = b
⇔ ∀ a, b ∈ T: ¬ ((a ⨀ b) ∨ (b ⨀ a)) ⇒ a = b
⇔ ∀ a, b ∈ T: (¬ (a ⨀ b) ∧ ¬ (b ⨀ a)) ⇒ a = b
```

## `compareFn<T>`

Operations that use comparison feature an optional function parameter `compareFn` that you _must_ supply when points can
be `NaN`, or are `symbol`s, and can supply in other cases.

```ts
type Comparator<T> = (t1: T, t2: T) => number
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
|                   | ∀ `a`, `b` ∈ `T`: `compare(a, b) === 0` ⇔ `compare(b, a) === 0`                              |
|                   | ∀ `a`, `b` ∈ `T`: `compare(a, b) < 0` ⇔ `compare(b, a) > 0`                                  |
|                   | ∀ `a`, `b` ∈ `T`: `!Number.isNaN(compare(a, b))`                                             |

## `ltComparator<T>`

This library compares points with `ltComparator<T>` if no explicit `compareFn<T>` is given as parameter.

```ts
function ltComparator<LTComparable> (t1: T, t2: T): number
```

`ltComparator<T>` compares 2 points with `<`.

The preconditions for this function are

- that the values must be “of the same type”.
- that the values cannot be `NaN` or a `symbol`, and

Using this default is the right choice in most sensible cases, where points are represented by `number`s, `string`s, or
`Date`s.

## Of the same type

This library is limited to compare points “of the same type”.

For primitive values (`number`, `bigint`, `string`, `boolean`) this means `typeof t1 === typeof t2`.

For `object`s, this means they have to have a common “most specialized common supertype”. Finally, `Object` is a common
supertype of all `object`s. So all `object`s are “of the same type”. This creates a challenge for `Date`, which is an
important `object` subtype for this library. Users would expect to only compare `Date`s with other `Date`s, but in fact
they can be compared with any other `object` (but probably not with the expected semantics). Because we do not want to
exclude mixed usage of `Date`s with, e.g., `moment.js` `object`s, this is up to the user.

The library user can override the `@@toPrimitive()`, `valueOf()` `toNumber()`, or `toString()` methods of `function`
instances, as they can for any `object`. It is impossible in JavaScript to create subtypes of `Function` that are still
`Callable`, but a library user might set things up to compare `function` instances with other `function` instances or
`object`s. Therefor, `function` instances are threathed as any other `object`, and, `function` instances are considered
“of the same type” as other `function` instances, and finally any other `object`.

When using TypeScript, the library user can limit the “common type” more using generics.

## Don't know 🤷

`undefined` and `null` represent _don't know 🤷_. We advise to use `undefined`, or not to have a `start` or `end`
property present in an interval to express this, and leave `null` well alone.

## Advise on points and comparison

We advise to use `number`s (except `NaN`), `string`s (ISO-formatted), or `Date`s to represent points.

If you must use non-`Date` `object`s, arrays, or `function`s as representations of points, consider overriding
`valueOf`, or make the comparison explicit with the optional `compareFn` parameter.
