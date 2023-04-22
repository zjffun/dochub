import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const createDiffEditor = (domElement: HTMLElement | null) => {
  if (!domElement) {
    return null;
  }

  const editor = monaco.editor.createDiffEditor(domElement, {
    diffWordWrap: "on",
    renderSideBySide: false,
    renderOverviewRuler: false,
    theme: "vs-dark",
  });

  return editor;
};

export default createDiffEditor;
