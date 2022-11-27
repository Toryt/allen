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

import { Constructor, TypeRepresentation } from './TypeRepresentation'

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
