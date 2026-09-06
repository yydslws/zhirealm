import { expect, test } from "@playwright/test";

async function openAnomaly(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "展开阅读全文" }).click();
  await page.getByRole("button", { name: /24 条评论/ }).click();
  await page.getByRole("button", { name: /展开 18 条折叠评论/ }).click();
  await page.getByRole("button", { name: "回复" }).click();
}

test("照片附件要打开并检查热点后才获得 C3", async ({ page }) => {
  await page.route("**/api/game", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: "照片发来了。", intent: "UNKNOWN", event: { type: "NONE" } }) }));
  await openAnomaly(page);
  await page.getByPlaceholder("输入一句话……").fill("拍张照片");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByRole("button", { name: /IMG_404_0207.jpg/ })).toBeVisible();
  const received = await page.evaluate(() => JSON.parse(localStorage.getItem("zhirealm-save-v1") ?? "{}").currentRun);
  expect(received.seenClueIds).not.toContain("C3");
  await page.getByRole("button", { name: /IMG_404_0207.jpg/ }).click();
  await expect(page.getByRole("dialog", { name: "原图详情" })).toBeVisible();
  const opened = await page.evaluate(() => JSON.parse(localStorage.getItem("zhirealm-save-v1") ?? "{}").currentRun);
  expect(opened.seenClueIds).not.toContain("C3");
  await page.getByRole("button", { name: "门牌 404" }).click();
  const inspected = await page.evaluate(() => JSON.parse(localStorage.getItem("zhirealm-save-v1") ?? "{}").currentRun);
  expect(inspected.seenClueIds).toContain("C3");
});

test("宿管通知打开后红点消失，登记表附件可查看", async ({ page }) => {
  await page.route("**/api/game", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: "我还在门口。", intent: "UNKNOWN", event: { type: "NONE" } }) }));
  await openAnomaly(page);
  await page.getByPlaceholder("输入一句话……").fill("先等等");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.locator(".unread-dot")).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: "打开私信" }).click();
  await expect(page.locator(".unread-dot")).toHaveCount(0);
  await page.getByRole("button", { name: /2023年明德楼住宿登记表.pdf/ }).click();
  await expect(page.getByRole("dialog", { name: "原图详情" })).toContainText("宋砚");
});
