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

import { isReferenceIntervals, ReferencedInterval, ReferenceIntervals } from './Interval'
import { Comparator } from './Comparator'
import assert, { equal, ok } from 'assert'
import { compareIntervals } from './compareIntervals'
import { commonTypeRepresentation } from './TypeRepresentation'

const haveCommonType: string = 'all `start` and `end` values of all intervals must be of a common type'

/**
 * Turn a {@link ReferenceIntervals} instance into an array of {@link ReferencedInterval} instances, ordered with
 * {@link compareIntervals} on their `interval` values.
 */
export function transposeAndOrder<T> (
  sources: Readonly<ReferenceIntervals<T>>,
  compareFn?: Comparator<T>
): ReadonlyArray<Readonly<ReferencedInterval<T>>> {
  equal(typeof sources, 'object')
  ok(sources)
  assert(compareFn === undefined || typeof compareFn === 'function')

  // use for .. in, because we also need the inherited properties
  let transposed: Array<Readonly<ReferencedInterval<T>>> = []
  for (const reference in sources) {
    const referenceTransposed: ReadonlyArray<Readonly<ReferencedInterval<T>>> = sources[reference].map(interval => ({
      interval,
      reference
    }))
    transposed = transposed.concat(referenceTransposed)
  }

  const cType = commonTypeRepresentation(
    ...transposed.reduce((acc: unknown[], { interval: { start, end } }: Readonly<ReferencedInterval<T>>): unknown[] => {
      acc.push(start)
      acc.push(end)
      return acc
    }, [])
  )

  assert(cType !== false, haveCommonType)
  assert(isReferenceIntervals(sources, cType, compareFn))

  function compareReferencedIntervals (
    ri1: Readonly<ReferencedInterval<T>>,
    ri2: Readonly<ReferencedInterval<T>>
  ): number {
    return compareIntervals(ri1.interval, ri2.interval, compareFn)
  }

  return transposed.sort(compareReferencedIntervals)
}
