import { IRelation } from "../../../types.d";
import getBlocks from "./getBlocks";

// remark-frontmatter preset
const frontmatterType = ["yaml", "toml"];

export default async function getRelations(
  fromContent: string,
  toContent: string
): Promise<IRelation[]> {
  const { default: remarkFrontmatter } = await import("remark-frontmatter");
  const { default: remarkParse } = await import("remark-parse");
  const { unified } = await import("unified");

  const fromAst = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .parse(fromContent);
  const toAst = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .parse(toContent);

  const fromBlocks = getBlocks(fromAst);
  const toBlocks = getBlocks(toAst);

  const relations: IRelation[] = [];

  let fromBlockIndex = 0;
  let toBlockIndex = 0;

  while (fromBlockIndex < fromBlocks.length && toBlockIndex < toBlocks.length) {
    const fromBlock = fromBlocks[fromBlockIndex];
    const toBlock = toBlocks[toBlockIndex];

    if (
      frontmatterType.includes(fromBlock.type || "") &&
      !frontmatterType.includes(toBlock.type || "")
    ) {
      fromBlockIndex++;
      continue;
    }

    if (
      frontmatterType.includes(toBlock.type || "") &&
      !frontmatterType.includes(fromBlock.type || "")
    ) {
      toBlockIndex++;
      continue;
    }

    relations.push({
      fromRange: [fromBlock.start, fromBlock.end],
      toRange: [toBlock.start, toBlock.end],
    });

    fromBlockIndex++;
    toBlockIndex++;
  }

  return relations;
}
