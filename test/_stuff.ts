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

export const stuff: unknown[] = [
  true,
  false,
  0,
  1,
  Math.PI,
  NaN,
  -7,
  '',
  'a string',
  Symbol('stuff symbol'),
  {},
  new Date(2022, 10, 23, 13, 48, 44, 345),
  [],
  () => 'an arrow function',
  function aFunction () {
    return 5
  },
  Date,
  Function,
  Object,
  A,
  new A(),
  B,
  new B(),
  C,
  new C(),
  null
]

export const stuffWithUndefined = stuff.concat([undefined])
