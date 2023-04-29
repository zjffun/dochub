import classnames from "classnames";
import { default as _get } from "lodash-es/get";
import { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  createRelations,
  deleteRelation,
  getViewerData,
  savePullNumber,
  saveToModifiedContent,
  updateTranslate,
} from "../../api";
import {
  closePr,
  createCommit,
  createPr,
  createPrBranch,
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
import openSignInWindow from "../../utils/openSignInWindow";
import pathInfo from "../../utils/pathInfo";
import ToastedError from "../../utils/ToastedError";
import PR_STATE from "./prState";
import usePrInfo from "./usePrInfo";

import "./index.scss";

enum MODE {
  VIEW = "view",
  EDIT = "edit",
  EDIT_RELATION = "editRelation",
}

export interface IRelationViewerData {
  docObjectId: string;
  fromPath: string;
  toPath: string;
  fromOriginalContent: string;
  fromOriginalContentSha: string;
  fromModifiedContent: string;
  fromModifiedContentSha: string;
  toModifiedRev: string;
  toOriginalContent: string;
  toOriginalContentSha: string;
  toModifiedContent: string;
  toModifiedContentSha: string;
  toOwner: string;
  toRepo: string;
  toBranch: string;
  toOriginalRev: string;
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

  const [relationViewerData, setRelationViewerData] = useState<
    IRelationViewerData | undefined
  >();

  const { prState, prRev, prBranch, prContent } = usePrInfo({
    owner: relationViewerData?.toOwner,
    repo: relationViewerData?.toRepo,
    path: relationViewerData?.toPath,
    pullNumber: relationViewerData?.pullNumber,
  });

  const diffEditorRef = useRef<IMonacoDiffEditorRelationRef>(null);

  const titleHref = `${pathname}${search}`;

  const needSyncContent =
    relationViewerData?.toModifiedRev !== prRev ||
    (prContent !== undefined &&
      prContent !== relationViewerData?.toModifiedContent);

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

  const saveTranslate = async () => {
    const content = getTranslatedContent();

    return saveToModifiedContent({
      path: docPath,
      content,
    });
  };

  const handleEditRelationsClick = async () => {
    setMode(MODE.EDIT_RELATION);
  };

  const handleEditContentClick = async () => {
    setMode(MODE.EDIT);
  };

  const handleSave = async () => {
    try {
      beforeEvent();

      // TODO: optimize
      await saveTranslate().then(({ path }) => {
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

      const toOwner = get(relationViewerData, "toOwner");
      const toRepo = get(relationViewerData, "toRepo");
      const toBranch = get(relationViewerData, "toBranch");
      const toOriginalRev = get(relationViewerData, "toOriginalRev");
      const toPath = get(relationViewerData, "toPath");
      const toModifiedContent = getTranslatedContent();

      await saveTranslate();

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

      await savePullNumber({
        path: docPath,
        pullNumber,
      });

      toast.success(
        <div>
          <span>Create PR successfully.</span> <a href={url}>Goto PR</a>
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

      setRelationViewerData(data);
    } catch (error) {
      setRelationViewerData(undefined);
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

      const docObjectId = get(relationViewerData, "docObjectId");

      await createRelations([
        {
          docObjectId,
          fromRange: [fromStartLine, fromEndLine],
          toRange: [toStartLine, toEndLine],
          state: "",
        },
      ]);

      await fetchViewerData({
        docPath: docPath,
      });

      toast.success("Create relation successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create relation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = window.confirm(`Delete relation?`);
    if (res) {
      try {
        setLoading(true);

        await deleteRelation(id);

        await fetchViewerData({
          docPath: docPath,
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

      const toOwner = get(relationViewerData, "toOwner");
      const toRepo = get(relationViewerData, "toRepo");
      const toPath = get(relationViewerData, "toPath");

      const toModifiedContent = getTranslatedContent();

      await saveTranslate();

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

      const toOwner = get(relationViewerData, "toOwner");
      const toRepo = get(relationViewerData, "toRepo");
      const pullNumber = get(relationViewerData, "pullNumber");

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

      const fromModifiedContentSha = get(
        relationViewerData,
        "fromModifiedContentSha"
      );
      const fromModifiedRev = get(relationViewerData, "fromModifiedRev");
      const toModifiedContentSha = get(
        relationViewerData,
        "toModifiedContentSha"
      );
      const toModifiedRev = get(relationViewerData, "toModifiedRev");

      const newRelations = relations.map((d) => {
        return {
          id: d.id,
          fromRange: d.fromModifiedRange,
          toRange: d.toModifiedRange,
          type: d.type,
        };
      });

      await updateTranslate({
        path: docPath,
        fromModifiedContentSha,
        fromModifiedRev,
        toModifiedContentSha,
        toModifiedRev,
        relations: newRelations,
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
      const res = window.confirm(`Sync translated content from pull request?`);
      if (res) {
        await saveToModifiedContent({
          path: docPath,
          content: prContent,
          rev: prRev,
        });

        setRelationViewerData((value) => {
          let result = value;
          if (value) {
            result = {
              ...value,
              toModifiedRev: prRev,
              toModifiedContent: prContent,
            };
          }
          return result;
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

  useEffect(() => {
    fetchViewerData({
      docPath: docPath,
    });
  }, [docPath]);

  useEffect(() => {
    (async () => {
      if (!relationViewerData) {
        setRelations([]);
        return;
      }
      try {
        const relations = await getRelationsWithModifiedRange({
          fromOriginalContent: relationViewerData.fromOriginalContent,
          toOriginalContent: relationViewerData.toOriginalContent,
          fromModifiedContent: relationViewerData.fromModifiedContent,
          toModifiedContent: relationViewerData.toModifiedContent,
          relations: relationViewerData.relations,
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
  }, [relationViewerData]);

  if (!relationViewerData) {
    return null;
  }

  const {
    fromOriginalContent,
    toOriginalContent,
    fromModifiedContent,
    toModifiedContent,
  } = relationViewerData;

  const SyncContentButton = (
    <li className="relation-overview__header__list__item">
      <button onClick={handleSyncContentClick}>Sync Content</button>
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
              <li className="relation-overview__header__list__item">
                <button onClick={handleSave}>Save</button>
              </li>
            )}

            {mode !== MODE.EDIT_RELATION && (
              <>
                {(prState === PR_STATE.NONE || prState === PR_STATE.CLOSED) && (
                  <li className="relation-overview__header__list__item">
                    <button onClick={handleCreatePrClick}>Create PR</button>
                  </li>
                )}
                {prState === PR_STATE.OPEN && (
                  <>
                    <li className="relation-overview__header__list__item">
                      <button onClick={handleUpdatePrClick}>Update PR</button>
                    </li>
                    <li className="relation-overview__header__list__item">
                      <button onClick={handleClosePrClick}>Close PR</button>
                    </li>
                    {needSyncContent && SyncContentButton}
                  </>
                )}
                {prState === PR_STATE.MERGED && (
                  <>
                    {needSyncContent && SyncContentButton}
                    {!needSyncContent && (
                      <li className="relation-overview__header__list__item">
                        <button onClick={handleUpdateTranslateClick}>
                          Update Translate
                        </button>
                      </li>
                    )}
                  </>
                )}
              </>
            )}

            {mode !== MODE.EDIT_RELATION && (
              <li className="relation-overview__header__list__item">
                <button onClick={handleEditRelationsClick}>
                  Edit Relations
                </button>
              </li>
            )}
            {mode === MODE.EDIT_RELATION && (
              <>
                <li className="relation-overview__header__list__item">
                  <CreateMode onCreate={handleCreate}></CreateMode>
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
            fromOriginal={fromOriginalContent}
            fromModified={fromModifiedContent}
            toOriginal={toOriginalContent}
            toModified={toModifiedContent}
            relations={relations}
            options={options({
              onDelete: handleDelete,
            })}
            onFromSave={(editor: { getValue: () => any }) => {
              const content = editor?.getValue();
            }}
            onToSave={() => {
              if (mode === MODE.EDIT) {
                handleSave();
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
