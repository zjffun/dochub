export interface IDoc {
  readonly path: string;
  readonly name?: string;
  readonly desc?: string;
  readonly lang?: string;
  readonly logoUrl?: string;
  readonly docUrl?: string;
  readonly originalLineNum?: number;
  readonly translatedLineNum?: number;
  readonly consistentLineNum?: number;
  readonly originalOwner?: string;
  readonly originalRepo?: string;
  readonly originalBranch?: string;
  readonly originalPath?: string;
  readonly originalRev?: string;
  readonly originalContent?: string;
  readonly translatedOwner?: string;
  readonly translatedRepo?: string;
  readonly translatedBranch?: string;
  readonly translatedPath?: string;
  readonly translatedRev?: string;
  readonly translatedContent?: string;
}

export interface IFormOption {
  label: string;
  value: string;
}

export interface IUserInfo {
  login: string;
  name: string;
  role: string;
  avatarUrl: string;
  email: string;
}
