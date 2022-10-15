/* eslint-env mocha */

import should from 'should'
import { pointTypeOf, primitivePointTypes } from '../src/point'
import { inspect } from 'util'

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
      const falseCases = [NaN, Symbol('not a point')]
      falseCases.forEach(c => {
        it(`returns false for ${inspect(c)}`, function () {
          should(pointTypeOf(c)).be.false()
        })
      })
    })
    describe("don't know 🤷", function () {
      const dontKnowCases = [undefined, null]
      dontKnowCases.forEach(c => {
        it(`returns undefined for ${inspect(c)}`, function () {
          should(pointTypeOf(c)).be.undefined()
        })
      })
    })
  })
  describe('primitive an wrapper types', function () {
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
    primitiveCases.forEach(c => {
      it(`returns ${typeof c} for ${inspect(c)}`, function () {
        should(pointTypeOf(c)).equal(typeof c)
      })
    })
  })
  describe('objects', function () {
    const objectCases = [new Date(89673548), {}, { a: 'an object' }, [], [1, 2], [1, {}], Math, JSON]
    objectCases.forEach(c => {
      it(`returns the constructor for ${inspect(c)}`, function () {
        should(pointTypeOf(c)).equal(c.constructor)
      })
    })
  })
})
