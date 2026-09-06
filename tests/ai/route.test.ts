import { describe, expect, it } from "vitest";
import { fallbackForNpc } from "@/src/ai/fallback";
import { aiResponseSchema } from "@/src/ai/schema";
import { askDeepSeek, withOneRetry } from "@/src/ai/client";
import { allowRequest } from "@/src/ai/rateLimit";
import { canonicalEventForIntent, fallbackIntentEvent } from "@/src/ai/events";
import { buildPrompt } from "@/src/ai/prompt";

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

  it("canonical event 由代码固定为附件而非任意线索", () => {
    expect(canonicalEventForIntent("ASK_PHOTO", "author")).toEqual({ type: "SHOW_ATTACHMENT", attachmentId: "photo-404" });
    expect(canonicalEventForIntent("ASK_REGISTER", "dormManager")).toEqual({ type: "SHOW_ATTACHMENT", attachmentId: "register-404" });
  });

  it("prompt 明确当前代码判定 intent", () => {
    const prompt = buildPrompt("dormManager", 4, [], "你是谁？", [], "ASK_DORM");
    expect(prompt).toContain("代码判定意图：ASK_DORM");
  });
});
