export interface IDoc {
  path: string;
  name?: string;
  desc?: string;
  lang?: string;
  logoUrl?: string;
  docUrl?: string;
  originalLineNum?: number;
  translatedLineNum?: number;
  consistentLineNum?: number;
  fromOwner?: string;
  fromRepo?: string;
  fromBranch?: string;
  fromPath?: string;
  fromOriginalRev?: string;
  fromOriginalContent?: string;
  fromModifiedRev?: string;
  fromModifiedContent?: string;
  toOwner?: string;
  toRepo?: string;
  toBranch?: string;
  toPath?: string;
  toOriginalRev?: string;
  toOriginalContent?: string;
  toModifiedRev?: string;
  toModifiedContent?: string;
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
