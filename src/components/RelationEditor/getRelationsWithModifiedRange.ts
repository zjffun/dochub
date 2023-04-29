import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { IRelation } from "./types";

async function createDiffEditor(
  domElement: HTMLElement,
  original: string,
  modified: string
) {
  // document.body.appendChild(domElement);
  // domElement.style.width = '100%';
  // domElement.style.height = '500px';

  const diffEditor = monaco.editor.createDiffEditor(domElement, {
    renderSideBySide: false,
    renderOverviewRuler: false,
  });

  diffEditor.setModel({
    original: monaco.editor.createModel(original),
    modified: monaco.editor.createModel(modified),
  });

  // wait for diff ready
  await new Promise((res) => {
    diffEditor.onDidUpdateDiff(() => {
      setTimeout(() => {
        res(undefined);
      }, 0);
    });
  });

  return diffEditor;
}

export interface IViewerRelationWithModifiedRange extends IRelation {
  fromModifiedRange: [number, number];
  toModifiedRange: [number, number];
  dirty: boolean;
}

export default async function getRelationsWithModifiedRange({
  relations,
  fromOriginalContent,
  toOriginalContent,
  fromModifiedContent,
  toModifiedContent,
}: {
  relations: IRelation[];
  fromOriginalContent: string;
  toOriginalContent: string;
  fromModifiedContent: string;
  toModifiedContent: string;
}) {
  const relationsWithModifiedRange: IViewerRelationWithModifiedRange[] = [];

  if (!relations.length) {
    return relationsWithModifiedRange;
  }

  const fromDiffEditor = await createDiffEditor(
    document.createElement("div"),
    fromOriginalContent,
    fromModifiedContent
  );
  const toDiffEditor = await createDiffEditor(
    document.createElement("div"),
    toOriginalContent,
    toModifiedContent
  );

  for (const relation of relations) {
    const fromModifiedRange: [number, number] = [
      fromDiffEditor?.getDiffLineInformationForOriginal(relation.fromRange[0])
        ?.equivalentLineNumber || 0,
      fromDiffEditor?.getDiffLineInformationForOriginal(relation.fromRange[1])
        ?.equivalentLineNumber || 0,
    ];

    let dirty = false;

    const changes = fromDiffEditor?.getLineChanges() || [];
    for (const change of changes) {
      // add
      if (change.originalEndLineNumber === 0) {
        if (
          change.originalStartLineNumber >= relation.fromRange[0] &&
          change.originalStartLineNumber < relation.fromRange[1]
        ) {
          dirty = true;
          break;
        }

        continue;
      }

      // delete or modify
      if (
        !(
          change.originalEndLineNumber < relation.fromRange[0] ||
          change.originalStartLineNumber > relation.fromRange[1]
        )
      ) {
        dirty = true;
        break;
      }
    }

    const toModifiedRange: [number, number] = [
      toDiffEditor?.getDiffLineInformationForOriginal(relation.toRange[0])
        ?.equivalentLineNumber || 0,
      toDiffEditor?.getDiffLineInformationForOriginal(relation.toRange[1])
        ?.equivalentLineNumber || 0,
    ];

    relationsWithModifiedRange.push({
      ...relation,
      fromModifiedRange,
      toModifiedRange,
      dirty,
    });
  }

  return relationsWithModifiedRange;
}
