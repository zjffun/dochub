import client from "./client";

export function createRelations(
  relations: {
    docObjectId: string;
    fromRange: [number, number];
    toRange: [number, number];
    state: string;
  }[]
) {
  return client.post<any, any>("/api/relations", relations);
}

export function deleteRelation(relationId: string) {
  return client.delete<any, any>(`/api/relation/${relationId}`);
}
