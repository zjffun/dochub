import { ICollection } from "../types";
import client from "./client";

export function getCollections(page: number = 1, pageSize: number = 20) {
  return client.get<any, { total: number; list: ICollection[] }>(
    "/api/collections",
    {
      params: {
        page,
        pageSize,
      },
    }
  );
}
