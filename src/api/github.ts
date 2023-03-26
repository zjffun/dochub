import { Base64 } from "js-base64";
import { Octokit } from "octokit";

function getOctokit() {
  const token = window.localStorage.getItem("github_token");

  const octokit = new Octokit({
    auth: token,
  });

  return octokit;
}

async function getBranchRev({
  owner,
  repo,
  branch,
}: {
  owner: string;
  repo: string;
  branch: string;
}) {
  const octokit = getOctokit();

  const res = await octokit.graphql<any>(
    `query($owner: String!, $repo: String!, $branch: String!) {
      repository(owner: $owner, name: $repo) {
        ref(qualifiedName: $branch) {
          target {
            ... on Commit {
              oid,
              committedDate
            }
          }
        }
      }    
    }`,
    {
      owner,
      repo,
      branch,
    }
  );

  return {
    oid: res.repository.ref.target.oid,
    date: res.repository.ref.target.committedDate,
  };
}

async function getLastOriginalFromRev({
  owner,
  repo,
  branch,
  date,
}: {
  owner: string;
  repo: string;
  branch: string;
  date: string;
}) {
  const octokit = getOctokit();

  const res = await octokit.graphql<any>(
    `query($owner: String!, $repo: String!, $branch: String!, $date: GitTimestamp!) {
      repository(owner: $owner, name: $repo) {
        ref(qualifiedName: $branch) {
          target {
            ... on Commit {
              history(first: 1, until: $date) {
                nodes {
                  oid,
                  committedDate
                }
              }
            }
          }
        }
      }    
    }`,
    {
      owner,
      repo,
      branch,
      date,
    }
  );

  return {
    oid: res.repository.ref.target.history.nodes[0].oid,
    date: res.repository.ref.target.history.nodes[0].committedDate,
  };
}

async function getContents({
  owner,
  repo,
  rev,
  path,
}: {
  owner: string;
  repo: string;
  rev: string;
  path: string;
}) {
  const octokit = getOctokit();

  const res = await octokit.graphql<any>(
    `query ($owner: String!, $repo: String!, $rev: String!, $path: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: $rev) {
          ... on Commit {
            file(path: $path) {
              object {
                ... on Blob {
                  text
                }
              }
            }
          }
        }
      }
    }`,
    {
      owner,
      repo,
      rev,
      path,
    }
  );

  const text = res.repository.object.file.object.text;

  return text;
}

async function getTranslatedOwnerAndRepo({
  translatedOwner,
  translatedRepo,
  owner,
}: {
  translatedOwner: string;
  translatedRepo: string;
  owner: string;
}) {
  if (owner === undefined) {
    throw Error("owner is not defined.");
  }

  if (translatedOwner === undefined) {
    throw Error("translatedOwner is not defined.");
  }

  if (translatedRepo === undefined) {
    throw Error("translatedRepo is not defined.");
  }

  const octokit = getOctokit();

  // If the owner is the same as the translated owner, then we don't need to fork.
  if (owner === translatedOwner) {
    return {
      owner: translatedOwner,
      repo: translatedRepo,
    };
  }

  let repo = translatedRepo;
  if (!repo.endsWith("-dochub")) {
    repo = `${repo}-dochub`;
  }

  try {
    await octokit.graphql<any>(
      `query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          owner {
            login
          }
        }
      }`,
      {
        owner,
        repo,
      }
    );
  } catch (e) {
    const forkRes = await octokit.rest.repos.createFork({
      owner: translatedOwner,
      repo: translatedRepo,
      name: repo,
    });

    if (forkRes.status !== 202) {
      throw Error("Failed to fork the repo.");
    }
  }

  return {
    owner,
    repo,
  };
}

async function createPrBranch({
  owner,
  repo,
  rev,
}: {
  owner: string;
  repo: string;
  rev: string;
}) {
  if (owner === undefined) {
    throw Error("owner is not defined.");
  }

  if (repo === undefined) {
    throw Error("repo is not defined.");
  }

  if (rev === undefined) {
    throw Error("rev is not defined.");
  }

  const octokit = getOctokit();

  const branch = `dochub/translate-${new Date().getTime()}`;

  const res = await octokit.rest.git.createRef({
    owner,
    repo,
    sha: rev,
    ref: `refs/heads/${branch}`,
  });

  return {
    branch: res.data.ref,
    sha: res.data.object.sha,
  };
}

async function createCommit({
  owner,
  repo,
  branch,
  sha,
  path,
  contents,
  headline,
}: {
  owner: string;
  repo: string;
  branch: string;
  sha: string;
  path: string;
  contents: string;
  headline?: string;
}) {
  if (owner === undefined) {
    throw Error("owner is not defined.");
  }

  if (repo === undefined) {
    throw Error("repo is not defined.");
  }

  if (branch === undefined) {
    throw Error("branch is not defined.");
  }

  if (sha === undefined) {
    throw Error("sha is not defined.");
  }

  if (path === undefined) {
    throw Error("path is not defined.");
  }

  if (contents === undefined) {
    throw Error("contents is not defined.");
  }

  const token = window.localStorage.getItem("github_token");

  const octokit = new Octokit({
    auth: token,
  });

  let currentHeadline = headline;
  if (!currentHeadline) {
    currentHeadline = `docs: translate ${path}`;
  }

  const res = await octokit.graphql<any>(
    `mutation($input: CreateCommitOnBranchInput!) {
      createCommitOnBranch(input: $input) {
        commit {
          oid
        }
      }
    }`,
    {
      input: {
        branch: {
          repositoryNameWithOwner: `${owner}/${repo}`,
          branchName: branch,
        },
        message: {
          headline: currentHeadline,
        },
        fileChanges: {
          additions: [
            {
              path,
              contents: Base64.encode(contents),
            },
          ],
        },
        expectedHeadOid: sha,
      },
    }
  );

  return {
    oid: res.createCommitOnBranch.commit.oid,
    headline: currentHeadline,
  };
}

async function createPr({
  owner,
  repo,
  branch,
  base,
  title,
  body,
  draft,
}: {
  owner: string;
  repo: string;
  branch: string;
  base: string;
  title: string;
  body?: string;
  draft?: boolean;
}) {
  const octokit = getOctokit();

  const res = await octokit.rest.pulls.create({
    owner,
    repo,
    head: branch,
    base,
    title,
    body,
    draft,
  });

  return {
    url: res.data.html_url,
  };
}

export {
  getBranchRev,
  getLastOriginalFromRev,
  getContents,
  getTranslatedOwnerAndRepo,
  createPrBranch,
  createCommit,
  createPr,
};
