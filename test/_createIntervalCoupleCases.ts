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

import { AllenRelation } from '../src/AllenRelation'
import { type Interval } from '../src/Interval'

export interface TestIntervals<T> {
  i1: Interval<T>
  i2: Interval<T>
}

export interface NonDegenerateTestIntervals<T> extends TestIntervals<T> {
  relation: AllenRelation
  comparison: number
  intersection: Readonly<Interval<T>> | undefined | false
  chops: ReadonlyArray<Readonly<Interval<T>>> | false
}

/**
 * Given 4 points, in order, create relevant intervals to test, and the expected relations.
 *
 * When `i1` and `i2` are swapped, we expect the `converse` relation.
 */
export function createIntervalCoupleCases<T>(pts: T[]): Array<NonDegenerateTestIntervals<T>> {
  return [
    /* all indefinite */
    {
      i1: {},
      i2: {},
      relation: AllenRelation.FULL,
      comparison: 0,
      intersection: false,
      chops: false
    },

    /* 1 definite */
    {
      i1: { start: pts[0] },
      i2: {},
      relation: AllenRelation.FULL,
      comparison: +1,
      intersection: false,
      chops: false
    },
    {
      i1: { end: pts[0] },
      i2: {},
      relation: AllenRelation.FULL,
      comparison: -1,
      intersection: false,
      chops: false
    },
    {
      i1: {},
      i2: { start: pts[0] },
      relation: AllenRelation.FULL,
      comparison: -1,
      intersection: false,
      chops: false
    },
    {
      i1: {},
      i2: { end: pts[0] },
      relation: AllenRelation.FULL,
      comparison: +1,
      intersection: false,
      chops: false
    },

    /* 2 definite */
    {
      i1: { start: pts[0], end: pts[1] },
      i2: {},
      relation: AllenRelation.FULL,
      comparison: +1,
      intersection: false,
      chops: false
    },

    {
      i1: { start: pts[1] },
      i2: { start: pts[0] },
      relation: AllenRelation.STARTS_LATER,
      comparison: +1,
      intersection: false,
      chops: false
    },
    {
      i1: { start: pts[1] },
      i2: { start: pts[1] },
      relation: AllenRelation.START_TOGETHER,
      comparison: 0,
      intersection: { start: pts[1] },
      chops: false
    },
    {
      i1: { start: pts[1] },
      i2: { start: pts[2] },
      relation: AllenRelation.STARTS_EARLIER,
      comparison: -1,
      intersection: false,
      chops: false
    },

    {
      i1: { start: pts[1] },
      i2: { end: pts[0] },
      relation: AllenRelation.PRECEDED_BY,
      comparison: +1,
      intersection: undefined,
      chops: [{ end: pts[0] }, { start: pts[1] }]
    },
    {
      i1: { start: pts[1] },
      i2: { end: pts[1] },
      relation: AllenRelation.MET_BY,
      comparison: +1,
      intersection: undefined,
      chops: [{ end: pts[1] }, { start: pts[1] }]
    },
    {
      i1: { start: pts[1] },
      i2: { end: pts[2] },
      relation: AllenRelation.AFTER.complement(),
      comparison: +1,
      intersection: false,
      chops: false
    },

    {
      i1: { end: pts[1] },
      i2: { start: pts[0] },
      relation: AllenRelation.BEFORE.complement(),
      comparison: -1,
      intersection: false,
      chops: false
    },
    {
      i1: { end: pts[1] },
      i2: { start: pts[1] },
      relation: AllenRelation.MEETS,
      comparison: -1,
      intersection: undefined,
      chops: [{ end: pts[1] }, { start: pts[1] }]
    },
    {
      i1: { end: pts[1] },
      i2: { start: pts[2] },
      relation: AllenRelation.PRECEDES,
      comparison: -1,
      intersection: undefined,
      chops: [{ end: pts[1] }, { start: pts[2] }]
    },

    {
      i1: { end: pts[1] },
      i2: { end: pts[0] },
      relation: AllenRelation.ENDS_LATER,
      comparison: +1,
      intersection: false,
      chops: false
    },
    {
      i1: { end: pts[1] },
      i2: { end: pts[1] },
      relation: AllenRelation.END_TOGETHER,
      comparison: 0,
      intersection: { end: pts[1] },
      chops: false
    },
    {
      i1: { end: pts[1] },
      i2: { end: pts[2] },
      relation: AllenRelation.ENDS_EARLIER,
      comparison: -1,
      intersection: false,
      chops: false
    },

    {
      i1: {},
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.FULL,
      comparison: -1,
      intersection: false,
      chops: false
    },

    /* 3 definite */
    // i1 start indefinite
    {
      i1: { end: pts[1] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.PRECEDES,
      comparison: -1,
      intersection: undefined,
      chops: [{ end: pts[1] }, { start: pts[2], end: pts[3] }]
    },
    {
      i1: { end: pts[1] },
      i2: { start: pts[1], end: pts[3] },
      relation: AllenRelation.MEETS,
      comparison: -1,
      intersection: undefined,
      chops: [{ end: pts[1] }, { start: pts[1], end: pts[3] }]
    },
    {
      i1: { end: pts[2] },
      i2: { start: pts[1], end: pts[3] },
      relation: AllenRelation.ENDS_IN,
      comparison: -1,
      intersection: { end: pts[2] },
      chops: false
    },
    {
      i1: { end: pts[3] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.END_TOGETHER,
      comparison: -1,
      intersection: { end: pts[3] },
      chops: false
    },
    {
      i1: { end: pts[3] },
      i2: { start: pts[1], end: pts[2] },
      relation: AllenRelation.ENDS_LATER,
      comparison: -1,
      intersection: false,
      chops: false
    },
    // i1 end indefinite
    {
      i1: { start: pts[0] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.STARTS_EARLIER,
      comparison: -1,
      intersection: false,
      chops: false
    },
    {
      i1: { start: pts[0] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.START_TOGETHER,
      comparison: +1,
      intersection: { start: pts[0] },
      chops: false
    },
    {
      i1: { start: pts[1] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.STARTS_IN,
      comparison: +1,
      intersection: { start: pts[1] },
      chops: false
    },
    {
      i1: { start: pts[1] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.MET_BY,
      comparison: +1,
      intersection: undefined,
      chops: [{ start: pts[0], end: pts[1] }, { start: pts[1] }]
    },
    {
      i1: { start: pts[2] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.PRECEDED_BY,
      comparison: +1,
      intersection: undefined,
      chops: [{ start: pts[0], end: pts[1] }, { start: pts[2] }]
    },
    // i2 start indefinite
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { end: pts[3] },
      relation: AllenRelation.ENDS_EARLIER,
      comparison: +1,
      intersection: false,
      chops: false
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { end: pts[3] },
      relation: AllenRelation.END_TOGETHER,
      comparison: +1,
      intersection: { end: pts[3] },
      chops: false
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { end: pts[2] },
      relation: AllenRelation.CONTAINS_END,
      comparison: +1,
      intersection: { end: pts[2] },
      chops: false
    },
    {
      i1: { start: pts[1], end: pts[2] },
      i2: { end: pts[1] },
      relation: AllenRelation.MET_BY,
      comparison: +1,
      intersection: undefined,
      chops: [{ end: pts[1] }, { start: pts[1], end: pts[2] }]
    },
    {
      i1: { start: pts[2], end: pts[3] },
      i2: { end: pts[1] },
      relation: AllenRelation.PRECEDED_BY,
      comparison: +1,
      intersection: undefined,
      chops: [{ end: pts[1] }, { start: pts[2], end: pts[3] }]
    },
    // i2 end indefinite
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[2] },
      relation: AllenRelation.PRECEDES,
      comparison: -1,
      intersection: undefined,
      chops: [{ start: pts[0], end: pts[1] }, { start: pts[2] }]
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[1] },
      relation: AllenRelation.MEETS,
      comparison: -1,
      intersection: undefined,
      chops: [{ start: pts[0], end: pts[1] }, { start: pts[1] }]
    },
    {
      i1: { start: pts[0], end: pts[2] },
      i2: { start: pts[1] },
      relation: AllenRelation.CONTAINS_START,
      comparison: -1,
      intersection: { start: pts[1] },
      chops: false
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[0] },
      relation: AllenRelation.START_TOGETHER,
      comparison: -1,
      intersection: { start: pts[0] },
      chops: false
    },
    {
      i1: { start: pts[1], end: pts[2] },
      i2: { start: pts[0] },
      relation: AllenRelation.STARTS_LATER,
      comparison: +1,
      intersection: false,
      chops: false
    },

    /* 4 definite → 13 basic relations */
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.PRECEDES,
      comparison: -1,
      intersection: undefined,
      chops: [
        { start: pts[0], end: pts[1] },
        { start: pts[2], end: pts[3] }
      ]
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[1], end: pts[3] },
      relation: AllenRelation.MEETS,
      comparison: -1,
      intersection: undefined,
      chops: [
        { start: pts[0], end: pts[1] },
        { start: pts[1], end: pts[3] }
      ]
    },
    {
      i1: { start: pts[0], end: pts[2] },
      i2: { start: pts[1], end: pts[3] },
      relation: AllenRelation.OVERLAPS,
      comparison: -1,
      intersection: { start: pts[1], end: pts[2] },
      chops: [
        { start: pts[0], end: pts[1] },
        { start: pts[1], end: pts[2] },
        { start: pts[2], end: pts[3] }
      ]
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.FINISHED_BY,
      comparison: -1,
      intersection: { start: pts[2], end: pts[3] },
      chops: [
        { start: pts[0], end: pts[2] },
        { start: pts[2], end: pts[3] }
      ]
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { start: pts[1], end: pts[2] },
      relation: AllenRelation.CONTAINS,
      comparison: -1,
      intersection: { start: pts[1], end: pts[2] },
      chops: [
        { start: pts[0], end: pts[1] },
        { start: pts[1], end: pts[2] }
      ]
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.STARTS,
      comparison: -1,
      intersection: { start: pts[0], end: pts[1] },
      chops: [
        { start: pts[0], end: pts[1] },
        { start: pts[1], end: pts[3] }
      ]
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.EQUALS,
      comparison: 0,
      intersection: { start: pts[0], end: pts[1] },
      chops: [{ start: pts[0], end: pts[1] }]
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { start: pts[0], end: pts[2] },
      relation: AllenRelation.STARTED_BY,
      comparison: +1,
      intersection: { start: pts[0], end: pts[2] },
      chops: [
        { start: pts[0], end: pts[2] },
        { start: pts[2], end: pts[3] }
      ]
    },
    {
      i1: { start: pts[1], end: pts[2] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.DURING,
      comparison: +1,
      intersection: { start: pts[1], end: pts[2] },
      chops: [
        { start: pts[0], end: pts[1] },
        { start: pts[1], end: pts[2] },
        { start: pts[2], end: pts[3] }
      ]
    },
    {
      i1: { start: pts[1], end: pts[3] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.FINISHES,
      comparison: +1,
      intersection: { start: pts[1], end: pts[3] },
      chops: [
        { start: pts[0], end: pts[1] },
        { start: pts[1], end: pts[3] }
      ]
    },
    {
      i1: { start: pts[1], end: pts[3] },
      i2: { start: pts[0], end: pts[2] },
      relation: AllenRelation.OVERLAPPED_BY,
      comparison: +1,
      intersection: { start: pts[1], end: pts[2] },
      chops: [
        { start: pts[0], end: pts[1] },
        { start: pts[1], end: pts[2] },
        { start: pts[2], end: pts[3] }
      ]
    },
    {
      i1: { start: pts[1], end: pts[2] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.MET_BY,
      comparison: +1,
      intersection: undefined,
      chops: [
        { start: pts[0], end: pts[1] },
        { start: pts[1], end: pts[2] }
      ]
    },
    {
      i1: { start: pts[2], end: pts[3] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.PRECEDED_BY,
      comparison: +1,
      intersection: undefined,
      chops: [
        { start: pts[0], end: pts[1] },
        { start: pts[2], end: pts[3] }
      ]
    },

    /* test with null */
    {
      i1: { start: null },
      i2: { end: pts[0] },
      relation: AllenRelation.FULL,
      comparison: +1,
      intersection: false,
      chops: false
    }
  ]
}
