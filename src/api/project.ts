import { IDoc } from "../types";
import client from "./client";

export function createProject(project: IDoc) {
  return client.post<any, IDoc>("/api/project", project);
}
