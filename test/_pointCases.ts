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
  new A(17),
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

export const sixNumbers = [-6, -4.983458, -1, 2, Math.PI, 23455]
export const sixStrings = ['a smallest', 'b less small', 'c medium', 'd larger', 'e largest', 'f super']
export const sixDates = [
  new Date(2006, 9, 3, 19, 49, 34, 848),
  new Date(2011, 9, 3, 19, 49, 34, 848),
  new Date(2015, 9, 3, 19, 49, 34, 848),
  new Date(2018, 9, 3, 19, 49, 34, 848),
  new Date(2022, 9, 3, 19, 49, 34, 848),
  new Date(2048, 9, 3, 19, 49, 34, 848)
]
export const sixArrays = sixNumbers.map(p => [p])
export function generateSixSymbols(discriminator: string): symbol[] {
  return sixStrings.map(s => Symbol(`${s} ${discriminator}`))
}
