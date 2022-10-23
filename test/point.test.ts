/* eslint-env mocha */

import 'should'
import { Point, Indefinite, PointTypeFor, isPoint, isIndefinitePoint } from '../src/point'
import { inspect } from 'util'
import { idiotPointTypeRepresentations, pointTypeRepresentations } from './_pointTypeRepresentationCases'
import { dontKnowCases, objectCases, pointCases, primitiveCases } from './_pointCases'

describe('point', function () {
  describe('isPoint', function () {
    describe('without point type', function () {
      describe("don't know", function () {
        dontKnowCases.forEach(c => {
          it(`returns false for ${inspect(c)}, because it is indefinite`, function () {
            isPoint(c).should.be.false()
            // typescript forbids this assignment, since `c` is `undefined | null`, which is not a `Point`
            // @ts-expect-error
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
      describe("don't know", function () {
        pointTypeRepresentations.forEach(ptr => {
          describe(`point type ${inspect(ptr)}`, function () {
            dontKnowCases.forEach(c => {
              it(`returns false for ${inspect(c)} with point type ${inspect(
                ptr
              )}, because it is indefinite`, function () {
                isPoint(c, ptr).should.be.false()
                // typescript forbids this assignment, since `c` is `undefined | null`, which is not a `DefinitePoint`
                // @ts-expect-error
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
              if (/* eslint-disable-line valid-typeof */ typeof c === ptr) {
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
                  // typescript allows this assignment, since `c` is of a type that is a `DefinitePoint`
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
                  // if we do not add more static information about `ptr`, TS cannot do better
                  const typed: Point = c
                  console.log(typed)
                })
              }
            })
          })
        })
      })
      describe('idiot definite point types', function () {
        idiotPointTypeRepresentations.forEach(iptr => {
          describe(`with ${inspect(iptr)} as point type`, function () {
            pointCases.forEach(c => {
              it(`returns false for ${inspect(c)} with point type ${inspect(iptr)}`, function () {
                // @ts-expect-error : TS does not allow this
                isPoint(c, iptr).should.be.false()
              })
            })
          })
        })
      })
    })
  })
  describe('isIndefinitePoint', function () {
    describe('without point type', function () {
      // MUDO makes no sense: always true
      describe("don't know", function () {
        dontKnowCases.forEach(c => {
          it(`returns true for ${inspect(c)}, because it is indefinite`, function () {
            isIndefinitePoint(c).should.be.true()
            // typescript allows this assignment, since `c` is `undefined | null`, which is a `Point`
            const typed: Indefinite<Point> = c
            console.log(typed)
          })
        })
      })
      describe('primitive or wrapped value', function () {
        primitiveCases.forEach(c => {
          it(`returns true for primitive or wrapped value ${inspect(c)}`, function () {
            isIndefinitePoint(c).should.be.true()
            // typescript allows this assignment, since `c` is of a type that is a `DefinitePoint`
            const typed: Indefinite<Point> = c
            console.log(typed)
          })
        })
      })
      describe('object', function () {
        objectCases.forEach(c => {
          it(`returns true for object ${inspect(c)}`, function () {
            isIndefinitePoint(c).should.be.true()
            // typescript allows this assignment, since `c` is an object, which is a `DefinitePoint`
            const typed: Indefinite<Point> = c
            console.log(typed)
          })
        })
      })
    })
    describe('with point type', function () {
      describe("don't know", function () {
        pointTypeRepresentations.forEach(ptr => {
          describe(`point type ${inspect(ptr)}`, function () {
            dontKnowCases.forEach(c => {
              it(`returns true for ${inspect(c)} with point type ${inspect(
                ptr
              )}, because it is indefinite`, function () {
                isIndefinitePoint(c, ptr).should.be.true()
                // typescript allows this assignment, since `c` is `undefined | null`, which is a `Point`
                const typed: Indefinite<PointTypeFor<typeof ptr>> = c
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
              if (/* eslint-disable-line valid-typeof */ typeof c === ptr) {
                it(`returns true for primitive or wrapped value ${inspect(c)} with point type ${inspect(
                  ptr
                )}`, function () {
                  isIndefinitePoint(c, ptr).should.be.true()
                  // typescript allows this assignment, since `c` is of a type that is a `DefinitePoint`
                  const typed: Indefinite<PointTypeFor<typeof ptr>> = c
                  console.log(typed)
                })
              } else {
                it(`returns false for primitive or wrapped value ${inspect(c)} with point type ${inspect(
                  ptr
                )}`, function () {
                  isIndefinitePoint(c, ptr).should.be.false()
                  // typescript allows this assignment, since `c` is of a type that is a `DefinitePoint` (although not of the expected type)
                  // if we do not add more static information about `ptr`, TS cannot do better
                  const typed: Indefinite<PointTypeFor<typeof ptr>> = c
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
                  isIndefinitePoint(c, ptr).should.be.true()
                  // typescript allows this assignment, since `c` is an object, which is a `DefinitePoint`
                  const typed: Indefinite<PointTypeFor<typeof ptr>> = c
                  console.log(typed)
                })
              } else {
                it(`returns false for object ${inspect(c)} with point type ${inspect(ptr)}`, function () {
                  isIndefinitePoint(c, ptr).should.be.false()
                  // typescript allows this assignment, since `c` is an object, which is a `DefinitePoint`
                  const typed: Indefinite<PointTypeFor<typeof ptr>> = c
                  console.log(typed)
                })
              }
            })
          })
        })
      })
      describe('idiot definite point types', function () {
        idiotPointTypeRepresentations.forEach(iptr => {
          describe(`with ${inspect(iptr)} as point type`, function () {
            pointCases.forEach(c => {
              it(`returns false for ${inspect(c)} with point type ${inspect(iptr)}`, function () {
                // @ts-expect-error: TS does not allow this
                isIndefinitePoint(c, iptr).should.be.false()
              })
            })
          })
        })
      })
    })
  })
})
