import { IUserInfo } from "../types";
import client from "./client";

export function getUser() {
  return client.get<any, IUserInfo>("/api/user");
}

export function getUserByLogin(login: string) {
  return client.get<any, IUserInfo>(`/api/user/${login}`);
}
