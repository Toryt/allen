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

import 'should'
import { typeRepresentations } from './_typeRepresentationCases'
import { inspect } from 'util'
import { stuffWithUndefined } from './_stuff'
import { isChainInterval } from '../src/ChainInterval'
import { A, B, C } from './_someClasses'
import { TypeFor, TypeRepresentation } from '../src'

const notAnIntervalCandidate = stuffWithUndefined.filter(s => typeof s !== 'object' && typeof s !== 'function')

interface StartCase<TR extends TypeRepresentation> {
  start: TypeFor<TR>
  okFor: TR[]
}

const startCases: ReadonlyArray<StartCase<any>> = [
  { start: 3, okFor: ['number'] },
  { start: 389579784n, okFor: ['bigint'] },
  { start: 'a string', okFor: ['string'] },
  { start: false, okFor: ['boolean'] },
  { start: Symbol('start case'), okFor: ['symbol'] },
  { start: { x: 'a start object' }, okFor: [Object] },
  { start: new Date(2022, 10, 27, 15, 21, 8, 344), okFor: [Date, Object] },
  { start: new A(4), okFor: [A, Object] },
  { start: new B(), okFor: [B, A, Object] },

  { start: new C(), okFor: [C, Object] },
  {
    start: function functionAsStart () {
      return 5
    },
    okFor: [Function, Object]
  }
]

describe('ChainInterval', function () {
  describe('isChainInterval', function () {
    typeRepresentations.forEach(ptr => {
      describe(inspect(ptr), function () {
        describe('not an object', function () {
          notAnIntervalCandidate.forEach(s => {
            it(`returns false for ${inspect(s)}`, function () {
              isChainInterval(s, ptr).should.be.false()
            })
          })
          it('returns false when there is an `end` property', function () {
            isChainInterval({ start: 4, end: 5 }, ptr).should.be.false()
          })
        })
        describe('possible start', function () {
          startCases.forEach(({ start, okFor }: StartCase<any>) => {
            if (okFor.includes(ptr)) {
              it(`start can be ${inspect(start)}`, function () {
                isChainInterval({ start }, ptr).should.be.true()
              })
              it('end is forbidden', function () {
                isChainInterval({ start, end: 'whatever' }, ptr).should.be.false()
              })
            } else {
              it(`start cannot be ${inspect(start)}`, function () {
                isChainInterval({ start }, ptr).should.be.false()
              })
            }
          })
          it('start is mandatory', function () {
            isChainInterval({ y: 'som property' }, ptr).should.be.false()
          })
        })
      })
    })
  })
})
