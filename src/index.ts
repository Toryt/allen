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

export {
  primitiveTypeRepresentations,
  Constructor,
  TypeRepresentation,
  isTypeRepresentation,
  commonTypeRepresentation
} from './typeRepresentation'
export { TypeFor, Indefinite } from './type'
export { Comparator } from './comparator'
export { LTComparablePrimitive, LTComparable, isLTComparableOrIndefinite, ltCompare } from './ltCompare'
export { Interval, isInterval } from './Interval'
export { RelationConstructor, Relation } from './Relation' // ok higher
export { AllenRelation } from './AllenRelation'
export { PointIntervalRelation } from './PointIntervalRelation'
export { isEnclosing, isMinimalEnclosing, minimalEnclosing } from './enclosing'
export { isOrderedSequence } from './sequence'
