import { describe, expect, it } from "vitest";
import { fallbackForNpc } from "@/src/ai/fallback";
import { aiResponseSchema } from "@/src/ai/schema";
import { withOneRetry } from "@/src/ai/client";
import { allowRequest } from "@/src/ai/rateLimit";

describe("AI 边界", () => {
  it("非法输出不会被当成游戏事件", () => {
    expect(aiResponseSchema.safeParse({ text: "越权", tone: "glitch", event: { type: "KILL" } }).success).toBe(false);
  });

  it("无 API 时提供角色固定回复", () => {
    expect(fallbackForNpc("user404")).toContain("截图");
    expect(fallbackForNpc("dormManager")).toContain("按我说的做");
  });

  it("失败后只自动重试一次", async () => {
    let calls = 0;
    const result = await withOneRetry(async () => (++calls === 2 ? "ok" : null));
    expect(result).toBe("ok");
    expect(calls).toBe(2);
  });

  it("同一会话限制为 30 次请求", () => {
    const key = `test-${Date.now()}`;
    for (let i = 0; i < 30; i++) expect(allowRequest(key, 1)).toBe(true);
    expect(allowRequest(key, 1)).toBe(false);
  });
});
