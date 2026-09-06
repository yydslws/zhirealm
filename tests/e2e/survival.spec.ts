import { expect, test } from "@playwright/test";

test("临界污染确认后失控，并可重试本轮", async ({ page }) => {
  await page.goto("/?demo=true");
  await page.getByRole("button", { name: "重置存档" }).click();
  await page.getByRole("button", { name: "展开阅读全文" }).click();
  await page.getByRole("button", { name: /24 条评论/ }).click();
  await page.getByRole("button", { name: "展开 18 条折叠评论" }).click();
  await page.getByRole("button", { name: "回复" }).click();
  await page.getByRole("button", { name: "打开附件" }).click();
  await page.getByRole("button", { name: "关闭" }).first().click();
  await page.getByRole("button", { name: "直接相信规则" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "强行揭示模糊证据" }).click();
  await expect(page.getByText("页面失控", { exact: true })).toBeVisible();
  await expect(page.getByText("有没有什么事，是你后来才发现不对劲的？")).toHaveCount(0);
  await page.getByRole("button", { name: "继续" }).click();
  await page.getByRole("button", { name: "继续" }).click();
  await page.getByRole("button", { name: "重试本轮" }).click();
  await expect(page.getByText(/第 1 周目 · pollution 0/)).toBeVisible();
});
