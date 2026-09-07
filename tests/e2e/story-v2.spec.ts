import { test, expect } from "@playwright/test";
import { initial, reduce } from "@/src/story-v2/reducer";

test("Story V2 completes END_A and survives reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText("编辑于 3 天前")).toBeVisible();
  await page.getByLabel("写下你的评论").fill("？");
  await page.getByRole("button", { name: "回复" }).click();
  await expect(page.getByText("这条回复的时间早于你的评论。")).toBeVisible();
  await page.getByRole("button", { name: /我这里现在是/ }).click();
  await page.getByRole("button", { name: /告诉他今天是/ }).click();
  await page.getByLabel("三位门牌号").fill("403");
  await page.getByRole("button", { name: "让他试试" }).click();
  await page.getByLabel("三位门牌号").fill("404");
  await page.getByRole("button", { name: "让他试试" }).click();
  await page.getByRole("button", { name: "看看校卡" }).click();
  await expect(page.getByText("明德楼住宿登记表｜404")).toBeVisible();
  await page.getByRole("button", { name: "再看看你的原回答" }).click();
  await expect(page.getByText("编辑于 刚刚")).toBeVisible();
  await page.getByRole("button", { name: "查看改动" }).click();
  await page.getByRole("button", { name: "查看改动" }).click();
  await page.getByLabel("写下他的名字").fill("陈渡");
  await page.getByRole("button", { name: "回复他" }).click();
  await page.getByRole("button", { name: "门外有什么？" }).click();
  await page.getByRole("button", { name: "继续" }).click();
  const today = new Date();
  await page.getByLabel("把日期告诉他").fill(`${today.getMonth() + 1}月${today.getDate()}日`);
  await page.getByRole("button", { name: "把日期告诉他" }).click();
  await page.getByRole("button", { name: "留下四个人的名字" }).click();
  await expect(page.getByText("你这回怎么去了这么久")).toBeVisible();
  await page.getByRole("button", { name: "你们出来了吗？" }).click();
  await expect(page.getByText("404，有人住过。四个名字留在了页面上。")).toBeVisible();
  await page.reload();
  await expect(page.getByText("404，有人住过。四个名字留在了页面上。")).toBeVisible();
});

test("END_B can return to the final choice and then complete END_A", async ({ page }) => {
  let state = initial();
  const actions = [
    { type: "COMMENT", value: "?" }, { type: "CLOCK", value: "16:58" }, { type: "DATE" },
    { type: "DOOR", value: "404" }, { type: "ROOM" }, { type: "MUTATE" }, { type: "HISTORY" }, { type: "HISTORY" },
    { type: "NAME", value: "陈渡" }, { type: "NOTE" }, { type: "OUTSIDE" }, { type: "FINAL_DATE", value: state.baseDate },
  ] as const;
  for (const action of actions) state = reduce(state, action as never);
  expect(state.stage).toBe("choice");
  await page.goto("/");
  await page.waitForTimeout(300);
  await page.evaluate((saved) => localStorage.setItem("story-v2", JSON.stringify(saved)), state);
  await page.reload();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "先让陈渡出来" }).click();
  await page.getByRole("button", { name: "让他先走" }).click();
  await page.getByRole("button", { name: "那宋砚呢？" }).click();
  await page.getByRole("button", { name: "继续" }).click();
  await expect(page.getByText("他到外面了吗？")).toBeVisible();
  await page.getByRole("button", { name: "回到最后的选择" }).click();
  await page.getByRole("button", { name: "留下四个人的名字" }).click();
  await page.getByRole("button", { name: "你们出来了吗？" }).click();
  await expect(page.getByText("404，有人住过。四个名字留在了页面上。")).toBeVisible();
});
