/*
 Copyright © 2022 – 2023 by Jan Dockx
 
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
import { type Interval, type ReferencedInterval, type ReferenceIntervals } from '../src/Interval'
import { generateSixSymbols, sixDates, sixNumbers, sixStrings } from './_pointCases'
import { type Comparator } from '../src/Comparator'
import { AllenRelation } from '../src/AllenRelation'
import { isSequence } from '../src/isSequence'
import { intersectionSequence } from '../src/intersectionSequence'
import { ok } from 'assert'
import { transposeAndOrder } from '../src/transposeAndOrder'

const sedf = AllenRelation.fromString<AllenRelation>('sedf')

describe('intersectionSequence', function () {
  function generateTests<T>(label: string, points: readonly T[], compareFn?: Comparator<T>): void {
    function validateResult(
      sources: Readonly<ReferenceIntervals<T>>,
      result: ReadonlyArray<Readonly<Interval<T>>>,
      gaps?: boolean
    ): void {
      isSequence(result, { ordered: true, gaps, compareFn }).should.be.true()
      const sourceReferencedIntervals: ReadonlyArray<Readonly<ReferencedInterval<T>>> = transposeAndOrder(
        sources,
        compareFn
      )
      result.forEach(resultInterval => {
        const resultIntervalReferenceIntervals: ReferenceIntervals<T> | undefined = resultInterval.referenceIntervals
        should(resultIntervalReferenceIntervals).be.an.Object()
        ok(resultIntervalReferenceIntervals)
        Object.keys(sources).forEach(sk => {
          should(resultIntervalReferenceIntervals).have.property(sk)
          resultIntervalReferenceIntervals[sk].should.be.an.Array()
        })
        sourceReferencedIntervals.forEach((sourceReferencedInterval: Readonly<ReferencedInterval<T>>) => {
          const sourceInterval: Interval<T> = sourceReferencedInterval.interval
          const sourceReference: string = sourceReferencedInterval.reference
          sourceReference.should.be.a.String()
          const rRs = AllenRelation.relation(resultInterval, sourceInterval, compareFn)
          if (resultIntervalReferenceIntervals[sourceReference]?.includes(sourceInterval)) {
            rRs.implies(sedf).should.be.true()
          } else {
            rRs.implies(AllenRelation.DOES_NOT_CONCUR_WITH)
          }
        })
      })
      sourceReferencedIntervals.forEach((sourceReferencedInterval: Readonly<ReferencedInterval<T>>) => {
        const sourceInterval: Interval<T> = sourceReferencedInterval.interval
        const sourceReference: string = sourceReferencedInterval.reference
        result
          .some(
            resultInterval =>
              AllenRelation.relation(resultInterval, sourceInterval, compareFn).implies(sedf) &&
              resultInterval.referenceIntervals !== undefined &&
              resultInterval.referenceIntervals[sourceReference] !== undefined &&
              resultInterval.referenceIntervals[sourceReference].includes(sourceInterval)
          )
          .should.be.true()
      })
    }

    function callIt(sources: Readonly<ReferenceIntervals<T>>): ReadonlyArray<Readonly<Interval<T>>> | false {
      return compareFn !== undefined && compareFn !== null
        ? intersectionSequence(sources, compareFn)
        : intersectionSequence(sources)
    }

    describe(label, function () {
      it('returns the empty sequence without sources', function () {
        const sources: ReferenceIntervals<T> = {}
        const result = callIt(sources)
        ok(result)
        result.should.be.an.Array()
        result.length.should.equal(0)
        validateResult(sources, result)
      })
      it('returns the sequence with 1 singleton source', function () {
        const aSource = [{ start: points[0], end: points[1] }]
        const sources: ReferenceIntervals<T> = { aSource }
        const result = callIt(sources)
        ok(result)
        result.should.be.an.Array()
        result.length.should.equal(1)
        validateResult(sources, result)
      })
      it('returns the sequence with 1 source', function () {
        const aSource = [
          { start: points[0], end: points[1] },
          { start: points[1], end: points[2] },
          { start: points[3], end: points[4] }
        ]
        const sources: ReferenceIntervals<T> = { aSource }
        const result = callIt(sources)
        ok(result)
        result.should.be.an.Array()
        result.length.should.equal(3)
        validateResult(sources, result)
      })
      // it('returns expected intersections with fully definite intervals', function () {
      //   const i1: Readonly<Interval<T>> = { start: points[0], end: points[2] }
      //   const i2: Readonly<Interval<T>> = { start: points[1], end: points[3] }
      //   const i3: Readonly<Interval<T>> = { start: points[0], end: points[2] } // duplicates i1
      //   /* i1 (o) i2
      //        i1 (e) i3
      //        i2 (O) i
      //        expect [0, 1[, [1, 2[, [1, 3[ */
      //   const i4: Readonly<Interval<T>> = { start: points[4], end: poin2ts[5] }
      //   /* i1, i2, i3 (p) i4 */
      //   // MUDO need more points to cover all relations
      //   const sources: Readonly<ReferenceIntervals<T>> = {
      //     property1: [i3, i2],
      //     property2: [i3, i1, i4],
      //     property3: [i4, i1]
      //   }
      //   const expected: ReadonlyArray<Readonly<Interval<T>>> = [
      //     {
      //       start: points[0],
      //       end: points[1],
      //       referenceIntervals: {
      //         property1: [i3],
      //         property2: [i1, i3],
      //         property3: [i1]
      //       }
      //     },
      //     {
      //       start: points[1],
      //       end: points[2],
      //       referenceIntervals: {
      //         property1: [i2, i3],
      //         property2: [i1, i3],
      //         property3: [i1]
      //       }
      //     },
      //     {
      //       start: points[2],
      //       end: points[3],
      //       referenceIntervals: {
      //         property1: [i2]
      //       }
      //     }, // gap
      //     {
      //       start: points[4],
      //       end: points[5],
      //       referenceIntervals: {
      //         property1: [i4],
      //         property2: [i4],
      //         property3: [i4]
      //       }
      //     }
      //   ]
      //   callIt(sources).should.deepEqual(expected)
      // })
    })
  }

  generateTests<number>('number', sixNumbers)
  generateTests<string>('string', sixStrings)
  generateTests<Date>('Date', sixDates)
  generateTests<symbol>('symbol', generateSixSymbols('interSectionSequence'), (s1: symbol, s2: symbol): number =>
    s1.toString() < s2.toString() ? -1 : s1.toString() > s2.toString() ? +1 : 0
  )
})
