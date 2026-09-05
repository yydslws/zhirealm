import { test, expect, type Page } from "@playwright/test";

async function publish(page: Page, ending: "death_404" | "exit" | "delete") {
  await page.goto("/");
  await page.getByRole("button", { name: "重置存档" }).click();
  await page.getByRole("button", { name: "阅读评论" }).click();
  if (ending === "death_404") await page.getByRole("button", { name: "深挖异常评论" }).click();
  else await page.getByRole("button", { name: "停止阅读" }).click();
  await page.getByRole("button", { name: "回复" }).click();
  await page.getByRole("button", { name: "查看私信与规则" }).click();
  if (ending === "exit") await page.getByRole("button", { name: "打开原始附件" }).click();
  else await page.getByRole("button", { name: "查看摘要" }).click();
  await page.getByRole("button", { name: "标记待核实" }).click();
  await page.locator(".clue").filter({ hasText: "C2" }).getByRole("button", { name: "查看" }).click();
  if (ending === "delete") await page.getByRole("button", { name: "强行揭示模糊证据" }).click();
  else await page.getByRole("button", { name: "查看已知证据" }).click();
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
