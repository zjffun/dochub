import classnames from "classnames";
import { FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  createRelations,
  deleteRelation,
  getViewerData,
  saveTranslatedContent,
} from "../api";
import {
  createCommit,
  createPr,
  createPrBranch,
  getTranslatedOwnerAndRepo,
} from "../api/github";
import Loading from "../components/Loading";
import RelationEditor, {
  IMonacoDiffEditorRelationRef,
} from "../components/RelationEditor";
import {
  IRelation,
  RelationTypeEnum,
} from "../components/RelationEditor/types";
import UserMenu from "../components/UserMenu";
import { useStoreContext } from "../store";
import openSignInWindow from "../utils/openSignInWindow";
import pathInfo from "../utils/pathInfo";

import "./RelationPage.scss";

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
  toOriginalContent: string;
  toOriginalContentSha: string;
  toModifiedContent: string;
  toModifiedContentSha: string;
  translatedOwner: string;
  translatedRepo: string;
  translatedBranch: string;
  translatedRev: string;
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
  ({
    onDelete,
    showDialog,
  }: {
    onDelete: (id: string) => void;
    showDialog: (id: string) => void;
  }) =>
  (data: any) => {
    const OptionsComponent = () => {
      return (
        <>
          <button onClick={() => onDelete(data.id)}>Delete</button>
          <button onClick={() => showDialog(data.id)}>Update</button>
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
      throw Error("submit fail");
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
  const [updateRelationDialogVisible, setUpdateRelationDialogVisible] =
    useState(false);
  const [updateRelationData, setUpdateRelationData] = useState<any>(null);
  const [currentUpdateCheckResultId, setCurrentUpdateCheckResultId] =
    useState("");

  const [relationViewerData, setRelationViewerData] = useState<
    IRelationViewerData | undefined
  >();

  const diffEditorRef = useRef<IMonacoDiffEditorRelationRef>(null);

  const titleHref = `${pathname}${search}`;

  const showDialog = (id: string) => {
    setCurrentUpdateCheckResultId(id);
    const relationWithOriginalContentInfo = relations.find(
      (d: any) => d.id === id
    );

    if (!relationWithOriginalContentInfo) {
      setUpdateRelationData(null);
      return;
    }

    setUpdateRelationDialogVisible(true);
  };

  const getTranslatedContent = () => {
    // TODO: optimize
    const editor = diffEditorRef.current?.toDiffEditor?.getModifiedEditor();

    const content = editor?.getValue();

    return content;
  };

  const saveTranslate = async () => {
    const content = getTranslatedContent();

    if (content === undefined) {
      throw Error("content is undefined");
    }

    return saveTranslatedContent({
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
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      if (!userInfo) {
        openSignInWindow();
        return;
      }

      // TODO: optimize
      await saveTranslate().then(({ path }) => {
        toast.success("Translated content saved.");

        if (path !== docPath) {
          const to = `/${type}${path}${search}`;
          navigate(to);
        }
      });
    } catch (error) {
      toast.error("Failed to save translated content.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrClick = async () => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      if (!userInfo) {
        openSignInWindow();
        return;
      }

      const translatedOwner = relationViewerData?.translatedOwner;
      const translatedRepo = relationViewerData?.translatedRepo;
      const translatedBranch = relationViewerData?.translatedBranch;
      const translatedRev = relationViewerData?.translatedRev;
      const toPath = relationViewerData?.toPath;
      const toModifiedContent = getTranslatedContent();

      if (translatedOwner === undefined) {
        throw new Error("translatedOwner is not defined");
      }

      if (translatedRepo === undefined) {
        throw new Error("translatedRepo is not defined");
      }

      if (translatedBranch === undefined) {
        throw new Error("translatedBranch is not defined");
      }

      if (translatedRev === undefined) {
        throw new Error("translatedRev is not defined");
      }

      if (toPath === undefined) {
        throw new Error("toPath is not defined");
      }

      if (toModifiedContent === undefined) {
        throw new Error("toModifiedContent is not defined");
      }

      await saveTranslate();

      const { owner, repo } = await getTranslatedOwnerAndRepo({
        translatedOwner,
        translatedRepo,
        owner: userInfo.login,
      });

      const { branch, sha } = await createPrBranch({
        owner,
        repo,
        rev: translatedRev,
      });

      const { oid, headline } = await createCommit({
        owner,
        repo,
        branch,
        sha,
        path: toPath,
        contents: toModifiedContent,
      });

      const { url } = await createPr({
        owner: translatedOwner,
        repo: translatedRepo,
        head: `${owner}:${branch}`,
        head_repo: repo,
        base: translatedBranch,
        title: headline,
        draft: true,
      });

      toast.success(
        <div>
          <span>Create PR successfully.</span> <a href={url}>Goto PR</a>
        </div>
      );

      window.open(url, "_blank");
    } catch (error) {
      toast.error("Failed to create PR.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchViewerData = async ({ docPath }: { docPath: string }) => {
    getViewerData({
      path: docPath,
    })
      .then((data: any) => {
        setRelationViewerData(data);
      })
      .catch(() => {
        setRelationViewerData(undefined);
      });
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
    if (!relationViewerData) {
      return;
    }

    createRelations([
      {
        docObjectId: relationViewerData?.docObjectId,
        fromRange: [fromStartLine, fromEndLine],
        toRange: [toStartLine, toEndLine],
        fromContentSha: relationViewerData?.fromModifiedContentSha,
        toContentSha: relationViewerData?.toModifiedContentSha,
        state: "",
      },
    ]).then(() => {
      toast.success("Create relation successfully.");
      fetchViewerData({
        docPath: docPath,
      });
    });
  };

  const handleDelete = async (id: string) => {
    const res = window.confirm(`Delete relation?`);
    if (res) {
      deleteRelation(id).then(() => {
        toast.success("Delete relation successfully.");
        fetchViewerData({
          docPath: docPath,
        });
      });
    }
  };

  const handleUpdateClick = async () => {};

  useEffect(() => {
    fetchViewerData({
      docPath: docPath,
    });
  }, [docPath]);

  if (!relationViewerData) {
    return null;
  }

  const {
    fromOriginalContent,
    toOriginalContent,
    fromModifiedContent,
    toModifiedContent,
  } = relationViewerData;

  const relations = relationViewerData.relations.map((d) => {
    return {
      ...d,
      // TODO: calc type
      type: RelationTypeEnum.relate,
    };
  });

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
            <li style={{ flex: "1 1 auto" }}></li>
            {mode === MODE.EDIT && (
              <li className="relation-overview__header__list__item">
                <button onClick={handleSave}>Save</button>
              </li>
            )}
            {mode !== MODE.EDIT_RELATION && (
              <li className="relation-overview__header__list__item">
                <button onClick={handleCreatePrClick}>Create PR</button>
              </li>
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
              showDialog,
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
