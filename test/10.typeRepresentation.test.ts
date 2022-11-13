/*
 Copyright © 2022 by Jan Dockx

 Licensed under the Apache License, Version 2.0 (the “License”);
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an “AS IS” BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* eslint-env mocha */

import {
  commonTypeRepresentation,
  Constructor,
  isTypeRepresentation,
  mostSpecializedCommonType,
  primitiveTypeRepresentations,
  representsSuperType,
  TypeRepresentation,
  typeRepresentationOf
} from '../src/typeRepresentation'
import { inspect } from 'util'
import should from 'should'
import { idiotTypeRepresentations, typeRepresentations } from './_typeRepresentationCases'
import { dontKnowCases, objectCases, primitiveCases } from './_pointCases'
import { A, B, C } from './_someClasses'

interface Case<T> {
  label: string
  elements: T[]
}

interface TrueCase<T> extends Case<T> {
  expected: TypeRepresentation | undefined
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
  { label: 'A', elements: [new A(4), new A(12), undefined], expected: A },
  {
    label: 'polymorph',
    elements: [null, null, null, undefined, new A(5), new A(3), new B(), new B()],
    expected: A
  },
  {
    label: 'polymorph in reverse order',
    elements: [null, null, null, undefined, new B(), new A(-5), new A(777), new B()],
    expected: A
  },
  { label: 'mixed objects', elements: [undefined, new A(44), new B(), new C()], expected: Object },
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

describe('typeRepresentation', function () {
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
      typeRepresentations.forEach(ptr => {
        it(`returns true for ${inspect(ptr)}`, function () {
          isTypeRepresentation(ptr).should.be.true()
        })
      })
    })
    describe('idiot point types', function () {
      idiotTypeRepresentations.forEach(iptr => {
        it(`returns false for ${inspect(iptr)}`, function () {
          isTypeRepresentation(iptr).should.be.false()
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
    it('returns undefined when called without arguments', function () {
      should(commonTypeRepresentation()).be.undefined()
    })
    describe('true', function () {
      trueCases.forEach(c => {
        it(`returns ${inspect(c.expected)} for ${c.label}`, function () {
          should(commonTypeRepresentation(...c.elements)).equal(c.expected)
        })
      })
      it('can deal with 1 argument', function () {
        should(commonTypeRepresentation(32)).equal('number')
      })
    })
    describe('false', function () {
      falseCases.forEach(c => {
        it(`returns false for ${c.label}`, function () {
          should(commonTypeRepresentation(...c.elements)).be.false()
        })
      })
      it('can deal with early false detection (coverage)', function () {
        should(commonTypeRepresentation(32, 'not a number', 14, true, 18)).be.false()
      })
    })
  })
  describe('representsSuperType', function () {
    describe('primitive', function () {
      typeRepresentations.forEach(ptr1 => {
        describe(inspect(ptr1), function () {
          typeRepresentations.forEach(ptr2 => {
            if (ptr1 === ptr2) {
              it(`${inspect(ptr1)} represents itself`, function () {
                representsSuperType(ptr1, ptr1).should.be.true()
              })
            } else if (typeof ptr1 === 'function' && typeof ptr2 === 'function' && ptr2.prototype instanceof ptr1) {
              it(`${inspect(ptr1)} represents ${inspect(ptr2)}`, function () {
                representsSuperType(ptr1, ptr1).should.be.true()
              })
            } else {
              it(`${inspect(ptr1)} does not represent ${inspect(ptr2)}`, function () {
                representsSuperType(ptr1, ptr2).should.be.false()
              })
            }
          })
          it(`${inspect(ptr1)} does not represent 'function'`, function () {
            // @ts-expect-error
            representsSuperType.bind(undefined, ptr1, 'function').should.throw()
          })
          idiotTypeRepresentations.forEach(s => {
            it(`${inspect(ptr1)} — ${inspect(s)} throws`, function () {
              // @ts-expect-error
              representsSuperType.bind(undefined, ptr1, s).should.throw()
            })
          })
        })
      })
    })
    describe('idiot super type', function () {
      idiotTypeRepresentations.forEach(s1 => {
        describe(inspect(s1), function () {
          typeRepresentations.forEach(ptr2 => {
            it(`${inspect(s1)} — ${inspect(ptr2)} throws`, function () {
              // @ts-expect-error
              representsSuperType.bind(undefined, s1, ptr2).should.throw()
            })
          })
          it(`${inspect(s1)} — 'function' throws`, function () {
            // @ts-expect-error
            representsSuperType.bind(undefined, s1, 'function').should.throw()
          })
          idiotTypeRepresentations.forEach(s => {
            it(`${inspect(s1)} does not represent ${inspect(s)}`, function () {
              // @ts-expect-error
              representsSuperType.bind(undefined, s1, s).should.throw()
            })
          })
        })
      })
    })
  })
})
