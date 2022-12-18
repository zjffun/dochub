import axios from "axios";

const client = axios.create({});

client.interceptors.response.use((res) => {
  return res.data;
});

export default client;
