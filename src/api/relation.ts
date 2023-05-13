import { apiPrefix } from "../config";
import client from "./client";

export function createRelation(relation: {
  docId: string;
  fromRange: [number, number];
  toRange: [number, number];
}) {
  return client.post<any, any>(`${apiPrefix}/v1/doc/relation`, relation);
}

export function deleteRelation({ docId, id }: { docId: string; id: string }) {
  return client.delete<any, any>(`${apiPrefix}/v1/doc/relation`, {
    data: {
      docId,
      id,
    },
  });
}
