<!---
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
-->

# Allen

Reason and validate the relations between intervals, and points and intervals, in JavaScript and TypeScript. This
library does not help with inference.

When working with intervals, we often want to express constraints (invariants) that limit acceptable combinations.
Expressing this correctly proves difficult in practice. Falling back to working with isolated start and end points, and
reasoning about their relations, in practice proves to be even much more difficult and error-prone. This problem was
tackled in 1983 by James Allen:

- [Allen, James F. “Maintaining knowledge about temporal intervals”], _Communications of the ACM 26(11) pages 832-843;
  November 1983_)

Good synopses of this theory are

- [Wikipedia]
- [Thomas A. Alspaugh “Allen's interval algebra”].

## How to use

```ts
import { Interval } from './Interval'
import { AllenRelation } from './AllenRelation'
import { PointIntervalRelation } from './PointIntervalRelation'

const iiCondition1: AllenRelation = AllenRelation.fromString<AllenRelation>('pbsSd')
const iiCcondition2: AllenRelation = AllenRelation.fromString<AllenRelation>('sDe')
const iiCondition: AllenRelation = iiCondition1.compose(iiCondition2)

const i1: Interval<string> = { start: '2022-11-04', end: '2023-04-12' }
const i2: Interval<string> = { start: '2021-08-22' }

const actual: AllenRelation = AllenRelation.relation(i1, i2)
if (!actual.implies(iiCondition)) {
  throw new Error(`i1 and i2 do no uphold ${iiCondition.toString()}`)
}

const piCondition1: PointIntervalRelation = PointIntervalRelation.or(
  PointIntervalRelation.BEFORE,
  PointIntervalRelation.TERMINATE
)
const piCondition: PointIntervalRelation = PointIntervalRelation.compose(piCondition1, iiCcondition2)

const p: string = '2021-08-15'
const piActual: PointIntervalRelation = PointIntervalRelation.relation(p, i2)
if (!piActual.implies(piCondition)) {
  throw new Error(`p and i2 do not uphold ${piCondition.toString()}`)
}
```

## Where to find

Repo, CI, issues, pull requests This project is maintained in [Bitbucket] (repo, CI, issues, pull requests, …).

<p style="background-color: lightyellow; color: darkgray;"><strong>TODO</strong> Branches are copied automatically 
to [GitHub] by CI. This is done as backup, and because open source projects are more easily found there. Issues and 
pull requests there will not be reviewed.</p>

### npm

[@toryt/allen][npm]

## Style

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

This code uses the application to TypeScript[eslint-config-standard-with-typescript] of the [Standard] coding style.
Tests require complete code coverage.

## License

Released under the [Apache License, Version 2.0][license].

<div style="font-style: italic; color: darkslategray;">
<p>Copyright © 2022 by Jan Dockx</p>

<p>Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with
the License. You may obtain a copy of the License at</p>

<p style="margin-left: 1cm;"><a href="http://www.apache.org/licenses/LICENSE-2.0">http://www.apache.org/licenses/LICENSE-2.0</a></p>

<p>Unless required by applicable law or agreed to in writing, software distributed under the License is distributed 
on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for 
the specific language governing permissions and limitations under the License.</p>
</div>

## Notes

This code was based on
[a Java implementation](https://github.com/jandppw/ppwcode-recovered-from-google-code/tree/master/java/value/trunk/src/main/java/org/ppwcode/value_III/time/interval)
last updated in December 2008.

[allen, james f. “maintaining knowledge about temporal intervals”]: https://dl.acm.org/doi/pdf/10.1145/182.358434
[wikipedia]: https://en.wikipedia.org/wiki/Allen%27s_interval_algebra
[thomas a. alspaugh “allen's interval algebra”]: https://www.ics.uci.edu/~alspaugh/cls/shr/allen.html
[bitbucket]: https://bitbucket.org/toryt/allen
[github]: https://github.com/Toryt/allen
[npm]: https://www.npmjs.com/package/@toryt/allen
[standard]: https://standardjs.com
[eslint-config-standard-with-typescript]: https://github.com/standard/eslint-config-standard-with-typescript
[license]: ./LICENSE
