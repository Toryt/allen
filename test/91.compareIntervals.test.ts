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
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'
import { Interval } from '../src'
import { compareIntervals } from '../src/Interval'

/* NOTE: Separated from Interval test, because in the test we use a dependency on AllenRealtion for the definition, and
         we only want to run these after also AllenRelation is tested, and before we run the tests regarding sequence,
         where we use this code. */

describe('interval (2)', function () {
  describe('compareIntervals', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: (a1: T, a2: T) => number): void {
      function callIt (i1: Interval<T>, i2: Interval<T>): number {
        return compareFn !== undefined && compareFn !== null
          ? /* prettier-ignore */ compareIntervals(i1, i2, compareFn)
          : compareIntervals(i1, i2)
      }
      describe(label, function () {
        it('returns -1 and fullfils the definition', function () {
          callIt({ start: points[0], end: points[1] }, { start: points[1], end: points[2] }).should.equal(-1)
        })
      })
    }

    generateTests<number>('number', sixNumbers)
    generateTests<string>('string', sixStrings)
    generateTests<Date>('Date', sixDates)
    generateTests<symbol>('symbol', generateSixSymbols('comparareIntervals'), (s1: Symbol, s2: Symbol): number =>
      s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0
    )
  })
})
