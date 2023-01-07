/*
 Copyright © 2022 – 2023 by Jan Dockx

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

/* eslint-env mocha */

import { AllenRelation } from '../src'
import { Network } from '../src/Network'

describe('compose', function () {
  // it('composes', function () {
  //   const Rintersection = AllenRelation.fromString<AllenRelation>('sedf')
  //   console.log(`Rintersection: ${Rintersection.toString()}`)
  //
  //   const RintersectionDot = Rintersection.converse()
  //   console.log(`RintersectionDot: ${RintersectionDot.toString()}`)
  //
  //   const Rorder = AllenRelation.fromString<AllenRelation>('pmoFDseS')
  //   console.log(`Rorder: ${Rorder.toString()}`)
  //
  //   const haveIntersection = AllenRelation.fromString<AllenRelation>('oFDseSfdO')
  //   console.log(`haveIntersection: ${haveIntersection.toString()}`)
  //
  //   const pAndQhaveIntersection = haveIntersection.compose(haveIntersection.converse())
  //   console.log(`pAndQhaveIntersection: ${pAndQhaveIntersection.toString()}`)
  //
  //   const pAndQhaveIntersectionOrder = AllenRelation.and(pAndQhaveIntersection, Rorder)
  //   console.log(`pAndQhaveIntersectionOrder: ${pAndQhaveIntersectionOrder.toString()}`)
  //
  //   const pIToq = Rintersection.compose(pAndQhaveIntersectionOrder)
  //   console.log(`pIToq: ${pIToq.toString()}`)
  //
  //   const pIToqIViaOrder = Rintersection.compose(pAndQhaveIntersectionOrder).compose(RintersectionDot)
  //   console.log(`pIToqIViaOrder: ${pIToqIViaOrder.toString()}`)
  //
  //   const pIToqIViaI = Rintersection.compose(RintersectionDot)
  //   console.log(`pIToqIViaI: ${pIToqIViaI.toString()}`)
  //
  //   const pIToqI = AllenRelation.and(pIToqIViaOrder, pIToqIViaI)
  //   console.log(`pIToqI: ${pIToqI.toString()}`)
  //
  //   function cPItoQ (r: AllenRelation): void {
  //     console.log()
  //     console.log(`r: ${r.toString()}`)
  //
  //     const pIToq = Rintersection.compose(r).min(AllenRelation.PRECEDES).min(AllenRelation.PRECEDED_BY)
  //
  //     console.log(`pIToq: ${pIToq.toString()}`)
  //
  //     const pIToqIViaOrder = pIToq.compose(RintersectionDot)
  //     console.log(`pIToqIViaOrder: ${pIToqIViaOrder.toString()}`)
  //
  //     const pIToqI = AllenRelation.and(pIToqIViaOrder, pIToqIViaI)
  //     console.log(`pIToqI: ${pIToqI.toString()}`)
  //   }
  //
  //   cPItoQ(AllenRelation.OVERLAPS)
  //   cPItoQ(AllenRelation.FINISHED_BY)
  //   cPItoQ(AllenRelation.CONTAINS)
  //   cPItoQ(AllenRelation.STARTS)
  //   cPItoQ(AllenRelation.EQUALS)
  //   cPItoQ(AllenRelation.STARTED_BY)
  // })
  // it('infer', function () {
  //   const Rorder = AllenRelation.fromString<AllenRelation>('pmoFDseS')
  //   console.log(`Rorder: ${Rorder.toString()}`)
  //
  //   const intervals = ['v', 'p', 'q', 'vIp', 'vIq'] as const
  //
  //   type Interval = typeof intervals[number]
  //
  //   type Relations = {
  //     [interval in Interval]?: AllenRelation
  //   }
  //
  //   type IntervalRelations = {
  //     [interval in Interval]?: Relations
  //   }
  //
  //   const known: IntervalRelations = {}
  //
  //   function update (i: Interval, j: Interval, rij: AllenRelation): void {
  //     function lazy (i: Interval, j: Interval, rij: AllenRelation) {
  //       const old = get(i, j)
  //       if (!rij.implies(old)) {
  //         console.warn(`LOOSING INFORMATION ${i} -- ${old} / ${rij} -> ${j}`)
  //       } else {
  //         console.warn(`ADDING INFORMATION ${i} -- ${old} / ${rij} -> ${j}`)
  //       }
  //       if (known[i] === undefined) {
  //         known[i] = {}
  //       }
  //       const o: Relations | undefined = known[i]
  //       ok(o)
  //       o[j] = rij
  //     }
  //
  //     if (i === j) {
  //       return
  //     }
  //     if (intervals.indexOf(i) < intervals.indexOf(j)) {
  //       lazy(i, j, rij)
  //     } else {
  //       lazy(j, i, rij.converse())
  //     }
  //   }
  //
  //   function get (i: Interval, j: Interval): AllenRelation {
  //     function read (i: Interval, j: Interval): AllenRelation {
  //       const o: Relations | undefined = known[i]
  //
  //       const result: AllenRelation | undefined = o === undefined ? undefined : o[j]
  //       return result ?? AllenRelation.FULL
  //     }
  //
  //     return i === j
  //       ? AllenRelation.EQUALS
  //       : intervals.indexOf(i) < intervals.indexOf(j)
  //       ? read(i, j)
  //       : read(j, i).converse()
  //   }
  //
  //   function print () {
  //     console.log()
  //     console.log(`| (.) |${intervals.map(i => ` ${i.padEnd(15)} `).join('|')}|`)
  //     console.log(`| --- |${intervals.map(() => ` --------------- `).join('|')}|`)
  //     intervals.forEach(i1 => {
  //       console.log(`| ${i1.padEnd(3)} |${intervals.map(i2 => ` ${get(i1, i2).toString().padEnd(15)} `).join('|')}|`)
  //     })
  //   }
  //
  //   interface ToDo {
  //     i: keyof Relations
  //     j: keyof Relations
  //     r: AllenRelation
  //   }
  //
  //   const toDos: ToDo[] = []
  //
  //   function add (i: keyof Relations, j: keyof Relations, r: AllenRelation) {
  //     console.log()
  //     console.log()
  //     console.log(`add: ${i} -- ${r.toString()} -> ${j}`)
  //     toDos.push({ i, j, r })
  //     while (toDos.length > 0) {
  //       console.log()
  //       const toDo: ToDo | undefined = toDos.shift()
  //       ok(toDo)
  //       console.log(`learn: ${toDo.i} -- ${toDo.r.toString()} -> ${toDo.j}`)
  //       update(toDo.i, toDo.j, toDo.r)
  //       intervals.forEach(k => {
  //         if (k !== toDo.i && k !== toDo.j) {
  //           const rkj: AllenRelation = AllenRelation.and(get(k, toDo.j), get(k, toDo.i).compose(toDo.r))
  //           const nkj = get(k, toDo.j)
  //           console.log(
  //             `${k} -- ${nkj.toString()} and (${get(k, toDo.i)} ⊕ ${toDo.r} = ${get(k, toDo.i).compose(
  //               toDo.r
  //             )}) = ${rkj.toString()} -> ${toDo.j}`
  //           )
  //           if (rkj !== nkj && rkj.implies(nkj)) {
  //             console.log('   TODO')
  //             toDos.push({ i: k, j: toDo.j, r: rkj })
  //           }
  //         }
  //       })
  //       intervals.forEach(k => {
  //         if (k !== toDo.i && k !== toDo.j) {
  //           const rik: AllenRelation = AllenRelation.and(get(toDo.i, k), toDo.r.compose(get(toDo.j, k)))
  //           const nik = get(toDo.i, k)
  //           console.log(
  //             `${toDo.i} -- ${nik.toString()} and (${toDo.r} ⊕ ${get(toDo.j, k)} = ${toDo.r.compose(
  //               get(toDo.j, k)
  //             )}) = ${rik.toString()} -> ${k}`
  //           )
  //           if (rik !== nik && rik.implies(nik)) {
  //             console.log('   TODO')
  //             toDos.push({ i: toDo.i, j: k, r: rik })
  //           }
  //         }
  //       })
  //       print()
  //       console.log(`TODOs: ${toDos.length}`)
  //     }
  //   }
  //
  //   print()
  //   add('vIp', 'v', AllenRelation.ENCLOSED_BY)
  //   add('vIq', 'v', AllenRelation.ENCLOSED_BY)
  //   add('vIp', 'p', AllenRelation.ENCLOSED_BY)
  //   add('vIq', 'q', AllenRelation.ENCLOSED_BY)
  //   add('p', 'q', AllenRelation.AFTER.complement())
  //   // add('v', 'p', AllenRelation.BEFORE)
  // })
  it('works', function () {
    const network = new Network()
    console.log(network.toString())
    network.add('p', 'q', AllenRelation.AFTER.complement())
    console.log()
    console.log(network.toString())
    console.log()
    network.add('vIp', 'p', AllenRelation.ENCLOSED_BY)
    console.log(network.toString())
    console.log()
    network.add('vIq', 'q', AllenRelation.ENCLOSED_BY)
    console.log(network.toString())
    console.log()
    network.add('vIp', 'v', AllenRelation.ENCLOSED_BY)
    console.log(network.toString())
    console.log()
    network.add('vIq', 'v', AllenRelation.ENCLOSED_BY)
    console.log(network.toString())
  })
})
