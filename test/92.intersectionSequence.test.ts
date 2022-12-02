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
import { AllenRelation, Comparator, isSequence } from '../src'
import { interSectionSequence } from '../src/interSectionSequence'
import { ok } from 'assert'

const sedf = AllenRelation.fromString<AllenRelation>('sedf')

describe('interSectionSequence', function () {
  function generateTests<T> (label: string, points: T[], compareFn?: Comparator<T>): void {
    function validateResult (
      sources: Readonly<ReferenceIntervals<T>>,
      result: ReadonlyArray<Readonly<Interval<T>>>,
      gaps?: boolean
    ): void {
      isSequence(result, { ordered: true, gaps, compareFn }).should.be.true()
      const allSourceIntervals: Array<Interval<T>> = Object.values<Array<Interval<T>>>(sources).flat()
      result.forEach(ir => {
        const referenceIntervals: ReferenceIntervals<T> | undefined = ir.referenceIntervals
        ok(referenceIntervals)
        const allReferenceIntervals: Array<Interval<T>> = Object.values<Array<Interval<T>>>(referenceIntervals).flat()
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