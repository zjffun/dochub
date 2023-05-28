import { apiPrefix } from "../config";
import { ITranslateDocData } from "../pages/TranslateDoc";
import { IBatchCreateDocs, IDoc, IRelation } from "../types";
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

  return client.get<any, { total: number; list: IDoc[] }>(
    `${apiPrefix}/v1/docs`,
    {
      params: getDocsParams,
    }
  );
}

export function createDoc(doc: IDoc) {
  return client.post<any, IDoc>(`${apiPrefix}/v1/doc`, doc);
}

export function batchCreateDocs(doc: IBatchCreateDocs) {
  return client.post<any, IDoc>(`${apiPrefix}/v1/docs`, doc);
}

export function forkDoc(
  doc: IDoc & {
    forkedDocId: string;
  }
) {
  return client.post<any, IDoc>(`${apiPrefix}/v1/fork-doc`, doc);
}

export function deleteDoc({
  path,
  permanently,
}: {
  path: string;
  permanently?: boolean;
}) {
  return client.delete<any, { path: string }>(`${apiPrefix}/v1/doc`, {
    data: {
      path,
      permanently,
    },
  });
}

export function getViewerData({ path }: IGetViewerDataParam) {
  return client.get<any, ITranslateDocData>(`${apiPrefix}/v1/doc`, {
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
  toOriginalContent,
  toOriginalContentSha,
  toOriginalRev,
  toModifiedContent,
  toModifiedRev,
  toEditingContent,
  relations,
  pullNumber,
}: {
  path: string;
  fromOriginalContentSha?: string;
  fromOriginalRev?: string;
  fromModifiedContent?: string;
  fromModifiedRev?: string;
  toOriginalContent?: string;
  toOriginalContentSha?: string;
  toOriginalRev?: string;
  toModifiedContent?: string;
  toModifiedRev?: string;
  toEditingContent?: string;
  relations?: IRelation[];
  pullNumber?: number;
}) {
  return client.put<any, any>(`${apiPrefix}/v1/doc`, {
    path,
    fromOriginalContentSha,
    fromOriginalRev,
    fromModifiedContent,
    fromModifiedRev,
    toOriginalContent,
    toOriginalContentSha,
    toOriginalRev,
    toModifiedContent,
    toModifiedRev,
    toEditingContent,
    relations,
    pullNumber,
  });
}
