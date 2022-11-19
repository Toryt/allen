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

import assert from 'assert'
import { Relation } from './Relation'
import { basicRelationBitPatterns, relationBitPatterns, reverse } from './bitPattern'
import { Interval } from './Interval'
import { Comparator } from './comparator'
import { Indefinite } from './type'
import { getCompareIfOk } from './getCompareIfOk'

/**
 * Support for reasoning about Allen relations, i.e., relations between intervals, and constraints on those relations.
 *
 * **We strongly advise to use this class when working with relations between intervals. Reasoning about relations
 * between intervals is treacherously difficult.**
 */
export class AllenRelation extends Relation {
  public static readonly NR_OF_BITS = 13
  public static readonly BASIC_REPRESENTATIONS = Object.freeze([
    'p',
    'm',
    'o',
    'F',
    'D',
    's',
    'e',
    'S',
    'd',
    'f',
    'O',
    'M',
    'P'
  ] as const)

  /**
   * All possible Allen relations.
   *
   * ### Invariants
   *
   * ```
   * Array.isArray(RELATIONS)
   * RELATIONS.length === NR_OF_RELATIONS
   * RELATIONS.every(gr => gr instanceof AllenRelation)
   * RELATIONS.every((gr1, i1) => RELATIONS.every((gr2, i2) => i2 <= i1 || gr1 !== gr2))
   * ```
   *
   * There are no other `AllenRelation`s than the instances of this array.
   */
  public static readonly RELATIONS: readonly AllenRelation[] = Object.freeze(
    relationBitPatterns(this.NR_OF_BITS).map(bitPattern => new AllenRelation(bitPattern))
  )

  /**
   * All possible basic Allen relations.
   *
   * This is an _orthogonal basis_ for all Allen relations.
   *
   * ### Invariants
   *
   * ```
   * Array.isArray(BASIC_RELATIONS)
   * BASIC_RELATIONS.length === 5
   * BASIC_RELATIONS.every(br => br instanceof AllenRelation)
   * BASIC_RELATIONS.every(br => RELATIONS.includes(br))
   * BASIC_RELATIONS.every((br1, i1) =>
   *   BASIC_RELATIONS.every((br2, i2) => i2 <= i1 || br1 !== br2 && !br1.implies(br2) && !br2.implies(br1)))
   * ```
   *
   * There are no other basic `AllenRelation`s than the instances of this array.
   */
  public static readonly BASIC_RELATIONS: readonly AllenRelation[] = Object.freeze(
    basicRelationBitPatterns(this.NR_OF_BITS).map(bitPattern => AllenRelation.RELATIONS[bitPattern])
  )

  /* region basic relations */
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * A _basic_ Allen relation that says that an interval `i1` _precedes_ an interval `i2`, i.e., the `end` of `i1` is
   * before the `start` of `i2`.
   *
   * ```
   * i1.end ≠ undefined ∧ i2.start ≠ undefined ∧ i1.end < i2.start
   * ```
   *
   * ![precedes](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-precedes.png)
   *
   * The short representation of this Allen relation is `p`. The converse of this relation is {@link PRECEDED_BY}.
   */
  static readonly PRECEDES: AllenRelation = AllenRelation.BASIC_RELATIONS[0]
  // Bit pattern: 1 = '0000000000001'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _meets_ an interval `i2`, i.e., the `end` of `i1` is the
   * `start` of `i2`.
   *
   * ```
   * i1.end ≠ undefined ∧ i2.start ≠ undefined ∧ i1.end = i2.start
   * ```
   *
   * ![meets](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-meets.png)
   *
   * The short representation of this Allen relation is `m`. The converse of this relation is {@link MET_BY}.
   */
  static readonly MEETS: AllenRelation = AllenRelation.BASIC_RELATIONS[1]
  // Bit pattern: 2 = '0000000000010'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _overlaps_ an interval `i2`, i.e.,
   *
   * - the `start` of `i1` is before the `start` of `i2`,
   * - the `end` of `i1` is after the `start` of `i2`, and before the `end` of `i2`
   *
   * ```
   * i1.start ≠ undefined ∧ i1.end ≠ undefined ∧ i2.start ≠ undefined ∧ i2.end ≠ undefined ∧
   *   i1.start < i2.start ∧ i2.start < i1.end ∧ i1.end < i2.end
   * ```
   *
   * ![overlaps](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-overlaps.png)
   *
   * The short representation of this Allen relation is `o`. The converse of this relation is {@link OVERLAPPED_BY}.
   */
  static readonly OVERLAPS: AllenRelation = AllenRelation.BASIC_RELATIONS[2]
  // Bit pattern: 4 = '0000000000100'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _is finished by_ an interval `i2`, i.e.,
   *
   * - the `start` of `i1` is before the `start` of `i2`, and
   * - the `end` of `i1` is the `end` of `i2`
   *
   * ```
   * i1.start ≠ undefined ∧ i1.end ≠ undefined ∧ i2.start ≠ undefined ∧ i2.end ≠ undefined ∧
   *   (i1.start < i2.start) ∧ (i1.end = i2.end)
   * ```
   *
   * ![is finished by](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-finishedBy.png)
   *
   * The short representation of this Allen relation is `F`. The converse of this relation is {@link FINISHES}.
   */
  static readonly FINISHED_BY: AllenRelation = AllenRelation.BASIC_RELATIONS[3]
  // Bit pattern: 8 = '0000000001000'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _contains_ an interval `i2`, i.e.,
   *
   * - the `start` of `i1` is before the `start` of `i2`, and
   * - the `end` of `i1` is after the `end` of `i2`
   *
   * ```
   * i1.start ≠ undefined ∧ i1.end ≠ undefined ∧ i2.start ≠ undefined ∧ i2.end ≠ undefined ∧
   *   i1.start < i2.start ∧ i2.end < i1.end
   * ```
   *
   * ![contains](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-contains.png)
   *
   * The short representation of this Allen relation is `D`. The converse of this relation is {@link DURING}.
   */
  static readonly CONTAINS: AllenRelation = AllenRelation.BASIC_RELATIONS[4]
  // Bit pattern: 16 = '0000000010000'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _starts_ an interval `i2`, i.e.,
   *
   * - the `start` of `i1` is the `start` of `i2`, and
   * - the `end` of `i1` is before the `end` of `i2`
   *
   * ```
   * i1.start ≠ undefined ∧ i1.end ≠ undefined ∧ i2.start ≠ undefined ∧ i2.end ≠ undefined ∧
   *   i1.start = i2.start ∧ i1.end < i2.end
   * ```
   *
   * ![starts](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-starts.png)
   *
   * The short representation of this Allen relation is `s`. The converse of this relation is {@link STARTED_BY}.
   */
  static readonly STARTS: AllenRelation = AllenRelation.BASIC_RELATIONS[5]
  // Bit pattern: 32 = '0000000100000'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _is equal to_ an interval `i2`, i.e.,
   *
   * - the `start` of `i1` is the `start` of `i2`, and
   * - the `end` of `i1` is the `end` of `i2`
   *
   * ```
   * i1.start ≠ undefined ∧ i1.end ≠ undefined ∧ i2.start ≠ undefined ∧ i2.end ≠ undefined ∧
   *   i1.start = i2.start ∧ i1.end = i2.end
   * ```
   *
   * ![equals](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-equals.png)
   *
   * The short representation of this Allen relation is `e`. The converse of this relation is itself.
   */
  static readonly EQUALS: AllenRelation = AllenRelation.BASIC_RELATIONS[6]
  // Bit pattern: 64 = '0000001000000'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _started by_ an interval `i2`, i.e.,
   *
   * - the `start` of `i1` is the `start` of `i2`, and
   * - the `end` of `i1` is after the `end` of `i2`
   *
   * ```
   * i1.start ≠ undefined ∧ i1.end ≠ undefined ∧ i2.start ≠ undefined ∧ i2.end ≠ undefined ∧
   *   i1.start = i2.start ∧ (i2.end < i1.end)
   * ```
   *
   * ![is started by](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-startedBy.png)
   *
   * The short representation of this Allen relation is `S`. The converse of this relation is {@link STARTS}.
   */
  static readonly STARTED_BY: AllenRelation = AllenRelation.BASIC_RELATIONS[7]
  // Bit pattern: 128 = '0000010000000'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _is during_ an interval `i2`, i.e.,
   *
   * - the `start` of `i1` is after the `start` of `i2`, and
   * - the `end` of `i1` is before the `end` of `i2`
   *
   * ```
   * i1.start ≠ undefined ∧ i1.end ≠ undefined ∧ i2.start ≠ undefined ∧ i2.end ≠ undefined ∧
   *   i2.start < i1.start ∧ i1.end < i2.end
   * ```
   *
   * ![is during](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-during.png)
   *
   * The short representation of this Allen relation is `d`. The converse of this relation is {@link CONTAINS}.
   */
  static readonly DURING: AllenRelation = AllenRelation.BASIC_RELATIONS[8]
  // Bit pattern: 256 = '0000100000000'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _finishes_ an interval `i2`, i.e.,
   *
   * - the `start` of `i1` is after the `start` of `i2`, and
   * - the `end` of `i1` is the `end` of `i2`
   *
   * ```
   * i1.start ≠ undefined ∧ i1.end ≠ undefined ∧ i2.start ≠ undefined ∧ i2.end ≠ undefined ∧
   *   i2.start < i1.start ∧ i1.end = i2.end
   * ```
   *
   * ![finishes](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-finishes.png)
   *
   * The short representation of this Allen relation is `f`. The converse of this relation is {@link FINISHED_BY}.
   */
  static readonly FINISHES: AllenRelation = AllenRelation.BASIC_RELATIONS[9]
  // Bit pattern: 512 = '0001000000000'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _is overlapped by_ an interval `i2`, i.e.,
   *
   * - the `start` of `i1` is after the `start` of `i2`, and before the `end` of `i2`, and
   * - the `end` of `i1` is after the `end` of `i2`
   *
   * ```
   * i1.start ≠ undefined ∧ i1.end ≠ undefined ∧ i2.start ≠ undefined ∧ i2.end ≠ undefined ∧
   *   i2.start < i1.start ∧ i1.start < i2.end ∧ i2.end < i1.end
   * ```
   *
   * ![is overlapped by](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-overlappedBy.png)
   *
   * The short representation of this Allen relation is `O`. The converse of this relation is {@link OVERLAPS}.
   */
  static readonly OVERLAPPED_BY: AllenRelation = AllenRelation.BASIC_RELATIONS[10]
  // Bit pattern: 1024 = '0010000000000'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _is met by_ an interval `i2`, i.e., the `start` of `i1` is
   * the `end` of `i2`.
   *
   * ```
   * i1.start ≠ undefined ∧ i2.end ≠ undefined ∧ i1.start = i2.end
   * ```
   *
   * ![is met by](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-metBy.png)
   *
   * The short representation of this Allen relation is `M`. The converse of this relation is {@link MEETS}.
   */
  static readonly MET_BY: AllenRelation = AllenRelation.BASIC_RELATIONS[11]
  // Bit pattern: 2048 = '0100000000000'

  /**
   * A _basic_ Allen relation that says that an interval `i1` _is preceded by_ an interval `i2`, i.e., the `start` of
   * `i1` is after the `end` of `i2`.
   *
   * ```
   * i1.start ≠ undefined ∧ i2.end ≠ undefined ∧ i2.end < i1.start
   * ```
   *
   * ![is preceded by](https://bitbucket.org/toryt/allen/raw/c00cab429681246b7718a462b94c4a68094e967c/doc/AllenRelation-precededBy.png)
   *
   * The short representation of this Allen relation is `P`. The converse of this relation is {@link PRECEDES}.
   */
  static readonly PRECEDED_BY: AllenRelation = AllenRelation.BASIC_RELATIONS[12]
  // Bit pattern: 4069 = '1000000000000'

  /* endregion */

  /* region secondary relations */
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * `(oFDseSdfO)` — a non-basic interval relation that is often handy to use, which expresses that and interval `i1`
   * and an interval `i2` are concurrent in some way.
   *
   * Thus, `i1` does _not_ {@link PRECEDES precede} `I`, does _not_ {@link MEETS meet} `I`, is _not_ {@link MET_BY}, and
   * is _not_ {@link PRECEDED_BY} `i2`.
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * CONCURS_WITH = or(OVERLAPS, FINISHED_BY, CONTAINS, STARTS, EQUALS, STARTED_BY, DURING, FINISHES, OVERLAPPED_BY)
   * ```
   */
  static readonly CONCURS_WITH: AllenRelation = AllenRelation.or(
    AllenRelation.OVERLAPS,
    AllenRelation.FINISHED_BY,
    AllenRelation.CONTAINS,
    AllenRelation.STARTS,
    AllenRelation.EQUALS,
    AllenRelation.STARTED_BY,
    AllenRelation.DURING,
    AllenRelation.FINISHES,
    AllenRelation.OVERLAPPED_BY
  )

  /**
   * `(pmoFD)` — a non-basic interval relation that is often handy to use, which expresses that an interval `i1` starts
   * earlier then an interval `i2`.
   *
   * ```
   * (i1.start ≠ undefined) ∧ (i2.start ≠ undefined) ∧ (i1.start < i2.start)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * STARTS_EARLIER = or(PRECEDES, MEETS, OVERLAPS, FINISHED_BY, CONTAINS)
   * ```
   */
  static readonly STARTS_EARLIER: AllenRelation = AllenRelation.or(
    AllenRelation.PRECEDES,
    AllenRelation.MEETS,
    AllenRelation.OVERLAPS,
    AllenRelation.FINISHED_BY,
    AllenRelation.CONTAINS
  )

  /**
   * `(seS)` — a non-basic interval relation that is often handy to use, which expresses that and interval `i1` and an
   * interval `i2` start at the same point.
   *
   * ```
   * (i1.start ≠ undefined) ∧ (i2.start ≠ undefined) ∧ (i1.start = i2.start)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * START_TOGETHER == or(STARTS, EQUALS, STARTED_BY)
   * ```
   */
  static readonly START_TOGETHER: AllenRelation = AllenRelation.or(
    AllenRelation.STARTS,
    AllenRelation.EQUALS,
    AllenRelation.STARTED_BY
  )

  /**
   * `(dfOMP)` — a non-basic interval relation that is often handy to use, which expresses that an interval `i1` starts
   * after an interval `i2`.
   *
   * ```
   * (i1.start ≠ undefined) ∧ (i2.start ≠ undefined) ∧ (i2.start < i1.start)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * STARTS_LATER == or(DURING, FINISHES, OVERLAPPED_BY, MET_BY, PRECEDED_BY)
   * ```
   */
  static readonly STARTS_LATER: AllenRelation = AllenRelation.or(
    AllenRelation.DURING,
    AllenRelation.FINISHES,
    AllenRelation.OVERLAPPED_BY,
    AllenRelation.MET_BY,
    AllenRelation.PRECEDED_BY
  )

  /**
   * `(dfO)` — a non-basic interval relation that is often handy to use, which expresses that an interval `i1` starts in
   * an interval `i2`.
   *
   * ```
   * (i1.start ≠ undefined) ∧ (i2.start ≠ undefined) ∧ (i2.end ≠ undefined) ∧ (i2.start < i1.start < i2.end)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * STARTS_IN == or(DURING, FINISHES, OVERLAPPED_BY)
   * ```
   */
  static readonly STARTS_IN: AllenRelation = AllenRelation.or(
    AllenRelation.DURING,
    AllenRelation.FINISHES,
    AllenRelation.OVERLAPPED_BY
  )

  /**
   * `(pmo)` — a non-basic interval relation that is often handy to use, which expresses that an interval `i1` starts
   * and ends before an interval `i2` starts and ends.
   *
   * ```
   * (i1.start ≠ undefined) ∧ (i2.start ≠ undefined) ∧ (i1.end ≠ undefined) ∧ (i2.end ≠ undefined) ∧
   *   (i1.start < i2.start) ∧ (i1.end < i2.end)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * STARTS_EARLIER_AND_ENDS_EARLIER == or(PRECEDES, MEETS, OVERLAPS)
   * ```
   */
  static readonly STARTS_EARLIER_AND_ENDS_EARLIER: AllenRelation = AllenRelation.or(
    AllenRelation.PRECEDES,
    AllenRelation.MEETS,
    AllenRelation.OVERLAPS
  )

  /**
   * `(OMP)` — a non-basic interval relation that is often handy to use, which expresses that an interval `i1` starts
   * and ends after an interval `i2` starts and ends.
   *
   * ```
   * (i1.start ≠ undefined) ∧ (i2.start ≠ undefined) ∧ (i1.end ≠ undefined) ∧ (i2.end ≠ undefined) ∧
   *   (i2.start < i1.start) ∧ (i2.end < i1.end)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * STARTS_LATER_AND_ENDS_LATER == or(OVERLAPPED_BY, MET_BY, PRECEDED_BY)
   * ```
   */
  static readonly STARTS_LATER_AND_ENDS_LATER: AllenRelation = AllenRelation.or(
    AllenRelation.OVERLAPPED_BY,
    AllenRelation.MET_BY,
    AllenRelation.PRECEDED_BY
  )

  /**
   * `(pmosd)` — a non-basic interval relation that is often handy to use, which expresses that interval `i1` ends
   * before an interval `i2` ends.
   *
   * ```
   * (i1.end ≠ undefined) ∧ (i2.end ≠ undefined) ∧ (i1.end < i2.end)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * ENDS_EARLIER == or(PRECEDES, MEETS, OVERLAPS, STARTS, DURING)
   * ```
   */
  static readonly ENDS_EARLIER: AllenRelation = AllenRelation.or(
    AllenRelation.PRECEDES,
    AllenRelation.MEETS,
    AllenRelation.OVERLAPS,
    AllenRelation.STARTS,
    AllenRelation.DURING
  )

  /**
   * `(osd)` — a non-basic interval relation that is often handy to use, which expresses that an interval `i1` ends in
   * an interval `i2`.
   *
   * ```
   * (i1.start ≠ undefined) ∧ (i2.start ≠ undefined) ∧ (i2.end ≠ undefined) ∧ (i2.start < i1.end < i2.end)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * ENDS_IN == or(OVERLAPS, STARTS, DURING)
   * ```
   */
  static readonly ENDS_IN: AllenRelation = AllenRelation.or(
    AllenRelation.OVERLAPS,
    AllenRelation.STARTS,
    AllenRelation.DURING
  )

  /**
   * `(Fef)` — a non-basic interval relation that is often handy to use, which expresses that interval `i1` and an
   * interval `i2` end at the same point.
   *
   * ```
   * (i1.end ≠ undefined) ∧ (i2.end ≠ undefined) ∧ (i1.end = i2.end)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * END_TOGETHER == or(FINISHED_BY, EQUALS, FINISHES)
   * ```
   */
  static readonly END_TOGETHER: AllenRelation = AllenRelation.or(
    AllenRelation.FINISHED_BY,
    AllenRelation.EQUALS,
    AllenRelation.FINISHES
  )

  /**
   * `(DSOMP)` — a non-basic interval relation that is often handy to use, which expresses that interval `i1` ends after
   * an interval `i2` ends.
   *
   * ```
   * (i1.end ≠ undefined) ∧ (i2.end ≠ undefined) ∧ (i2.end < i1.end)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * ENDS_LATER == or(CONTAINS, STARTED_BY, OVERLAPPED_BY, MET_BY, PRECEDED_BY)
   * ```
   */
  static readonly ENDS_LATER: AllenRelation = AllenRelation.or(
    AllenRelation.CONTAINS,
    AllenRelation.STARTED_BY,
    AllenRelation.OVERLAPPED_BY,
    AllenRelation.MET_BY,
    AllenRelation.PRECEDED_BY
  )

  /**
   * `(oFD)` — a non-basic interval relation that is often handy to use, which expresses that an interval `i1` contains
   * the start of an interval `i2`.
   *
   * ```
   * (i1.start ≠ undefined) ∧ (i1.end ≠ undefined) ∧ (i2.start ≠ undefined) ∧ (i1.start < i2.start < i1.end)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * CONTAINS_START == or(OVERLAPS, FINISHED_BY, CONTAINS)
   * ```
   */
  static readonly CONTAINS_START: AllenRelation = AllenRelation.or(
    AllenRelation.OVERLAPS,
    AllenRelation.FINISHED_BY,
    AllenRelation.CONTAINS
  )

  /**
   * `(DSO)` — a non-basic interval relation that is often handy to use, which expresses that an interval `i1`
   * contains the end of an interval `i2`.
   *
   * ```
   * (i1.start ≠ undefined) ∧ (i1.end ≠ undefined) ∧ (i2.end ≠ undefined) ∧ (i1.start < i2.end < i1.end)
   * ```
   *
   * This relation is introduced because it is the possible result of the composition of 2 basic relations.
   *
   * ### Invariants
   *
   * ```ts
   * CONTAINS_END == or(CONTAINS, STARTED_BY, OVERLAPPED_BY)
   * ```
   */
  static readonly CONTAINS_END: AllenRelation = AllenRelation.or(
    AllenRelation.CONTAINS,
    AllenRelation.STARTED_BY,
    AllenRelation.OVERLAPPED_BY
  )

  /**
   * `(FDeS)` — a non-basic interval relation that is often handy to use, which expresses that an interval `i1`
   * encloses an interval `i2`.
   *
   * ```
   * (i1.start ≠ undefined) ∧ (i1.end ≠ undefined) ∧ (i2.end ≠ undefined) ∧ (i1.start ≤ i2.start) ∧ (i2.end ≤ i1.end)
   * ```
   *
   * ### Invariants
   *
   * ```ts
   * CONTAINS_END == or(CONTAINS, STARTED_BY, OVERLAPPED_BY)
   * ```
   */
  static readonly ENCLOSES: AllenRelation = AllenRelation.or(
    AllenRelation.FINISHED_BY,
    AllenRelation.CONTAINS,
    AllenRelation.EQUALS,
    AllenRelation.STARTED_BY
  )

  /* endregion */

  /**
   * The _converse_ of a relation `x1 ⊡ x2` between to values of the same type `x1` and `x2` is the relation `x2 ⊡ x1`:
   *
   * ```ts
   * compare(x2, x3).converse() === compare(x1, x2)
   * ```
   *
   * This makes little sense if the relation is between values of different types.
   *
   * The converse of a basic relation is defined. The converse of a general relation _gr_ is the disjunction of the
   * converse relations of the basic relations that are implied by _gr_.
   *
   * ### Invariants
   *
   * ```ts
   * this.converse().converse() === this
   * this.converse() === BASIC_RELATIONS[NR_OF_BITS - this.ordinal()]
   * BASIC_RELATIONS.every(br => !this.impliedBy(br) || this.converse().impliedBy(br.converse()))
   * ```
   */
  converse (): AllenRelation {
    /* Given the order in which the basic relations occur in the bit pattern, the converse is the reverse bit pattern
       (read the bit pattern from left to right instead of right to left). We need to add a `32 - NR_OF_BITS` bit shift
       to compensate for the fact that we store the `NR_OF_BITS` bit bitpattern in a 32 bit int. */
    return this.typedConstructor().RELATIONS[reverse(this.nrOfBits(), this.bitPattern)]
  }

  /**
   * This matrix holds the compositions of basic interval relations. These are part of the given semantics, and cannot
   * be calculated. See {@link compose}.
   */
  static readonly BASIC_COMPOSITIONS: AllenRelation[][] = [
    [
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.fullRelation<AllenRelation>()
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.MEETS,
      AllenRelation.MEETS,
      AllenRelation.MEETS,
      AllenRelation.ENDS_IN,
      AllenRelation.ENDS_IN,
      AllenRelation.ENDS_IN,
      AllenRelation.END_TOGETHER,
      AllenRelation.ENDS_LATER
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.STARTS_EARLIER_AND_ENDS_EARLIER,
      AllenRelation.STARTS_EARLIER_AND_ENDS_EARLIER,
      AllenRelation.STARTS_EARLIER,
      AllenRelation.OVERLAPS,
      AllenRelation.OVERLAPS,
      AllenRelation.CONTAINS_START,
      AllenRelation.ENDS_IN,
      AllenRelation.ENDS_IN,
      AllenRelation.CONCURS_WITH,
      AllenRelation.CONTAINS_END,
      AllenRelation.ENDS_LATER
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.MEETS,
      AllenRelation.OVERLAPS,
      AllenRelation.FINISHED_BY,
      AllenRelation.CONTAINS,
      AllenRelation.OVERLAPS,
      AllenRelation.FINISHED_BY,
      AllenRelation.CONTAINS,
      AllenRelation.ENDS_IN,
      AllenRelation.END_TOGETHER,
      AllenRelation.CONTAINS_END,
      AllenRelation.CONTAINS_END,
      AllenRelation.ENDS_LATER
    ],
    [
      AllenRelation.STARTS_EARLIER,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONTAINS,
      AllenRelation.CONTAINS,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONTAINS,
      AllenRelation.CONTAINS,
      AllenRelation.CONCURS_WITH,
      AllenRelation.CONTAINS_END,
      AllenRelation.CONTAINS_END,
      AllenRelation.CONTAINS_END,
      AllenRelation.ENDS_LATER
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.STARTS_EARLIER_AND_ENDS_EARLIER,
      AllenRelation.STARTS_EARLIER_AND_ENDS_EARLIER,
      AllenRelation.STARTS_EARLIER,
      AllenRelation.STARTS,
      AllenRelation.STARTS,
      AllenRelation.START_TOGETHER,
      AllenRelation.DURING,
      AllenRelation.DURING,
      AllenRelation.STARTS_IN,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.MEETS,
      AllenRelation.OVERLAPS,
      AllenRelation.FINISHED_BY,
      AllenRelation.CONTAINS,
      AllenRelation.STARTS,
      AllenRelation.EQUALS,
      AllenRelation.STARTED_BY,
      AllenRelation.DURING,
      AllenRelation.FINISHES,
      AllenRelation.OVERLAPPED_BY,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.STARTS_EARLIER,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONTAINS,
      AllenRelation.CONTAINS,
      AllenRelation.START_TOGETHER,
      AllenRelation.STARTED_BY,
      AllenRelation.STARTED_BY,
      AllenRelation.STARTS_IN,
      AllenRelation.OVERLAPPED_BY,
      AllenRelation.OVERLAPPED_BY,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.PRECEDES,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.ENDS_EARLIER,
      AllenRelation.fullRelation<AllenRelation>(),
      AllenRelation.DURING,
      AllenRelation.DURING,
      AllenRelation.STARTS_LATER,
      AllenRelation.DURING,
      AllenRelation.DURING,
      AllenRelation.STARTS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.PRECEDES,
      AllenRelation.MEETS,
      AllenRelation.ENDS_IN,
      AllenRelation.END_TOGETHER,
      AllenRelation.ENDS_LATER,
      AllenRelation.DURING,
      AllenRelation.FINISHES,
      AllenRelation.STARTS_LATER_AND_ENDS_LATER,
      AllenRelation.DURING,
      AllenRelation.FINISHES,
      AllenRelation.STARTS_LATER_AND_ENDS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.STARTS_EARLIER,
      AllenRelation.CONTAINS_START,
      AllenRelation.CONCURS_WITH,
      AllenRelation.CONTAINS_END,
      AllenRelation.ENDS_LATER,
      AllenRelation.STARTS_IN,
      AllenRelation.OVERLAPPED_BY,
      AllenRelation.STARTS_LATER_AND_ENDS_LATER,
      AllenRelation.STARTS_IN,
      AllenRelation.OVERLAPPED_BY,
      AllenRelation.STARTS_LATER_AND_ENDS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.STARTS_EARLIER,
      AllenRelation.START_TOGETHER,
      AllenRelation.STARTS_IN,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.STARTS_IN,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.STARTS_IN,
      AllenRelation.MET_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY
    ],
    [
      AllenRelation.fullRelation<AllenRelation>(),
      AllenRelation.STARTS_LATER,
      AllenRelation.STARTS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.STARTS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.STARTS_LATER,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY,
      AllenRelation.PRECEDED_BY
    ]
  ]

  /**
   * Given 3 intervals `i1`, `i2`, and `i3`, given `gr1 = relation(i1, i2)` and `gr2 = relation(i2, i3)`,
   * `gr1.compose(gr2) = relation(i1, i2)`.
   *
   * Composition is not commutative but is both left and right associative, and distributes over `or`.
   *
   * Although this method is still, like most other methods in this class, of constant time (_O(1)_), it takes a
   * significant longer constant time, namely ~ 13<sup>2</sup>.
   *
   * ### Preconditions
   *
   * `gr` is of the same type as `this`
   *
   * @result BASIC_RELATIONS.every(br1 => BASIC_RELATIONS.every(br2 => !br1.implies(this) || !br2.implies(gr) || result.impliedBy(BASIC_COMPOSITIONS[br1.ordinal()][br2.ordinal()]))
   */
  compose (gr: AllenRelation): AllenRelation {
    // noinspection SuspiciousTypeOfGuard
    assert(gr instanceof AllenRelation)

    return this.typedConstructor().BASIC_RELATIONS.reduce(
      (acc1: this, br1: this) =>
        /* prettier-ignore */ this.impliedBy(br1)
          ? this.typedConstructor().BASIC_RELATIONS.reduce(
            (acc2: this, br2: this) =>
              gr.impliedBy(br2)
                ? AllenRelation.or(acc2, AllenRelation.BASIC_COMPOSITIONS[br1.ordinal()][br2.ordinal()] as this)
                : acc2,
            acc1
          )
          : acc1,
      this.typedConstructor().emptyRelation()
    )
  }

  /**
   * The relation of `i1` with `i2` with the lowest possible {@link uncertainty}.
   *
   * `undefined` as `iN.start` or `iN.end` is considered as ‘unknown’ 🤷, and thus is not used to restrict the relation
   * more, leaving it with more {@link uncertainty}.
   *
   * This method is key to validating semantic constraints on intervals, using the following idiom:
   *
   * ```ts
   * ...
   * const t: T = ...
   * const i1: Interval<T> = ...
   * const i2: Interval<T> = ...
   * const condition: AllenRelation  = ...
   * const actual: AllenRelation = relation(i1, i2)
   * if (!actual.implies(condition)) {
   *   throw new ....
   * }
   * ...
   * ```
   *
   * This can result in any of only 26 relations, i.e.,
   *
   * - the 13 {@link BASIC_RELATIONS},
   * - `(pmoFDseSdfO)`,
   * - `(pmoFD)`,
   * - `(pmosd)`,
   * - `(osd)`,
   * - `(oFD)`,
   * - `(seS)`,
   * - `(Fef)`,
   * - `(dfO)`,
   * - `(DSO)`,
   * - `(DSOMP)`,
   * - `(dfOMP)`,
   * - `(oFDseSdfOMP)`, or
   * - {@link AllenRelation.fullRelation}.
   */
  static relation<T> (i1: Interval<T>, i2: Interval<T>, compareFn?: Comparator<T>): AllenRelation {
    const compare: Comparator<T> = getCompareIfOk([i1, i2], compareFn)

    const i1Start: Indefinite<T> = i1.start
    const i1End: Indefinite<T> = i1.end
    const i2Start: Indefinite<T> = i2.start
    const i2End: Indefinite<T> = i2.end

    let result: AllenRelation = AllenRelation.fullRelation<AllenRelation>()

    if (i1Start !== undefined && i1Start !== null) {
      if (i2Start !== undefined && i2Start !== null) {
        const compareStart = compare(i1Start, i2Start)
        if (compareStart < 0) {
          result = result.min(AllenRelation.STARTS_EARLIER.complement())
        } else if (compareStart === 0) {
          result = result.min(AllenRelation.START_TOGETHER.complement())
        } else {
          result = result.min(AllenRelation.STARTS_LATER.complement())
        }
      }
      if (i2End !== undefined && i2End !== null) {
        const comparei1StartI2End = compare(i1Start, i2End)
        if (comparei1StartI2End < 0) {
          // pmoFDseSdfO, not MP; begins before end
          result = result.min(AllenRelation.MET_BY)
          result = result.min(AllenRelation.PRECEDED_BY)
        } else {
          /* all paths return (see below) */
          if (comparei1StartI2End === 0) {
            /* Here, the intervals cannot be EQUAL.

               Because of the if's we are in, we know that at this place

               - i1Start !== undefined && i1Start !== null
               - i2End !== undefined && i2End !== null
               - compare(i1Start, i2End) === 0

               which is the definition of i1 MET_BY i2.

               (found by coverage) */
            return AllenRelation.MET_BY
          }
          return AllenRelation.PRECEDED_BY
        }
      }
    }
    if (i1End !== undefined && i1End !== null) {
      if (i2Start !== undefined && i2Start !== null) {
        const compareI1EndI2Start = compare(i1End, i2Start)
        if (compareI1EndI2Start < 0) {
          return AllenRelation.PRECEDES
        } else if (compareI1EndI2Start === 0) {
          /* Here, the intervals cannot be EQUAL.

             Because of the if's we are in, we know that at this place

             - i1End !== undefined && i1End !== null
             - i2Start !== undefined && i2Start !== null
             - compare(i1End, i2Start) === 0

             which is the definition of i1 MEETS i2.

             (found by coverage) */
          return AllenRelation.MEETS
        } else {
          // i1End.after(i2Begin); // not pm, oFDseSdfOMP, ends after start
          result = result.min(AllenRelation.PRECEDES)
          result = result.min(AllenRelation.MEETS)
        }
      }
      if (i2End !== undefined && i2End !== null) {
        const compareI1EndI2End = compare(i1End, i2End)
        if (compareI1EndI2End < 0) {
          result = result.min(AllenRelation.ENDS_EARLIER.complement())
        } else if (compareI1EndI2End === 0) {
          result = result.min(AllenRelation.END_TOGETHER.complement())
        } else {
          result = result.min(AllenRelation.ENDS_LATER.complement())
        }
      }
    }
    return result
  }
}
