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
import { choppedSequence } from '../src/choppedSequence'
import { ok } from 'assert'
import { transposeAndOrder } from '../src/transposeAndOrder'

const sedf = AllenRelation.fromString<AllenRelation>('sedf')

describe('choppedSequence', function () {
  describe('compositions', function () {
    it('has compositions', function () {
      // possible relations, ordered i1 vs i2: `(pmoFDse)`
      interface PartRelations {
        i1: AllenRelation[]
        i2: AllenRelation[]
      }
      const relations = new Map<AllenRelation, PartRelations>()
      relations.set(AllenRelation.PRECEDES, {
        i1: [AllenRelation.EQUALS, AllenRelation.PRECEDES],
        i2: [AllenRelation.PRECEDED_BY, AllenRelation.EQUALS]
      })
      relations.set(AllenRelation.MEETS, {
        i1: [AllenRelation.EQUALS, AllenRelation.MEETS],
        i2: [AllenRelation.MET_BY, AllenRelation.EQUALS]
      })
      relations.set(AllenRelation.OVERLAPS, {
        i1: [AllenRelation.STARTED_BY, AllenRelation.FINISHED_BY, AllenRelation.MET_BY],
        i2: [AllenRelation.MET_BY, AllenRelation.STARTED_BY, AllenRelation.FINISHED_BY]
      })
      relations.set(AllenRelation.FINISHED_BY, {
        i1: [AllenRelation.STARTED_BY, AllenRelation.FINISHED_BY],
        i2: [AllenRelation.MET_BY, AllenRelation.EQUALS]
      })
      relations.set(AllenRelation.CONTAINS, {
        i1: [AllenRelation.STARTED_BY, AllenRelation.CONTAINS, AllenRelation.FINISHED_BY],
        i2: [AllenRelation.MET_BY, AllenRelation.EQUALS, AllenRelation.MEETS]
      })
      relations.set(AllenRelation.STARTS, {
        i1: [AllenRelation.EQUALS, AllenRelation.MEETS],
        i2: [AllenRelation.STARTED_BY, AllenRelation.FINISHED_BY]
      })
      relations.set(AllenRelation.EQUALS, {
        i1: [AllenRelation.EQUALS, AllenRelation.EQUALS],
        i2: [AllenRelation.EQUALS, AllenRelation.EQUALS]
      })
      const possibleRelationsI2Vsi3 = [
        AllenRelation.PRECEDES,
        AllenRelation.MEETS,
        AllenRelation.OVERLAPS,
        AllenRelation.FINISHED_BY,
        AllenRelation.CONTAINS,
        AllenRelation.STARTS,
        AllenRelation.EQUALS
      ]
      // we know i2vsi3; we know i2vs elements; what is i3 vs elements?
      possibleRelationsI2Vsi3.forEach(i2Vsi3 => {
        const i3VsI2 = i2Vsi3.converse()
        console.log(`i3 ${i3VsI2.toString()} i2`)
        relations.forEach((partRelations, i1Vsi2) => {
          console.log(`  i2 ${i1Vsi2.converse().toString()} i1`)
          partRelations.i2.forEach((i2VsPart, index) => {
            const i3VsPart = i3VsI2.compose(i2VsPart)
            const doesNotConcur = i3VsPart.implies(AllenRelation.DOES_NOT_CONCUR_WITH)
            console.log(`   i3 ${i3VsPart.toString()} i[${index}] ${doesNotConcur ? '❎' : '❌'}`)
          })
        })
      })
    })
  })
  function generateTests<T> (label: string, points: readonly T[], compareFn?: Comparator<T>): void {
    function validateResult (
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
        should(resultInterval).have.ownProperty('referenceIntervals')
        const resultIntervalReferenceIntervals: ReferenceIntervals<T> | undefined = resultInterval.referenceIntervals
        ok(resultIntervalReferenceIntervals)
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

    function callIt (sources: Readonly<ReferenceIntervals<T>>): ReadonlyArray<Readonly<Interval<T>>> {
      return compareFn !== undefined && compareFn !== null
        ? /* prettier-ignore */ choppedSequence(sources, compareFn)
        : choppedSequence(sources)
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
      })
      // it('returns expected intersections with fully definite intervals', function () {
      //   const i1: Readonly<Interval<T>> = { start: points[0], end: points[2] }
      //   const i2: Readonly<Interval<T>> = { start: points[1], end: points[3] }
      //   const i3: Readonly<Interval<T>> = { start: points[0], end: points[2] } // duplicates i1
      //   /* i1 (o) i2
      //        i1 (e) i3
      //        i2 (O) i3
      //        expect [0, 1[, [1, 2[, [1, 3[ */
      //   const i4: Readonly<Interval<T>> = { start: points[4], end: points[5] }
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
