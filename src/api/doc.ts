import { IRelation } from "../components/RelationEditor/types";
import { IRelationViewerData } from "../pages/TranslateDoc";
import { IDoc } from "../types";
import client from "./client";

export class GetDocsParams {
  page?: number = 1;
  pageSize?: number = 20;
  path?: string = "/";
  depth?: number = 1;
  isDelete?: boolean = false;

  constructor(params: GetDocsParams) {
    Object.assign(this, params);
  }
}

export interface IGetViewerDataParam {
  path: string;
}

export function getDocs(params: GetDocsParams = {}) {
  const getDocsParams = new GetDocsParams(params);

  return client.get<any, { total: number; list: IDoc[] }>("/api/docs", {
    params: getDocsParams,
  });
}

export function createDoc(doc: IDoc) {
  return client.post<any, IDoc>("/api/doc", doc);
}

export function deleteDoc({
  path,
  permanently,
}: {
  path: string;
  permanently?: boolean;
}) {
  return client.delete<any, { path: string }>(`/api/doc`, {
    params: {
      path,
      permanently,
    },
  });
}

export function getViewerData({ path }: IGetViewerDataParam) {
  return client.get<any, IRelationViewerData>("/api/doc/viewer-data", {
    params: {
      path,
    },
  });
}

export function updateDoc({
  path,
  fromOriginalContentSha,
  fromOriginalRev,
  fromModifiedContent,
  fromModifiedRev,
  toOriginalContentSha,
  toOriginalRev,
  toModifiedContent,
  toModifiedRev,
  relations,
  pullNumber,
}: {
  path: string;
  fromOriginalContentSha?: string;
  fromOriginalRev?: string;
  fromModifiedContent?: string;
  fromModifiedRev?: string;
  toOriginalContentSha?: string;
  toOriginalRev?: string;
  toModifiedContent?: string;
  toModifiedRev?: string;
  relations?: IRelation[];
  pullNumber?: number;
}) {
  return client.put<any, any>("/api/doc", {
    path,
    fromOriginalContentSha,
    fromOriginalRev,
    fromModifiedContent,
    fromModifiedRev,
    toOriginalContentSha,
    toOriginalRev,
    toModifiedContent,
    toModifiedRev,
    relations,
    pullNumber,
  });
}
