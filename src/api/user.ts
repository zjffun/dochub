import axios from "axios";
import { IUserInfo } from "../types";
import client, {
  requestInterceptor,
  responseInterceptorFulfilled,
} from "./client";

export function getUser() {
  return client.get<any, IUserInfo>("/api/user");
}

export function getUserMute() {
  const instance = axios.create();

  instance.interceptors.request.use(requestInterceptor);
  instance.interceptors.response.use(responseInterceptorFulfilled);

  return instance.get<any, IUserInfo>("/api/user");
}

export function getUserByLogin(login: string) {
  return client.get<any, IUserInfo>(`/api/user/${login}`);
}
