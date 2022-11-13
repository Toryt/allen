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

import { primitiveTypeRepresentations, TypeRepresentation } from '../src/typeRepresentation'
import { A, B, C } from './_someClasses'

const pptsAsTypeRepresentations: readonly TypeRepresentation[] = primitiveTypeRepresentations

export const typeRepresentations: TypeRepresentation[] = pptsAsTypeRepresentations.concat([
  Object,
  Date,
  A,
  B,
  C,
  Function
])

export function notAConstructor1 (): string {
  return 'not a constructor 1'
}

notAConstructor1.prototype.constructor = A

export function notAConstructor2 (): string {
  return 'not a constructor 2'
}

notAConstructor2.prototype = Object.prototype

export const idiotTypeRepresentations = [
  null,
  'undefined',
  'object',
  'function',
  'another string',
  '',
  43,
  890623470896376978306924906437890634n,
  true,
  false,
  Symbol('not a point type representation'),
  {},
  new A(9),
  [],
  [1, 2, 3],
  notAConstructor1,
  notAConstructor2,
  () => 43
]
