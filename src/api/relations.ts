import { IRelationGroupByPath } from "../types";
import client from "./client";

export interface IGetRelationViewerDataParam {
  fromPath: string;
  toPath: string;
  nameId: string;
}

export function getListGroupByPath({
  page,
  pageSize,
  nameId,
}: {
  page?: number;
  pageSize?: number;
  nameId: string;
}) {
  return client.get<any, { total: number; list: IRelationGroupByPath[] }>(
    "/api/relations/path-list",
    {
      params: {
        page,
        pageSize,
        nameId,
      },
    }
  );
}

export function getRelationViewerData({
  fromPath,
  toPath,
  nameId,
}: IGetRelationViewerDataParam) {
  return client.get<any, any[]>("/api/relations/viewer-data", {
    params: {
      fromPath,
      toPath,
      nameId,
    },
  });
}
