/* eslint-env mocha */

import 'should'
import {
  areOfSameType,
  mostSpecializedCommonType,
  commonTypeRepresentation,
  TypeRepresentation,
  primitiveTypeRepresentations,
  isTypeRepresentation,
  typeRepresentationOf
} from '../src/util'
import { inspect } from 'util'
import should from 'should'
import { Constructor } from '../src/constructor'
import { idiotPointTypeRepresentations, pointTypeRepresentations } from './_pointTypeRepresentationCases'
import { dontKnowCases, objectCases, primitiveCases } from './_pointCases'

interface Case<T> {
  label: string
  elements: T[]
}

interface TrueCase<T> extends Case<T> {
  expected: TypeRepresentation | undefined
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

const trueCases: Array<TrueCase<unknown>> = [
  {
    label: 'number',
    elements: [undefined, undefined, 42, Math.LN2, 42, Number.NEGATIVE_INFINITY, Number.EPSILON],
    expected: 'number'
  },
  { label: 'numbers with NaN', elements: [23, 34, NaN, 43, undefined], expected: 'number' },
  { label: 'bigint', elements: [80532987634n, undefined, 9509523n, null], expected: 'bigint' },
  { label: 'string', elements: [null, 'string', '', 'a string'], expected: 'string' },
  { label: 'boolean', elements: [false, null, null, true], expected: 'boolean' },
  {
    label: 'Date',
    elements: [new Date(1996, 3, 24, 12, 34, 56, 897), new Date(2001, 3, 24, 12, 34, 56, 897)],
    expected: Date
  },
  { label: 'Number', elements: [Number(3), Number(89734)], expected: 'number' },
  { label: 'BigInt', elements: [BigInt(-432), BigInt(897532)], expected: 'bigint' },
  { label: 'String', elements: [String('a'), String('b')], expected: 'string' },
  { label: 'Boolean', elements: [Boolean(false), undefined, Boolean(true)], expected: 'boolean' },
  { label: 'object', elements: [{ a: 'a one' }, { b: 'a two' }, null], expected: Object },
  { label: 'A', elements: [new A(), new A(), undefined], expected: A },
  {
    label: 'polymorph',
    elements: [null, null, null, undefined, new A(), new A(), new B(), new B()],
    expected: A
  },
  {
    label: 'polymorph in reverse order',
    elements: [null, null, null, undefined, new B(), new A(), new A(), new B()],
    expected: A
  },
  { label: 'mixed objects', elements: [undefined, new A(), new B(), new C()], expected: Object },
  {
    label: 'object and array',
    elements: [{ a: ' a thing' }, [3]],
    expected: Object
  },
  {
    label: 'array and object',
    elements: [[null, null, 34], undefined, {}],
    expected: Object
  },
  {
    label: 'functions',
    elements: [
      () => 0,
      undefined,
      function a () {
        return true
      }
    ],
    expected: Function
  },
  {
    label: 'function and object',
    elements: [() => 0, undefined, {}],
    expected: Object
  },
  {
    label: 'array',
    elements: [
      [1, 3],
      [2, 3]
    ],
    expected: Array
  },
  { label: 'symbols', elements: [undefined, undefined, Symbol('a'), null, Symbol('b')], expected: 'symbol' },
  { label: 'mixed array', elements: [[11], ['a string']], expected: Array },
  { label: 'undefined', elements: [undefined, undefined, undefined], expected: undefined },
  { label: 'null', elements: [null, null], expected: undefined },
  { label: 'null and undefined', elements: [undefined, null, undefined], expected: undefined },
  { label: 'empty', elements: [], expected: undefined }
]

const falseCases: Array<Case<unknown>> = [
  { label: 'mixed primitives', elements: [undefined, null, 34, 'a string'] },
  { label: 'mixed', elements: [{}, null, 34] }
]

describe('util', function () {
  describe('primitiveTypeRepresentations', function () {
    it('is an array of strings', function () {
      primitiveTypeRepresentations.should.be.an.Array()
      primitiveTypeRepresentations.forEach(ppt => {
        ppt.should.be.a.String()
      })
    })

    const notPrimitivePointTypes = ['object', 'function', 'undefined']
    const pptsAsString: string[] = primitiveTypeRepresentations.slice()
    notPrimitivePointTypes.forEach(nppt => {
      it(`${nppt} is not a primitive point type`, function () {
        pptsAsString.includes(nppt).should.be.false()
      })
    })
  })
  describe('isTypeRepresentation', function () {
    describe('yes', function () {
      pointTypeRepresentations.forEach(ptr => {
        it(`returns true for ${inspect(ptr)}`, function () {
          isTypeRepresentation(ptr).should.be.true()
          const typed: TypeRepresentation = ptr
          console.log(typed)
        })
      })
    })
    describe('idiot point types', function () {
      idiotPointTypeRepresentations.forEach(iptr => {
        it(`returns false for ${inspect(iptr)}`, function () {
          isTypeRepresentation(iptr).should.be.false()
          // @ts-expect-error
          const typed: TypeRepresentation = iptr
          console.log(typed)
        })
      })
    })
  })
  describe('typeRepresentationOf', function () {
    describe("don't know 🤷", function () {
      dontKnowCases.forEach(c => {
        it(`returns undefined for ${inspect(c)}`, function () {
          should(typeRepresentationOf(c)).be.undefined()
        })
      })
    })
    describe('primitive and wrapper types', function () {
      primitiveCases.forEach(c => {
        it(`returns ${typeof c} for ${inspect(c)}`, function () {
          should(typeRepresentationOf(c)).equal(typeof c)
        })
      })
    })
    describe('objects and functions', function () {
      objectCases.forEach(c => {
        it(`returns the constructor for ${inspect(c)}`, function () {
          should(typeRepresentationOf(c)).equal(c.constructor)
        })
      })
    })
  })
  describe('mostSpecializedCommonType', function () {
    interface CommonCase {
      c1: Constructor<Object>
      c2: Constructor<Object>
      expected: Constructor<Object>
    }

    const cases: CommonCase[] = [
      { c1: Object, c2: Object, expected: Object },
      { c1: Date, c2: Date, expected: Date },
      { c1: Function, c2: Function, expected: Function },
      { c1: A, c2: A, expected: A },
      { c1: B, c2: B, expected: B },
      { c1: C, c2: C, expected: C },
      { c1: Function, c2: Function, expected: Function },
      { c1: Object, c2: Function, expected: Object },
      { c1: Object, c2: Date, expected: Object },
      { c1: Object, c2: A, expected: Object },
      { c1: Object, c2: B, expected: Object },
      { c1: Object, c2: C, expected: Object },
      { c1: A, c2: B, expected: A },
      { c1: A, c2: C, expected: Object },
      { c1: B, c2: C, expected: Object },
      { c1: A, c2: Date, expected: Object },
      { c1: A, c2: Function, expected: Object },
      { c1: B, c2: Date, expected: Object },
      { c1: B, c2: Function, expected: Object },
      { c1: C, c2: Date, expected: Object },
      { c1: C, c2: Function, expected: Object }
    ]

    cases.forEach(c => {
      describe(`${inspect(c.c1)} — ${inspect(c.c2)} -> ${inspect(c.expected)}`, function () {
        it(`returns ${inspect(c.expected)} when called with (${inspect(c.c1)}, ${inspect(c.c2)})`, function () {
          mostSpecializedCommonType(c.c1, c.c2).should.equal(c.expected)
        })
        it(`returns ${inspect(c.expected)} when called with (${inspect(c.c2)}, ${inspect(c.c1)})`, function () {
          mostSpecializedCommonType(c.c2, c.c1).should.equal(c.expected)
        })
      })
    })
  })
  describe('commonTypeRepresentation', function () {
    describe('true', function () {
      trueCases.forEach(c => {
        it(`returns ${inspect(c.expected)} for ${c.label}`, function () {
          should(commonTypeRepresentation(...c.elements)).equal(c.expected)
        })
      })
    })
    describe('false', function () {
      falseCases.forEach(c => {
        it(`returns false for ${c.label}`, function () {
          should(commonTypeRepresentation(...c.elements)).be.false()
        })
      })
    })
  })
  describe('areOfSameType', function () {
    describe('true', function () {
      trueCases.forEach(c => {
        it(`returns true for ${c.label}`, function () {
          areOfSameType(...c.elements).should.be.true()
        })
      })
    })
    describe('false', function () {
      falseCases.forEach(c => {
        it(`returns false for ${c.label}`, function () {
          areOfSameType(...c.elements).should.be.false()
        })
      })
    })
  })
})
