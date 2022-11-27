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

const notAnIntervalCandidate = stuffWithUndefined.filter(s => typeof s !== 'object' && typeof s !== 'function')

describe('ChainInterval', function () {
  describe('isChainInterval', function () {
    describe('not an object', function () {
      typeRepresentations.forEach(ptr => {
        describe(inspect(ptr), function () {
          notAnIntervalCandidate.forEach(s => {
            it(`returns false for ${inspect(s)}`, function () {
              isChainInterval(s, ptr).should.be.false()
            })
          })
        })
      })
    })
  })
})
