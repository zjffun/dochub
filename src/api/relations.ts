import { IRelationGroupByPath } from "../types";
import client from "./client";

export interface IGetRelationViewerDataParam {
  fromPath: string;
  toPath: string;
}

export function getListGroupByPath(page: number = 1, pageSize: number = 20) {
  return client.get<any, IRelationGroupByPath[]>(
    "/relations/getListGroupByPath",
    {
      params: {
        page,
        pageSize,
      },
    }
  );
}

export function getRelationViewerData({
  fromPath,
  toPath,
}: IGetRelationViewerDataParam) {
  return client.get<any, any[]>("/relations/getRelationViewerData", {
    params: {
      fromPath,
      toPath,
    },
  });
}
