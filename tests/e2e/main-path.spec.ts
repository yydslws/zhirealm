import { test, expect } from "@playwright/test";

test("玩家可以从阅读走到草稿发布", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "阅读回答" }).click();
  await page.getByRole("button", { name: "阅读评论" }).click();
  await expect(page.getByText("用户不存在")).toBeVisible();
  await page.getByRole("button", { name: "回复" }).click();
  await page.getByRole("button", { name: "查看私信与规则" }).click();
  await page.locator(".clue").filter({ hasText: "C2" }).getByRole("button", { name: "查看" }).click();
  await page.getByRole("button", { name: "打开草稿" }).click();
  await page.getByRole("button", { name: "确认发布" }).click();
  await expect(page.getByText("回答已经登记。你现在可以选择：")).toBeVisible();
});
