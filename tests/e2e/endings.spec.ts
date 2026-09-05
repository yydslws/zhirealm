import { test, expect, type Page } from "@playwright/test";

async function publish(page: Page, ending: "death_404" | "exit" | "delete") {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "展开阅读全文" }).click();
  await page.getByRole("button", { name: /24 条评论/ }).click();
  await page.getByRole("button", { name: "回复" }).click();
  if (ending === "exit") await page.getByRole("button", { name: "打开附件" }).click();
  await page.getByRole("button", { name: "关闭" }).first().click();
  await page.locator(".clue").filter({ hasText: ending === "delete" ? "C4" : "C2" }).getByRole("button", { name: "打开记录" }).click();
  await page.getByRole("button", { name: "打开草稿" }).click();
  await page.getByRole("button", { name: "确认发布" }).click();
}

for (const [button, title] of [["关闭此页", "该回答不存在"], ["回到首页", "回到首页"], ["删除回答", "删除成功"]] as const) {
  test(`${button} 可提交对应结局`, async ({ page }) => {
    await publish(page, button === "关闭此页" ? "death_404" : button === "回到首页" ? "exit" : "delete");
    await page.getByRole("button", { name: button }).click();
    await page.getByRole("button", { name: "确认", exact: true }).click();
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  });
}
