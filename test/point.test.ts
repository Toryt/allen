/* eslint-env mocha */

import should from 'should'
import { pointTypeOf, primitivePointTypes } from '../src/point'
import { inspect } from 'util'
import { DefinitePoint, isDefinitePoint } from '../lib2/point'

const notAPointCases = [NaN, Symbol('not a point')]
const dontKnowCases = [undefined, null]
const primitiveCases = [
  Number.NEGATIVE_INFINITY,
  Number.MIN_VALUE,
  Number.MIN_SAFE_INTEGER,
  -34,
  0,
  Number.EPSILON,
  1,
  Math.LN2,
  Math.PI,
  45,
  Number.MAX_SAFE_INTEGER,
  Number.MAX_VALUE,
  Number.POSITIVE_INFINITY,
  -895672890643709647309687348967934n,
  -34n,
  -1n,
  0n,
  1n,
  89679867134989671398678136983476983476982679234n,
  'a string',
  '   an untrimmed string    ',
  '',
  true,
  false,
  function () {
    return true
  },
  (a: string) => a + '!',
  Number(4),
  BigInt(4),
  String('a wrapped string'),
  Boolean(false),
  Number,
  BigInt,
  String,
  Boolean,
  Array,
  Date,
  Object
]
const objectCases = [new Date(89673548), {}, { a: 'an object' }, [], [1, 2], [1, {}], Math, JSON]

describe('point', function () {
  describe('primitivePointTypes', function () {
    it('is an array of strings', function () {
      primitivePointTypes.should.be.an.Array()
      primitivePointTypes.forEach(ppt => {
        ppt.should.be.a.String()
      })
    })

    const notPrimitivePointTypes = ['object', 'symbol', 'undefined']
    const ppts: string[] = primitivePointTypes.slice()
    notPrimitivePointTypes.forEach(nppt => {
      it(`${nppt} is not a primitive point type`, function () {
        ppts.includes(nppt).should.be.false()
      })
    })
  })
  describe('pointTypeOf', function () {
    describe('false result', function () {
      notAPointCases.forEach(c => {
        it(`returns false for ${inspect(c)}`, function () {
          should(pointTypeOf(c)).be.false()
        })
      })
    })
    describe("don't know 🤷", function () {
      dontKnowCases.forEach(c => {
        it(`returns undefined for ${inspect(c)}`, function () {
          should(pointTypeOf(c)).be.undefined()
        })
      })
    })
  })
  describe('primitive and wrapper types', function () {
    primitiveCases.forEach(c => {
      it(`returns ${typeof c} for ${inspect(c)}`, function () {
        should(pointTypeOf(c)).equal(typeof c)
      })
    })
  })
  describe('objects', function () {
    objectCases.forEach(c => {
      it(`returns the constructor for ${inspect(c)}`, function () {
        should(pointTypeOf(c)).equal(c.constructor)
      })
    })
  })
  describe('isDefinitePoint', function () {
    describe('without point type', function () {
      notAPointCases.forEach(c => {
        it(`returns false for ${inspect(c)}, because it is not a point`, function () {
          isDefinitePoint(c).should.be.false()
          // MUDO typescript should forbid this assignment, since `c` can be `symbol`, which is not a `DefinitePoint`
          //      It cannot help us with NaN, but it should with `symbol`
          const typed: DefinitePoint = c
          console.log(typed)
        })
      })
      dontKnowCases.forEach(c => {
        it(`returns false for ${c}, because it is indefinite`, function () {
          isDefinitePoint(c).should.be.false()
          // typescript forbids this assignment, since `c` is `undefined | null`, which is not a `DefinitePoint`
          // @ts-ignore
          const typed: DefinitePoint = c
          console.log(typed)
        })
      })
      primitiveCases.forEach(c => {
        it(`returns true for primitive or wrapped value ${c}`, function () {
          isDefinitePoint(c).should.be.true()
          // typescript allows this assignment, since `c` is of a type that is a `DefinitePoint`
          const typed: DefinitePoint = c
          console.log(typed)
        })
      })
      objectCases.forEach(c => {
        it(`returns true for object ${inspect(c)}`, function () {
          isDefinitePoint(c).should.be.true()
          // typescript allows this assignment, since `c` is an object, which is a `DefinitePoint`
          const typed: DefinitePoint = c
          console.log(typed)
        })
      })
    })
    describe('with point type', function () {})
  })
})
