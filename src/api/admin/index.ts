import adminClient from "./client";

export * from "./collections";
export * from "./relations";

export function login(username: string, password: string) {
  return adminClient.post<any, any>("/api/auth/login", {
    username,
    password,
  });
}
