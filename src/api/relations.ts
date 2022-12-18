import { IRelationGroupByPath } from "../types";
import client from "./client";

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
