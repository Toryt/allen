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
import { Interval, ReferenceIntervals } from '../src/Interval'
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'
import { Comparator } from '../src/Comparator'
import { ltCompare } from '../src/ltCompare'
import { AllenRelation } from '../src/AllenRelation'
import { compareIntervals } from '../src/compareIntervals'
import { isSequence } from '../src/isSequence'
import { interSectionSequence, transposeAndOrder } from '../src/interSectionSequence'
import { ok } from 'assert'

const sedf = AllenRelation.fromString<AllenRelation>('sedf')

describe('interSectionSequence', function () {
  describe('transposeAndOrder', function () {
    it('works with an empty object', function () {
      transposeAndOrder({}, 'number').should.deepEqual([])
    })
    it('returns an array for 1 property, sorted', function () {
      const aProperty = [{ start: 32, end: 334 }, { start: 22, end: 23 }, { start: -1 }]
      const result = transposeAndOrder({ aProperty }, 'number')
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
      const result = transposeAndOrder({ aProperty }, 'number', ltCompare)
      result.should.be.an.Array()
      result.length.should.equal(aProperty.length)
      const orderedAProperty = aProperty.slice().sort(compareIntervals)
      result.forEach((e, i) => {
        e.reference.should.equal('aProperty')
        e.interval.should.equal(orderedAProperty[i])
      })
    })
    it('returns the expected result with 3 properties', function () {
      const property1: ReadonlyArray<Interval<number>> = [
        { start: 32, end: 334 },
        { start: 22, end: 23 },
        { start: -1 }
      ]
      const property2: ReadonlyArray<Interval<number>> = [{ start: 32 }, { start: 24, end: 26 }]
      const property3: ReadonlyArray<Interval<number>> = [{ end: 32 }, { start: 122, end: 144 }]
      const result = transposeAndOrder({ property1, property2, property3 }, 'number', ltCompare)
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
  describe('interSectionSequence', function () {
    function generateTests<T> (label: string, points: T[], compareFn?: Comparator<T>): void {
      function validateResult (
        sources: Readonly<ReferenceIntervals<T>>,
        result: ReadonlyArray<Readonly<Interval<T>>>,
        gaps?: boolean
      ): void {
        isSequence(result, { ordered: true, gaps, compareFn }).should.be.true()
        const allSourceIntervals: Array<Interval<T>> = Object.values<ReadonlyArray<Interval<T>>>(sources).flat()
        result.forEach(ir => {
          const referenceIntervals: ReferenceIntervals<T> | undefined = ir.referenceIntervals
          ok(referenceIntervals)
          const allReferenceIntervals: ReadonlyArray<Interval<T>> =
            Object.values<ReadonlyArray<Interval<T>>>(referenceIntervals).flat()
          allSourceIntervals.forEach((is: Interval<T>) => {
            const irRis = AllenRelation.relation(ir, is, compareFn)
            if (allReferenceIntervals.includes(is)) {
              irRis.implies(sedf).should.be.true()
              // MUDO and refers to correct name
            } else {
              irRis.implies(AllenRelation.DOES_NOT_CONCUR_WITH)
            }
          })
        })
        allSourceIntervals.forEach(is => {
          result.some(ir => AllenRelation.relation(ir, is, compareFn).implies(sedf)).should.be.true()
          // MUDO and refers
        })
      }

      function callIt (sources: Readonly<ReferenceIntervals<T>>): ReadonlyArray<Readonly<Interval<T>>> {
        return compareFn !== undefined && compareFn !== null
          ? /* prettier-ignore */ interSectionSequence(sources, compareFn)
          : interSectionSequence(sources)
      }

      describe(label, function () {
        it('returns the empty sequence without sources', function () {
          const sources: ReferenceIntervals<T> = {}
          const result = callIt(sources)
          result.should.be.an.Array()
          result.length.should.equal(0)
          validateResult(sources, result)
        })
        it('returns the sequence with 1 singleton source', function () {
          const aSource = [{ start: points[0], end: points[1] }]
          const sources: ReferenceIntervals<T> = { aSource }
          const result = callIt(sources)
          result.should.be.an.Array()
          result.length.should.equal(1)
          validateResult(sources, result)
          // MUDO more tests
        })
        it('returns the sequence with 1 source', function () {
          const aSource = [
            { start: points[0], end: points[1] },
            { start: points[1], end: points[2] },
            { start: points[3], end: points[4] }
          ]
          const sources: ReferenceIntervals<T> = { aSource }
          const result = callIt(sources)
          result.should.be.an.Array()
          result.length.should.equal(3)
          validateResult(sources, result)
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
})
