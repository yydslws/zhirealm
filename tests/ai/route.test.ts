import { describe, expect, it } from "vitest";
import { fallbackForNpc } from "@/src/ai/fallback";
import { aiResponseSchema } from "@/src/ai/schema";
import { askDeepSeek, withOneRetry } from "@/src/ai/client";
import { allowRequest } from "@/src/ai/rateLimit";
import { fallbackIntentEvent } from "@/src/ai/events";

describe("AI 边界", () => {
  it("非法输出不会被当成游戏事件", () => {
    expect(aiResponseSchema.safeParse({ text: "越权", tone: "glitch", event: { type: "KILL" } }).success).toBe(false);
  });

  it("无 API 时提供角色固定回复", () => {
    expect(fallbackForNpc("author")).toContain("404");
    expect(fallbackForNpc("dormManager")).toContain("别再联系他");
  });

  it("失败后只自动重试一次", async () => {
    let calls = 0;
    const result = await withOneRetry(async () => (++calls === 2 ? "ok" : null));
    expect(result).toBe("ok");
    expect(calls).toBe(2);
  });

  it("上游模型超时会快速返回离线结果", async () => {
    const previousKey = process.env.DEEPSEEK_API_KEY;
    process.env.DEEPSEEK_API_KEY = "test-key";
    const previousFetch = globalThis.fetch;
    try {
      globalThis.fetch = ((_input, init) => new Promise((_, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
      })) as typeof fetch;
      await expect(askDeepSeek("test", 5)).resolves.toBeNull();
    } finally {
      globalThis.fetch = previousFetch;
      if (previousKey === undefined) delete process.env.DEEPSEEK_API_KEY;
      else process.env.DEEPSEEK_API_KEY = previousKey;
    }
  });

  it("同一会话限制为 30 次请求", () => {
    const key = `test-${Date.now()}`;
    for (let i = 0; i < 30; i++) expect(allowRequest(key, 1)).toBe(true);
    expect(allowRequest(key, 1)).toBe(false);
  });

  it("离线兜底也返回可校验的意图事件", () => {
    const result = fallbackIntentEvent("ASK_SONG_YAN", "author");
    expect(result.intent).toBe("ASK_SONG_YAN");
    expect(result.event).toEqual({ type: "REVEAL_CLUE", clueId: "C2" });
  });
});
