import { apiPrefix } from "../config";
import { IDoc } from "../types";
import client from "./client";

export function createProject(project: IDoc) {
  return client.post<any, IDoc>(`${apiPrefix}/v1/project`, project);
}

export function getProjects() {
  return client.get<any, { total: number; list: IDoc[] }>(
    `${apiPrefix}/v1/projects`
  );
}
