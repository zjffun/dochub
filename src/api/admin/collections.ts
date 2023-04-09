import adminClient from "./client";

export function deleteRelations(collectionName: string) {
  return adminClient.delete<any, any>(`/api/collections/relations/${collectionName}`);
}

export function updateProgressInfo(collectionName: string) {
  return adminClient.put<any, any>(`/api/collections/progress-info/${collectionName}`);
}
