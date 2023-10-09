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

export default function createGithubBlobUrl({
  owner,
  repo,
  rev,
  path,
}: {
  owner?: string;
  repo?: string;
  rev?: string;
  path?: string;
}) {
  if (!owner || !repo || !rev || !path) {
    return "";
  }

  const url = `https://github.com/${owner}/${repo}/blob/${rev}/${path}`;

  return url;
}

export function createGithubPullUrl({
  owner,
  repo,
  pullNumber,
}: {
  owner?: string;
  repo?: string;
  pullNumber?: string | number;
}) {
  if (!owner || !repo || pullNumber !== undefined) {
    return "";
  }

  const url = `https://github.com/${owner}/${repo}/pull/${pullNumber}`;

  return url;
}
