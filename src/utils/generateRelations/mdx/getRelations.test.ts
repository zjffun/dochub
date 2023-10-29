import getRelations from "./getRelations";

const baseFromContent = `# test 1

foo

## test 2

bar`;
const baseToContent = `# 测试 1

文字1
文字2

## 测试 2

文字3`;

describe("getRelations", () => {
  test("base", async () => {
    expect(
      await getRelations(baseFromContent, baseToContent)
    ).toMatchSnapshot();
  });

  test("frontmatter", async () => {
    const fromContent = `---
title: 中文标题
---

${baseFromContent}
`;

    const toContent = `---
title: 中文标题
---

${baseToContent}
`;

    expect(await getRelations(fromContent, toContent)).toMatchSnapshot();
  });

  test("frontmatter only in to content", async () => {
    const fromContent = `${baseFromContent}`;

    const toContent = `---
title: 中文标题
---

${baseToContent}
`;

    expect(await getRelations(fromContent, toContent)).toMatchSnapshot();
  });

  test("frontmatter only in from content", async () => {
    const fromContent = `---
title: 中文标题
---

${baseFromContent}
`;

    const toContent = `${baseToContent}`;

    expect(await getRelations(fromContent, toContent)).toMatchSnapshot();
  });
});
