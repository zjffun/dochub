export interface IDoc {
  readonly path: string;
  readonly name: string;
  readonly desc: string;
  readonly lang: string;
  readonly logoUrl: string;
  readonly docUrl: string;
  readonly originalLineNum: number;
  readonly translatedLineNum: number;
  readonly consistentLineNum: number;
}
