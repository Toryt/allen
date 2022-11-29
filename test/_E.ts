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

import { Relation } from '../src/Relation'
import { basicRelationBitPatterns } from '../src/bitPattern'

const RELATIONS_CACHE: E[] = []

export class E extends Relation {
  public static readonly NR_OF_BITS = 3
  public static readonly BASIC_REPRESENTATIONS = Object.freeze(['x', 'y', 'z'] as const)

  public static generalRelation (index: number): E {
    if (RELATIONS_CACHE[index] === undefined) {
      RELATIONS_CACHE[index] = new E(index)
    }
    return RELATIONS_CACHE[index]
  }

  public static readonly X: E = E.generalRelation(1)
  public static readonly Y: E = E.generalRelation(2)
  public static readonly Z: E = E.generalRelation(4)

  public static readonly BASIC_RELATIONS: readonly E[] = Object.freeze(
    basicRelationBitPatterns(this.NR_OF_BITS).map(bitPattern => E.generalRelation(bitPattern))
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
      return this.typedConstructor().generalRelation(this.bitPattern & t.bitPattern)
    }
    return this.typedConstructor().generalRelation(this.bitPattern | t.bitPattern)
  }

  thisParamReturnsE (t: this): E {
    if (this.implies(t)) {
      return this.typedConstructor().generalRelation(this.bitPattern & t.bitPattern)
    }
    return this.typedConstructor().generalRelation(this.bitPattern | t.bitPattern)
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
