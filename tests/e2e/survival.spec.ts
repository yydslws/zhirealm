import { expect, test } from "@playwright/test";

test("临界污染确认后失控，并可重试本轮", async ({ page }) => {
  await page.goto("/?demo=true");
  await page.getByRole("button", { name: "Reset Save" }).click();
  await page.getByRole("button", { name: "阅读评论" }).click();
  await page.getByRole("button", { name: "深挖异常评论" }).click();
  await page.getByRole("button", { name: "回复" }).click();
  await page.getByRole("button", { name: "查看私信与规则" }).click();
  await page.getByRole("button", { name: "打开原始附件" }).click();
  await expect(page.getByText("内容正在被替换。再进行一次危险操作，页面可能失控。")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "直接相信规则" }).click();
  await expect(page.getByText("页面失控", { exact: true })).toBeVisible();
  await expect(page.getByText("有没有什么事情，是你后来才发现不对劲的？")).toHaveCount(0);
  await page.getByRole("button", { name: "继续" }).click();
  await page.getByRole("button", { name: "继续" }).click();
  await page.getByRole("button", { name: "重试本轮" }).click();
  await expect(page.getByText(/第 1 周目 · 页面稳定/)).toBeVisible();
});
