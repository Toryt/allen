export interface Relation {
  impliedBy: (gr: this) => boolean
  implies: (gr: this) => boolean
}

export interface BasicRelation<BRR extends string> extends Relation {
  readonly representation: BRR
  ordinal: () => number
}

export type RepresentationOf<BR extends BasicRelation<string>> = BR['representation']

export interface BasicRelationConstructor<R extends Relation, BRR extends string, BR extends R & BasicRelation<BRR>>
  extends Function {
  BASIC_REPRESENTATIONS: readonly BRR[]
  BASIC_RELATIONS: readonly BR[]
  RELATIONS: readonly R[]
  EMPTY: R
  FULL: R
}
