import client from "./client";

export function saveTranslatedContent({
  path,
  content,
}: {
  path: string;
  content: string;
}) {
  return client.post<any, { path: string }>("/api/translated-content", {
    path,
    content,
  });
}
