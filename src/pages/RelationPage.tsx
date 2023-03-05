import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { IRelationViewerData } from "relation2-core";
import { IRelationEditorRef, RelationEditor } from "relation2-react";
import { getRelationViewerData } from "../api";
import { saveTranslatedContent } from "../api/translatedContent";
import UserMenu from "../components/UserMenu";
import { useStoreContext } from "../store";
import openSignInWindow from "../utils/openSignInWindow";
import pathInfo from "../utils/pathInfo";

import "react-toastify/dist/ReactToastify.css";
import "./RelationPage.scss";

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

  const handleSave = (editor: { getValue: () => any }) => {
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

  useEffect(() => {
    getRelationViewerData({
      path: docPath,
    }).then((data: any) => {
      setRelationViewerData(data);
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
              <button>Save</button>
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
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default RelationPage;
