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

export class A {
  public a: number

  constructor(a: number) {
    this.a = a
  }
}

export class B extends A {
  public b: string

  constructor() {
    super(444)
    this.b = 'a string'
  }
}

export class C {
  public c: boolean

  constructor() {
    this.c = false
  }
}
