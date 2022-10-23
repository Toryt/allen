import { A, B, C } from './_someClasses'

export const stuff: unknown[] = [
  true,
  false,
  0,
  1,
  Math.PI,
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
