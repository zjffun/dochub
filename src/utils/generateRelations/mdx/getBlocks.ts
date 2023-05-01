import type { Root } from "mdast";

const blockType = ["heading", "yaml"];

export interface IBlock {
  start?: number;
  end?: number;
}

export default function getBlocks(ast: Root) {
  const children = ast.children;
  const blocks: {
    start: number;
    end: number;
  }[] = [];

  if (!children.length) {
    return blocks;
  }

  let startLine;

  for (let i = 0; i < children.length - 1; i++) {
    const child = children[i];

    if (!child.position) {
      continue;
    }

    if (startLine === undefined) {
      startLine = child.position.start.line;
    }

    if (!blockType.includes(children[i + 1].type)) {
      continue;
    }

    blocks.push({
      start: startLine,
      end: child.position.end.line,
    });
    startLine = undefined;
  }

  const lastChild = children.at(-1);

  if (lastChild?.position) {
    if (startLine === undefined) {
      startLine = lastChild.position.start.line;
    }

    blocks.push({
      start: startLine,
      end: lastChild.position.end.line,
    });
  }

  return blocks;
}
