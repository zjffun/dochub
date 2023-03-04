import client from "./client";

export interface IGetRelationViewerDataParam {
  path: string;
}

export function getRelationViewerData({ path }: IGetRelationViewerDataParam) {
  return client.get<any, any[]>("/api/relations/viewer-data", {
    params: {
      path,
    },
  });
}
