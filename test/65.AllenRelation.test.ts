/* eslint-env mocha */

import { AllenRelation } from '../src/AllenRelation'
import 'should'
import { generateRelationTests } from './_generateRelationTests'

describe('AllenRelation', function () {
  generateRelationTests('AllenRelation', AllenRelation, [
    { name: 'PRECEDES', representation: 'p' },
    { name: 'MEETS', representation: 'm' },
    { name: 'OVERLAPS', representation: 'o' },
    { name: 'FINISHED_BY', representation: 'F' },
    { name: 'CONTAINS', representation: 'D' },
    { name: 'STARTS', representation: 's' },
    { name: 'EQUALS', representation: 'e' },
    { name: 'STARTED_BY', representation: 'S' },
    { name: 'DURING', representation: 'd' },
    { name: 'FINISHES', representation: 'f' },
    { name: 'OVERLAPPED_BY', representation: 'O' },
    { name: 'MET_BY', representation: 'M' },
    { name: 'PRECEDED_BY', representation: 'P' }
  ])
})
