export interface IRelationGroupByPath {
  fromPath: string;
  toPath: string;
}

export interface ICollection {
  readonly name: string;
  readonly groupName: string;
  readonly lang: string;
  readonly desc: string;
}
