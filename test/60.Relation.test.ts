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

import 'should'
import { Relation } from '../src/Relation'
import { generateRelationTests } from './_generateRelationTests'
import { E } from './_E'

function isEAsExpected (e: E, isBasic?: boolean, noRecursion?: boolean): void {
  e.should.be.an.instanceof(E)
  e.should.be.an.instanceof(Relation)
  if (isBasic === true) {
    e.isBasic().should.be.true()
    e.ordinal().should.be.a.Number()
  }
  e.uncertainty().should.be.a.Number()
  e.extraMethod().should.equal(4)
  if (noRecursion === undefined || !noRecursion) {
    const complement: E = e.complement()
    isEAsExpected(complement, false, true)
    const thisType: E = e.noParamReturnsThisType()
    isEAsExpected(thisType, false, true)
    const eType: E = e.noParamReturnsE()
    isEAsExpected(eType, false, true)
    const other: E = E.generalRelation(3)
    const thisParamThisType: E = e.thisParamReturnsThisType(other)
    isEAsExpected(thisParamThisType, false, true)
    const thisParamE: E = e.thisParamReturnsE(other)
    isEAsExpected(thisParamE, false, true)
  }
}

describe('Relation', function () {
  generateRelationTests<E>(
    'E',
    E,
    [
      { name: 'X', representation: 'x' },
      { name: 'Y', representation: 'y' },
      { name: 'Z', representation: 'z' }
    ],
    [],
    true
  )
  describe('usage', function () {
    it('has basic representations', function () {
      E.BASIC_REPRESENTATIONS.forEach((brr: string) => {
        brr.should.be.a.String()
      })
    })
    it('has typed basic relations', function () {
      const basicRelations: readonly E[] = E.BASIC_RELATIONS
      const br: E = basicRelations[0]
      isEAsExpected(br, true)
    })
    // it('has typed relations', function () {
    //   const relations: readonly E[] = E.RELATIONS
    //   const br: E = relations[1]
    //   isEAsExpected(br)
    // })
    it('has a typed EMPTY', function () {
      const EMPTY: E = E.emptyRelation<E>()
      isEAsExpected(EMPTY)
    })
    it('has a typed FULL', function () {
      const FULL: E = E.fullRelation<E>()
      isEAsExpected(FULL)
    })
    it('supports implied by', function () {
      const one: E = E.generalRelation(3)
      const other = E.generalRelation(5)
      one.impliedBy(other).should.be.a.Boolean()
    })
    it('supports implies', function () {
      const one: E = E.generalRelation(3)
      const other = E.generalRelation(5)
      one.implies(other).should.be.a.Boolean()
    })
    it('supports min', function () {
      const one: E = E.generalRelation(3)
      const other = E.generalRelation(5)
      const third = E.generalRelation(7)
      const result1 = one.min(other)
      result1.should.be.instanceof(E)
      const result2 = third.min(result1)
      result2.should.be.instanceof(E)
      const result3: E = result1.min(third)
      result3.should.be.instanceof(E)
    })
    it('supports or', function () {
      const one: E = E.generalRelation(3)
      const other = E.generalRelation(5)
      const third = E.generalRelation(7)
      const result1 = E.or(one, other)
      result1.should.be.instanceof(E)
      const result2: E = E.or(result1, third)
      result2.should.be.instanceof(E)
    })
    it('or without arguments can be called without actual value for generic parameter', function () {
      const result1: E = E.or()
      result1.should.be.equal(E.emptyRelation<E>())
    })
    it('supports and', function () {
      const one: E = E.generalRelation(3)
      const other = E.generalRelation(5)
      const third = E.generalRelation(7)
      const result1: E = E.and(one, other)
      result1.should.be.instanceof(E)
      const result2: E = E.and(third, result1)
      result2.should.be.instanceof(E)
    })
    it('and without arguments can be called without actual value for generic parameter', function () {
      const result1: E = E.and()
      result1.should.be.equal(E.fullRelation<E>())
    })
    it('supports fromString', function () {
      const result: E = E.fromString<E>('xy')
      result.should.be.instanceof(E)
    })
    it('supports typed fromString', function () {
      const result: E = E.e('xy')
      result.should.be.instanceof(E)
    })
  })
})
