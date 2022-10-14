/* eslint-env mocha */

import 'should'
import { arePointsOfSameType } from '../src/util'

interface Case<T> {
  label: string
  elements: T[]
}

class A {
  public a: string

  constructor () {
    this.a = 'an a'
  }
}

class B extends A {
  public b: number

  constructor () {
    super()
    this.b = 432
  }
}

class C {
  public c: boolean

  constructor () {
    this.c = true
  }
}

const trueCases: Array<Case<unknown>> = [
  { label: 'number', elements: [undefined, undefined, 42, Math.LN2, 42, Number.NEGATIVE_INFINITY, Number.EPSILON] },
  { label: 'bigint', elements: [80532987634n, undefined, 9509523n, null] },
  { label: 'string', elements: [null, 'string', '', 'a string'] },
  { label: 'boolean', elements: [false, null, null, true] },
  { label: 'Date', elements: [new Date(1996, 3, 24, 12, 34, 56, 897), new Date(2001, 3, 24, 12, 34, 56, 897)] },
  { label: 'Number', elements: [Number(3), Number(89734)] },
  { label: 'BigInt', elements: [BigInt(-432), BigInt(897532)] },
  { label: 'String', elements: [String('a'), String('b')] },
  { label: 'Boolean', elements: [Boolean(false), undefined, Boolean(true)] },
  { label: 'object', elements: [{ a: 'a one' }, { b: 'a two' }, null] },
  { label: 'A', elements: [new A(), new A(), undefined] },
  {
    label: 'polymorph',
    elements: [null, null, null, undefined, new A(), new A(), new B(), new B()]
  },
  {
    label: 'polymorph in reverse order',
    elements: [null, null, null, undefined, new B(), new A(), new A(), new B()]
  },
  {
    label: 'object and array',
    elements: [{ a: ' a thing' }, [3]]
  },
  {
    label: 'array and object',
    elements: [[null, null, 34], undefined, {}]
  },
  {
    label: 'array',
    elements: [
      [1, 3],
      [2, 3]
    ]
  },
  { label: 'mixed array', elements: [[11], ['a string']] },
  { label: 'undefined', elements: [undefined, undefined, undefined] },
  { label: 'null', elements: [null, null] },
  { label: 'null and undefined', elements: [undefined, null, undefined] },
  { label: 'empty', elements: [] }
]

const falseCases: Array<Case<unknown>> = [
  { label: 'mixed primitives', elements: [undefined, null, 34, 'a string'] },
  { label: 'mixed objects', elements: [undefined, new A(), new B(), new C()] },
  { label: 'mixed', elements: [{}, null, 34] },
  { label: 'NaN', elements: [23, 34, NaN, 43, undefined] },
  { label: 'symbols', elements: [undefined, undefined, Symbol('a'), null, Symbol('b')] }
]

describe('util', function () {
  describe('arePointsOfSameType', function () {
    describe('true', function () {
      trueCases.forEach(c => {
        it(`returns true for ${c.label}`, function () {
          arePointsOfSameType(...c.elements).should.be.true()
        })
      })
    })
    describe('false', function () {
      falseCases.forEach(c => {
        it(`returns false for ${c.label}`, function () {
          arePointsOfSameType(...c.elements).should.be.false()
        })
      })
    })
  })
})
