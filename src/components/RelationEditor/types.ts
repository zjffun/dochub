export type { IRelation } from "../../types.d";

export enum RelationTypeEnum {
  add = "add",
  remove = "remove",
  change = "change",
  relate = "relate",
  dirty = "dirty",
  temp = "temp",
  unknown = "unknown",
}

export type IScrollTopMap = [
  [number, number],
  [number, number],
  [number, number]
];

export interface ILink {
  source: [
    [number, number],
    [number, number],
    [number, number],
    [number, number]
  ];
  target: [
    [number, number],
    [number, number],
    [number, number],
    [number, number]
  ];
  type: RelationTypeEnum;
  id?: string;
}
