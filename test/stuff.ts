export const stuff: unknown[] = [true, false, 0, 1, Math.PI, -7, '', 'a string', Symbol('stuff symbol'), {}, [], null]

export const stuffWithUndefined = stuff.concat([undefined])
