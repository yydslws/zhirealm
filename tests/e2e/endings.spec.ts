import { test, expect, type Page } from "@playwright/test";

async function publish(page: Page, ending: "death_404" | "exit" | "delete") {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "展开阅读全文" }).click();
  await page.getByRole("button", { name: /24 条评论/ }).click();
  await page.getByRole("button", { name: "展开 18 条折叠评论" }).click();
  await page.getByRole("button", { name: "回复" }).click();
  if (ending === "exit") await page.getByRole("button", { name: "打开附件" }).click();
  await page.getByRole("button", { name: "关闭" }).first().click();
  if (ending === "delete") {
    await page.getByRole("button", { name: "第5次编辑" }).click();
    await page.getByRole("dialog", { name: "回答编辑记录" }).getByRole("button", { name: "比较版本" }).nth(1).click();
    await page.getByRole("dialog", { name: "回答编辑记录" }).getByRole("button", { name: "关闭" }).click();
  } else if (ending !== "exit") {
    await page.getByLabel("搜索问题").fill("404");
    await page.getByLabel("搜索问题").press("Enter");
    await page.getByRole("dialog", { name: "搜索结果" }).getByRole("button", { name: /明德楼以前有 404/ }).click();
  }
  await page.getByRole("button", { name: "打开草稿" }).click();
  await page.getByRole("button", { name: "确认发布" }).click();
}

for (const [button, title] of [["关闭此页", "陈渡出来了"], ["回到首页", "直播暂停"], ["删除回答", "删除自己的记录"]] as const) {
  test(`${button} 可提交对应结局`, async ({ page }) => {
    await publish(page, button === "关闭此页" ? "death_404" : button === "回到首页" ? "exit" : "delete");
    await page.getByRole("button", { name: button }).click();
    await page.getByRole("button", { name: "确认", exact: true }).click();
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  });
}
