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

/* eslint-env mocha */

import 'should'
import { inspect } from 'util'
import { stuff, stuffWithUndefined } from './_stuff'
import { Interval, isInterval, isReferenceIntervals, ReferenceIntervals } from '../src/Interval'
import { typeRepresentations } from './_typeRepresentationCases'
import {
  commonTypeRepresentation,
  representsSuperType,
  TypeRepresentation,
  typeRepresentationOf
} from '../src/TypeRepresentation'
import { TypeFor } from '../src/type'
import { A, B, C } from './_someClasses'
import { Comparator } from '../src/Comparator'
import { ltCompare } from '../src/ltCompare'
import { ok } from 'assert'

interface Case<T extends TypeRepresentation> {
  label: string
  pointType: T
  p1: TypeFor<T>
  p2: TypeFor<T>
  compareFn?: Comparator<TypeFor<T>>
  compareFnOptional?: boolean
}

const indefinites = [undefined, null]

const trueCases: Array<Case<TypeRepresentation>> = [
  { label: 'number', pointType: 'number', p1: -4, p2: Math.PI },
  {
    label: 'number with NaN',
    pointType: 'number',
    p1: 0,
    p2: NaN,
    compareFn: (t1: number, t2: number): number =>
      // NaN is largest
      Number.isNaN(t1) ? (Number.isNaN(t2) ? 0 : +1) : Number.isNaN(t2) ? -1 : ltCompare(t1, t2),
    compareFnOptional: false
  },
  {
    label: 'bigint',
    pointType: 'bigint',
    p1: -72799850575770750175017107610717190n,
    p2: 90785075016070176023707012760760267026n
  },
  { label: 'string', pointType: 'string', p1: 'string one', p2: 'string two' },
  { label: 'boolean', pointType: 'boolean', p1: false, p2: true },
  {
    label: 'Date',
    pointType: Date,
    p1: new Date(2022, 9, 23, 13, 56, 33, 213),
    p2: new Date(2024, 4, 18, 6, 5, 36, 388)
  },
  { label: 'Number', pointType: 'number', p1: Number(3), p2: Number(89734) },
  { label: 'BigInt', pointType: 'bigint', p1: BigInt(-432), p2: BigInt(8975322352525252662626662677222727n) },
  { label: 'String', pointType: 'string', p1: String('a'), p2: String('b') },
  { label: 'Boolean', pointType: 'boolean', p1: Boolean(false), p2: Boolean(true) },
  {
    label: 'object',
    pointType: Object,
    p1: { a: 'a one' },
    p2: { b: 'a two' },
    compareFn: (t1: object, t2: object): number => ('a' in t1 ? ('b' in t2 ? -1 : 0) : +1),
    compareFnOptional: true
  },
  {
    label: 'A',
    pointType: A,
    p1: new A(1),
    p2: new A(2),
    compareFn: (t1: A, t2: A): number => (t1.a < t2.a ? -1 : t2.a < t1.a ? +1 : 0),
    compareFnOptional: true
  },
  {
    label: 'polymorph',
    pointType: A,
    p1: new A(1),
    p2: new B(),
    compareFn: (t1: A, t2: A): number => (t1.a < t2.a ? -1 : t2.a < t1.a ? +1 : 0),
    compareFnOptional: true
  },
  {
    label: 'polymorph in reverse order',
    pointType: A,
    p1: new B(),
    p2: new A(777),
    compareFn: (t1: A, t2: A): number => (t1.a < t2.a ? -1 : t2.a < t1.a ? +1 : 0),
    compareFnOptional: true
  },
  {
    label: 'mixed objects',
    pointType: Object,
    p1: new B(),
    p2: new C(),
    compareFn: (t1: A, t2: A): number => (t1.constructor === t2.constructor ? 0 : t1 instanceof B ? -1 : +1),
    compareFnOptional: true
  },
  {
    label: 'array and object',
    pointType: Object,
    p1: [null, null, 34],
    p2: {}
  },
  {
    label: 'functions',
    pointType: Function,
    p1: () => 0,
    p2: function a () {
      return true
    }
  },
  {
    label: 'function and object',
    pointType: Object,
    p1: () => 0,
    p2: {}
  },
  {
    label: 'array',
    pointType: Array,
    p1: [1, 3],
    p2: [2, 3]
  },
  {
    label: 'symbols',
    pointType: 'symbol',
    p1: Symbol('a'),
    p2: Symbol('b'),
    compareFn: (p1: symbol, p2: symbol): number => ltCompare(p1.toString(), p2.toString())
  },
  { label: 'mixed array', pointType: Array, p1: [11], p2: ['a string'] }
]

const notAnIntervalCandidate = stuffWithUndefined.filter(s => typeof s !== 'object' && typeof s !== 'function')

describe('Interval', function () {
  describe('isReferenceIntervals', function () {
    describe('not an object', function () {
      typeRepresentations.forEach(ptr => {
        describe(inspect(ptr), function () {
          stuffWithUndefined
            .filter(
              s =>
                typeof s !== 'object' ||
                s === null ||
                (s instanceof Array && s.length > 0) ||
                s instanceof A ||
                s instanceof B ||
                s instanceof C ||
                Object.keys(s).length > 0
            )
            .forEach(s => {
              it(`returns false for ${inspect(s)}`, function () {
                isReferenceIntervals(s, ptr).should.be.false()
              })
            })
        })
      })
    })
    describe('recursive', function () {
      it('returns true with a recursion, 1 deep', function () {
        const me: ReferenceIntervals<number> = {
          something: [{ start: -4, end: -2, referenceIntervals: { something1Deep: [{ start: 2, end: 6 }] } }],
          other: [
            { start: 15, end: 88 },
            { start: 6, end: 12 }
          ]
        }
        me['other'][0].referenceIntervals = me
        isReferenceIntervals(me, 'number').should.be.true()
      })
    })
    it('returns true with a recursion, 2 deep', function () {
      const me: ReferenceIntervals<number> = {
        something: [{ start: -4, end: -2, referenceIntervals: { something1Deep: [{ start: 2, end: 6 }] } }],
        other: [
          { start: 15, end: 88 },
          { start: 6, end: 12 }
        ]
      }
      const oneDeep: ReferenceIntervals<number> | undefined = me['something'][0].referenceIntervals
      ok(oneDeep)
      const twoDeepInterval: Interval<number> = oneDeep['something1Deep'][0]
      twoDeepInterval.referenceIntervals = me
      isReferenceIntervals(me, 'number').should.be.true()
    })
    it('returns true with a recursion, 2 deep, with a compare function', function () {
      const me: ReferenceIntervals<number> = {
        something: [{ start: -4, end: -2, referenceIntervals: { something1Deep: [{ start: 2, end: 6 }] } }],
        other: [
          { start: 15, end: 88 },
          { start: 6, end: 12 }
        ]
      }
      const oneDeep: ReferenceIntervals<number> | undefined = me['something'][0].referenceIntervals
      ok(oneDeep)
      const twoDeepInterval: Interval<number> = oneDeep['something1Deep'][0]
      twoDeepInterval.referenceIntervals = me
      isReferenceIntervals(me, 'number', ltCompare).should.be.true()
    })
    it('returns false with a recursion, 2 deep, with an illegal interval', function () {
      const me: ReferenceIntervals<number> = {
        something: [{ start: -4, end: -2, referenceIntervals: { something1Deep: [{ start: 22222, end: 6 }] } }],
        other: [
          { start: 15, end: 88 },
          { start: 6, end: 12 }
        ]
      }
      const oneDeep: ReferenceIntervals<number> | undefined = me['something'][0].referenceIntervals
      ok(oneDeep)
      const twoDeepInterval: Interval<number> = oneDeep['something1Deep'][0]
      twoDeepInterval.referenceIntervals = me
      isReferenceIntervals(me, 'number').should.be.false()
    })
    describe('true', function () {
      it('returns true for the empty object', function () {
        isReferenceIntervals({}, Date).should.be.true()
      })
      it('returns true with one property that is the empty array', function () {
        isReferenceIntervals({ aProperty: [] }, Date).should.be.true()
      })
      it('returns true with a symbol as property key', function () {
        const aSymbol = Symbol('a symbol as property')
        const candidate = { [aSymbol]: [{ start: 6, end: 12 }] }
        isReferenceIntervals(candidate, 'number').should.be.true()
      })
      it('returns true with a symbol as property key, that contains an idiot value', function () {
        // these properties are not taken into account
        const aSymbol = Symbol('a symbol as property')
        const candidate = { [aSymbol]: 'not an array of intervals at all' }
        isReferenceIntervals(candidate, 'number').should.be.true()
      })
      it('returns true for the empty array', function () {
        // border case
        const a: unknown[] = []
        isReferenceIntervals(a, 'number').should.be.true()
      })
      it('returns true for a Date', function () {
        // border case
        const d: Date = new Date(65746779)
        isReferenceIntervals(d, 'number').should.be.true()
      })
    })
    describe('false', function () {
      stuffWithUndefined
        .filter(s => !Array.isArray(s) || s.length > 0)
        .forEach(s => {
          it(`returns false when a property value is ${inspect(s)}`, function () {
            const ri = {
              something: [{ start: -4, end: -2, referenceIntervals: { something1Deep: [{ start: 4, end: 6 }] } }],
              s,
              other: [
                { start: 15, end: 88 },
                { start: 6, end: 12 }
              ]
            }
            isReferenceIntervals(ri, 'number').should.be.false()
          })
        })
      notAnIntervalCandidate.forEach(s => {
        it(`returns false when an array value contains ${inspect(s)}`, function () {
          const ri = {
            something: [s]
          }
          isReferenceIntervals(ri, 'number').should.be.false()
        })
        it(`returns false when an array value contains ${inspect(s)}, 2 deep`, function () {
          const ri = {
            something: [
              {
                start: -4,
                end: -2,
                referenceIntervals: {
                  something1Deep: [
                    {
                      start: 4,
                      end: 6,
                      referenceIntervals: { something2Deep: [{ start: 11, end: 99 }, s, { start: 12 }] }
                    }
                  ]
                }
              }
            ],
            other: [
              { start: 15, end: 88 },
              { start: 6, end: 12 }
            ]
          }
          isReferenceIntervals(ri, 'number').should.be.false()
        })
      })
    })
    describe('indefinite point type', function () {
      indefinites.forEach(start => {
        indefinites.forEach(end => {
          it(`returns true when the pointType is \`undefined\` for [${inspect(start)}, ${inspect(end)}[`, function () {
            isReferenceIntervals({ property: [{ start, end }] }, undefined).should.be.true()
          })
          it(`returns false when the pointType is \`undefined\` for [20, ${inspect(end)}[`, function () {
            isReferenceIntervals({ property: [{ start: 20, end }] }, undefined).should.be.false()
          })
        })
      })
    })
  })

  describe('isInterval', function () {
    describe('not an object', function () {
      typeRepresentations.forEach(ptr => {
        describe(inspect(ptr), function () {
          notAnIntervalCandidate.forEach(s => {
            it(`returns false for ${inspect(s)}`, function () {
              isInterval(s, ptr).should.be.false()
            })
          })
        })
      })
    })
    describe('complete indefinite', function () {
      typeRepresentations.forEach(ptr => {
        describe(inspect(ptr), function () {
          indefinites.forEach(p1 => {
            indefinites.forEach(p2 => {
              it(`returns true for [${inspect(p1)}, ${inspect(p2)}[ for point type ${inspect(ptr)}`, function () {
                isInterval({ start: p1, end: p2 }, ptr).should.be.true()
              })
            })
          })
        })
      })
    })

    typeRepresentations.forEach(targetPointType => {
      describe(`pointType ${inspect(targetPointType)}`, function () {
        trueCases.forEach(({ label, pointType, p1, p2, compareFn, compareFnOptional }) => {
          function reverse<TR extends TypeRepresentation> (comp: Comparator<TypeFor<TR>>) {
            return function <T extends TypeFor<TR>> (t1: T, t2: T): number {
              return -1 * comp(t1, t2)
            }
          }

          function callIt (i: unknown, reverseCompare?: boolean): boolean {
            return reverseCompare !== undefined
              ? compareFn !== undefined
                ? isInterval(i, targetPointType, reverse(compareFn))
                : isInterval(i, targetPointType, reverse(ltCompare))
              : /* prettier-ignore */ compareFn !== undefined
                ? isInterval(i, targetPointType, compareFn)
                : isInterval(i, targetPointType, ltCompare)
          }

          const isSubtypeOfTarget = representsSuperType(targetPointType, pointType) ? 'true' : 'false'
          describe(`${label} ${isSubtypeOfTarget === 'true' ? '>' : '≯'} ${inspect(targetPointType)}`, function () {
            describe(`nominal ${compareFn !== undefined ? 'with' : 'without'} compareFn`, function () {
              it(`returns ${isSubtypeOfTarget} for [${inspect(p1)}, ${inspect(p2)}[`, function () {
                callIt({ start: p1, end: p2 }).should.be[isSubtypeOfTarget]()
              })
              it(`returns false for [${inspect(p2)}, ${inspect(p1)}[ (end < start)`, function () {
                callIt({ start: p2, end: p1 }).should.be.false()
              })
              it(`returns ${isSubtypeOfTarget} for [${inspect(p2)}, ${inspect(
                p1
              )}[ (end < start) with a reverse comparator`, function () {
                callIt({ start: p2, end: p1 }, true).should.be[isSubtypeOfTarget]()
              })
              it(`returns false for [${inspect(p1)}, ${inspect(p1)}[ (degenerate)`, function () {
                callIt({ start: p1, end: p1 }).should.be.false()
              })
              it(`returns false for [${inspect(p1)}, ${inspect(
                p1
              )}[ (degenerate) with a reverse comparator`, function () {
                callIt({ start: p1, end: p1 }, true).should.be.false()
              })
            })
            describe('throws', function () {
              if (
                isSubtypeOfTarget === 'true' &&
                compareFn !== undefined &&
                (compareFnOptional === undefined || !compareFnOptional)
              ) {
                it(`[${inspect(p1)}, ${inspect(p2)}[ throws without comparator`, function () {
                  isInterval.bind(undefined, { start: p1, end: p2 }, targetPointType).should.throw()
                })
              }
            })
            describe('indefinite', function () {
              const tP1: TypeRepresentation | undefined = typeRepresentationOf(p1)
              ok(tP1)
              const tP2: TypeRepresentation | undefined = typeRepresentationOf(p2)
              ok(tP2)

              indefinites.forEach(indef => {
                const p1IsSubtypeOfTarget = representsSuperType(targetPointType, tP1) ? 'true' : 'false'
                it(`returns ${p1IsSubtypeOfTarget} for [${inspect(p1)}, ${inspect(indef)}[`, function () {
                  callIt({ start: p1, end: indef }).should.be[p1IsSubtypeOfTarget]()
                })
                const p2IsSubtypeOfTarget = representsSuperType(targetPointType, tP2) ? 'true' : 'false'
                it(`returns ${p2IsSubtypeOfTarget} for [${inspect(indef)}, ${inspect(p2)}[`, function () {
                  callIt({ start: indef, end: p2 }).should.be[p2IsSubtypeOfTarget]()
                })
              })
            })

            describe('other types', function () {
              const wrongStuff = stuff.filter(s => {
                const trs = typeRepresentationOf(s)
                return trs !== undefined && !representsSuperType(targetPointType, trs)
              })
              wrongStuff.forEach(s => {
                it(`returns false for [${inspect(p1)}, ${inspect(s)}[`, function () {
                  callIt({ start: p1, end: s }).should.be.false()
                })
                it(`returns false for [${inspect(s)}, ${inspect(p2)}[`, function () {
                  callIt({ start: s, end: p2 }).should.be.false()
                })
              })
            })

            describe('with referenceIntervals', function () {
              const actualType: TypeRepresentation | undefined | false = commonTypeRepresentation(p1, p2)
              const psSubtypeOfTarget =
                actualType !== false && (actualType === undefined || representsSuperType(targetPointType, actualType))
                  ? 'true'
                  : 'false'
              it(`returns ${psSubtypeOfTarget} with one reference interval that is a copy of me`, function () {
                callIt({
                  start: p1,
                  end: p2,
                  referenceIntervals: { aSource: [{ start: p1, end: p2 }] }
                }).should.be[psSubtypeOfTarget]()
              })
              it(`returns ${psSubtypeOfTarget} with one reference interval that is me, 1 deep`, function () {
                const i: Interval<any> = { start: p1, end: p2 }
                i.referenceIntervals = { aSource: [i] }
                callIt(i).should.be[psSubtypeOfTarget]()
              })
            })
          })
        })
      })
    })
    describe('object without compareFn', function () {
      it('returns false because the interval is degenerate (all objects are the same)', function () {
        isInterval({ start: {}, end: new A(27) }, Object).should.be.false()
      })
    })
    describe('interval with referenceIntervals, false', function () {
      it('returns false when a first level reference interval features a different type', function () {
        isInterval(
          { start: 1, end: 2, referenceIntervals: { property: [{ start: 'not a number' }] } },
          'number'
        ).should.be.false()
      })
      it('returns false when a first level reference interval features a different type, and the interval itself is indefinite', function () {
        isInterval({ referenceIntervals: { property: [{ start: 'not a number' }] } }, 'number').should.be.false()
      })
      it('returns false when a second level reference interval features a different type', function () {
        isInterval(
          {
            start: 1,
            end: 2,
            referenceIntervals: {
              property: [
                { start: 3 },
                {
                  end: 7,
                  referenceIntervals: {
                    anotherProperty: [{ start: 12, end: 14 }, { referenceIntervals: { end: 'not a number' } }]
                  }
                }
              ]
            }
          },
          'number'
        ).should.be.false()
      })
    })
    describe('indefinite point type', function () {
      indefinites.forEach(start => {
        indefinites.forEach(end => {
          indefinites.forEach(referenceStart => {
            indefinites.forEach(referenceEnd => {
              it(`returns true when the pointType is \`undefined\` for [${inspect(start)}, ${inspect(
                end
              )}[ with reference to [${inspect(referenceStart)}, ${inspect(referenceEnd)}[`, function () {
                isInterval(
                  { start, end, referenceInterval: { property: [{ start: referenceStart, end: referenceEnd }] } },
                  undefined
                ).should.be.true()
              })
              it(`returns false when the pointType is \`undefined\` for [${inspect(
                start
              )}, 20[ with reference to [${inspect(referenceStart)}, ${inspect(referenceEnd)}[`, function () {
                isInterval(
                  { start, end: 20, referenceInterval: { property: [{ start: referenceStart, end: referenceEnd }] } },
                  undefined
                ).should.be.false()
              })
              it(`returns false when the pointType is \`undefined\` for [${inspect(start)}, ${inspect(
                end
              )}[ with reference to [20, ${inspect(referenceEnd)}[`, function () {
                isInterval(
                  { start, end, referenceInterval: { property: [{ start: 20, end: referenceEnd }] } },
                  undefined
                ).should.be.false()
              })
            })
          })
        })
      })
    })
  })
})
