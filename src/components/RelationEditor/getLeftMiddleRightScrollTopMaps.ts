import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { IRelation, IScrollTopMap } from "./types";

const getLastLeftMiddleRightScrollTopMap = ({
  fromEditor,
  toEditor,
  leftMiddleRightScrollTopMaps,
}: {
  fromEditor: monaco.editor.ICodeEditor;
  toEditor: monaco.editor.ICodeEditor;
  leftMiddleRightScrollTopMaps: IScrollTopMap[];
}): IScrollTopMap => {
  const fromLineTopEnd = fromEditor.getTopForLineNumber(
    Number.POSITIVE_INFINITY
  );
  const toLineTopEnd = toEditor.getTopForLineNumber(Number.POSITIVE_INFINITY);

  const lastLeftMiddleRightScrollTopMaps = leftMiddleRightScrollTopMaps.at(-1);
  if (lastLeftMiddleRightScrollTopMaps) {
    const fromLineTopStart = lastLeftMiddleRightScrollTopMaps[0][1];
    const middleTopStart = lastLeftMiddleRightScrollTopMaps[1][1];
    const toLineTopStart = lastLeftMiddleRightScrollTopMaps[2][1];

    return [
      [fromLineTopStart, fromLineTopEnd],
      [
        middleTopStart,
        middleTopStart +
          Math.max(
            fromLineTopEnd - fromLineTopStart,
            toLineTopEnd - toLineTopStart
          ),
      ],
      [toLineTopStart, toLineTopEnd],
    ];
  }

  return [
    [0, fromLineTopEnd],
    [0, Math.max(fromLineTopEnd, toLineTopEnd)],
    [0, toLineTopEnd],
  ];
};

const getGapLeftMiddleRightScrollTopMap = ({
  fromLineTopStart,
  toLineTopStart,
  leftMiddleRightScrollTopMaps,
}: {
  fromLineTopStart: number;
  toLineTopStart: number;
  leftMiddleRightScrollTopMaps: IScrollTopMap[];
}): IScrollTopMap => {
  const lastLeftMiddleRightScrollTopMaps = leftMiddleRightScrollTopMaps.at(-1);

  if (lastLeftMiddleRightScrollTopMaps) {
    const lastFromLineTopStart = lastLeftMiddleRightScrollTopMaps[0][1];
    const lastMiddleTopStart = lastLeftMiddleRightScrollTopMaps[1][1];
    const lastToLineTopStart = lastLeftMiddleRightScrollTopMaps[2][1];
    const middleTopEnd =
      lastMiddleTopStart +
      Math.max(
        fromLineTopStart - lastFromLineTopStart,
        toLineTopStart - lastToLineTopStart
      );
    return [
      [lastFromLineTopStart, fromLineTopStart],
      [lastMiddleTopStart, middleTopEnd],
      [lastToLineTopStart, toLineTopStart],
    ];
  }

  const middleTopStart = 0;
  const middleTopEnd = Math.max(fromLineTopStart, toLineTopStart);
  return [
    [0, fromLineTopStart],
    [middleTopStart, middleTopEnd],
    [0, toLineTopStart],
  ];
};

const getLeftMiddleRightScrollTopMaps = ({
  fromEditor,
  toEditor,
  relations,
}: {
  fromEditor: monaco.editor.ICodeEditor;
  toEditor: monaco.editor.ICodeEditor;
  relations: IRelation[];
}) => {
  const leftMiddleRightScrollTopMaps: IScrollTopMap[] = [];

  relations.forEach(({ fromRange, toRange }) => {
    let fromLineTopEnd, toLineTopEnd;

    const fromLineTopStart = fromEditor.getTopForLineNumber(fromRange[0]);
    if (fromRange[1] !== null) {
      fromLineTopEnd = fromEditor.getTopForLineNumber(fromRange[1] + 1);
    } else {
      fromLineTopEnd = fromLineTopStart;
    }

    const toLineTopStart = toEditor.getTopForLineNumber(toRange[0]);
    if (toRange[1] !== null) {
      toLineTopEnd = toEditor.getTopForLineNumber(toRange[1] + 1);
    } else {
      toLineTopEnd = toLineTopStart;
    }

    const gapLeftMiddleRightScrollTopMap = getGapLeftMiddleRightScrollTopMap({
      fromLineTopStart,
      toLineTopStart,
      leftMiddleRightScrollTopMaps,
    });

    leftMiddleRightScrollTopMaps.push(gapLeftMiddleRightScrollTopMap);

    const middleTopStart = gapLeftMiddleRightScrollTopMap[1][1];
    const middleTopEnd =
      middleTopStart +
      Math.max(
        fromLineTopEnd - fromLineTopStart,
        toLineTopEnd - toLineTopStart
      );

    leftMiddleRightScrollTopMaps.push([
      [fromLineTopStart, fromLineTopEnd],
      [middleTopStart, middleTopEnd],
      [toLineTopStart, toLineTopEnd],
    ]);
  });

  leftMiddleRightScrollTopMaps.push(
    getLastLeftMiddleRightScrollTopMap({
      fromEditor,
      toEditor,
      leftMiddleRightScrollTopMaps,
    })
  );

  return leftMiddleRightScrollTopMaps;
};

export default getLeftMiddleRightScrollTopMaps;
