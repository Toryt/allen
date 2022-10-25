/* eslint-env mocha */

import 'should'
import { inspect } from 'util'
import { stuff, stuffWithUndefined } from './stuff'
import { isInterval } from '../src/Interval'
import { typeRepresentations } from './_typeRepresentationCases'
import { TypeRepresentation, typeRepresentationOf, representsSuperType } from '../src/typeRepresentation'
import { TypeFor } from '../src/type'
import { A, B, C } from './_someClasses'

interface Case<T extends TypeRepresentation> {
  label: string
  pointType: T
  p1: TypeFor<T>
  p2: TypeFor<T>
}

const indefinites = [undefined, null]

const trueCases: Array<Case<TypeRepresentation>> = [
  { label: 'number', pointType: 'number', p1: -4, p2: Math.PI },
  { label: 'number with NaN', pointType: 'number', p1: 0, p2: NaN },
  {
    label: 'bigint',
    pointType: 'bigint',
    p1: -72799850575770750175017107610717190n,
    p2: 90785075016070176023707012760760267026n
  },
  { label: 'string', pointType: 'string', p1: 'string one', p2: 'string two' },
  { label: 'boolean', pointType: 'boolean', p1: false, p2: true },
  {
    label: 'Date',
    pointType: Date,
    p1: new Date(2022, 9, 23, 13, 56, 33, 213),
    p2: new Date(2024, 4, 18, 6, 5, 36, 388)
  },
  { label: 'Number', pointType: 'number', p1: Number(3), p2: Number(89734) },
  { label: 'BigInt', pointType: 'bigint', p1: BigInt(-432), p2: BigInt(8975322352525252662626662677222727) },
  { label: 'String', pointType: 'string', p1: String('a'), p2: String('b') },
  { label: 'Boolean', pointType: 'boolean', p1: Boolean(true), p2: Boolean(false) },
  { label: 'object', pointType: Object, p1: { a: 'a one' }, p2: { b: 'a two' } },
  { label: 'A', pointType: A, p1: new A(), p2: new A() },
  { label: 'polymorph', pointType: A, p1: new A(), p2: new B() },
  { label: 'polymorph in reverse order', pointType: A, p1: new B(), p2: new A() },
  { label: 'mixed objects', pointType: Object, p1: new B(), p2: new C() },
  {
    label: 'object and array',
    pointType: Object,
    p1: { a: ' a thing' },
    p2: [3]
  },
  {
    label: 'array and object',
    pointType: Object,
    p1: [null, null, 34],
    p2: {}
  },
  {
    label: 'functions',
    pointType: Function,
    p1: () => 0,
    p2: function a () {
      return true
    }
  },
  {
    label: 'function and object',
    pointType: Object,
    p1: () => 0,
    p2: {}
  },
  {
    label: 'array',
    pointType: Array,
    p1: [1, 3],
    p2: [2, 3]
  },
  { label: 'symbols', pointType: 'symbol', p1: Symbol('a'), p2: Symbol('b') },
  { label: 'mixed array', pointType: Array, p1: [11], p2: ['a string'] }
]
//
// const falseCases: Array<Case<unknown>> = [
//   { label: 'mixed primitives', elements: [undefined, null, 34, 'a string'] },
//   { label: 'mixed', elements: [{}, null, 34] }
// ]

const notAnIntervalCandidate = stuffWithUndefined.filter(s => typeof s !== 'object' && typeof s !== 'function')

describe('interval', function () {
  describe('isInterval', function () {
    describe('not an object', function () {
      typeRepresentations.forEach(ptr => {
        describe(inspect(ptr), function () {
          notAnIntervalCandidate.forEach(s => {
            it(`returns false for ${inspect(s)}`, function () {
              isInterval(s, ptr).should.be.false()
            })
          })
        })
      })
    })
    describe('complete indefinite', function () {
      typeRepresentations.forEach(ptr => {
        describe(inspect(ptr), function () {
          indefinites.forEach(p1 => {
            indefinites.forEach(p2 => {
              it(`returns true for [${inspect(p1)}, ${inspect(p2)}[ for point type ${inspect(ptr)}`, function () {
                isInterval({ start: p1, end: p2 }, ptr).should.be.true()
              })
            })
          })
        })
      })
    })

    function represents (typeRepresentation: TypeRepresentation, u: unknown) {
      const tru = typeRepresentationOf(u)
      return tru === undefined || tru === null || representsSuperType(typeRepresentation, tru)
    }

    typeRepresentations.forEach(targetPointType => {
      describe(`pointType ${inspect(targetPointType)}`, function () {
        trueCases.forEach(({ label, pointType, p1, p2 }) => {
          const expectedLabel = representsSuperType(targetPointType, pointType) ? 'true' : 'false'
          describe(`${label} -> ${expectedLabel}`, function () {
            it(`returns ${expectedLabel} for [${inspect(p1)}, ${inspect(p2)}[ for point type ${inspect(
              targetPointType
            )}`, function () {
              isInterval({ start: p1, end: p2 }, targetPointType).should.be[expectedLabel]()
            })
            it(`returns false for [${inspect(p2)}, ${inspect(p1)}[ for point type ${inspect(
              targetPointType
            )}`, function () {
              isInterval({ start: p2, end: p1 }, targetPointType).should.be.false()
            })
            indefinites.forEach(indef => {
              if (!represents(targetPointType, p1)) {
                it(`returns ${expectedLabel} for [${inspect(p1)}, ${inspect(indef)}[ for point type ${inspect(
                  targetPointType
                )}`, function () {
                  isInterval({ start: p1, end: indef }, targetPointType).should.be[expectedLabel]()
                })
              }
              if (!represents(targetPointType, p2)) {
                it(`returns ${expectedLabel} for [${inspect(indef)}, ${inspect(p2)}[ for point type ${inspect(
                  targetPointType
                )}`, function () {
                  isInterval({ start: indef, end: p2 }, targetPointType).should.be[expectedLabel]()
                })
              }
            })

            const wrongStuff = stuff.filter(s => {
              const trs = typeRepresentationOf(s)
              return trs !== undefined && !representsSuperType(targetPointType, trs)
            })
            wrongStuff.forEach(s => {
              it(`returns false for [${inspect(p1)}, ${inspect(s)}[ for point type ${inspect(
                targetPointType
              )}`, function () {
                isInterval({ start: p1, end: s }, targetPointType).should.be.false()
              })
              it(`returns ${expectedLabel} for [${inspect(s)}, ${inspect(p2)}[ for point type ${inspect(
                targetPointType
              )}`, function () {
                isInterval({ start: s, end: p2 }, targetPointType).should.be.false()
              })
            })
          })
        })
      })
    })
  })
})
