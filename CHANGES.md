# Changes

## 0

### 0.6

#### 0.6.0

- Remove type `LTComparablePrimitive`, `LTComparable`, and `SafeComparator`

The intention of these types was to have TypeScript warn the user when the default comparison would not work, and a
`compareFn` was explicitly necessary. This is so only when `symbol`s or `NaN` are used as point representations, which
is a border case in any way. The type system in any case could only detect this for `symbol`, since `NaN` is not a
separate type, but just a `number`. I was today years old when I learned this doesn't even work for `symbol`s, since
they are coerced to `Object`. Please imagine a rant about type systems in general, and this one in particular, here.

The removed types thus have no function. This condition is checked at run time anyway.

### 0.5

#### 0.5.0

- `TypeRepresentation` file name is changed (this is the incompatibility)

### 0.4

#### 0.4.2

- add `ReferenceIntervals`

#### 0.4.1

- add `chainToGaplessLeftDefiniteSequence`

#### 0.4.0

- `Comparator` file name is changed (this is the incompatibility)
- add `compareChainIntervals`
- add `SafeComparator`
- add `Chain` and `isChain`

### 0.3

#### 0.3.3

- add `ChainInterval` interface, and `isChainInterval`

#### 0.3.2

- make `compareIntervals` a first order function

#### 0.3.1

- add the option to `isSequence` to demand the sequence to be gapless or not

#### 0.3.0

- make `isSequence` work with an optional `options` object, instead of directly with an optional `compareFn` argument
- include `leftDefinite` and `rightDefinite` in `options`
- replace `isOrderedSequence` with the option `ordered` in `isSequence`

### 0.2

#### 0.2.3

- add `isOrderedSequence`
- add `isSequence`

#### 0.2.2

- add `isMinimalEnclosing`

#### 0.2.1

- add `minimalEnclosing`

#### 0.2.0

- intervals can no longer be degenerate
- definitions of basic Allen relations are simplified (revert)
- add `isEnclosing`

Found out that degenerate intervals make no sense. With half-open intervals, they are the empty set. When intervals are
interpreted as closed, degenerate intervals represent 1 point. we get nonsensical results, or difficult caveats, when
considering relations with the empty set or a single point. Depending on the definition of the basic relations (as
minimal definitions comparing the `start` and `end` points, or as sets of points), we get different results, which is
confusing. Some relations are the EMPTY relation, and others are not, depending on whether intervals are considered
closed or half-open.

Degenerate intervals in any interpretation should be barred from the domain representation.

### 0.1

#### 0.1.1

- fix embarissing typo in first sentence of README
- fixes in documentation

#### 0.1.0

- tweak definitions of basic relations so they work unambiguously with degenerate intervals

### 0.0

#### 0.0.3

- upgrade `eslint` and a plugin
- use explicit links in `README.md` for documentation pages, so they work in the `npm` homepage too

No solution yet for `typedoc` pages (they are not in the repository).

#### 0.0.2

- complete entries in `package.json`
- use explicit links in `README.md`, so the images are shown in the `npm` homepage too

#### 0.0.1

First experimental release
