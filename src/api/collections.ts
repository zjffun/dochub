import { ICollection } from "../types";
import client from "./client";

export function getCollections(page: number = 1, pageSize: number = 20) {
  return client.get<any, ICollection[]>("/collections", {
    params: {
      page,
      pageSize,
    },
  });
}
