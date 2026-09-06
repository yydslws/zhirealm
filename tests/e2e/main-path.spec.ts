import { test, expect } from "@playwright/test";

test("玩家可以从阅读走到草稿发布", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "展开阅读全文" }).click();
  await page.getByRole("button", { name: /24 条评论/ }).click();
  await expect(page.getByRole("button", { name: "展开 18 条折叠评论" })).toBeVisible();
  await page.getByRole("button", { name: "展开 18 条折叠评论" }).click();
  await expect(page.getByText(/终于有人回了/)).toBeVisible();
  await page.getByRole("button", { name: "回复" }).click();
  await page.getByLabel("搜索问题").fill("404");
  await page.getByLabel("搜索问题").press("Enter");
  await page.getByRole("dialog", { name: "搜索结果" }).getByRole("button", { name: /明德楼以前有 404/ }).click();
  await page.getByRole("button", { name: "查看缓存摘要" }).click();
  await page.getByRole("button", { name: /返回搜索结果/ }).click();
  await page.getByRole("dialog", { name: "搜索结果" }).getByRole("button", { name: "关闭" }).click();
  await page.getByRole("button", { name: "打开草稿" }).click();
  await page.getByRole("button", { name: "确认发布" }).click();
  await expect(page.getByText("直播记录已经补全。你现在可以关闭此页、回到首页，或者删除自己的回答。", { exact: true })).toBeVisible();
});
