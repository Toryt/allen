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

const should = require('should')
const {
  primitiveTypeRepresentations,
  isTypeRepresentation,
  commonTypeRepresentation,
  isLTComparableOrIndefinite,
  ltCompare,
  isInterval,
  AllenRelation,
  PointIntervalRelation,
  isEnclosing,
  isMinimalEnclosing,
  minimalEnclosing,
  isSequence,
  compareIntervals,
  isChainInterval
} = require('../src')

describe('index JS', function () {
  describe('exports', function () {
    it('exports primitiveTypeRepresentations', function () {
      primitiveTypeRepresentations.should.be.an.Array()
    })
    it('exports isTypeRepresentation', function () {
      isTypeRepresentation('number').should.be.true()
    })
    it('exports commonTypeRepresentation', function () {
      should(commonTypeRepresentation(4, true)).be.false()
    })
    it('exports isLTComparableOrIndefinite', function () {
      isLTComparableOrIndefinite(NaN).should.be.false()
    })
    it('exports ltCompare', function () {
      ltCompare.should.be.a.Function()
    })
    it('exports isInterval', function () {
      isInterval({ start: 4 }, 'string').should.be.false()
    })
    it('exports AllenRelation', function () {
      const x = AllenRelation.PRECEDED_BY
      x.should.be.an.instanceof(AllenRelation)
    })
    it('exports PointIntervalRelation', function () {
      const x = PointIntervalRelation.IN
      x.should.be.an.instanceof(PointIntervalRelation)
    })
    it('exports isEnclosing', function () {
      isEnclosing.should.be.a.Function()
    })
    it('exports minimalEnclosing', function () {
      isMinimalEnclosing.should.be.a.Function()
    })
    it('exports compareIntervals', function () {
      compareIntervals.should.be.a.Function()
    })
    it('exports minimalEnclosing', function () {
      minimalEnclosing.should.be.a.Function()
    })
    it('exports isSequence', function () {
      isSequence.should.be.a.Function()
    })
    it('exports isChainInterval', function () {
      isChainInterval.should.be.a.Function()
    })
  })
  describe('examples', function () {
    it('ts README Allen compiles and works', function () {
      function allenRelationExample () {
        const iiCondition1 = AllenRelation.fromString('psSd')
        const iiCondition2 = AllenRelation.fromString('sde')
        const iiCondition = iiCondition1.compose(iiCondition2)

        const i1 = { start: '2022-11-04', end: '2023-04-12' }
        const i2 = { start: '2021-08-22' }

        const iiActual = AllenRelation.relation(i1, i2)
        if (!iiActual.implies(iiCondition)) {
          throw new Error(`i1 and i2 do no uphold ${iiCondition.toString()}`)
        }

        return iiActual
      }

      allenRelationExample.should.throw('i1 and i2 do no uphold (pmoseSdfO)')
    })
    it('ts README point-interval compiles and works', function () {
      function pointIntervalExample () {
        const piCondition1 = PointIntervalRelation.or(PointIntervalRelation.BEFORE, PointIntervalRelation.TERMINATES)
        const iiCondition2 = AllenRelation.fromString('sde')
        const piCondition = piCondition1.compose(iiCondition2)

        const p = '2021-08-15'
        const i = { start: '2021-08-22' }

        const piActual = PointIntervalRelation.relation(p, i)
        if (!piActual.implies(piCondition)) {
          throw new Error(`p and i2 do not uphold ${piCondition.toString()}`)
        }

        return piActual
      }

      pointIntervalExample().should.equal(PointIntervalRelation.BEFORE)
    })
  })
})
