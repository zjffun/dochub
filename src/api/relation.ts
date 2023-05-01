import client from "./client";

export function createRelation(relation: {
  docId: string;
  fromRange: [number, number];
  toRange: [number, number];
}) {
  return client.post<any, any>("/api/doc-relation", relation);
}

export function deleteRelation({ docId, id }: { docId: string; id: string }) {
  return client.delete<any, any>(`/api/doc-relation/${docId}/${id}`);
}
