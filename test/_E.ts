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

import { Relation } from '../src'
import { basicRelationBitPatterns, relationBitPatterns } from '../src/bitPattern'

export class E extends Relation {
  public static readonly NR_OF_BITS = 3
  public static readonly BASIC_REPRESENTATIONS = Object.freeze(['x', 'y', 'z'] as const)

  public static readonly RELATIONS: readonly E[] = Object.freeze(
    relationBitPatterns(this.NR_OF_BITS).map(bitPattern => new E(bitPattern))
  )

  public static readonly X: E = E.RELATIONS[1]
  public static readonly Y: E = E.RELATIONS[2]
  public static readonly Z: E = E.RELATIONS[4]

  public static readonly BASIC_RELATIONS: readonly E[] = Object.freeze(
    basicRelationBitPatterns(this.NR_OF_BITS).map(bitPattern => E.RELATIONS[bitPattern])
  )

  extraMethod (): number {
    return 4
  }

  noParamReturnsThisType (): this {
    return this.typedConstructor().BASIC_RELATIONS[0]
  }

  noParamReturnsE (): E {
    return E.BASIC_RELATIONS[0]
  }

  thisParamReturnsThisType (t: this): this {
    if (this.implies(t)) {
      return this.typedConstructor().RELATIONS[this.bitPattern & t.bitPattern]
    }
    return this.typedConstructor().RELATIONS[this.bitPattern | t.bitPattern]
  }

  thisParamReturnsE (t: this): E {
    if (this.implies(t)) {
      return this.typedConstructor().RELATIONS[this.bitPattern & t.bitPattern]
    }
    return this.typedConstructor().RELATIONS[this.bitPattern | t.bitPattern]
  }

  // NOTE: This is not possible; t is of type E, but implies requires the `this` type as parameter. In subclasses that
  //       could be the subclass, which is stronger than E. This is only relevant when implies is called inside an
  //       instance method, where there is a `this` type.
  // eParamReturnsE (t: E): E {
  //   if (this.implies(t)) {
  //     return this.typedConstructor().RELATIONS[this.bitPattern & t.bitPattern]
  //   }
  //   return this.typedConstructor().RELATIONS[this.bitPattern | t.bitPattern]
  // }

  public static e (s: string): E {
    return this.fromString<E>(s)
  }
}
