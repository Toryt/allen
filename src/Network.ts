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
import assert, { ok } from 'assert'
import { EOL } from 'os'

/**
 * Map of interval names to an {@link AllenRelation}.
 *
 * This represents a sparse row in a matrix of {@link AllenRelation} from the interval for which this row is defined to
 * all other intervals named in this object.
 */
type Relations = Map<string, AllenRelation>

/**
 * Map of interval names to a {@link Relations} object.
 *
 * This is a sparse matrix of the {@link AllenRelation} from the interval named here to all other intervals that are
 * later in the `intervals` array.
 */
type IntervalRelations = Map<string, Relations>

interface ToDo {
  i: string
  j: string
  r: AllenRelation
}

interface TodoAndUncertainty {
  todo: ToDo
  u: number
  next: TodoAndUncertainty | undefined
}

export class ToDos {
  private readonly direct: IntervalRelations = new Map<string, Relations>()
  private list: TodoAndUncertainty | undefined = undefined

  private insert(todo: ToDo): void {
    const u = todo.r.uncertainty()

    let previous: TodoAndUncertainty | undefined
    let next: TodoAndUncertainty | undefined = this.list
    while (next !== undefined && next.u < u) {
      previous = next // next ≠ undefined, so now previous ≠ undefined
      next = previous.next
    }

    if (previous === undefined) {
      /* If we went through the iteration at least once `previous ≠ undefined`. Otherwise, we need to add the new
         element at the start of the list, which might have been empty. */
      this.list = { todo, u, next }
      return
    }

    /* `previous ≠ undefined`, so we went through the iteration at least once. The list was not empty. Either:
       * We are now at the end of the list (`next === undefined`). `previous` was the last element, and we need to add
         the new element at the end after `previous`, or
       * We are now in the middle of the list (`next !== undefined`), and the new element needs to be spliced between
         `previous` and `next`.
       In any case, `next` is the entry after the new element. */
    previous.next = { todo, u, next }
  }

  /**
   * Adds the `todo` for `todo.i (todo.r) todo.j` if `todo.i < todo.j`, and for `todo.j (todo.r)^ todo.i` if
   * `todo.i > todo.j`. Nothing is added if `todo.i = todo.j`.
   *
   * If there already is an entry `todo.i (s) todo.j` in the data structure, it is replaced with `todo.i (s ∧ todo.r) todo.j`.
   *
   * ### Precondition
   *
   * `i ≠ j`
   */
  add({ i, j, r }: ToDo): void {
    assert(i !== j)
    const [k, l, s]: [string, string, AllenRelation] = i < j ? [i, j, r] : [j, i, r.converse()]
    if (!this.direct.has(k)) {
      this.direct.set(k, new Map<string, AllenRelation>())
    }
    const kMap: Relations | undefined = this.direct.get(k)
    ok(kMap)
    const previous: AllenRelation | undefined = kMap.get(l)
    const strictR = previous !== undefined ? AllenRelation.and(previous, s) : s
    kMap.set(l, strictR)
    this.insert({ i: k, j: l, r: strictR })
  }

  notEmpty(): boolean {
    return this.list !== undefined
  }

  /**
   * ### Precondition
   *
   * `notEmpty()`
   */
  pop(): ToDo {
    const result: TodoAndUncertainty | undefined = this.list
    ok(result)
    this.list = result.next
    const iMap: Relations | undefined = this.direct.get(result.todo.i)
    ok(iMap)
    iMap.delete(result.todo.j)
    // there is no need to delete this.direct[result.todo.i] if it is empty
    return result.todo
  }

  toString(): string {
    let result: string = '['
    let counter: number = 0
    let next: TodoAndUncertainty | undefined = this.list
    while (next !== undefined) {
      result += `${EOL}  ${counter}: ${next.todo.i} ${next.todo.r.toString()} ${next.todo.j} (${next.u})`
      next = next.next
      counter++
    }
    return result + `${EOL}]`
  }
}

/**
 * Maximum lenght of {@link AllenRelation.toString()}, for padding.
 */
const padAR = 15

export class Network {
  private readonly _intervals: string[] = []

  private readonly known: IntervalRelations = new Map<string, Relations>()

  intervals(): string[] {
    return this._intervals.slice()
  }

  get(i: string, j: string): AllenRelation {
    if (i === j) {
      return AllenRelation.EQUALS
    }

    const [k, l]: [string, string] = i < j ? [i, j] : [j, i]

    const kMap: Relations | undefined = this.known.get(k)

    if (kMap === undefined) {
      return AllenRelation.FULL
    }

    const klAR: AllenRelation | undefined = kMap.get(l)

    if (klAR === undefined) {
      return AllenRelation.FULL
    }

    return i < j ? klAR : klAR.converse()
  }

  /**
   * ### Precondition
   *
   * `i < j`
   * `get(i, j).impliedBy(rij)`
   */
  private update(i: string, j: string, rij: AllenRelation): void {
    assert(i < j)
    assert(this.get(i, j).impliedBy(rij))

    if (!this.known.has(i)) {
      this.known.set(i, new Map<string, AllenRelation>())
    }

    const iMap: Relations | undefined = this.known.get(i)
    ok(iMap)
    iMap.set(j, rij)
  }

  add(i: string, j: string, r: AllenRelation): void {
    if (!this._intervals.includes(i)) {
      this._intervals.push(i)
    }
    if (!this._intervals.includes(j)) {
      this._intervals.push(j)
    }
    const toDos: ToDos = new ToDos()
    toDos.add({ i, j, r })
    while (toDos.notEmpty()) {
      const toDo: ToDo = toDos.pop()
      this.update(toDo.i, toDo.j, toDo.r)
      this._intervals.forEach(k => {
        if (k !== toDo.i && k !== toDo.j) {
          const nkj = this.get(k, toDo.j)
          const rkj: AllenRelation = AllenRelation.and(nkj, this.get(k, toDo.i).compose(toDo.r))
          // `rkj` implies `nkj`, because of `and`, but it might be stronger
          if (rkj !== nkj) {
            toDos.add({ i: k, j: toDo.j, r: rkj })
          }
          const nik = this.get(toDo.i, k)
          const rik: AllenRelation = AllenRelation.and(nik, toDo.r.compose(this.get(toDo.j, k)))
          // `rik` implies `nik`, because of `and`, but it might be stronger
          if (rik !== nik) {
            toDos.add({ i: toDo.i, j: k, r: rik })
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
    this.known.forEach((relations: Relations, from: string) => {
      const fromMap = new Map<string, AllenRelation>()
      relations.forEach((ar: AllenRelation, to: string) => {
        fromMap.set(to, ar)
      })
      copy.known.set(from, fromMap)
    })
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
