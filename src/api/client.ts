import axios from "axios";
import { toast } from "react-toastify";

const client = axios.create({});

client.interceptors.request.use((req) => {
  // TODO: cookie or localstorage
  if (req.headers) {
    req.headers["Authorization"] = `Bearer ${localStorage.getItem(
      "access_token"
    )}`;
  }

  return req;
});

client.interceptors.response.use(
  (res) => {
    return res.data;
  },
  (err) => {
    toast.error(err?.response?.data?.message || "Something went wrong");
    return Promise.reject(err);
  }
);

export default client;
