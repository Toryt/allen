/* eslint-env mocha */

import 'should'
import { ltCompare } from '../src/ltCompare'
import { inspect } from 'util'
import { PrimitivePoint } from '../src/point'
import { stuffWithUndefined } from './stuff'
import { isLTComparableOrIndefinite } from '../lib2/ltComparator'

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
  { label: 'array', smaller: [11], larger: [2] },
  { label: 'function', smaller: () => 5, larger: function a () {} },
  { label: 'function vs object', smaller: () => 5, larger: {} }
]

describe('ltComparator', function () {
  describe('ltComparator', function () {
    cases.forEach((c: Case<unknown>) => {
      describe(c.label, function () {
        it(`returns a negative number when the first argument (${inspect(
          c.smaller
        )}) is smaller than the second (${inspect(c.larger)})`, function () {
          ltCompare(c.smaller, c.larger).should.be.lessThan(0)
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
          ltCompare(t, t).should.equal(0)
        })
        it(`returns a positive number when the first argument (${inspect(
          c.smaller
        )}) is larger than the second (${inspect(c.larger)})`, function () {
          ltCompare(c.larger, c.smaller).should.be.greaterThan(0)
        })
      })
    })
    describe('object', function () {
      it('always returns zero for objects (all objects are the same)', function () {
        ltCompare({ a: 'an object' }, { b: 43 }).should.equal(0)
      })
    })
    describe('tweaked objects', function () {
      it('uses toPrimitive to coerce objects', function () {
        class A {
          private readonly i: number

          constructor (i: number) {
            this.i = i
          }

          [Symbol.toPrimitive] (): PrimitivePoint {
            return this.i
          }
        }

        const a1 = new A(1)
        const a2 = new A(2)

        ltCompare(a1, a2).should.be.lessThan(0)
        ltCompare(a1, a1).should.be.equal(0)
        ltCompare(a2, a1).should.be.greaterThan(0)
      })

      it('uses valueOf to coerce objects', function () {
        class A {
          private readonly i: number

          constructor (i: number) {
            this.i = i
          }

          valueOf (): PrimitivePoint {
            return this.i
          }
        }

        const a1 = new A(1)
        const a2 = new A(2)

        ltCompare(a1, a2).should.be.lessThan(0)
        ltCompare(a1, a1).should.be.equal(0)
        ltCompare(a2, a1).should.be.greaterThan(0)
      })

      it('uses toString to coerce objects', function () {
        class A {
          private readonly i: number

          constructor (i: number) {
            this.i = i
          }

          toString (): string {
            return this.i.toString()
          }
        }

        const a1 = new A(1)
        const a2 = new A(2)

        ltCompare(a1, a2).should.be.lessThan(0)
        ltCompare(a1, a1).should.be.equal(0)
        ltCompare(a2, a1).should.be.greaterThan(0)
      })
    })
  })
  describe('isLTComparableOrIndefinite', function () {
    stuffWithUndefined.forEach(s => {
      if (s === undefined || s === null) {
        it(`returns true for ${inspect(s)}, representing don't know`, function () {
          isLTComparableOrIndefinite(s).should.be.true()
        })
      } else if (typeof s === 'symbol' || Number.isNaN(s)) {
        it(`returns false for ${inspect(s)}`, function () {
          isLTComparableOrIndefinite(s).should.be.false()
        })
      } else {
        it(`returns true for ${inspect(s)}`, function () {
          isLTComparableOrIndefinite(s).should.be.true()
        })
      }
    })
  })
})
