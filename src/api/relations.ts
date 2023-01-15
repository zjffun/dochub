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
    "/api/relations/getListGroupByPath",
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
  return client.get<any, any[]>("/api/relations/getRelationViewerData", {
    params: {
      fromPath,
      toPath,
      nameId,
    },
  });
}
