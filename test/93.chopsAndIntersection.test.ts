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
import { Interval, isInterval } from '../src/Interval'
import { intervalToString } from './_intervalToString'
import { AllenRelation } from '../src/AllenRelation'
import { chops, intersection, LabeledInterval } from '../src/chopsAndIntersection'
import { Comparator } from '../src/Comparator'
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'
import should from 'should'
import { TypeRepresentation } from '../src'
import { ok } from 'assert'
import { inspect } from 'util'

const label1 = 'first label'
const label2 = 'second label'

const nonBasicWithIntersection = [
  AllenRelation.ENDS_IN,
  AllenRelation.CONTAINS_START,
  AllenRelation.START_TOGETHER,
  AllenRelation.END_TOGETHER,
  AllenRelation.STARTS_IN,
  AllenRelation.CONTAINS_END
]

function hasExpectedReferenceIntervals<T> (
  i: Readonly<Interval<T>>,
  i1: Readonly<Interval<T>>,
  i2: Readonly<Interval<T>>
): void {
  ok(i.referenceIntervals)
  i.referenceIntervals[label1].length.should.equal(1)
  i.referenceIntervals[label1][0].should.equal(i1)
  i.referenceIntervals[label2].length.should.equal(1)
  i.referenceIntervals[label2][0].should.equal(i2)
}

function areSameIntervals<T> (
  one: Readonly<Interval<T>> | undefined | false,
  other: Readonly<Interval<T>> | undefined | false,
  i1: Readonly<Interval<T>>,
  i2: Readonly<Interval<T>>,
  pointType: TypeRepresentation,
  compareFn?: Comparator<T>
): void {
  if (one === false) {
    should(other).be.false()
  } else if (one === undefined) {
    should(other).be.undefined()
  } else {
    isInterval(one, pointType, compareFn).should.be.true()
    isInterval(other, pointType, compareFn).should.be.true()
    ok(other)
    AllenRelation.relation(one, other, compareFn).should.equal(AllenRelation.EQUALS)
    hasExpectedReferenceIntervals(one, i1, i2)
    hasExpectedReferenceIntervals(other, i1, i2)
    should(one.referenceIntervals).deepEqual(other.referenceIntervals)
  }
}
describe('choppedAndIntersection', function () {
  describe('intersection', function () {
    function generateTests<T> (
      label: string,
      pointType: TypeRepresentation,
      points: T[],
      compareFn?: Comparator<T>
    ): void {
      const cases = createIntervalCoupleCases<T>(points)

      function callIt (
        i1: Readonly<Interval<T>>,
        i2: Readonly<Interval<T>>
      ): Readonly<Interval<T>> | undefined | false {
        const li1: LabeledInterval<T> = { label: label1, interval: i1 }
        const li2: LabeledInterval<T> = { label: label2, interval: i2 }
        return compareFn !== undefined && compareFn !== null
          ? /* prettier-ignore */ intersection(li1, li2, compareFn)
          : intersection(li1, li2)
      }

      describe(label, function () {
        cases.forEach(({ i1, i2 }: NonDegenerateTestIntervals<T>) => {
          it(`returns the intersection for ${intervalToString(i1)}, ${intervalToString(
            i2
          )} and fullfils the definition`, function () {
            const calculatedRelation: AllenRelation = AllenRelation.relation(i1, i2, compareFn)
            const result: Readonly<Interval<T>> | undefined | false = callIt(i1, i2)
            console.log(inspect(result, { depth: 5 }))
            const symmetric: Readonly<Interval<T>> | undefined | false = callIt(i2, i1)
            areSameIntervals(result, symmetric, i1, i2, pointType, compareFn)
            if (!calculatedRelation.isBasic() && !nonBasicWithIntersection.includes(calculatedRelation)) {
              should(result).equal(false)
            } else if (calculatedRelation.implies(AllenRelation.DOES_NOT_CONCUR_WITH)) {
              should(result).be.undefined()
            } else {
              should(result).be.an.Object()
            }
            if (result === false) {
              calculatedRelation.isBasic().should.be.false()
              nonBasicWithIntersection.should.not.containEql(calculatedRelation)
            } else if (result === undefined) {
              calculatedRelation.isBasic().should.be.true()
              calculatedRelation.implies(AllenRelation.DOES_NOT_CONCUR_WITH).should.be.true()
            } else {
              should(result).be.an.Object()
            }
          })
        })
      })
    }

    generateTests<number>('number', 'number', sixNumbers)
    generateTests<string>('string', 'string', sixStrings)
    generateTests<Date>('Date', Date, sixDates)
    generateTests<symbol>(
      'symbol',
      'symbol',
      generateSixSymbols('comparareIntervals'),
      (s1: Symbol, s2: Symbol): number => (s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0)
    )
  })
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
              calculatedRelation.isBasic().should.be.false()
            } else {
              result.should.be.an.Array()
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
})
