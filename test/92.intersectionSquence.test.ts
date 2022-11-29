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
import { Interval } from '../src/Interval'
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'
import { Comparator } from '../src'
import { interSectionSequence, SourceIntervals } from '../src/interSectionSequence'

describe('interSectionSequence', function () {
  function generateTests<T> (label: string, points: T[], compareFn?: Comparator<T>): void {
    function callIt (sources: SourceIntervals<T>): Array<Interval<T>> {
      return compareFn !== undefined && compareFn !== null
        ? /* prettier-ignore */ interSectionSequence(sources, compareFn)
        : interSectionSequence(sources)
    }
    describe(label, function () {
      it('returns the empty sequence without sources', function () {
        const result = callIt({})
        result.should.be.an.Array()
        result.length.should.equal(0)
      })
      it('returns the sequence with 1 singleton source', function () {
        const aSource = [{ start: points[0], end: points[1] }]
        const result = callIt({ aSource })
        result.should.be.an.Array()
        result.length.should.equal(1)
        // MUDO more tests
      })
    })
  }

  generateTests<number>('number', sixNumbers)
  generateTests<string>('string', sixStrings)
  generateTests<Date>('Date', sixDates)
  generateTests<symbol>('symbol', generateSixSymbols('interSectionSequence'), (s1: Symbol, s2: Symbol): number =>
    s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0
  )
})
