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

import { A, B, C } from './_someClasses'

export const dontKnowCases = [undefined, null]

export const primitiveCases = [
  Number.NEGATIVE_INFINITY,
  Number.MIN_VALUE,
  Number.MIN_SAFE_INTEGER,
  -34,
  0,
  Number.EPSILON,
  1,
  Math.LN2,
  Math.PI,
  45,
  Number.MAX_SAFE_INTEGER,
  Number.MAX_VALUE,
  Number.POSITIVE_INFINITY,
  NaN,
  -895672890643709647309687348967934n,
  -34n,
  -1n,
  0n,
  1n,
  89679867134989671398678136983476983476982679234n,
  'a string',
  '   an untrimmed string    ',
  '',
  true,
  false,
  Number(4),
  BigInt(4),
  String('a wrapped string'),
  Boolean(false),
  Symbol('abc')
]

export const objectCases = [
  new Date(89673548),
  {},
  { a: 'an object' },
  [],
  [1, 2],
  [1, {}],
  Math,
  JSON,
  new A(),
  new B(),
  new C(),
  function () {
    return true
  },
  (a: string) => a + '!',
  Number,
  BigInt,
  String,
  Boolean,
  Array,
  Date,
  Object
]

export const pointCases = (dontKnowCases as unknown[]).concat(primitiveCases).concat(objectCases)
