export class A {
  public a: number

  constructor () {
    this.a = 4
  }
}

export class B extends A {
  public b: string

  constructor () {
    super()
    this.b = 'a string'
  }
}

export class C {
  public c: boolean

  constructor () {
    this.c = false
  }
}
