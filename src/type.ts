import { Constructor, TypeRepresentation } from './typeRepresentation'

export type TypeFor<
  T extends TypeRepresentation
> = /* prettier-ignore */ T extends 'number'
  ? number
  : T extends 'bigint'
    ? bigint
    : T extends 'string'
      ? string
      : T extends 'boolean'
        ? boolean
        : T extends 'symbol'
          ? symbol
          : T extends Constructor<Object>
            ? InstanceType<T>
            : never

/**
 * The super type of a specific type of point `T`, or `undefined` or `null`, to
 * express “don't know 🤷”.
 *
 * We advise against using `null`. Use `undefined` to express “don't know 🤷”.
 */
export type Indefinite<T> = T | undefined | null
