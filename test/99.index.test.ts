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
  commonTypeRepresentation,
  Comparator,
  Constructor,
  Indefinite,
  Interval,
  isInterval,
  isLTComparableOrIndefinite,
  isTypeRepresentation,
  LTComparable,
  LTComparablePrimitive,
  ltCompare,
  PointIntervalRelation,
  primitiveTypeRepresentations,
  Relation,
  RelationConstructor,
  TypeFor,
  TypeRepresentation
} from '../src'

describe('index', function () {
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
  it('exports LTComparablePrimitive', function () {
    const x: LTComparablePrimitive = true
    x.should.be.a.Boolean()
  })
  it('exports LTComparable', function () {
    const x: LTComparable = 4
    x.should.be.a.Number()
  })
  it('exports isLTComparableOrIndefinite', function () {
    isLTComparableOrIndefinite(NaN).should.be.false()
  })
  it('exports ltCompare', function () {
    ltCompare.should.be.a.Function()
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
    function x (x: Relation): string {
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
})
