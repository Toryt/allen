import { PointIntervalRelation } from '../lib/PointIntervalRelation'

const basicRelations: readonly PointIntervalRelation[] = PointIntervalRelation.BASIC_RELATIONS
const relations: readonly PointIntervalRelation[] = PointIntervalRelation.RELATIONS
const empty: PointIntervalRelation = PointIntervalRelation.emptyRelation()
const before: PointIntervalRelation = PointIntervalRelation.BEFORE
const after: PointIntervalRelation = PointIntervalRelation.AFTER
const full: PointIntervalRelation = PointIntervalRelation.fullRelation()
const or: PointIntervalRelation = PointIntervalRelation.or(before, after)
const or2 = PointIntervalRelation.or(or, after)
const and: PointIntervalRelation = PointIntervalRelation.and(before, after)
const and2 = PointIntervalRelation.and(and, after)

console.log(basicRelations, relations, before, empty, full, or2, and2)
