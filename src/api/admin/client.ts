import axios from "axios";

const adminClient = axios.create({});

adminClient.interceptors.request.use((req) => {
  // TODO: cookie or localstorage
  if (req.headers) {
    req.headers["Authorization"] = `Bearer ${localStorage.getItem(
      "access_token"
    )}`;
  }

  return req;
});

adminClient.interceptors.response.use((res) => {
  return res.data;
});

export default adminClient;
