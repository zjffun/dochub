export let signInUrl = "https://dochub.zjffun.com/api/auth/github";

if (process.env.NODE_ENV === "development") {
  signInUrl = "http://127.0.0.1:3001/api/auth/github";
}
