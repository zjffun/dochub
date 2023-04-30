import { useEffect, useState } from "react";
import { getContent, getPr } from "../../api/github";
import PR_STATE from "./prState";

function usePrInfo({
  owner,
  repo,
  path,
  pullNumber,
}: {
  owner?: string;
  repo?: string;
  path?: string;
  pullNumber?: number;
}) {
  const [prState, setPrState] = useState<PR_STATE>(PR_STATE.NONE);
  const [prBranch, setPrBranch] = useState<string>();
  const [prRev, setPrRev] = useState<string>();
  const [prContent, setPrContent] = useState<string>();

  useEffect(() => {
    if (
      pullNumber === undefined ||
      pullNumber === 0 ||
      owner === undefined ||
      repo === undefined
    ) {
      setPrState(PR_STATE.NONE);
      setPrBranch(undefined);
      setPrRev(undefined);
      return;
    }

    setPrState(PR_STATE.FETCHING);
    getPr({
      owner,
      repo,
      pullNumber,
    })
      .then((data) => {
        if (data.merged) {
          setPrState(PR_STATE.MERGED);
        } else if (data.closed) {
          setPrState(PR_STATE.CLOSED);
        } else {
          setPrState(PR_STATE.OPEN);
        }
        setPrBranch(data.branch);
        setPrRev(data.rev);
      })
      .catch((error) => {
        console.error(error);
        setPrState(PR_STATE.NONE);
        setPrBranch(undefined);
        setPrRev(undefined);
      });
  }, [owner, repo, pullNumber]);

  useEffect(() => {
    if (
      owner === undefined ||
      repo === undefined ||
      path === undefined ||
      prRev === undefined
    ) {
      setPrContent(undefined);
      return;
    }

    if (prState !== PR_STATE.OPEN && prState !== PR_STATE.MERGED) {
      setPrContent(undefined);
      return;
    }

    getContent({
      owner,
      repo,
      path,
      rev: prRev,
    })
      .then((data) => {
        setPrContent(data);
      })
      .catch((error) => {
        console.error(error);
        setPrContent(undefined);
      });
  }, [owner, repo, path, prState, prRev]);

  return { prState, prBranch, prRev, prContent };
}

export default usePrInfo;
