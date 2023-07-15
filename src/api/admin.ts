import { apiPrefix } from "../config";
import { IDoc } from "../types";
import client from "./client";

export function runSetDocProgressTask() {
  return client.get<any, IDoc>(`${apiPrefix}/v1/tasks/setDocProgress`);
}
