import { IDoc } from "../types";
import client from "./client";

export class GetDocsParams {
  page?: number = 1;
  pageSize?: number = 20;
  path?: string = "/";
  depth?: number = 1;

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

export function getViewerData({ path }: IGetViewerDataParam) {
  return client.get<any, any[]>("/api/doc/viewer-data", {
    params: {
      path,
    },
  });
}

export function saveTranslatedContent({
  path,
  content,
}: {
  path: string;
  content: string;
}) {
  return client.put<any, { path: string }>("/api/doc", {
    path,
    translatedContent: content,
  });
}
