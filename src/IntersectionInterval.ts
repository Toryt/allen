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

import { Interval } from './Interval'

export interface IntersectionSources<T> {
  [origin: string]: ReadonlyArray<Interval<T>>
}

/**
 * An `IntersectionInterval` is an {@link Interval} that refers to the {@link Interval}s it is the intersection of.
 */
export type IntersectionInterval<
  T,
  I extends IntersectionSources<T>
> = /* prettier-ignore */ Interval<T> &
{
  [Source in keyof I]: Interval<T>
}
