import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { ILink, IRelation } from "./types";

const getLinks = ({
  fromEditor,
  toEditor,
  relations,
  fromContainerDomNode,
  toContainerDomNode,
}: {
  fromEditor: monaco.editor.ICodeEditor;
  toEditor: monaco.editor.ICodeEditor;
  relations: IRelation[];
  fromContainerDomNode?: HTMLElement;
  toContainerDomNode?: HTMLElement;
}) => {
  const fromScrollTop = fromEditor.getScrollTop();
  const toScrollTop = toEditor.getScrollTop();

  const currentFromContainerDomNode =
    fromContainerDomNode || fromEditor.getDomNode();
  const {
    width: fromEditorWidth,
    left: fromEditorLeft,
    height: fromEditorHeight,
  } = currentFromContainerDomNode!.getBoundingClientRect();
  const fromLeft = 0;
  const fromRight = fromEditorWidth;

  const currentToContainerDomNode = toContainerDomNode || toEditor.getDomNode();
  const {
    width: toEditorWidth,
    left: toEditorLeft,
    height: toEditorHeight,
  } = currentToContainerDomNode!.getBoundingClientRect();
  const toLeft = toEditorLeft - fromEditorLeft;
  const toRight = toLeft + toEditorWidth;

  const links: ILink[] = [];

  relations.forEach(({ fromRange, toRange, type, id }) => {
    let fromLineTopEnd, toLineTopEnd;

    const fromLineTopStart = fromEditor.getTopForLineNumber(fromRange[0]);
    if (fromRange[1] !== null) {
      fromLineTopEnd = fromEditor.getTopForLineNumber(fromRange[1] + 1);
    } else {
      fromLineTopEnd = fromLineTopStart;
    }
    const fromLine1TopSubScrollTop = fromLineTopStart - fromScrollTop;
    const fromLine2TopSubScrollTop = fromLineTopEnd - fromScrollTop;

    const toLineTopStart = toEditor.getTopForLineNumber(toRange[0]);
    if (toRange[1] !== null) {
      toLineTopEnd = toEditor.getTopForLineNumber(toRange[1] + 1);
    } else {
      toLineTopEnd = toLineTopStart;
    }
    const toLine1TopSubScrollTop = toLineTopStart - toScrollTop;
    const toLine2TopSubScrollTop = toLineTopEnd - toScrollTop;

    // ignore relations out of view
    if (fromLine2TopSubScrollTop < 0 && toLine2TopSubScrollTop < 0) {
      return;
    }
    if (
      fromLine1TopSubScrollTop > fromEditorHeight &&
      toLine1TopSubScrollTop > toEditorHeight
    ) {
      return;
    }

    links.push({
      source: [
        [fromLeft, fromLine1TopSubScrollTop],
        [fromRight, fromLine1TopSubScrollTop],
        [fromRight, fromLine2TopSubScrollTop],
        [fromLeft, fromLine2TopSubScrollTop],
      ],
      target: [
        [toLeft, toLine1TopSubScrollTop],
        [toRight, toLine1TopSubScrollTop],
        [toRight, toLine2TopSubScrollTop],
        [toLeft, toLine2TopSubScrollTop],
      ],
      type,
      id,
    });
  });

  return links;
};

export default getLinks;
