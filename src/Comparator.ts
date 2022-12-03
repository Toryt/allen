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

/**
 * Function with the traditional comparison semantics.
 *
 * * a negative number is returned when `t1` is considered smaller than `t2`,
 * * a positive number is returned when `t1` is considered larger than `t2`, and
 * * `0` when `t1` and `t2` are considered equal
 *
 * The function is never called with indefinite points (`t1` and `t2` are never `undefined` or `null`).
 *
 * We cannot use `ReadOnly<T>` as type for the arguments, because `ltCompare` allows `unknown`.
 */
export type Comparator<T> = (t1: T, t2: T) => number
