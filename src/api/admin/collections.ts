import adminClient from "./client";

export function deleteRelations(nameId: string) {
  return adminClient.delete<any, any>(`/api/collections/relations/${nameId}`);
}

export function updateProgressInfo(nameId: string) {
  return adminClient.put<any, any>(`/api/collections/progress-info/${nameId}`);
}
