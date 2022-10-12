/* eslint-env mocha */

import 'should'
import { ltComparator } from '../lib2/comparator'
import { inspect } from 'util'

interface Case<T> {
  label: string
  smaller: T
  larger: T
}

const cases: Array<Case<unknown>> = [
  { label: 'number', smaller: -4, larger: Math.PI },
  { label: 'number with -∞', smaller: Number.NEGATIVE_INFINITY, larger: Math.PI },
  { label: 'number with +∞', smaller: -4, larger: Number.POSITIVE_INFINITY },
  { label: 'number with ε', smaller: 0, larger: Number.EPSILON },
  { label: 'bigint', smaller: 4532341515151n, larger: 8905723809897562098790253n },
  { label: 'string', smaller: 'short', larger: 't is much larger' },
  { label: 'empty string', smaller: '', larger: 'not empty' },
  { label: 'boolean', smaller: false, larger: true },
  { label: 'Date', smaller: new Date(1996, 3, 24, 12, 34, 56, 897), larger: new Date(2001, 3, 24, 12, 34, 56, 897) },
  { label: 'Number', smaller: Number(3), larger: Number(89734) },
  { label: 'BigInt', smaller: BigInt(-432), larger: BigInt(897532) },
  { label: 'String', smaller: String('a'), larger: String('b') },
  { label: 'Boolean', smaller: Boolean(false), larger: Boolean(true) },
  { label: 'array', smaller: [1, 3], larger: [2, 3] },
  { label: 'array', smaller: [11], larger: [2] }
]

describe('comparator', function () {
  describe('ltComparator', function () {
    cases.forEach((c: Case<unknown>) => {
      describe(c.label, function () {
        it(`returns a negative number when the first argument (${inspect(
          c.smaller
        )}) is smaller than the second (${inspect(c.larger)})`, function () {
          ltComparator(c.smaller, c.larger).should.be.lessThan(0)
        })
        it(`returns zero when the first argument is equal to the second (${inspect(c.smaller)})`, function () {
          /* prettier-ignore */
          const t =
            c.smaller instanceof Date
              ? new Date(c.smaller.getTime())
              : c.smaller instanceof Number
                ? Number(c.smaller.valueOf())
                : c.smaller instanceof BigInt
                  ? BigInt(c.smaller.valueOf())
                  : c.smaller instanceof String
                    ? String(c.smaller.valueOf())
                    : c.smaller instanceof Boolean
                      ? Boolean(c.smaller.valueOf())
                      : typeof c.smaller === 'object'
                        ? { ...c.smaller }
                        : c.smaller
          ltComparator(t, t).should.equal(0)
        })
        it(`returns a positive number when the first argument (${inspect(
          c.smaller
        )}) is larger than the second (${inspect(c.larger)})`, function () {
          ltComparator(c.larger, c.smaller).should.be.greaterThan(0)
        })
      })
    })
    describe('object', function () {
      it('always returns zero for objects (all objects are the same)', function () {
        ltComparator({ a: 'an object' }, { b: 43 }).should.equal(0)
      })
    })
  })
})
