/* eslint-env mocha */

import 'should'
import { primitivePointTypes } from '../src/point'

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
})
