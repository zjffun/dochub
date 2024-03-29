import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const setModelToDiffEditor = async (
  diffEditor: monaco.editor.IStandaloneDiffEditor | null,
  original: string,
  modified: string
) => {
  if (!diffEditor) {
    return false;
  }

  diffEditor.setModel({
    original: monaco.editor.createModel(original, "markdown"),
    modified: monaco.editor.createModel(modified, "markdown"),
  });

  // wait for diff ready
  return new Promise((res) => {
    diffEditor.onDidUpdateDiff(() => {
      setTimeout(() => {
        res(undefined);
      }, 0);
    });
  });
};

export default setModelToDiffEditor;
