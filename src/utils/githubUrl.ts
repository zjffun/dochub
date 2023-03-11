export function githubUrl(url: string) {
  const parsedUrl = new URL(url);
  const paths = parsedUrl.pathname.split("/");
  const owner = paths[1];
  const repo = paths[2];
  const type = paths[3];
  const branch = paths[4];
  const path = paths.slice(5).join("/");

  return {
    parsedUrl,
    owner,
    repo,
    type,
    branch,
    path,
  };
}
