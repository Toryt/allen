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
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'
import { compareIntervals } from '../src/compareIntervals'
import { AllenRelation } from '../src/AllenRelation'
import { createIntervalCoupleCases, NonDegenerateTestIntervals } from './_createIntervalCoupleCases'
import { intervalToString } from './_intervalToString'

describe('compareIntervals', function () {
  function generateTests<T> (label: string, points: T[], compareFn?: (a1: T, a2: T) => number): void {
    const crossReference26 = new Map<AllenRelation, number[]>()
    crossReference26.set(AllenRelation.PRECEDES, [-1])
    crossReference26.set(AllenRelation.MEETS, [-1])
    crossReference26.set(AllenRelation.OVERLAPS, [-1])
    crossReference26.set(AllenRelation.FINISHED_BY, [-1])
    crossReference26.set(AllenRelation.CONTAINS, [-1])
    crossReference26.set(AllenRelation.STARTS, [-1])
    crossReference26.set(AllenRelation.STARTS_EARLIER, [-1])
    crossReference26.set(AllenRelation.ENDS_IN, [-1])
    crossReference26.set(AllenRelation.CONTAINS_START, [-1])
    crossReference26.set(AllenRelation.fromString<AllenRelation>('oFDseSdfOMP'), [-1])
    crossReference26.set(AllenRelation.EQUALS, [0])
    crossReference26.set(AllenRelation.fromString<AllenRelation>('pmoFDseSdfO'), [+1])
    crossReference26.set(AllenRelation.CONTAINS_END, [+1])
    crossReference26.set(AllenRelation.STARTS_IN, [+1])
    crossReference26.set(AllenRelation.STARTS_LATER, [+1])
    crossReference26.set(AllenRelation.STARTED_BY, [+1])
    crossReference26.set(AllenRelation.DURING, [+1])
    crossReference26.set(AllenRelation.FINISHES, [+1])
    crossReference26.set(AllenRelation.OVERLAPPED_BY, [+1])
    crossReference26.set(AllenRelation.MET_BY, [+1])
    crossReference26.set(AllenRelation.PRECEDED_BY, [+1])
    crossReference26.set(AllenRelation.ENDS_EARLIER, [-1, +1])
    crossReference26.set(AllenRelation.ENDS_LATER, [-1, +1])
    crossReference26.set(AllenRelation.START_TOGETHER, [-1, 0, +1])
    crossReference26.set(AllenRelation.END_TOGETHER, [-1, 0, +1])
    crossReference26.set(AllenRelation.fullRelation<AllenRelation>(), [-1, 0, +1])

    const cases = createIntervalCoupleCases<T>(points)

    function callIt (i1: Readonly<Interval<T>>, i2: Readonly<Interval<T>>): number {
      return compareFn !== undefined && compareFn !== null
        ? /* prettier-ignore */ compareIntervals(i1, i2, compareFn)
        : compareIntervals(i1, i2)
    }

    describe(label, function () {
      cases.forEach(({ i1, i2, relation, comparison }: NonDegenerateTestIntervals<T>) => {
        it(`returns ${comparison} for ${intervalToString(i1)}, ${intervalToString(
          i2
        )} and fullfils the definition`, function () {
          const result = callIt(i1, i2)
          const calculatedRelation = AllenRelation.relation(i1, i2, compareFn)
          calculatedRelation.should.equal(relation)
          result.should.equal(comparison)
          should(crossReference26.get(calculatedRelation)).containEql(result)
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
