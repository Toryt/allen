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
import { Interval, isInterval, ReferencedInterval } from '../src/Interval'
import { intervalToString } from './_intervalToString'
import { AllenRelation } from '../src/AllenRelation'
import { chops, intersection } from '../src/chopsAndIntersection'
import { Comparator } from '../src/Comparator'
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'
import should from 'should'
import { isSequence, TypeRepresentation } from '../src'
import { ok } from 'assert'

const label1 = 'first label'
const label2 = 'second label'

describe('choppedAndIntersection', function () {
  describe('intersection', function () {
    function generateTests<T> (
      label: string,
      pointType: TypeRepresentation,
      points: T[],
      compareFn?: Comparator<T>
    ): void {
      const nonBasicWithIntersection = [
        AllenRelation.ENDS_IN,
        AllenRelation.CONTAINS_START,
        AllenRelation.START_TOGETHER,
        AllenRelation.END_TOGETHER,
        AllenRelation.STARTS_IN,
        AllenRelation.CONTAINS_END
      ]

      const intersectionWithSourceRelations = [
        AllenRelation.STARTS,
        AllenRelation.START_TOGETHER,
        AllenRelation.STARTS_IN,
        AllenRelation.EQUALS,
        AllenRelation.DURING,
        AllenRelation.ENDS_IN,
        AllenRelation.END_TOGETHER,
        AllenRelation.FINISHES
      ]

      const cases = createIntervalCoupleCases<T>(points)

      function callIt (
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
      ): Readonly<Interval<T>> | undefined | false {
        return compareFn !== undefined && compareFn !== null
          ? /* prettier-ignore */ intersection(li1, li2, compareFn)
          : intersection(li1, li2)
      }

      function moreOrLessEqual (one: Readonly<Interval<T>>, other: Readonly<Interval<T>> | undefined | false): void {
        ok(other)
        const oneOtherRelation = AllenRelation.relation(one, other, compareFn)
        if (one.end === undefined) {
          oneOtherRelation.should.equal(AllenRelation.START_TOGETHER)
        } else if (one.start === undefined) {
          oneOtherRelation.should.equal(AllenRelation.END_TOGETHER)
        } else {
          oneOtherRelation.should.equal(AllenRelation.EQUALS)
        }
      }

      function hasExpectedReferenceIntervals (
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

      function areSameIntervals (
        one: Readonly<Interval<T>> | undefined | false,
        other: Readonly<Interval<T>> | undefined | false,
        i1: Readonly<Interval<T>>,
        i2: Readonly<Interval<T>>
      ): void {
        if (one === false) {
          should(other).be.false()
        } else if (one === undefined) {
          should(other).be.undefined()
        } else {
          isInterval(one, pointType, compareFn).should.be.true()
          isInterval(other, pointType, compareFn).should.be.true()
          moreOrLessEqual(one, other)
          ok(other)
          hasExpectedReferenceIntervals(one, i1, i2)
          hasExpectedReferenceIntervals(other, i1, i2)
          should(one.referenceIntervals).deepEqual(other.referenceIntervals)
        }
      }

      describe(label, function () {
        cases.forEach(({ i1, i2, intersection: expected, relation }: NonDegenerateTestIntervals<T>) => {
          it(`returns the intersection for ${intervalToString(i1)}, ${intervalToString(
            i2
          )} ${relation.toString()} and fullfils the definition`, function () {
            const li1: ReferencedInterval<T> = { reference: label1, interval: i1 }
            const li2: ReferencedInterval<T> = { reference: label2, interval: i2 }
            const result: Readonly<Interval<T>> | undefined | false = callIt(li1, li2)
            if (expected === false || expected === undefined) {
              should(result).equal(expected)
            } else {
              moreOrLessEqual(expected, result)
            }
            const commuted: Readonly<Interval<T>> | undefined | false = callIt(li2, li1)
            areSameIntervals(result, commuted, i1, i2)
            const calculatedRelation: AllenRelation = AllenRelation.relation(i1, i2, compareFn)
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
              const i1Relation = AllenRelation.relation(result, i1, compareFn)
              i1Relation.implies(AllenRelation.CONCURS_WITH).should.be.true()
              i1Relation.should.be.oneOf(intersectionWithSourceRelations)
              const i2Relation = AllenRelation.relation(result, i2, compareFn)
              i2Relation.implies(AllenRelation.CONCURS_WITH).should.be.true()
              i2Relation.should.be.oneOf(intersectionWithSourceRelations)
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
      const chopWithSourceRelations = [
        AllenRelation.PRECEDES,
        AllenRelation.MEETS,
        AllenRelation.STARTS,
        AllenRelation.START_TOGETHER,
        AllenRelation.EQUALS,
        AllenRelation.DURING,
        AllenRelation.END_TOGETHER,
        AllenRelation.FINISHES,
        AllenRelation.MET_BY,
        AllenRelation.PRECEDED_BY
      ]

      const cases = createIntervalCoupleCases<T>(points)

      function callIt (
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
      ): ReadonlyArray<Readonly<Interval<T>>> | false {
        return compareFn !== undefined && compareFn !== null
          ? /* prettier-ignore */ chops(li1, li2, compareFn)
          : chops(li1, li2)
      }

      function callIntersection (
        li1: ReferencedInterval<T>,
        li2: ReferencedInterval<T>
      ): Readonly<Interval<T>> | undefined | false {
        return compareFn !== undefined && compareFn !== null
          ? /* prettier-ignore */ intersection(li1, li2, compareFn)
          : intersection(li1, li2)
      }

      describe(label, function () {
        cases.forEach(({ i1, i2, chops: expected, relation }: NonDegenerateTestIntervals<T>) => {
          it(`returns chops for ${intervalToString(i1)}, ${intervalToString(
            i2
          )} ${relation.toString()} and fullfils the definition`, function () {
            const li1: ReferencedInterval<T> = { reference: label1, interval: i1 }
            const li2: ReferencedInterval<T> = { reference: label2, interval: i2 }
            const result: ReadonlyArray<Readonly<Interval<T>>> | false = callIt(li1, li2)
            if (expected === false) {
              should(result).equal(expected)
            } else {
              result.should.containDeep(expected)
            }
            const commuted: ReadonlyArray<Readonly<Interval<T>>> | false = callIt(li2, li1)
            commuted.should.eql(result)
            const calculatedRelation: AllenRelation = AllenRelation.relation(i1, i2, compareFn)
            if (!calculatedRelation.isBasic()) {
              should(result).equal(false)
            } else {
              result.should.be.an.Array()
            }
            if (result === false) {
              calculatedRelation.isBasic().should.be.false()
            } else {
              const intersection = callIntersection(li1, li2)
              should(intersection).not.be.false()
              if (intersection !== undefined) {
                isSequence(result, { compareFn, ordered: true, gaps: false }).should.be.true()
                intersection.should.be.oneOf(result)
              } else {
                const gaps = calculatedRelation.implies(AllenRelation.IS_SEPARATE_FROM)
                isSequence(result, { compareFn, ordered: true, gaps }).should.be.true()
              }
              result.forEach(i => {
                ok(i.referenceIntervals)
                const maxReferenceIntervals = [i1, i2]
                const i1Relation = AllenRelation.relation(i, i1, compareFn)
                i1Relation.should.be.oneOf(chopWithSourceRelations)
                if (i1Relation.implies(AllenRelation.CONCURS_WITH)) {
                  i1.should.be.oneOf(i.referenceIntervals[label1])
                } else if (i.referenceIntervals[label1] !== undefined) {
                  i.referenceIntervals[label1].should.not.containEql(i1)
                }
                if (i.referenceIntervals[label1] !== undefined) {
                  i.referenceIntervals[label1].forEach(ri => {
                    ri.should.be.oneOf(maxReferenceIntervals)
                  })
                }
                const i2Relation = AllenRelation.relation(i, i2, compareFn)
                i2Relation.should.be.oneOf(chopWithSourceRelations)
                if (i2Relation.implies(AllenRelation.CONCURS_WITH)) {
                  i2.should.be.oneOf(i.referenceIntervals[label2])
                } else if (i.referenceIntervals[label2] !== undefined) {
                  i.referenceIntervals[label2].should.not.containEql(i2)
                }
                if (i.referenceIntervals[label2] !== undefined) {
                  i.referenceIntervals[label2].forEach(ri => {
                    ri.should.be.oneOf(maxReferenceIntervals)
                  })
                }
              })
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
