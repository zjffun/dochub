import { IUserInfo } from "../store";
import client from "./client";

export function getUser() {
  return client.get<any, IUserInfo>("/api/user");
}
