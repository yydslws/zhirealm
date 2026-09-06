import { test, expect, type Page } from "@playwright/test";

async function publish(page: Page, ending: "death_404" | "exit" | "delete") {
  await page.goto("/?demo=true");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "重置存档" }).click();
  await page.getByRole("button", { name: "展开阅读全文" }).click();
  await page.getByRole("button", { name: /24 条评论/ }).click();
  await page.getByRole("button", { name: "展开 18 条折叠评论" }).click();
  await page.getByRole("button", { name: "回复" }).click();
  await page.getByRole("button", { name: "打开原始附件" }).click();
  await page.getByRole("button", { name: "打开记录" }).nth(2).click();
  if (ending === "delete") {
    await page.getByRole("button", { name: "第5次编辑" }).click();
    await page.getByRole("dialog", { name: "回答编辑记录" }).getByRole("button", { name: "比较版本" }).nth(1).click();
    await page.getByRole("dialog", { name: "回答编辑记录" }).getByRole("button", { name: "关闭" }).click();
  } else {
    await page.getByLabel("搜索问题").fill("404");
    await page.getByLabel("搜索问题").press("Enter");
    await page.getByRole("dialog", { name: "搜索结果" }).getByRole("button", { name: /明德楼以前有 404/ }).click();
    await page.getByRole("button", { name: "查看缓存" }).click();
    await page.getByRole("button", { name: /返回搜索结果/ }).click();
    await page.getByRole("dialog", { name: "搜索结果" }).getByRole("button", { name: "关闭" }).click();
  }
  await page.getByRole("button", { name: "打开草稿" }).click();
  await page.getByRole("button", { name: "确认发布" }).click();
}

test("退出阅读入口可提交陈渡结局", async ({ page }) => {
  await publish(page, "death_404");
  await page.getByRole("button", { name: "退出阅读" }).click();
    await page.getByRole("button", { name: "离开", exact: true }).click();
    await expect(page.getByText("陈渡出来了", { exact: true })).toBeVisible();
});

test("知境 Logo 可提交直播暂停结局", async ({ page }) => {
  await publish(page, "exit");
  await page.getByRole("button", { name: "知境" }).click();
  await expect(page.getByText("直播暂停", { exact: true })).toBeVisible();
});

test("回答菜单可提交删除结局", async ({ page }) => {
  await publish(page, "delete");
  await page.getByRole("button", { name: "回答菜单" }).click();
  await page.getByRole("button", { name: "删除回答" }).click();
  await page.getByRole("button", { name: "删除", exact: true }).click();
  await expect(page.getByText("删除自己的记录", { exact: true })).toBeVisible();
});
