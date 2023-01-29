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

import should from 'should'
import {
  AllenRelation,
  type Chain,
  type ChainInterval,
  chainToGaplessLeftDefiniteSequence,
  commonTypeRepresentation,
  type Comparator,
  compareIntervals,
  type Constructor,
  type Indefinite,
  type Interval,
  isChain,
  isChainInterval,
  isEnclosing,
  isInterval,
  isLTComparableOrIndefinite,
  isMinimalEnclosing,
  isReferenceIntervals,
  isSequence,
  isTypeRepresentation,
  ltCompare,
  minimalEnclosing,
  PointIntervalRelation,
  primitiveTypeRepresentations,
  type ReferenceIntervals,
  Relation,
  type RelationConstructor,
  type SequenceOptions,
  type TypeFor,
  type TypeRepresentation
} from '../src'
import assert from 'assert'
import { basicRelationBitPatterns, relationBitPatterns } from '../src/bitPattern'

describe('index TS', function () {
  describe('exports', function () {
    it('exports primitiveTypeRepresentations', function () {
      primitiveTypeRepresentations.should.be.an.Array()
    })
    it('exports Constructor', function () {
      class A {
        n: number
        constructor (n: number) {
          this.n = n
        }
      }
      const x: Constructor<A> = A
      x.should.be.a.Function()
    })
    it('exports TypeRepresentation', function () {
      const x: TypeRepresentation = 'number'
      x.should.be.a.String()
    })
    it('exports isTypeRepresentation', function () {
      isTypeRepresentation('number').should.be.true()
    })
    it('exports commonTypeRepresentation', function () {
      should(commonTypeRepresentation(4, true)).be.false()
    })
    it('exports TypeFor', function () {
      const x: TypeFor<'number'> = 42
      x.should.be.a.Number()
    })
    it('exports Indefinite', function () {
      const x: Indefinite<number> = undefined
      should(x).be.undefined()
    })
    it('exports Comparator', function () {
      const x: Comparator<number> = function (n1: number, n2: number): number {
        return n1 + n2
      }
      x.should.be.a.Function()
    })
    it('exports isLTComparableOrIndefinite', function () {
      isLTComparableOrIndefinite(NaN).should.be.false()
    })
    it('exports ltCompare', function () {
      ltCompare.should.be.a.Function()
    })
    it('exports ReferenceIntervals', function () {
      const x: ReferenceIntervals<string> = { aReference: [{ start: 'the start' }] }
      x.should.be.an.Object()
    })
    it('exports isReferenceIntervals', function () {
      isReferenceIntervals<'string'>({ aProperty: [{ start: 'a' }] }, 'string').should.be.true()
    })
    it('exports Interval', function () {
      const x: Interval<string> = { start: 'the start' }
      x.should.be.an.Object()
    })
    it('exports isInterval', function () {
      isInterval<'string'>({ start: 4 }, 'string').should.be.false()
    })
    it('exports RelationConstructor', function () {
      function x (x: RelationConstructor<Relation>): string {
        return x.emptyRelation().toString()
      }
      x.should.be.a.Function()
    })
    it('exports Relation', function () {
      class RR extends Relation {
        public static readonly NR_OF_BITS = 1
        public static readonly BASIC_REPRESENTATIONS = Object.freeze(['r'] as const)

        public static readonly RELATIONS: readonly RR[] = Object.freeze(
          relationBitPatterns(this.NR_OF_BITS).map(bitPattern => new RR(bitPattern))
        )

        public static readonly R: RR = RR.RELATIONS[1]

        public static readonly BASIC_RELATIONS: readonly RR[] = Object.freeze(
          basicRelationBitPatterns(this.NR_OF_BITS).map(bitPattern => RR.RELATIONS[bitPattern])
        )
      }

      function x (x: RR): string {
        return x.toString()
      }
      x.should.be.a.Function()
    })
    it('exports AllenRelation', function () {
      const x: AllenRelation = AllenRelation.PRECEDED_BY
      x.should.be.an.instanceof(AllenRelation)
    })
    it('exports PointIntervalRelation', function () {
      const x: PointIntervalRelation = PointIntervalRelation.IN
      x.should.be.an.instanceof(PointIntervalRelation)
    })
    it('exports isEnclosing', function () {
      isEnclosing.should.be.a.Function()
    })
    it('exports minimalEnclosing', function () {
      isMinimalEnclosing.should.be.a.Function()
    })
    it('exports minimalEnclosing', function () {
      minimalEnclosing.should.be.a.Function()
    })
    it('exports compareIntervals', function () {
      compareIntervals.should.be.a.Function()
    })
    it('exports SequenceOptions', function () {
      const x: SequenceOptions<number> = {}
      x.should.be.an.Object()
    })
    it('exports isSequence', function () {
      isSequence.should.be.a.Function()
    })
    it('exports ChainInterval', function () {
      const x: ChainInterval<number> = { start: 8 }
      x.should.be.an.Object()
    })
    it('exports isChainInterval', function () {
      isChainInterval.should.be.a.Function()
    })
    it('exports Chain', function () {
      const x: ReadonlyArray<ChainInterval<number>> = [{ start: 8 }]
      assert(isChain(x, 'number'))
      const chain: Chain<number> = x
      chain.should.be.an.Array()
    })
    it('exports isChain', function () {
      isChain.should.be.a.Function()
    })
    it('exports chainToGaplessLeftDefiniteSequence', function () {
      chainToGaplessLeftDefiniteSequence.should.be.a.Function()
    })
  })
  describe('examples', function () {
    it('ts README Allen compiles and works', function () {
      function allenRelationExample (): AllenRelation {
        const iiCondition1: AllenRelation = AllenRelation.fromString<AllenRelation>('psSd')
        const iiCondition2: AllenRelation = AllenRelation.fromString<AllenRelation>('sde')
        const iiCondition: AllenRelation = iiCondition1.compose(iiCondition2)

        const i1: Interval<string> = { start: '2022-11-04', end: '2023-04-12' }
        const i2: Interval<string> = { start: '2021-08-22' }

        const iiActual: AllenRelation = AllenRelation.relation(i1, i2)
        if (!iiActual.implies(iiCondition)) {
          throw new Error(`i1 and i2 do no uphold ${iiCondition.toString()}`)
        }

        return iiActual
      }

      allenRelationExample.should.throw('i1 and i2 do no uphold (pmoseSdfO)')
    })
    it('ts README point-interval compiles and works', function () {
      function pointIntervalExample (): PointIntervalRelation {
        const piCondition1: PointIntervalRelation = PointIntervalRelation.or(
          PointIntervalRelation.BEFORE,
          PointIntervalRelation.TERMINATES
        )
        const iiCondition2: AllenRelation = AllenRelation.fromString<AllenRelation>('sde')
        const piCondition: PointIntervalRelation = piCondition1.compose(iiCondition2)

        const p: string = '2021-08-15'
        const i: Interval<string> = { start: '2021-08-22' }

        const piActual: PointIntervalRelation = PointIntervalRelation.relation(p, i)
        if (!piActual.implies(piCondition)) {
          throw new Error(`p and i2 do not uphold ${piCondition.toString()}`)
        }

        return piActual
      }

      pointIntervalExample().should.equal(PointIntervalRelation.BEFORE)
    })
  })
})
