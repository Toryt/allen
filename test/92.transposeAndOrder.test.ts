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

import should from 'should'
import { Interval } from '../src/Interval'
import { ltCompare } from '../src/ltCompare'
import { compareIntervals } from '../src/compareIntervals'
import { transposeAndOrder } from '../src/transposeAndOrder'

describe('transposeAndOrder', function () {
  it('works with an empty object', function () {
    should(transposeAndOrder({})).deepEqual([])
  })
  it('returns an array for 1 property, sorted', function () {
    const aProperty = [{ start: 32, end: 334 }, { start: 22, end: 23 }, { start: -1 }]
    const result = transposeAndOrder({ aProperty })
    result.should.be.an.Array()
    result.length.should.equal(aProperty.length)
    const orderedAProperty = aProperty.slice().sort(compareIntervals)
    result.forEach((e, i) => {
      e.reference.should.equal('aProperty')
      e.interval.should.equal(orderedAProperty[i])
    })
  })
  it('returns an array for 1 property, sorted, with a comparator', function () {
    const aProperty = [{ start: 32, end: 334 }, { start: 22, end: 23 }, { start: -1 }]
    const result = transposeAndOrder({ aProperty }, ltCompare)
    result.should.be.an.Array()
    result.length.should.equal(aProperty.length)
    const orderedAProperty = aProperty.slice().sort(compareIntervals)
    result.forEach((e, i) => {
      e.reference.should.equal('aProperty')
      e.interval.should.equal(orderedAProperty[i])
    })
  })
  it('returns the expected result with 3 properties', function () {
    const property1: ReadonlyArray<Interval<number>> = [{ start: 32, end: 334 }, { start: 22, end: 23 }, { start: -1 }]
    const property2: ReadonlyArray<Interval<number>> = [{ start: 32 }, { start: 24, end: 26 }]
    const property3: ReadonlyArray<Interval<number>> = [{ end: 32 }, { start: 122, end: 144 }]
    const result = transposeAndOrder({ property1, property2, property3 }, ltCompare)
    result.should.be.an.Array()
    result.length.should.equal(property1.length + property2.length + property3.length)
    const ordered: ReadonlyArray<Interval<number>> = property1
      .concat(property2)
      .concat(property3)
      .sort(compareIntervals)
    result.forEach((e, i) => {
      const expectedReference =
        /* prettier-ignore */ property1.includes(e.interval)
          ? 'property1'
          : property2.includes(e.interval)
            ? 'property2'
            : property3.includes(e.interval)
              ? 'property3'
              : 'error'
      e.reference.should.equal(expectedReference)
      e.interval.should.equal(ordered[i])
    })
  })
})
