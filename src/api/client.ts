import axios from "axios";
import { toast } from "react-toastify";

const client = axios.create({});

client.interceptors.request.use(requestInterceptor);

client.interceptors.response.use(
  responseInterceptorFulfilled,
  responseInterceptorRejected
);

export function requestInterceptor(req: any) {
  // TODO: cookie or localstorage
  if (req.headers) {
    req.headers["Authorization"] = `Bearer ${localStorage.getItem(
      "access_token"
    )}`;
  }

  return req;
}

export function responseInterceptorFulfilled(res: any) {
  return res.data;
}

export function responseInterceptorRejected(err: any) {
  toast.error(err?.response?.data?.message || "Something went wrong");
  return Promise.reject(err);
}

export default client;
