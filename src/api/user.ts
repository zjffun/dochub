import axios from "axios";
import { apiPrefix } from "../config";
import { IUserInfo } from "../types";
import client, {
  requestInterceptor,
  responseInterceptorFulfilled,
} from "./client";

export function getUser() {
  return client.get<any, IUserInfo>(`${apiPrefix}/v1/current-user`);
}

export function getUserMute() {
  const instance = axios.create();

  instance.interceptors.request.use(requestInterceptor);
  instance.interceptors.response.use(responseInterceptorFulfilled);

  return instance.get<any, IUserInfo>(`${apiPrefix}/v1/current-user`);
}

export function getUserByLogin(login: string) {
  return client.get<any, IUserInfo>(`${apiPrefix}/v1/user`, {
    params: {
      login,
    },
  });
}

export function getCurrentUserPermissions({ path }: { path: string }) {
  const instance = axios.create();

  instance.interceptors.request.use(requestInterceptor);
  instance.interceptors.response.use(responseInterceptorFulfilled);

  return instance.get<any, any>(`${apiPrefix}/v1/current-user/permissions`, {
    params: {
      path,
    },
  });
}
