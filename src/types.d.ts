export interface IRelationGroupByPath {
  fromPath: string;
  toPath: string;
}

export interface ICollection {
  readonly nameId: string;
  readonly name: string;
  readonly groupName: string;
  readonly lang: string;
  readonly desc: string;
  readonly logoUrl: string;
  readonly docUrl: string;
  readonly originalLineNum: number;
  readonly translatedLineNum: number;
  readonly consistentLineNum: number;
}
