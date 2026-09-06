import { test, expect } from "@playwright/test";

test("刷新保持当前轮，结局第三屏才进入二周目", async ({ page }) => {
  await page.goto("/?demo=true");
  await page.getByRole("button", { name: "重置存档" }).click();
  await page.getByRole("button", { name: "展开阅读全文" }).click();
  await page.getByRole("button", { name: /24 条评论/ }).click();
  await page.getByRole("button", { name: "展开 18 条折叠评论" }).click();
  await page.reload();
  await expect(page.getByText(/终于有人回了/)).toBeVisible();
  await expect(page.getByText(/第 1 周目/)).toBeVisible();
  await page.getByRole("button", { name: "强制 C 结局" }).click();
  await page.getByRole("button", { name: "重新进入下一轮" }).click();
  await expect(page.getByText(/第 2 周目/)).toBeVisible();
  await expect(page.getByText(/那场三天前的直播里，仍有人记得你来过/)).toBeVisible();
});
