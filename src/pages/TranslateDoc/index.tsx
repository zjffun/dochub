import classnames from "classnames";
import { default as _get } from "lodash-es/get";
import { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  createRelation,
  deleteRelation,
  getViewerData,
  updateDoc,
} from "../../api";
import {
  closePr,
  createCommit,
  createPr,
  createPrBranch,
  getBranchRev,
  getBranchRevAndContent,
  getToOwnerAndRepo,
} from "../../api/github";
import Loading from "../../components/Loading";
import RelationEditor, {
  IMonacoDiffEditorRelationRef,
} from "../../components/RelationEditor";
import getRelationsWithModifiedRange, {
  IViewerRelationWithModifiedRange,
} from "../../components/RelationEditor/getRelationsWithModifiedRange";
import {
  IRelation,
  RelationTypeEnum,
} from "../../components/RelationEditor/types";
import UserMenu from "../../components/UserMenu";
import { useStoreContext } from "../../store";
import getRelations from "../../utils/generateRelations/mdx/getRelations";
import openSignInWindow from "../../utils/openSignInWindow";
import pathInfo from "../../utils/pathInfo";
import ToastedError from "../../utils/ToastedError";
import PR_STATE from "./prState";
import usePrInfo from "./usePrInfo";

import "./index.scss";

enum MODE {
  EDIT = "edit",
  EDIT_RELATION = "editRelation",
}

export interface ITranslateDocData {
  id: string;
  fromPath: string;
  toPath: string;
  fromOwner: string;
  fromRepo: string;
  fromBranch: string;
  fromOriginalRev: string;
  fromModifiedRev: string;
  fromOriginalContent: string;
  fromOriginalContentSha: string;
  fromModifiedContent: string;
  fromModifiedContentSha: string;
  toOriginalRev: string;
  toModifiedRev: string;
  toOriginalContent: string;
  toOriginalContentSha: string;
  toModifiedContent: string;
  toModifiedContentSha: string;
  toEditingContent: string;
  toEditingContentSha: string;
  toOwner: string;
  toRepo: string;
  toBranch: string;
  pullNumber: number;
  relations: IRelation[];
}

interface CreateModeProps {
  onCreate?: (ranges: {
    fromStartLine: number;
    fromEndLine: number;
    toStartLine: number;
    toEndLine: number;
  }) => void;
}

const toPrStates = [PR_STATE.NONE, PR_STATE.CLOSED];

const options =
  ({ onDelete }: { onDelete: (id: string) => void }) =>
  (data: any) => {
    const OptionsComponent = () => {
      return (
        <>
          <button onClick={() => onDelete(data.id)}>Delete</button>
        </>
      );
    };

    return <OptionsComponent></OptionsComponent>;
  };

const CreateMode: FC<CreateModeProps> = ({ onCreate }) => {
  const [fromStartLine, setFromStartLine] = useState<number | undefined>();
  const [fromEndLine, setFromEndLine] = useState<number | undefined>();
  const [toStartLine, setToStartLine] = useState<number | undefined>();
  const [toEndLine, setToEndLine] = useState<number | undefined>();

  const submit = () => {
    if (
      fromStartLine === undefined ||
      fromEndLine === undefined ||
      toStartLine === undefined ||
      toEndLine === undefined
    ) {
      throw ToastedError("Can't create relation: invalid range.");
    }
    onCreate?.({
      fromStartLine,
      fromEndLine,
      toStartLine,
      toEndLine,
    });
  };

  useEffect(() => {
    const listener = (event: any) => {
      setFromStartLine(event.detail.fromStartLine);
      setFromEndLine(event.detail.fromEndLine);
      setToStartLine(event.detail.toStartLine);
      setToEndLine(event.detail.toEndLine);
    };

    // TODO: multiple diff editor
    document.addEventListener("relationCreateRangeChange", listener);

    return () => {
      document.addEventListener("relationCreateRangeChange", listener);
    };
  }, []);

  return (
    <span>
      {fromStartLine && fromEndLine && toStartLine && toEndLine && (
        <span>
          <button onClick={submit}>
            [L{fromStartLine},{fromEndLine}-L{toStartLine},{toEndLine}] Create
          </button>
        </span>
      )}
    </span>
  );
};

function RelationPage() {
  const search = window.location.search;
  const { pathname, type, docPath } = pathInfo();

  const navigate = useNavigate();
  const { userInfo } = useStoreContext();

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(MODE.EDIT);
  const [relations, setRelations] = useState<
    IViewerRelationWithModifiedRange[]
  >([]);

  const [translateDocData, setTranslateDocData] = useState<
    ITranslateDocData | undefined
  >();

  const [canUpdateFromModifiedRev, setCanUpdateFromModifiedRev] =
    useState(false);
  const [canUpdateToModifiedRev, setCanUpdateToModifiedRev] = useState(false);

  const { prState, prRev, prBranch, prContent } = usePrInfo({
    owner: translateDocData?.toOwner,
    repo: translateDocData?.toRepo,
    path: translateDocData?.toPath,
    pullNumber: translateDocData?.pullNumber,
  });

  const diffEditorRef = useRef<IMonacoDiffEditorRelationRef>(null);

  const titleHref = `${pathname}${search}`;

  const needSyncContent =
    prContent !== undefined && prContent !== translateDocData?.toEditingContent;

  const needUpdateOriginal =
    translateDocData &&
    (translateDocData.toOriginalRev !== translateDocData.toModifiedRev ||
      translateDocData.fromOriginalRev !== translateDocData.fromModifiedRev);

  const updateTranslateDocData = (newData: any) => {
    setTranslateDocData((prev) => {
      return {
        ...prev,
        ...newData,
      };
    });
  };

  const beforeEvent = () => {
    if (loading) {
      return;
    }

    if (!userInfo) {
      openSignInWindow();
      return;
    }

    setLoading(true);
  };

  const get = (object: any, path: any, defaultValue?: any) => {
    const res = _get(object, path, defaultValue);

    if (res === undefined) {
      throw ToastedError(`Filed to get ${path}.`);
    }

    return res;
  };

  const getTranslatedContent = () => {
    const content = diffEditorRef.current?.getToModifiedContent();

    if (content === undefined) {
      throw ToastedError("Failed to get translated content.");
    }

    return content;
  };

  const saveToEditingContent = async () => {
    const content = getTranslatedContent();

    return updateDoc({
      path: docPath,
      toEditingContent: content,
    });
  };

  const handleEditRelationsClick = async () => {
    setMode(MODE.EDIT_RELATION);
  };

  const handleEditContentClick = async () => {
    setMode(MODE.EDIT);
  };

  const handleSaveContent = async () => {
    try {
      beforeEvent();

      // TODO: optimize
      await saveToEditingContent().then(({ path }) => {
        toast.success("Translated content saved.");

        if (path !== docPath) {
          const to = `/${type}${path}${search}`;
          navigate(to);
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save translated content.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrClick = async () => {
    try {
      beforeEvent();

      const toOwner = get(translateDocData, "toOwner");
      const toRepo = get(translateDocData, "toRepo");
      const toBranch = get(translateDocData, "toBranch");
      const toOriginalRev = get(translateDocData, "toOriginalRev");
      const toPath = get(translateDocData, "toPath");
      const toModifiedContent = getTranslatedContent();

      await saveToEditingContent();

      const { owner, repo } = await getToOwnerAndRepo({
        toOwner,
        toRepo,
        // beforeEvent checked
        owner: userInfo!.login,
      });

      const { branch, sha } = await createPrBranch({
        owner,
        repo,
        rev: toOriginalRev,
      });

      const { oid, headline } = await createCommit({
        owner,
        repo,
        branch,
        sha,
        path: toPath,
        contents: toModifiedContent,
      });

      const { url, pullNumber } = await createPr({
        owner: toOwner,
        repo: toRepo,
        head: `${owner}:${branch}`,
        head_repo: repo,
        base: toBranch,
        title: headline,
        draft: true,
      });

      await updateDoc({
        path: docPath,
        pullNumber,
      });

      toast.success(
        <div>
          <span>Create PR successfully.</span>{" "}
          <a href={url} rel="noreferrer" target="_blank">
            Goto PR
          </a>
        </div>
      );

      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create PR.");
    } finally {
      setLoading(false);
    }
  };

  const fetchViewerData = async ({ docPath }: { docPath: string }) => {
    try {
      const data = await getViewerData({
        path: docPath,
      });

      setTranslateDocData(data);
    } catch (error) {
      setTranslateDocData(undefined);
    }
  };

  const handleCreate = async ({
    fromStartLine,
    fromEndLine,
    toStartLine,
    toEndLine,
  }: {
    fromStartLine: number;
    fromEndLine: number;
    toStartLine: number;
    toEndLine: number;
  }) => {
    try {
      beforeEvent();

      const docId = get(translateDocData, "id");

      const docRes = await createRelation({
        docId,
        fromRange: [fromStartLine, fromEndLine],
        toRange: [toStartLine, toEndLine],
      });

      updateTranslateDocData({
        relations: docRes.relations,
      });

      toast.success("Create relation successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create relation.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTranslatedContentClick = async () => {
    try {
      beforeEvent();

      const toOwner = get(translateDocData, "toOwner");
      const toRepo = get(translateDocData, "toRepo");
      const toBranch = get(translateDocData, "toBranch");
      const toPath = get(translateDocData, "toPath");

      const { rev: toModifiedRev, content: toModifiedContent } =
        await getBranchRevAndContent({
          owner: toOwner,
          repo: toRepo,
          branch: toBranch,
          path: toPath,
        });

      const docRes = await updateDoc({
        path: docPath,
        toModifiedRev,
        toModifiedContent,
      });

      updateTranslateDocData({
        toModifiedContent,
        toModifiedRev: docRes.toModifiedRev,
        toModifiedContentSha: docRes.toModifiedContentSha,
      });

      toast.success("Update translated content successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update translated content.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOriginalContentClick = async () => {
    try {
      beforeEvent();

      const fromOwner = get(translateDocData, "fromOwner");
      const fromRepo = get(translateDocData, "fromRepo");
      const fromBranch = get(translateDocData, "fromBranch");
      const fromPath = get(translateDocData, "fromPath");

      const { rev: fromModifiedRev, content: fromModifiedContent } =
        await getBranchRevAndContent({
          owner: fromOwner,
          repo: fromRepo,
          branch: fromBranch,
          path: fromPath,
        });

      const docRes = await updateDoc({
        path: docPath,
        fromModifiedRev,
        fromModifiedContent,
      });

      updateTranslateDocData({
        fromModifiedContent,
        fromModifiedRev: docRes.fromModifiedRev,
        fromModifiedContentSha: docRes.fromModifiedContentSha,
      });

      toast.success("Update original content successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update original content.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (relationId: string) => {
    const res = window.confirm(`Delete relation?`);
    if (res) {
      try {
        beforeEvent();

        const docId = get(translateDocData, "id");

        const docRes = await deleteRelation({
          docId,
          id: relationId,
        });

        updateTranslateDocData({
          relations: docRes.relations,
        });

        toast.success("Delete relation successfully.");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete relation.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdatePrClick = async () => {
    try {
      beforeEvent();

      if (!prBranch || !prRev) {
        throw ToastedError("prBranch or prRev is undefined.");
      }

      const toOwner = get(translateDocData, "toOwner");
      const toRepo = get(translateDocData, "toRepo");
      const toPath = get(translateDocData, "toPath");

      const toModifiedContent = getTranslatedContent();

      await saveToEditingContent();

      await createCommit({
        owner: toOwner,
        repo: toRepo,
        branch: prBranch,
        sha: prRev,
        path: toPath,
        contents: toModifiedContent,
      });

      toast.success("Update PR successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update PR.");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePrClick = async () => {
    try {
      beforeEvent();

      const toOwner = get(translateDocData, "toOwner");
      const toRepo = get(translateDocData, "toRepo");
      const pullNumber = get(translateDocData, "pullNumber");

      await closePr({
        owner: toOwner,
        repo: toRepo,
        pullNumber,
      });

      toast.success("Update PR successfully.");
    } catch (error) {
      toast.error("Failed to update PR.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTranslateClick = async () => {
    try {
      beforeEvent();
      const newFromOriginalContent = get(
        translateDocData,
        "fromModifiedContent"
      );
      const newFromOriginalContentSha = get(
        translateDocData,
        "fromModifiedContentSha"
      );
      const newFromOriginalRev = get(translateDocData, "fromModifiedRev");
      const newToOriginalContent = get(translateDocData, "toModifiedContent");
      const newToOriginalContentSha = get(
        translateDocData,
        "toModifiedContentSha"
      );
      const newToOriginalRev = get(translateDocData, "toModifiedRev");

      const newRelations = relations.map((d) => {
        return {
          id: d.id,
          fromRange: d.fromModifiedRange,
          toRange: d.toModifiedRange,
        };
      });

      const docRes = await updateDoc({
        path: docPath,
        fromOriginalContentSha: newFromOriginalContentSha,
        fromOriginalRev: newFromOriginalRev,
        toOriginalContentSha: newToOriginalContentSha,
        toOriginalRev: newToOriginalRev,
        relations: newRelations,
      });

      updateTranslateDocData({
        fromOriginalContent: newFromOriginalContent,
        toOriginalContent: newToOriginalContent,
        fromOriginalContentSha: docRes.fromOriginalContentSha,
        fromOriginalRev: docRes.fromOriginalRev,
        toOriginalContentSha: docRes.toOriginalContentSha,
        toOriginalRev: docRes.toOriginalRev,
        relations: docRes.relations,
      });

      toast.success("Update translate successfully.");
    } catch (error) {
      toast.error("Failed to update translate.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTranslateByMergedPrClick = async () => {
    try {
      beforeEvent();

      if (prContent === undefined) {
        throw ToastedError("prContent is undefined.");
      }

      // from
      const fromOriginalContent = get(translateDocData, "fromOriginalContent");
      const newFromOriginalContent = get(
        translateDocData,
        "fromModifiedContent"
      );
      const newFromOriginalContentSha = get(
        translateDocData,
        "fromModifiedContentSha"
      );
      const newFromOriginalRev = get(translateDocData, "fromModifiedRev");

      // to
      const toOriginalContent = get(translateDocData, "toOriginalContent");
      const newToOriginalContent = prContent;
      const newToOriginalRev = prRev;

      const relations = get(translateDocData, "relations");

      const relationsWithModifiedRange = await getRelationsWithModifiedRange({
        fromOriginalContent: fromOriginalContent,
        fromModifiedContent: newFromOriginalContent,
        toOriginalContent: toOriginalContent,
        toModifiedContent: newToOriginalContent,
        relations,
      });

      const newRelations = relationsWithModifiedRange.map((d) => {
        return {
          id: d.id,
          fromRange: d.fromModifiedRange,
          toRange: d.toModifiedRange,
        };
      });

      const docRes = await updateDoc({
        path: docPath,
        fromOriginalContentSha: newFromOriginalContentSha,
        fromOriginalRev: newFromOriginalRev,
        // TODO: optimize toOriginalContent and toModifiedContent
        toOriginalContent: newToOriginalContent,
        toOriginalRev: newToOriginalRev,
        toModifiedContent: newToOriginalContent,
        toModifiedRev: newToOriginalRev,
        relations: newRelations,
        pullNumber: 0,
      });

      updateTranslateDocData({
        fromOriginalContent: newFromOriginalContent,
        toOriginalContent: newToOriginalContent,
        fromOriginalContentSha: docRes.fromOriginalContentSha,
        fromOriginalRev: docRes.fromOriginalRev,
        toOriginalContentSha: docRes.toOriginalContentSha,
        toOriginalRev: docRes.toOriginalRev,
        toModifiedContentSha: docRes.toModifiedContentSha,
        toModifiedRev: docRes.toModifiedRev,
        relations: docRes.relations,
        pullNumber: docRes.pullNumber,
      });

      toast.success("Update translate successfully.");
    } catch (error) {
      toast.error("Failed to update translate.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncContentClick = async () => {
    if (!prContent) {
      throw ToastedError("prContent is undefined.");
    }

    if (!prRev) {
      throw ToastedError("prRev is undefined.");
    }

    try {
      beforeEvent();
      const res = window.confirm(
        `Sync translated content from pull request #${translateDocData?.pullNumber}?`
      );
      if (res) {
        const docRes = await updateDoc({
          path: docPath,
          toEditingContent: prContent,
        });

        updateTranslateDocData({
          toEditingContent: prContent,
          toEditingContentSha: docRes.toEditingContentSha,
        });

        toast.success("Translated content saved.");
      }
    } catch (error) {
      toast.error("Failed to save translated content.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRelationsClick = async () => {
    try {
      beforeEvent();

      const fromOriginalContent = get(translateDocData, "fromOriginalContent");
      const toOriginalContent = get(translateDocData, "toOriginalContent");

      const newRelations = await getRelations(
        fromOriginalContent,
        toOriginalContent
      );

      const docRes = await updateDoc({
        path: docPath,
        relations: newRelations,
      });

      updateTranslateDocData({
        relations: docRes.relations,
      });

      toast.success("Regenerate relations successfully.");
    } catch (error) {
      toast.error("Failed to regenerate relations.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViewerData({
      docPath: docPath,
    });
  }, [docPath]);

  useEffect(() => {
    (async () => {
      if (!translateDocData) {
        setRelations([]);
        return;
      }

      try {
        const relations = await getRelationsWithModifiedRange({
          fromOriginalContent: translateDocData.fromOriginalContent,
          toOriginalContent: translateDocData.toOriginalContent,
          fromModifiedContent: translateDocData.fromModifiedContent,
          toModifiedContent: translateDocData.toModifiedContent,
          relations: translateDocData.relations,
        });

        relations.forEach((d) => {
          d.type = d.dirty ? RelationTypeEnum.dirty : RelationTypeEnum.relate;
        });

        setRelations(relations);
      } catch (error) {
        setRelations([]);
        console.error(error);
      }
    })();
  }, [translateDocData]);

  useEffect(() => {
    if (
      ![PR_STATE.NONE, PR_STATE.OPEN, PR_STATE.CLOSED].includes(prState) ||
      !translateDocData
    ) {
      setCanUpdateFromModifiedRev(false);
      return;
    }

    // TODO: abort last request
    (async () => {
      const { rev: latestFromModifiedRev } = await getBranchRev({
        owner: translateDocData.fromOwner,
        repo: translateDocData.fromRepo,
        branch: translateDocData.fromBranch,
      });

      if (latestFromModifiedRev !== translateDocData.fromModifiedRev) {
        setCanUpdateFromModifiedRev(true);
      } else {
        setCanUpdateFromModifiedRev(false);
      }
    })();
  }, [prState, translateDocData]);

  useEffect(() => {
    if (
      ![PR_STATE.NONE, PR_STATE.CLOSED].includes(prState) ||
      !translateDocData
    ) {
      setCanUpdateToModifiedRev(false);
      return;
    }

    // TODO: abort last request
    (async () => {
      const { rev: latestToModifiedRev } = await getBranchRev({
        owner: translateDocData.toOwner,
        repo: translateDocData.toRepo,
        branch: translateDocData.toBranch,
      });

      if (latestToModifiedRev !== translateDocData.toModifiedRev) {
        setCanUpdateToModifiedRev(true);
      } else {
        setCanUpdateToModifiedRev(false);
      }
    })();
  }, [prState, translateDocData]);

  if (!translateDocData) {
    return null;
  }

  const { fromOriginalContent, toOriginalContent, fromModifiedContent } =
    translateDocData;

  let editorToModifiedContent = "";
  if (translateDocData.toEditingContentSha) {
    editorToModifiedContent = translateDocData.toEditingContent || "";
  } else {
    editorToModifiedContent = translateDocData.toModifiedContent || "";
  }

  const SyncContentButton = (
    <li className="relation-overview__header__list__item">
      <button onClick={handleSyncContentClick}>
        Sync Content From PR(#{translateDocData.pullNumber})
      </button>
    </li>
  );

  const UpdateTranslateButton = (
    <li className="relation-overview__header__list__item">
      <button onClick={handleUpdateTranslateClick}>Update Translate</button>
    </li>
  );

  return (
    <div className="relation-view-page">
      <main className={"relation-overview"}>
        <header className="relation-overview__header">
          <ul className="relation-overview__header__list">
            <li className="relation-overview__header__list__item">
              <h1>
                <a className="dochub__editor-name" href="/">
                  DocHub
                </a>
              </h1>
            </li>
            <li className="relation-overview__header__list__item">
              <h2>
                <a className="dochub__editor-title" href={titleHref}>
                  {docPath}
                </a>
              </h2>
            </li>
            <li style={{ flex: "1 1 0" }}></li>

            {mode === MODE.EDIT && (
              <>
                <li className="relation-overview__header__list__item">
                  <button onClick={handleSaveContent}>Save</button>
                </li>
                {toPrStates.includes(prState) && (
                  <>
                    <li className="relation-overview__header__list__item">
                      <button onClick={handleCreatePrClick}>Create PR</button>
                    </li>

                    {needUpdateOriginal && UpdateTranslateButton}
                  </>
                )}
                {prState === PR_STATE.OPEN && (
                  <>
                    <li className="relation-overview__header__list__item">
                      <button onClick={handleUpdatePrClick}>
                        Update PR(#{translateDocData.pullNumber})
                      </button>
                    </li>
                    <li className="relation-overview__header__list__item">
                      <button onClick={handleClosePrClick}>
                        Close PR(#{translateDocData.pullNumber})
                      </button>
                    </li>
                    {needSyncContent && SyncContentButton}
                  </>
                )}
                {prState === PR_STATE.MERGED && (
                  <li className="relation-overview__header__list__item">
                    <button onClick={handleUpdateTranslateByMergedPrClick}>
                      Update Translate By Merged PR(#
                      {translateDocData.pullNumber})
                    </button>
                  </li>
                )}
                {canUpdateFromModifiedRev && (
                  <li className="relation-overview__header__list__item">
                    <button onClick={handleUpdateOriginalContentClick}>
                      Update Original Content
                    </button>
                  </li>
                )}
                {canUpdateToModifiedRev && (
                  <li className="relation-overview__header__list__item">
                    <button onClick={handleUpdateTranslatedContentClick}>
                      Update Translated Content
                    </button>
                  </li>
                )}
                <li className="relation-overview__header__list__item">
                  <button onClick={handleEditRelationsClick}>
                    Edit Relations
                  </button>
                </li>
              </>
            )}

            {mode === MODE.EDIT_RELATION && (
              <>
                <li className="relation-overview__header__list__item">
                  <CreateMode onCreate={handleCreate}></CreateMode>
                </li>
                <li className="relation-overview__header__list__item">
                  <button onClick={handleRegenerateRelationsClick}>
                    Regenerate Relations
                  </button>
                </li>
                <li className="relation-overview__header__list__item">
                  <button onClick={handleEditContentClick}>Edit Content</button>
                </li>
              </>
            )}

            <li className="relation-overview__header__list__item">
              <UserMenu></UserMenu>
            </li>
          </ul>
        </header>
        <section
          className={classnames({
            "relation-overview__relations": true,
            "relation-overview__relations--show-options":
              mode === MODE.EDIT_RELATION,
          })}
        >
          <RelationEditor
            ref={diffEditorRef}
            fromOriginal={fromOriginalContent || ""}
            fromModified={fromModifiedContent || ""}
            toOriginal={toOriginalContent || ""}
            toModified={editorToModifiedContent}
            relations={relations}
            options={options({
              onDelete: handleDelete,
            })}
            onFromSave={(editor: { getValue: () => any }) => {
              const content = editor?.getValue();
            }}
            onToSave={() => {
              if (mode === MODE.EDIT) {
                handleSaveContent();
              }
            }}
          />
        </section>
      </main>
      <Loading loading={loading}></Loading>
    </div>
  );
}

export default RelationPage;
