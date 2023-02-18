/*
 Copyright © 2023 by Jan Dockx
 
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

import { AllenRelation } from './AllenRelation'
import assert, { notEqual, ok } from 'assert'
import { EOL } from 'os'

/**
 * Map of interval names to an {@link AllenRelation}.
 *
 * This represents a sparse row in a matrix of {@link AllenRelation} from the interval for which this row is defined to
 * all other intervals named in this object.
 */
type Relations = Record<string, AllenRelation>

/**
 * Map of interval names to a {@link Relations} object.
 *
 * This is a sparse matrix of the {@link AllenRelation} from the interval named here to all other intervals that are
 * later in the `intervals` array.
 */
type IntervalRelations = Record<string, Relations>

interface ToDo {
  i: string
  j: string
  r: AllenRelation
}

/**
 * Maximum lenght of {@link AllenRelation.toString()}, for padding.
 */
const padAR = 15

export class UpdateConflict extends Error {
  public readonly i: string
  public readonly j: string
  public readonly oldIJRelation: AllenRelation
  public readonly newIJRelation: AllenRelation

  constructor(i: string, j: string, oldIJRelation: AllenRelation, newIJRelation: AllenRelation) {
    super(`Conflicting relation update: ${i} -- ${oldIJRelation.toString()} / ${newIJRelation.toString()} -> ${j}`)
    this.i = i
    this.j = j
    this.oldIJRelation = oldIJRelation
    this.newIJRelation = newIJRelation
    Object.setPrototypeOf(this, UpdateConflict.prototype)
  }
}

export class Network {
  private readonly _intervals: string[] = []

  private readonly known: IntervalRelations = {}

  private isEarlierOrUnknownInterval(i: string, j: string): boolean {
    notEqual(i, j)

    const indexI = this._intervals.indexOf(i)
    if (indexI < 0) {
      return true
    }
    const indexJ = this._intervals.indexOf(j)
    if (indexJ < 0) {
      return true
    }
    return indexI < indexJ
  }

  private sparseRead(i: string, j: string): AllenRelation {
    assert(i !== j)
    assert(this.isEarlierOrUnknownInterval(i, j))

    const o: Relations | undefined = this.known[i]

    const result: AllenRelation | undefined = o === undefined ? undefined : o[j]
    return result ?? AllenRelation.FULL
  }

  intervals(): string[] {
    return this._intervals.slice()
  }

  get(i: string, j: string): AllenRelation {
    return i === j
      ? AllenRelation.EQUALS
      : this.isEarlierOrUnknownInterval(i, j)
      ? this.sparseRead(i, j)
      : this.sparseRead(j, i).converse()
  }

  private lazySparseUpdate(i: string, j: string, rij: AllenRelation): void {
    assert(i !== j)
    assert(this.isEarlierOrUnknownInterval(i, j))

    const old = this.get(i, j)
    if (!rij.implies(old)) {
      throw new UpdateConflict(i, j, old, rij)
    }

    if (this.known[i] === undefined) {
      this.known[i] = {}
    }

    const o: Relations | undefined = this.known[i]
    ok(o)

    o[j] = rij
  }

  private update(i: string, j: string, rij: AllenRelation): void {
    if (i === j) {
      return
    }

    if (this.isEarlierOrUnknownInterval(i, j)) {
      this.lazySparseUpdate(i, j, rij)
    } else {
      this.lazySparseUpdate(j, i, rij.converse())
    }
  }

  add(i: string, j: string, r: AllenRelation): void {
    if (!this._intervals.includes(i)) {
      this._intervals.push(i)
    }
    if (!this._intervals.includes(j)) {
      this._intervals.push(j)
    }
    const todos: ToDo[] = []
    todos.push({ i, j, r })
    while (todos.length > 0) {
      const toDo: ToDo | undefined = todos.shift()
      ok(toDo)
      this.update(toDo.i, toDo.j, toDo.r)
      this._intervals.forEach(k => {
        if (k !== toDo.i && k !== toDo.j) {
          const nkj = this.get(k, toDo.j)
          const rkj: AllenRelation = AllenRelation.and(nkj, this.get(k, toDo.i).compose(toDo.r))
          // `rkj` implies `nkj`, because of `and`, but it might be stronger
          if (rkj !== nkj) {
            todos.push({ i: k, j: toDo.j, r: rkj })
          }
        }
      })
      this._intervals.forEach(k => {
        if (k !== toDo.i && k !== toDo.j) {
          const nik = this.get(toDo.i, k)
          const rik: AllenRelation = AllenRelation.and(nik, toDo.r.compose(this.get(toDo.j, k)))
          // `rik` implies `nik`, because of `and`, but it might be stronger
          if (rik !== nik) {
            todos.push({ i: toDo.i, j: k, r: rik })
          }
        }
      })
    }
  }

  /**
   * Create a new {@link Network}, with the same intervals and Allen relations between them.
   *
   * After this, they can evolve separately with {@link add}.
   *
   * (Subtypes should override this method to add extra properties they might have.)
   */
  clone(): this {
    const copy: this = new (this.constructor as new () => this)()
    this._intervals.forEach(interval => {
      copy._intervals.push(interval)
    })
    Object.entries(this.known).forEach(([from, relations]: [string, Relations]) => {
      copy.known[from] = Object.entries(relations).reduce((acc2: Relations, [to, ar]: [string, AllenRelation]) => {
        acc2[to] = ar
        return acc2
      }, {})
    }, copy.known)
    return copy
  }

  /**
   * Markdown table representation of the network.
   */
  toString(): string {
    /* maximum lenght of interval name, for padding */
    const padI = Math.max(
      this._intervals.reduce((acc, i) => {
        return Math.max(acc, i.length)
      }, 0),
      3
    )
    return (
      `| ${'(.)'.padEnd(padI)} |${this._intervals.map(i => ` ${i.padEnd(padAR)} |`).join('')}
| ${'-'.repeat(padI)} |${this._intervals.map(() => ` ${'-'.repeat(padAR)} |`).join('')}` +
      this._intervals
        .map(
          i1 =>
            EOL +
            `| ${i1.padEnd(padI)} |${this._intervals
              .map(i2 => ` ${this.get(i1, i2).toString().padEnd(padAR)} |`)
              .join('')}`
        )
        .join('')
    )
  }
}
