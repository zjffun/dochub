export let apiPrefix = "https://dochub-server.zjffun.com/api";

if (process.env.NODE_ENV === "development") {
  apiPrefix = "http://127.0.0.1:3001/api";
}

export const signInUrl = `${apiPrefix}/auth/github`;
