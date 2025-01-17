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
import should from 'should'
import { beforeEach } from 'mocha'
import { EOL } from 'os'
import { ok } from 'assert'

function relationShouldBe(network: Network, i1: string, i2: string, r: AllenRelation): void {
  network.get(i1, i2).should.equal(r)
  network.get(i2, i1).should.equal(r.converse())
}

declare module 'mocha' {
  export interface Context {
    subject: Network
    relationShouldBe: (i1: string, i2: string, r: AllenRelation) => void
  }
}

interface IntersectionRelations {
  toFirst: AllenRelation
  toSecond: AllenRelation
}

/**
 * | `w (.) v` | `w ∩ v (.) w` | `w ∩ v (.) v` |
 * | --------- | ------------- | ------------- |
 * | `(p)`     | `()`          | `()`          |
 * | `(m)`     | `()`          | `()`          |
 * | `(o)`     | `(f)`         | `(s)`         |
 * | `(F)`     | `(f)`         | `(e)`         |
 * | `(D)`     | `(d)`         | `(e)`         |
 * | `(s)`     | `(e)`         | `(s)`         |
 * | `(e)`     | `(e)`         | `(e)`         |
 * | `(S)`     | `(s)`         | `(e)`         |
 * | `(d)`     | `(e)`         | `(d)`         |
 * | `(f)`     | `(e)`         | `(f)`         |
 * | `(O)`     | `(s)`         | `(f)`         |
 * | `(M)`     | `()`          | `()`          |
 * | `(P)`     | `()`          | `()`          |
 */
const intersections: Map<AllenRelation, IntersectionRelations> = new Map<AllenRelation, IntersectionRelations>()
intersections.set(AllenRelation.OVERLAPS, {
  toFirst: AllenRelation.FINISHES,
  toSecond: AllenRelation.STARTS
})
intersections.set(AllenRelation.FINISHED_BY, {
  toFirst: AllenRelation.FINISHES,
  toSecond: AllenRelation.EQUALS
})
intersections.set(AllenRelation.CONTAINS, {
  toFirst: AllenRelation.DURING,
  toSecond: AllenRelation.EQUALS
})
intersections.set(AllenRelation.STARTS, {
  toFirst: AllenRelation.EQUALS,
  toSecond: AllenRelation.STARTS
})
intersections.set(AllenRelation.EQUALS, {
  toFirst: AllenRelation.EQUALS,
  toSecond: AllenRelation.EQUALS
})
intersections.set(AllenRelation.STARTED_BY, {
  toFirst: AllenRelation.STARTS,
  toSecond: AllenRelation.EQUALS
})
intersections.set(AllenRelation.DURING, {
  toFirst: AllenRelation.EQUALS,
  toSecond: AllenRelation.DURING
})
intersections.set(AllenRelation.FINISHES, {
  toFirst: AllenRelation.EQUALS,
  toSecond: AllenRelation.FINISHES
})
intersections.set(AllenRelation.OVERLAPPED_BY, {
  toFirst: AllenRelation.STARTS,
  toSecond: AllenRelation.FINISHES
})

describe('Network', function () {
  describe('constructor', function () {
    it('can be constructed', function () {
      const subject: Network = new Network()
      should(subject).be.instanceof(Network)
      subject.intervals().should.be.empty()
      subject.get('a', 'b').should.equal(AllenRelation.FULL)
      subject.get('c', 'c').should.equal(AllenRelation.EQUALS)
    })
  })
  describe('instance methods', function () {
    beforeEach(function () {
      this.subject = new Network()
      this.relationShouldBe = relationShouldBe.bind(undefined, this.subject)
    })

    describe('#add', function () {
      it('intersections', function () {
        /* Set up a network that describes the intersection of an interval 'v' with and interal 'p' and with an interval
           'q'. Given the relation between 'p' and 'q', what is the relation beween 'p ∩ v' and 'q ∩ v'? */
        this.subject.add('p', 'q', AllenRelation.AFTER.complement()) // p not after q
        this.subject.intervals().should.be.containDeep(['p', 'q'])
        // console.log(this.subject.toString())
        // console.log()
        this.relationShouldBe('p', 'q', AllenRelation.AFTER.complement())

        this.subject.add('p ∩ v', 'p', AllenRelation.ENCLOSED_BY)
        this.subject.intervals().should.be.containDeep(['p', 'q', 'p ∩ v'])
        // console.log(this.subject.toString())
        // console.log()
        this.relationShouldBe('p', 'q', AllenRelation.AFTER.complement())
        this.relationShouldBe('p ∩ v', 'p', AllenRelation.ENCLOSED_BY)
        this.relationShouldBe('p ∩ v', 'q', AllenRelation.FULL)

        this.subject.add('p ∩ v', 'v', AllenRelation.ENCLOSED_BY)
        this.subject.intervals().should.be.containDeep(['p', 'q', 'p ∩ v', 'v'])
        // console.log(this.subject.toString())
        // console.log()
        this.relationShouldBe('p', 'q', AllenRelation.AFTER.complement())
        this.relationShouldBe('p ∩ v', 'p', AllenRelation.ENCLOSED_BY)
        this.relationShouldBe('p ∩ v', 'q', AllenRelation.FULL)
        this.relationShouldBe('p ∩ v', 'v', AllenRelation.ENCLOSED_BY)
        this.relationShouldBe('p', 'v', AllenRelation.CONCURS_WITH)
        this.relationShouldBe('q', 'v', AllenRelation.FULL)

        this.subject.add('q ∩ v', 'q', AllenRelation.ENCLOSED_BY)
        this.subject.intervals().should.be.containDeep(['p', 'q', 'p ∩ v', 'v', 'q ∩ v'])
        // console.log(this.subject.toString())
        // console.log()
        this.relationShouldBe('p', 'q', AllenRelation.AFTER.complement())
        this.relationShouldBe('p ∩ v', 'p', AllenRelation.ENCLOSED_BY)
        this.relationShouldBe('p ∩ v', 'q', AllenRelation.FULL)
        this.relationShouldBe('p ∩ v', 'v', AllenRelation.ENCLOSED_BY)
        this.relationShouldBe('p', 'v', AllenRelation.CONCURS_WITH)
        this.relationShouldBe('q', 'v', AllenRelation.FULL)
        this.relationShouldBe('q ∩ v', 'p', AllenRelation.FULL)
        this.relationShouldBe('q ∩ v', 'q', AllenRelation.ENCLOSED_BY)
        this.relationShouldBe('q ∩ v', 'v', AllenRelation.FULL)
        this.relationShouldBe('q ∩ v', 'p ∩ v', AllenRelation.FULL)

        this.subject.add('q ∩ v', 'v', AllenRelation.ENCLOSED_BY)
        this.subject.intervals().should.be.containDeep(['p', 'q', 'p ∩ v', 'v', 'q ∩ v'])
        // console.log(this.subject.toString())
        // console.log()
        this.relationShouldBe('p', 'q', AllenRelation.AFTER.complement())
        this.relationShouldBe('p ∩ v', 'p', AllenRelation.ENCLOSED_BY)
        this.relationShouldBe('p ∩ v', 'q', AllenRelation.FULL)
        this.relationShouldBe('p ∩ v', 'v', AllenRelation.ENCLOSED_BY)
        this.relationShouldBe('p', 'v', AllenRelation.CONCURS_WITH)
        this.relationShouldBe('q', 'v', AllenRelation.CONCURS_WITH)
        this.relationShouldBe('q ∩ v', 'p', AllenRelation.FULL)
        this.relationShouldBe('q ∩ v', 'q', AllenRelation.ENCLOSED_BY)
        this.relationShouldBe('q ∩ v', 'v', AllenRelation.ENCLOSED_BY)
        /* there is no sensible conclusion */
        this.relationShouldBe('q ∩ v', 'p ∩ v', AllenRelation.FULL)
      })
    })
    describe('prepared', function () {
      beforeEach(function () {
        this.subject.add('p', 'q', AllenRelation.AFTER.complement())
        this.subject.add('p ∩ v', 'p', AllenRelation.ENCLOSED_BY)
        this.subject.add('p ∩ v', 'v', AllenRelation.ENCLOSED_BY)
        this.subject.add('q ∩ v', 'q', AllenRelation.ENCLOSED_BY)
        this.subject.add('q ∩ v', 'v', AllenRelation.ENCLOSED_BY)
      })
      describe('#clone', function () {
        it('intersections', function () {
          const clone = this.subject.clone()
          const cloneIntervals = clone.intervals()
          cloneIntervals.should.be.deepEqual(this.subject.intervals())
          // console.log(clone.toString())
          // console.log()
          cloneIntervals.forEach((ci1, i1) => {
            cloneIntervals.forEach((ci2, i2) => {
              if (i2 >= i1) {
                relationShouldBe(clone, ci1, ci2, this.subject.get(ci1, ci2))
              }
            })
          })

          // clone is separate
          this.subject.add('a', 'b', AllenRelation.emptyRelation<AllenRelation>())
          this.subject.intervals().should.containDeep(['a', 'b'])
          this.subject.get('a', 'b').should.equal(AllenRelation.emptyRelation<AllenRelation>())
          clone.intervals().should.not.containEql('a')
          clone.intervals().should.not.containEql('b')
          clone.get('a', 'b').should.equal(AllenRelation.FULL)

          clone.add('c', 'd', AllenRelation.emptyRelation<AllenRelation>())
          clone.intervals().should.containDeep(['c', 'd'])
          clone.get('c', 'd').should.equal(AllenRelation.emptyRelation<AllenRelation>())
          this.subject.intervals().should.not.containEql('c')
          this.subject.intervals().should.not.containEql('d')
          this.subject.get('c', 'd').should.equal(AllenRelation.FULL)
        })
      })
      describe('#toString', function () {
        it('works', function () {
          const result = this.subject.toString()
          console.log(result)
          const resultLines = result.split(EOL)
          const intervals = this.subject.intervals()
          resultLines.forEach((rl, j) => {
            const regexp = new RegExp(
              j === 0
                ? `^\\| \\(\\.\\) +${intervals.map(i2 => `\\| ${i2} +`).join('')} \\|$`
                : j === 1
                ? `^\\| ---+ (\\| ---+ ){${intervals.length}}\\|$`
                : `^\\\\| ${intervals[j - 2]} +${intervals
                    .map(
                      i2 =>
                        `\\| ${this.subject
                          .get(intervals[j - 2], i2)
                          .toString()
                          .replace(/\(/g, '\\(')
                          .replace(/\)/g, '\\)')} +`
                    )
                    .join('')}\\|$`
            )
            rl.should.match(regexp)
          })
        })
      })
    })
    describe('intersection keeps order', function () {
      it('does not produce the desired result with a general intersection statement', function () {
        const intersection = AllenRelation.fromString<AllenRelation>('sedf')
        this.subject.add('p', 'q', AllenRelation.AFTER.complement())
        this.subject.add('p ∩ v', 'p', intersection)
        this.subject.add('p ∩ v', 'v', intersection)
        this.subject.add('q ∩ v', 'q', intersection)
        this.subject.add('q ∩ v', 'v', intersection)
        const result = this.subject.get('p ∩ v', 'q ∩ v')
        console.log(`p ∩ v ${result.toString()} q ∩ v`)
        result.should.equal(AllenRelation.FULL) // ≠ AllenRelation.AFTER.complement()
      })
      it('does produce the desired result with a distributed or', function () {
        const results: string[] = []
        let allTogether: AllenRelation = AllenRelation.emptyRelation<AllenRelation>()
        this.subject.add('p', 'q', AllenRelation.AFTER.complement())
        intersections.forEach(({ toFirst: pIvRp, toSecond: pIvRv }, pRv) => {
          const networkP = this.subject.clone()
          networkP.add('p', 'v', pRv)
          networkP.add('p ∩ v', 'p', pIvRp)
          networkP.add('p ∩ v', 'v', pIvRv)
          intersections.forEach(({ toFirst: qIvRq, toSecond: qIvRv }, qRv) => {
            const networkPQ = networkP.clone()
            networkPQ.add('q', 'v', qRv)
            networkPQ.add('q ∩ v', 'q', qIvRq)
            networkPQ.add('q ∩ v', 'v', qIvRv)
            results.push(
              `p ${pRv.toString()} v; q ${qRv.toString()} v: p ∩ v ${networkPQ.get('p ∩ v', 'q ∩ v').toString()} q ∩ v`
            )
            allTogether = AllenRelation.or(allTogether, networkPQ.get('p ∩ v', 'q ∩ v'))
          })
        })
        results.forEach(r => {
          console.log(r)
        })
        console.log()
        console.log(`p ∩ v ${allTogether.toString()} q ∩ v`)
        allTogether.should.equal(AllenRelation.AFTER.complement())
      })
      it('behaves as expected for p(d)v, q(d)v', function () {
        this.subject.add('p', 'q', AllenRelation.AFTER.complement())
        const intersectionRelations = intersections.get(AllenRelation.DURING)
        ok(intersectionRelations)
        const { toFirst, toSecond }: IntersectionRelations = intersectionRelations
        this.subject.add('p', 'v', AllenRelation.DURING)
        this.subject.add('p ∩ v', 'p', toFirst)
        this.subject.add('p ∩ v', 'v', toSecond)
        this.subject.add('q', 'v', AllenRelation.DURING)
        this.subject.add('q ∩ v', 'q', toFirst)
        this.subject.add('q ∩ v', 'v', toSecond)
        this.subject.get('p ∩ v', 'q ∩ v').should.equal(AllenRelation.AFTER.complement())
      })
    })
  })
  it('all', function () {
    console.log()
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
    // console.log()
    // network.add('q', 'vIp', AllenRelation.BEFORE)
    // console.log(network.toString())
    console.log(`vIp -- ${network.get('vIp', 'vIq').toString()} --> vIq`)
  })
  it('a', function () {
    console.log()
    const network = new Network()
    network.add('p', 'q', AllenRelation.AFTER.complement())
    network.add('vIp', 'p', AllenRelation.ENCLOSED_BY)
    network.add('vIq', 'q', AllenRelation.ENCLOSED_BY)
    network.add('vIp', 'v', AllenRelation.ENCLOSED_BY)
    network.add('vIq', 'v', AllenRelation.ENCLOSED_BY)
    network.add('p', 'v', AllenRelation.fromString<AllenRelation>('oFDseS'))
    network.add('vIp', 'v', AllenRelation.fromString<AllenRelation>('se'))
    network.add('q', 'v', AllenRelation.fromString<AllenRelation>('oFDseS'))
    network.add('vIq', 'v', AllenRelation.fromString<AllenRelation>('se'))
    console.log(network.toString())
    console.log(`vIp -- ${network.get('vIp', 'vIq').toString()} --> vIq`)
  })
  it('b', function () {
    console.log()
    const network = new Network()
    network.add('p', 'q', AllenRelation.AFTER.complement())
    network.add('vIp', 'p', AllenRelation.ENCLOSED_BY)
    network.add('vIq', 'q', AllenRelation.ENCLOSED_BY)
    network.add('vIp', 'v', AllenRelation.ENCLOSED_BY)
    network.add('vIq', 'v', AllenRelation.ENCLOSED_BY)
    network.add('p', 'v', AllenRelation.fromString<AllenRelation>('dfO'))
    network.add('vIp', 'p', AllenRelation.fromString<AllenRelation>('se'))
    network.add('q', 'v', AllenRelation.fromString<AllenRelation>('oFDseS'))
    network.add('vIq', 'v', AllenRelation.fromString<AllenRelation>('se'))
    console.log(network.toString())
    console.log(`vIp -- ${network.get('vIp', 'vIq').toString()} --> vIq`)
  })
  it('c', function () {
    console.log()
    const network = new Network()
    network.add('p', 'q', AllenRelation.AFTER.complement())
    network.add('vIp', 'p', AllenRelation.ENCLOSED_BY)
    network.add('vIq', 'q', AllenRelation.ENCLOSED_BY)
    network.add('vIp', 'v', AllenRelation.ENCLOSED_BY)
    network.add('vIq', 'v', AllenRelation.ENCLOSED_BY)
    network.add('p', 'v', AllenRelation.fromString<AllenRelation>('oFDseS'))
    network.add('vIp', 'v', AllenRelation.fromString<AllenRelation>('se'))
    network.add('q', 'v', AllenRelation.fromString<AllenRelation>('dfO'))
    network.add('vIq', 'q', AllenRelation.fromString<AllenRelation>('se'))
    console.log(network.toString())
    console.log(`vIp -- ${network.get('vIp', 'vIq').toString()} --> vIq`)
  })
  it('d', function () {
    console.log()
    const network = new Network()
    network.add('p', 'q', AllenRelation.AFTER.complement())
    network.add('vIp', 'p', AllenRelation.ENCLOSED_BY)
    network.add('vIq', 'q', AllenRelation.ENCLOSED_BY)
    network.add('vIp', 'v', AllenRelation.ENCLOSED_BY)
    network.add('vIq', 'v', AllenRelation.ENCLOSED_BY)
    network.add('p', 'v', AllenRelation.fromString<AllenRelation>('dfO'))
    network.add('vIp', 'p', AllenRelation.fromString<AllenRelation>('se'))
    network.add('q', 'v', AllenRelation.fromString<AllenRelation>('dfO'))
    network.add('vIq', 'q', AllenRelation.fromString<AllenRelation>('se'))
    console.log(network.toString())
    console.log(`vIp -- ${network.get('vIp', 'vIq').toString()} --> vIq`)
  })
})
