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
  new A(),
  [],
  [1, 2, 3],
  notAConstructor1,
  notAConstructor2,
  () => 43
]
