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

import { createIntervalCoupleCases, NonDegenerateTestIntervals } from './_createIntervalCoupleCases'
import { Interval } from '../src/Interval'
import { intervalToString } from './_intervalToString'
import { AllenRelation } from '../src/AllenRelation'
import { chops, LabeledInterval } from '../src/chopsAndIntersection'
import { Comparator } from '../src/Comparator'
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'
import should from 'should'

const label1 = 'first label'
const label2 = 'second label'

// const nonBasicWithIntersection = [
//   AllenRelation.ENDS_IN,
//   AllenRelation.CONTAINS_START,
//   AllenRelation.START_TOGETHER,
//   AllenRelation.END_TOGETHER,
//   AllenRelation.STARTS_IN,
//   AllenRelation.CONTAINS_END
// ]

describe('choppedAndIntersection', function () {
  describe('chops', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: Comparator<T>): void {
      const cases = createIntervalCoupleCases<T>(points)

      function callIt (
        i1: Readonly<Interval<T>>,
        i2: Readonly<Interval<T>>
      ): ReadonlyArray<Readonly<Interval<T>>> | false {
        const li1: LabeledInterval<T> = { label: label1, interval: i1 }
        const li2: LabeledInterval<T> = { label: label2, interval: i2 }
        return compareFn !== undefined && compareFn !== null
          ? /* prettier-ignore */ chops(li1, li2, compareFn)
          : chops(li1, li2)
      }

      describe(label, function () {
        cases.forEach(({ i1, i2 }: NonDegenerateTestIntervals<T>) => {
          it(`returns chops for ${intervalToString(i1)}, ${intervalToString(
            i2
          )} and fullfils the definition`, function () {
            const calculatedRelation: AllenRelation = AllenRelation.relation(i1, i2, compareFn)
            const result: ReadonlyArray<Readonly<Interval<T>>> | false = callIt(i1, i2)
            if (!calculatedRelation.isBasic()) {
              should(result).equal(false)
            }
            if (result === false) {
              should(calculatedRelation.isBasic()).be.false()
              // MUDO ONLY FOR INTERSECTION nonBasicWithIntersection.should.not.containEql(result)
            } else {
              should(result).be.an.Array()
            }
          })
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
  // describe('intersection')
})
