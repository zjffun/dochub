import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { IRelationViewerData } from "relation2-core";
import {
  CreateMode,
  IRelationEditorRef,
  RelationEditor,
} from "relation2-react";
import { getRelationViewerData } from "../api";

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
  const [showOptions, setShowOptions] = useState(false);
  const [updateRelationDialogVisible, setUpdateRelationDialogVisible] =
    useState(false);
  const [updateRelationData, setUpdateRelationData] = useState<any>(null);
  const [currentUpdateCheckResultId, setCurrentUpdateCheckResultId] =
    useState("");

  const [relationViewerData, setRelationViewerData] = useState<
    IRelationViewerData | undefined
  >();

  const diffEditorRef = useRef<IRelationEditorRef>({
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
            {/* <li className="relation-overview__header__list__item">
              <button onClick={() => {}}>Open From File</button>
            </li>
            <li className="relation-overview__header__list__item">
              <button onClick={() => {}}>Open To File</button>
            </li>
            <li className="relation-overview__header__list__item">
              <label>
                <input
                  type="checkbox"
                  checked={showOptions}
                  onChange={(e) => setShowOptions(e.target.checked)}
                />
                Show Options
              </label>
            </li>
            <li className="relation-overview__header__list__item">
              <CreateMode onCreate={() => {}} />
            </li> */}
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
            onToSave={(editor: { getValue: () => any }) => {
              const content = editor?.getValue();
            }}
          />
        </section>
      </main>
    </div>
  );
}

export default RelationPage;
