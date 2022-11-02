/* eslint-env mocha */

import { AllenRelation } from '../src/AllenRelation'
import 'should'
import { generateRelationTests } from './_generateRelationTests'

describe('AllenRelation', function () {
  generateRelationTests<AllenRelation>(
    'AllenRelation',
    AllenRelation,
    [
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
    ],
    [
      { name: 'CONCURS_WITH', representation: 'oFDseSdfO' },
      { name: 'STARTS_EARLIER', representation: 'pmoFD' },
      { name: 'START_TOGETHER', representation: 'seS' },
      { name: 'STARTS_LATER', representation: 'dfOMP' },
      { name: 'STARTS_IN', representation: 'dfO' },
      { name: 'STARTS_EARLIER_AND_ENDS_EARLIER', representation: 'pmo' },
      { name: 'STARTS_LATER_AND_ENDS_LATER', representation: 'OMP' },
      { name: 'ENDS_EARLIER', representation: 'pmosd' },
      { name: 'ENDS_IN', representation: 'osd' },
      { name: 'END_TOGETHER', representation: 'Fef' },
      { name: 'ENDS_LATER', representation: 'DSOMP' },
      { name: 'CONTAINS_START', representation: 'oFD' },
      { name: 'CONTAINS_END', representation: 'DSO' }
    ],
    false // there are 67108864; it takes hours to test all combinations
  )
})
