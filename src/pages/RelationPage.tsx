import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IRelationViewerData } from "relation2-core";
import { IRelationEditorRef, RelationEditor } from "relation2-react";
import { getRelationViewerData } from "../api";
import { saveTranslatedContent } from "../api/translatedContent";
import UserMenu from "../components/UserMenu";
import { useStoreContext } from "../store";

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

  const params = useParams();
  const nameId = params.nameId;

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
    const fromPath = relationViewerData?.fromPath;
    const toPath = relationViewerData?.toPath;
    const userName = userInfo?.login;

    if (
      nameId === undefined ||
      fromPath === undefined ||
      toPath === undefined ||
      userName === undefined
    ) {
      throw Error("Invalid params nameId, fromPath, toPath, userName");
    }

    setIsSaving(true);
    saveTranslatedContent({
      fromPath,
      toPath,
      nameId,
      content,
    })
      .then(({ title }) => {
        const to = `/${userName}/${nameId}/${title}${window.location.search}`;
        navigate(to);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const fromPath = urlSearchParams.get("fromPath");
    const toPath = urlSearchParams.get("toPath");

    if (!fromPath || !toPath || !nameId) {
      return;
    }

    getRelationViewerData({
      fromPath,
      toPath,
      nameId,
    }).then((data: any) => {
      setRelationViewerData(data);
    });
  }, [nameId]);

  if (!relationViewerData) {
    return null;
  }

  return (
    <div className="relation-view-page">
      <main className={"relation-overview"}>
        <header className="relation-overview__header">
          <ul className="relation-overview__header__list">
            <li className="relation-overview__header__list__item">
              <a className="dochub__editor-name" href="/">
                DocHub
              </a>
            </li>
            <li style={{ flex: "1 1 auto" }}></li>
            {/* <li className="relation-overview__header__list__item">
              <button onClick={() => {}}>Edit</button>
            </li> */}
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
