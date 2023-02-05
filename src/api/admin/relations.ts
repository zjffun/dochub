import client from "./client";

export function addRelations(relations: any[]) {
  return client.post<any, any>("/api/relations", relations);
}
