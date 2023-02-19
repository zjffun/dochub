import client from "./client";

export function saveTranslatedContent({
  fromPath,
  toPath,
  nameId,
  content,
}: {
  fromPath: string;
  toPath: string;
  nameId: string;
  content: string;
}) {
  return client.post<any, { title: string }>("/api/translated-content", {
    fromPath,
    toPath,
    nameId,
    content,
  });
}
