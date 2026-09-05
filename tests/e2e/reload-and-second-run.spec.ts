import { test, expect } from "@playwright/test";

test("刷新保持当前轮，结局第三屏才进入二周目", async ({ page }) => {
  await page.goto("/?demo=true");
  await page.getByRole("button", { name: "Reset Save" }).click();
  await page.getByRole("button", { name: "阅读评论" }).click();
  await page.reload();
  await expect(page.getByText("用户不存在")).toBeVisible();
  await expect(page.getByText(/第 1 周目/)).toBeVisible();
  await page.getByRole("button", { name: "强制 C 结局" }).click();
  await page.getByRole("button", { name: "继续" }).click();
  await page.getByRole("button", { name: "继续" }).click();
  await page.getByRole("button", { name: "重新进入" }).click();
  await expect(page.getByText(/第 2 周目/)).toBeVisible();
  await expect(page.getByText(/有人还记得你来过/)).toBeVisible();
});
