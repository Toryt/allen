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

import { AllenRelation, Interval } from '../src'

export interface TestIntervals<T> {
  i1: Interval<T>
  i2: Interval<T>
}

export interface NonDegenerateTestIntervals<T> extends TestIntervals<T> {
  relation: AllenRelation
  comparison: number
}

/**
 * Given 4 points, in order, create relevant intervals to test, and the expected relations.
 *
 * When `i1` and `i2` are swapped, we expect the `converse` relation.
 */
export function createIntervalCoupleCases<T> (pts: T[]): Array<NonDegenerateTestIntervals<T>> {
  return [
    /* all indefinite */
    { i1: {}, i2: {}, relation: AllenRelation.fullRelation<AllenRelation>(), comparison: 0 },

    /* 1 definite */
    { i1: { start: pts[0] }, i2: {}, relation: AllenRelation.fullRelation<AllenRelation>(), comparison: +1 },
    { i1: { end: pts[0] }, i2: {}, relation: AllenRelation.fullRelation<AllenRelation>(), comparison: -1 },
    { i1: {}, i2: { start: pts[0] }, relation: AllenRelation.fullRelation<AllenRelation>(), comparison: -1 },
    { i1: {}, i2: { end: pts[0] }, relation: AllenRelation.fullRelation<AllenRelation>(), comparison: +1 },

    /* 2 definite */
    {
      i1: { start: pts[0], end: pts[1] },
      i2: {},
      relation: AllenRelation.fullRelation<AllenRelation>(),
      comparison: +1
    },

    {
      i1: { start: pts[1] },
      i2: { start: pts[0] },
      relation: AllenRelation.fromString<AllenRelation>('dfOMP'),
      comparison: +1
    },
    {
      i1: { start: pts[1] },
      i2: { start: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('seS'),
      comparison: 0
    },
    {
      i1: { start: pts[1] },
      i2: { start: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('dfOMP').converse(),
      comparison: -1
    },

    {
      i1: { start: pts[1] },
      i2: { end: pts[0] },
      relation: AllenRelation.fromString<AllenRelation>('P'),
      comparison: +1
    },
    {
      i1: { start: pts[1] },
      i2: { end: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('M'),
      comparison: +1
    },
    {
      i1: { start: pts[1] },
      i2: { end: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('pmoFDseSdfO'),
      comparison: +1
    },

    {
      i1: { end: pts[1] },
      i2: { start: pts[0] },
      relation: AllenRelation.fromString<AllenRelation>('oFDseSdfOMP'),
      comparison: -1
    },
    {
      i1: { end: pts[1] },
      i2: { start: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('m'),
      comparison: -1
    },
    {
      i1: { end: pts[1] },
      i2: { start: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('p'),
      comparison: -1
    },

    {
      i1: { end: pts[1] },
      i2: { end: pts[0] },
      relation: AllenRelation.fromString<AllenRelation>('DSOMP'),
      comparison: +1
    },
    {
      i1: { end: pts[1] },
      i2: { end: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('Fef'),
      comparison: 0
    },
    {
      i1: { end: pts[1] },
      i2: { end: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('pmosd'),
      comparison: -1
    },

    {
      i1: {},
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.fullRelation<AllenRelation>(),
      comparison: -1
    },

    /* 3 definite */
    // i1 start indefinite
    {
      i1: { end: pts[1] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('p'),
      comparison: -1
    },
    {
      i1: { end: pts[1] },
      i2: { start: pts[1], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('m'),
      comparison: -1
    },
    {
      i1: { end: pts[2] },
      i2: { start: pts[1], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('osd'),
      comparison: -1
    },
    {
      i1: { end: pts[3] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('Fef'),
      comparison: -1
    },
    {
      i1: { end: pts[3] },
      i2: { start: pts[1], end: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('DSOMP'),
      comparison: -1
    },
    // i1 end indefinite
    {
      i1: { start: pts[0] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('pmoFD'),
      comparison: -1
    },
    {
      i1: { start: pts[0] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('seS'),
      comparison: +1
    },
    {
      i1: { start: pts[1] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('dfO'),
      comparison: +1
    },
    {
      i1: { start: pts[1] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('M'),
      comparison: +1
    },
    {
      i1: { start: pts[2] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('P'),
      comparison: +1
    },
    // i2 start indefinite
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('pmosd'),
      comparison: +1
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('Fef'),
      comparison: +1
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { end: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('DSO'),
      comparison: +1
    },
    {
      i1: { start: pts[1], end: pts[2] },
      i2: { end: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('M'),
      comparison: +1
    },
    {
      i1: { start: pts[2], end: pts[3] },
      i2: { end: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('P'),
      comparison: +1
    },
    // i2 end indefinite
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('p'),
      comparison: -1
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('m'),
      comparison: -1
    },
    {
      i1: { start: pts[0], end: pts[2] },
      i2: { start: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('oFD'),
      comparison: -1
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[0] },
      relation: AllenRelation.fromString<AllenRelation>('seS'),
      comparison: -1
    },
    {
      i1: { start: pts[1], end: pts[2] },
      i2: { start: pts[0] },
      relation: AllenRelation.fromString<AllenRelation>('dfOMP'),
      comparison: +1
    },

    /* 4 definite → 13 basic relations */
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.PRECEDES,
      comparison: -1
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[1], end: pts[3] },
      relation: AllenRelation.MEETS,
      comparison: -1
    },
    {
      i1: { start: pts[0], end: pts[2] },
      i2: { start: pts[1], end: pts[3] },
      relation: AllenRelation.OVERLAPS,
      comparison: -1
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.FINISHED_BY,
      comparison: -1
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { start: pts[1], end: pts[2] },
      relation: AllenRelation.CONTAINS,
      comparison: -1
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.STARTS,
      comparison: -1
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.EQUALS,
      comparison: 0
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { start: pts[0], end: pts[2] },
      relation: AllenRelation.STARTED_BY,
      comparison: +1
    },
    {
      i1: { start: pts[1], end: pts[2] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.DURING,
      comparison: +1
    },
    {
      i1: { start: pts[1], end: pts[3] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.FINISHES,
      comparison: +1
    },
    {
      i1: { start: pts[1], end: pts[3] },
      i2: { start: pts[0], end: pts[2] },
      relation: AllenRelation.OVERLAPPED_BY,
      comparison: +1
    },
    {
      i1: { start: pts[1], end: pts[2] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.MET_BY,
      comparison: +1
    },
    {
      i1: { start: pts[2], end: pts[3] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.PRECEDED_BY,
      comparison: +1
    },

    /* test with null */
    { i1: { start: null }, i2: { end: pts[0] }, relation: AllenRelation.fullRelation<AllenRelation>(), comparison: +1 }
  ]
}
