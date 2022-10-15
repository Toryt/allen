/* eslint-env mocha */

import should from 'should'
import {
  pointTypeOf,
  primitivePointTypes,
  DefinitePoint,
  DefinitePointTypeFor,
  DefinitePointTypeRepresentation,
  isDefinitePoint,
  isPoint,
  Point,
  PointTypeFor
} from '../src/point'
import { inspect } from 'util'
import { isDefinitePointTypeRepresentation } from '../lib2/point'

const notAPointCases = [NaN, Symbol('not a point')]
const dontKnowCases = [undefined, null]
const primitiveCases = [
  Number.NEGATIVE_INFINITY,
  Number.MIN_VALUE,
  Number.MIN_SAFE_INTEGER,
  -34,
  0,
  Number.EPSILON,
  1,
  Math.LN2,
  Math.PI,
  45,
  Number.MAX_SAFE_INTEGER,
  Number.MAX_VALUE,
  Number.POSITIVE_INFINITY,
  -895672890643709647309687348967934n,
  -34n,
  -1n,
  0n,
  1n,
  89679867134989671398678136983476983476982679234n,
  'a string',
  '   an untrimmed string    ',
  '',
  true,
  false,
  function () {
    return true
  },
  (a: string) => a + '!',
  Number(4),
  BigInt(4),
  String('a wrapped string'),
  Boolean(false),
  Number,
  BigInt,
  String,
  Boolean,
  Array,
  Date,
  Object
]

class A {
  public a: number

  constructor () {
    this.a = 4
  }
}

class B extends A {
  public b: string

  constructor () {
    super()
    this.b = 'a string'
  }
}

class C {
  public c: boolean

  constructor () {
    this.c = false
  }
}

const objectCases = [
  new Date(89673548),
  {},
  { a: 'an object' },
  [],
  [1, 2],
  [1, {}],
  Math,
  JSON,
  new A(),
  new B(),
  new C()
]

const pointCases = (notAPointCases as unknown[])
  .concat(dontKnowCases)
  .concat(primitiveCases)
  .concat(objectCases)

const pptsAsDefinitePointTypeRepresentations: readonly DefinitePointTypeRepresentation[] = primitivePointTypes
const pointTypeRepresentations: DefinitePointTypeRepresentation[] = pptsAsDefinitePointTypeRepresentations.concat([
  Object,
  Date,
  A,
  B,
  C
])

function notAConstructor1 (): string {
  return 'not a constructor 1'
}

notAConstructor1.prototype.constructor = A

function notAConstructor2 (): string {
  return 'not a constructor 2'
}

notAConstructor2.prototype = Object.prototype

const idiotDefinitePointTypeRepresentations = [
  null,
  'undefined',
  'object',
  'symbol',
  'another string',
  '',
  43,
  890623470896376978306924906437890634n,
  true,
  false,
  Symbol('not a point type representation'),
  {},
  new A(),
  [],
  [1, 2, 3],
  notAConstructor1,
  notAConstructor2,
  () => 43
]

describe('point', function () {
  describe('primitivePointTypes', function () {
    it('is an array of strings', function () {
      primitivePointTypes.should.be.an.Array()
      primitivePointTypes.forEach(ppt => {
        ppt.should.be.a.String()
      })
    })

    const notPrimitivePointTypes = ['object', 'symbol', 'undefined']
    const pptsAsString: string[] = primitivePointTypes.slice()
    notPrimitivePointTypes.forEach(nppt => {
      it(`${nppt} is not a primitive point type`, function () {
        pptsAsString.includes(nppt).should.be.false()
      })
    })
  })
  describe('isDefinitePointTypeRepresentation', function () {
    describe('yes', function () {
      pointTypeRepresentations.forEach(ptr => {
        it(`returns true for ${inspect(ptr)}`, function () {
          isDefinitePointTypeRepresentation(ptr).should.be.true()
          const typed: DefinitePointTypeRepresentation = ptr
          console.log(typed)
        })
      })
    })
    describe('idiot point types', function () {
      idiotDefinitePointTypeRepresentations.forEach(iptr => {
        it(`returns false for ${inspect(iptr)}`, function () {
          isDefinitePointTypeRepresentation(iptr).should.be.false()
          // @ts-expect-error
          const typed: DefinitePointTypeRepresentation = iptr
          console.log(typed)
        })
      })
    })
  })
  describe('pointTypeOf', function () {
    describe('false result', function () {
      notAPointCases.forEach(c => {
        it(`returns false for ${inspect(c)}`, function () {
          should(pointTypeOf(c)).be.false()
        })
      })
    })
    describe("don't know 🤷", function () {
      dontKnowCases.forEach(c => {
        it(`returns undefined for ${inspect(c)}`, function () {
          should(pointTypeOf(c)).be.undefined()
        })
      })
    })
  })
  describe('primitive and wrapper types', function () {
    primitiveCases.forEach(c => {
      it(`returns ${typeof c} for ${inspect(c)}`, function () {
        should(pointTypeOf(c)).equal(typeof c)
      })
    })
  })
  describe('objects', function () {
    objectCases.forEach(c => {
      it(`returns the constructor for ${inspect(c)}`, function () {
        should(pointTypeOf(c)).equal(c.constructor)
      })
    })
  })
  describe('isDefinitePoint', function () {
    describe('without point type', function () {
      describe('not a point', function () {
        notAPointCases.forEach(c => {
          it(`returns false for ${inspect(c)}, because it is not a point`, function () {
            isDefinitePoint(c).should.be.false()
            // MUDO typescript should forbid this assignment, since `c` can be `symbol`, which is not a `DefinitePoint`
            //      It cannot help us with NaN, but it should with `symbol`
            const typed: DefinitePoint = c
            console.log(typed)
          })
        })
      })
      describe("don't know", function () {
        dontKnowCases.forEach(c => {
          it(`returns false for ${inspect(c)}, because it is indefinite`, function () {
            isDefinitePoint(c).should.be.false()
            // typescript forbids this assignment, since `c` is `undefined | null`, which is not a `DefinitePoint`
            // @ts-expect-error
            const typed: DefinitePoint = c
            console.log(typed)
          })
        })
      })
      describe('primitive or wrapped value', function () {
        primitiveCases.forEach(c => {
          it(`returns true for primitive or wrapped value ${inspect(c)}`, function () {
            isDefinitePoint(c).should.be.true()
            // typescript allows this assignment, since `c` is of a type that is a `DefinitePoint`
            const typed: DefinitePoint = c
            console.log(typed)
          })
        })
      })
      describe('object', function () {
        objectCases.forEach(c => {
          it(`returns true for object ${inspect(c)}`, function () {
            isDefinitePoint(c).should.be.true()
            // typescript allows this assignment, since `c` is an object, which is a `DefinitePoint`
            const typed: DefinitePoint = c
            console.log(typed)
          })
        })
      })
    })
    describe('with point type', function () {
      describe('not a point', function () {
        pointTypeRepresentations.forEach(ptr => {
          describe(`point type ${inspect(ptr)}`, function () {
            notAPointCases.forEach(c => {
              it(`returns false for ${inspect(c)} with point type ${inspect(
                ptr
              )}, because it is not a point`, function () {
                isDefinitePoint(c, ptr).should.be.false()
                // MUDO typescript should forbid this assignment, since `c` can be `symbol`, which is not a `DefinitePoint`
                //      It cannot help us with NaN, but it should with `symbol`
                const typed: DefinitePoint = c
                console.log(typed)
              })
            })
          })
        })
      })
      describe("don't know", function () {
        pointTypeRepresentations.forEach(ptr => {
          describe(`point type ${inspect(ptr)}`, function () {
            dontKnowCases.forEach(c => {
              it(`returns false for ${inspect(c)} with point type ${inspect(
                ptr
              )}, because it is indefinite`, function () {
                isDefinitePoint(c, ptr).should.be.false()
                // typescript forbids this assignment, since `c` is `undefined | null`, which is not a `DefinitePoint`
                // @ts-expect-error
                const typed: DefinitePoint = c
                console.log(typed)
              })
            })
          })
        })
      })
      describe('primitive or wrapped value', function () {
        pointTypeRepresentations.forEach(ptr => {
          describe(`point type ${inspect(ptr)}`, function () {
            primitiveCases.forEach(c => {
              if (
                /* eslint-disable-line valid-typeof */ typeof c === ptr ||
                (typeof c === 'function' && typeof ptr === 'function' && c instanceof ptr)
              ) {
                it(`returns true for primitive or wrapped value ${inspect(c)} with point type ${inspect(
                  ptr
                )}`, function () {
                  isDefinitePoint(c, ptr).should.be.true()
                  // typescript allows this assignment, since `c` is of a type that is a `DefinitePoint`
                  const typed: DefinitePointTypeFor<typeof ptr> = c
                  console.log(typed)
                })
              } else {
                it(`returns false for primitive or wrapped value ${inspect(c)} with point type ${inspect(
                  ptr
                )}`, function () {
                  isDefinitePoint(c, ptr).should.be.false()
                  // typescript allows this assignment, since `c` is of a type that is a `DefinitePoint`
                  // if we do not add more static information about `ptr`, TS cannot do better
                  const typed: DefinitePoint = c
                  console.log(typed)
                })
              }
            })
          })
        })
      })
      describe('object', function () {
        pointTypeRepresentations.forEach(ptr => {
          describe(`point type ${inspect(ptr)}`, function () {
            objectCases.forEach(c => {
              if (typeof ptr === 'function' && c instanceof ptr) {
                it(`returns true for object ${inspect(c)} with point type ${inspect(ptr)}`, function () {
                  isDefinitePoint(c, ptr).should.be.true()
                  // typescript allows this assignment, since `c` is an object, which is a `DefinitePoint`
                  const typed: DefinitePointTypeFor<typeof ptr> = c
                  console.log(typed)
                })
              } else {
                it(`returns false for object ${inspect(c)} with point type ${inspect(ptr)}`, function () {
                  isDefinitePoint(c, ptr).should.be.false()
                  // typescript allows this assignment, since `c` is an object, which is a `DefinitePoint`
                  // if we do not add more static information about `ptr`, TS cannot do better
                  const typed: DefinitePoint = c
                  console.log(typed)
                })
              }
            })
          })
        })
      })
      describe('idiot definite point types', function () {
        idiotDefinitePointTypeRepresentations.forEach(iptr => {
          describe(`with ${inspect(iptr)} as point type`, function () {
            pointCases.forEach(c => {
              it(`returns false for ${inspect(c)} with point type ${inspect(iptr)}`, function () {
                // @ts-expect-error : TS does not allow this
                isDefinitePoint(c, iptr).should.be.false()
              })
            })
          })
        })
      })
    })
  })
  describe('isPoint', function () {
    describe('without point type', function () {
      describe('not a point', function () {
        notAPointCases.forEach(c => {
          it(`returns false for ${inspect(c)}, because it is not a point`, function () {
            isPoint(c).should.be.false()
            // MUDO typescript should forbid this assignment, since `c` can be `symbol`, which is not a `DefinitePoint`
            //      It cannot help us with NaN, but it should with `symbol`
            const typed: Point = c
            console.log(typed)
          })
        })
      })
      describe("don't know", function () {
        dontKnowCases.forEach(c => {
          it(`returns true for ${inspect(c)}, because it is indefinite`, function () {
            isPoint(c).should.be.true()
            // typescript allows this assignment, since `c` is `undefined | null`, which is a `Point`
            const typed: Point = c
            console.log(typed)
          })
        })
      })
      describe('primitive or wrapped value', function () {
        primitiveCases.forEach(c => {
          it(`returns true for primitive or wrapped value ${inspect(c)}`, function () {
            isPoint(c).should.be.true()
            // typescript allows this assignment, since `c` is of a type that is a `DefinitePoint`
            const typed: Point = c
            console.log(typed)
          })
        })
      })
      describe('object', function () {
        objectCases.forEach(c => {
          it(`returns true for object ${inspect(c)}`, function () {
            isPoint(c).should.be.true()
            // typescript allows this assignment, since `c` is an object, which is a `DefinitePoint`
            const typed: Point = c
            console.log(typed)
          })
        })
      })
    })
    describe('with point type', function () {
      describe('not a point', function () {
        pointTypeRepresentations.forEach(ptr => {
          describe(`point type ${inspect(ptr)}`, function () {
            notAPointCases.forEach(c => {
              it(`returns false for ${inspect(c)} with point type ${inspect(
                ptr
              )}, because it is not a point`, function () {
                isPoint(c, ptr).should.be.false()
                // MUDO typescript should forbid this assignment, since `c` can be `symbol`, which is not a `DefinitePoint`
                //      It cannot help us with NaN, but it should with `symbol`
                const typed: Point = c
                console.log(typed)
              })
            })
          })
        })
      })
      describe("don't know", function () {
        pointTypeRepresentations.forEach(ptr => {
          describe(`point type ${inspect(ptr)}`, function () {
            dontKnowCases.forEach(c => {
              it(`returns true for ${inspect(c)} with point type ${inspect(
                ptr
              )}, because it is indefinite`, function () {
                isPoint(c, ptr).should.be.true()
                // typescript allows this assignment, since `c` is `undefined | null`, which is a `Point`
                const typed: Point = c
                console.log(typed)
              })
            })
          })
        })
      })
      describe('primitive or wrapped value', function () {
        pointTypeRepresentations.forEach(ptr => {
          describe(`point type ${inspect(ptr)}`, function () {
            primitiveCases.forEach(c => {
              if (
                /* eslint-disable-line valid-typeof */ typeof c === ptr ||
                (typeof c === 'function' && typeof ptr === 'function' && c instanceof ptr)
              ) {
                it(`returns true for primitive or wrapped value ${inspect(c)} with point type ${inspect(
                  ptr
                )}`, function () {
                  isPoint(c, ptr).should.be.true()
                  // typescript allows this assignment, since `c` is of a type that is a `DefinitePoint`
                  const typed: PointTypeFor<typeof ptr> = c
                  console.log(typed)
                })
              } else {
                it(`returns false for primitive or wrapped value ${inspect(c)} with point type ${inspect(
                  ptr
                )}`, function () {
                  isPoint(c, ptr).should.be.false()
                  // typescript allows this assignment, since `c` is of a type that is a `DefinitePoint` (although not of the expected type)
                  // if we do not add more static information about `ptr`, TS cannot do better
                  const typed: Point = c
                  console.log(typed)
                })
              }
            })
          })
        })
      })
      describe('object', function () {
        pointTypeRepresentations.forEach(ptr => {
          describe(`point type ${inspect(ptr)}`, function () {
            objectCases.forEach(c => {
              if (typeof ptr === 'function' && c instanceof ptr) {
                it(`returns true for object ${inspect(c)} with point type ${inspect(ptr)}`, function () {
                  isPoint(c, ptr).should.be.true()
                  // typescript allows this assignment, since `c` is an object, which is a `DefinitePoint`
                  const typed: PointTypeFor<typeof ptr> = c
                  console.log(typed)
                })
              } else {
                it(`returns false for object ${inspect(c)} with point type ${inspect(ptr)}`, function () {
                  isPoint(c, ptr).should.be.false()
                  // typescript allows this assignment, since `c` is an object, which is a `DefinitePoint`
                  const typed: Point = c
                  console.log(typed)
                })
              }
            })
          })
        })
      })
      describe('idiot definite point types', function () {
        idiotDefinitePointTypeRepresentations.forEach(iptr => {
          describe(`with ${inspect(iptr)} as point type`, function () {
            pointCases.forEach(c => {
              it(`returns false for ${inspect(c)} with point type ${inspect(iptr)}`, function () {
                // @ts-expect-error: TS does not allow this
                isPoint(c, iptr).should.be.false()
              })
            })
          })
        })
      })
    })
  })
})
