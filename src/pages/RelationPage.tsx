import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { IViewerContents, IViewerRelation } from "relation2-core";
import { IRelationEditorRef, RelationEditor } from "relation2-react";
import { getViewerData, saveTranslatedContent } from "../api";
import {
  createCommit,
  createPr,
  createPrBranch,
  getTranslatedOwnerAndRepo,
} from "../api/github";
import UserMenu from "../components/UserMenu";
import { useStoreContext } from "../store";
import openSignInWindow from "../utils/openSignInWindow";
import pathInfo from "../utils/pathInfo";

import "./RelationPage.scss";

export interface IRelationViewerData {
  fromPath: string;
  toPath: string;
  fromModifiedContent: string;
  toModifiedContent: string;
  translatedOwner: string;
  translatedRepo: string;
  translatedBranch: string;
  translatedRev: string;
  viewerRelations: IViewerRelation[];
  viewerContents: IViewerContents;
}

const options = (showDialog: (id: string) => void) => (data: any) => {
  const OptionsComponent = () => {
    return (
      <>
        <button onClick={() => {}}>Delete</button>
        <button onClick={() => showDialog(data.id)}>Update</button>
      </>
    );
  };

  return <OptionsComponent></OptionsComponent>;
};

function RelationPage() {
  const search = window.location.search;
  const { pathname, type, docPath } = pathInfo();

  const navigate = useNavigate();
  const { userInfo } = useStoreContext();

  const [showOptions, setShowOptions] = useState(false);
  const [updateRelationDialogVisible, setUpdateRelationDialogVisible] =
    useState(false);
  const [updateRelationData, setUpdateRelationData] = useState<any>(null);
  const [currentUpdateCheckResultId, setCurrentUpdateCheckResultId] =
    useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [relationViewerData, setRelationViewerData] = useState<
    IRelationViewerData | undefined
  >();

  const diffEditorRef = useRef<IRelationEditorRef & { current: any }>({
    current: null,
    relationsWithOriginalContent: [],
  });

  const titleHref = `${pathname}${search}`;

  const showDialog = (id: string) => {
    setCurrentUpdateCheckResultId(id);
    const relationWithOriginalContentInfo =
      diffEditorRef.current.relationsWithOriginalContent.find(
        (d: any) => d.id === id
      );

    if (!relationWithOriginalContentInfo) {
      setUpdateRelationData(null);
      return;
    }

    setUpdateRelationDialogVisible(true);
  };

  const handleSave = () => {
    // TODO: optimize
    const editor =
      diffEditorRef.current?.current?.diffEditorRef?.current?.[1]?.getModifiedEditor();

    const content = editor?.getValue();

    if (!userInfo) {
      openSignInWindow();
      return;
    }

    setIsSaving(true);
    saveTranslatedContent({
      path: docPath,
      content,
    })
      .then(({ path }) => {
        toast.success("Translated content saved.");

        if (path !== docPath) {
          const to = `/${type}${path}${search}`;
          navigate(to);
        } else {
          fetchViewerData({ docPath: docPath });
        }
      })
      .catch((e) => {
        toast.error("Failed to save translated content.");
        console.error(e);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleCreatePrClick = async () => {
    if (!userInfo) {
      openSignInWindow();
      return;
    }

    const translatedOwner = relationViewerData?.translatedOwner;
    const translatedRepo = relationViewerData?.translatedRepo;
    const translatedBranch = relationViewerData?.translatedBranch;
    const translatedRev = relationViewerData?.translatedRev;
    const toPath = relationViewerData?.toPath;
    const toModifiedContent = relationViewerData?.toModifiedContent;

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
  };

  const fetchViewerData = async ({ docPath }: { docPath: string }) => {
    getViewerData({
      path: docPath,
    }).then((data: any) => {
      setRelationViewerData(data);
    });
  };

  useEffect(() => {
    fetchViewerData({
      docPath: docPath,
    });
  }, [docPath]);

  if (!relationViewerData) {
    return null;
  }

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
            {/* <li className="relation-overview__header__list__item">
              <button onClick={() => {}}>Edit</button>
            </li> */}
            <li className="relation-overview__header__list__item">
              <button onClick={handleSave}>Save</button>
            </li>
            <li className="relation-overview__header__list__item">
              <button onClick={handleCreatePrClick}>Create PR</button>
            </li>
            <li className="relation-overview__header__list__item">
              <UserMenu></UserMenu>
            </li>
          </ul>
        </header>
        <section
          className={classnames({
            "relation-overview__relations": true,
            "relation-overview__relations--show-options": showOptions,
          })}
        >
          <RelationEditor
            relationViewerData={relationViewerData}
            options={options(showDialog)}
            ref={diffEditorRef}
            onFromSave={(editor: { getValue: () => any }) => {
              const content = editor?.getValue();
            }}
            onToSave={handleSave}
          />
        </section>
      </main>
    </div>
  );
}

export default RelationPage;
