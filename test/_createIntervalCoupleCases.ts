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
}

/**
 * Given 4 points, in order, create relevant intervals to test, and the expected relations.
 *
 * When `i1` and `i2` are swapped, we expect the `converse` relation.
 */
export function createIntervalCoupleCases<T> (pts: T[]): Array<NonDegenerateTestIntervals<T>> {
  return [
    /* all indefinite */
    { i1: {}, i2: {}, relation: AllenRelation.fullRelation<AllenRelation>() },

    /* 1 definite */
    { i1: { start: pts[0] }, i2: {}, relation: AllenRelation.fullRelation<AllenRelation>() },
    { i1: { end: pts[0] }, i2: {}, relation: AllenRelation.fullRelation<AllenRelation>() },
    { i1: {}, i2: { start: pts[0] }, relation: AllenRelation.fullRelation<AllenRelation>() },
    { i1: {}, i2: { end: pts[0] }, relation: AllenRelation.fullRelation<AllenRelation>() },

    /* 2 definite */
    { i1: { start: pts[0], end: pts[1] }, i2: {}, relation: AllenRelation.fullRelation<AllenRelation>() },

    { i1: { start: pts[1] }, i2: { start: pts[0] }, relation: AllenRelation.fromString<AllenRelation>('dfOMP') },
    { i1: { start: pts[1] }, i2: { start: pts[1] }, relation: AllenRelation.fromString<AllenRelation>('seS') },
    {
      i1: { start: pts[1] },
      i2: { start: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('dfOMP').converse()
    },

    { i1: { start: pts[1] }, i2: { end: pts[0] }, relation: AllenRelation.fromString<AllenRelation>('P') },
    { i1: { start: pts[1] }, i2: { end: pts[1] }, relation: AllenRelation.fromString<AllenRelation>('M') },
    {
      i1: { start: pts[1] },
      i2: { end: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('pmoFDseSdfO')
    },

    {
      i1: { end: pts[1] },
      i2: { start: pts[0] },
      relation: AllenRelation.fromString<AllenRelation>('oFDseSdfOMP')
    },
    { i1: { end: pts[1] }, i2: { start: pts[1] }, relation: AllenRelation.fromString<AllenRelation>('m') },
    { i1: { end: pts[1] }, i2: { start: pts[2] }, relation: AllenRelation.fromString<AllenRelation>('p') },

    { i1: { end: pts[1] }, i2: { end: pts[0] }, relation: AllenRelation.fromString<AllenRelation>('DSOMP') },
    { i1: { end: pts[1] }, i2: { end: pts[1] }, relation: AllenRelation.fromString<AllenRelation>('Fef') },
    { i1: { end: pts[1] }, i2: { end: pts[2] }, relation: AllenRelation.fromString<AllenRelation>('pmosd') },

    { i1: {}, i2: { start: pts[0], end: pts[1] }, relation: AllenRelation.fullRelation<AllenRelation>() },

    /* 3 definite */
    // i1 start indefinite
    {
      i1: { end: pts[1] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('p')
    },
    {
      i1: { end: pts[1] },
      i2: { start: pts[1], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('m')
    },
    {
      i1: { end: pts[2] },
      i2: { start: pts[1], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('osd')
    },
    {
      i1: { end: pts[3] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('Fef')
    },
    {
      i1: { end: pts[3] },
      i2: { start: pts[1], end: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('DSOMP')
    },
    // i1 end indefinite
    {
      i1: { start: pts[0] },
      i2: { start: pts[2], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('pmoFD')
    },
    {
      i1: { start: pts[0] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('seS')
    },
    {
      i1: { start: pts[1] },
      i2: { start: pts[0], end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('dfO')
    },
    {
      i1: { start: pts[1] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('M')
    },
    {
      i1: { start: pts[2] },
      i2: { start: pts[0], end: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('P')
    },
    // i2 start indefinite
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('pmosd')
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { end: pts[3] },
      relation: AllenRelation.fromString<AllenRelation>('Fef')
    },
    {
      i1: { start: pts[0], end: pts[3] },
      i2: { end: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('DSO')
    },
    {
      i1: { start: pts[1], end: pts[2] },
      i2: { end: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('M')
    },
    {
      i1: { start: pts[2], end: pts[3] },
      i2: { end: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('P')
    },
    // i2 end indefinite
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[2] },
      relation: AllenRelation.fromString<AllenRelation>('p')
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('m')
    },
    {
      i1: { start: pts[0], end: pts[2] },
      i2: { start: pts[1] },
      relation: AllenRelation.fromString<AllenRelation>('oFD')
    },
    {
      i1: { start: pts[0], end: pts[1] },
      i2: { start: pts[0] },
      relation: AllenRelation.fromString<AllenRelation>('seS')
    },
    {
      i1: { start: pts[1], end: pts[2] },
      i2: { start: pts[0] },
      relation: AllenRelation.fromString<AllenRelation>('dfOMP')
    },

    /* 4 definite → 13 basic relations */
    { i1: { start: pts[0], end: pts[1] }, i2: { start: pts[2], end: pts[3] }, relation: AllenRelation.PRECEDES },
    { i1: { start: pts[0], end: pts[1] }, i2: { start: pts[1], end: pts[3] }, relation: AllenRelation.MEETS },
    { i1: { start: pts[0], end: pts[2] }, i2: { start: pts[1], end: pts[3] }, relation: AllenRelation.OVERLAPS },
    { i1: { start: pts[0], end: pts[3] }, i2: { start: pts[2], end: pts[3] }, relation: AllenRelation.FINISHED_BY },
    { i1: { start: pts[0], end: pts[3] }, i2: { start: pts[1], end: pts[2] }, relation: AllenRelation.CONTAINS },
    { i1: { start: pts[0], end: pts[1] }, i2: { start: pts[0], end: pts[3] }, relation: AllenRelation.STARTS },
    { i1: { start: pts[0], end: pts[1] }, i2: { start: pts[0], end: pts[1] }, relation: AllenRelation.EQUALS },
    { i1: { start: pts[0], end: pts[3] }, i2: { start: pts[0], end: pts[2] }, relation: AllenRelation.STARTED_BY },
    { i1: { start: pts[1], end: pts[2] }, i2: { start: pts[0], end: pts[3] }, relation: AllenRelation.DURING },
    { i1: { start: pts[1], end: pts[3] }, i2: { start: pts[0], end: pts[3] }, relation: AllenRelation.FINISHES },
    {
      i1: { start: pts[1], end: pts[3] },
      i2: { start: pts[0], end: pts[2] },
      relation: AllenRelation.OVERLAPPED_BY
    },
    { i1: { start: pts[1], end: pts[2] }, i2: { start: pts[0], end: pts[1] }, relation: AllenRelation.MET_BY },
    { i1: { start: pts[2], end: pts[3] }, i2: { start: pts[0], end: pts[1] }, relation: AllenRelation.PRECEDED_BY },

    /* test with null */
    { i1: { start: null }, i2: { end: pts[0] }, relation: AllenRelation.fullRelation<AllenRelation>() }
  ]
}
