import { describe, expect, it } from "vitest";
import { classifyIntent } from "@/src/ai/intents";
import { createInitialState, gameReducer } from "@/src/game/reducer";

describe("互动闭环修正", () => {
  it("打开评论和展开折叠评论是两个动作", () => {
    const opened = gameReducer(createInitialState(), { type: "OPEN_COMMENTS", actionId: "comments" });
    expect(opened.currentRun.commentsOpened).toBe(true);
    expect(opened.currentRun.hasSeenUser404Comment).toBe(false);
    expect(opened.currentRun.foldedCommentCount).toBe(17);
    const shifted = gameReducer(opened, { type: "SHIFT_FOLDED_COUNT", actionId: "shift" });
    expect(shifted.currentRun.foldedCountShifted).toBe(true);
    expect(shifted.currentRun.foldedCommentCount).toBe(18);
    const anomaly = gameReducer(shifted, { type: "OPEN_FOLDED_COMMENTS", actionId: "folded" });
    expect(anomaly.currentRun.hasSeenUser404Comment).toBe(true);
  });

  it("警告答主会暂停直播，推进答主会进入危险路线", () => {
    const warned = gameReducer({ ...createInitialState(), phase: 3 }, { type: "CHAT_NPC", npc: "author", text: "别进去", reply: "我先在门口看看。", intent: "WARN_AUTHOR", event: { type: "NONE" }, actionId: "warn" });
    expect(warned.currentRun.liveFeedPaused).toBe(true);
    expect(warned.currentRun.authorPath).toBe("outside");
    const blocked = gameReducer(warned, { type: "RELEASE_LIVE_EVENT", eventId: "author-door", actionId: "blocked" });
    expect(blocked.currentRun.liveFeedReleasedIds).not.toContain("author-door");
    const pushed = gameReducer(warned, { type: "CHAT_NPC", npc: "author", text: "进去看看", reply: "那我进去。", intent: "PUSH_AUTHOR", event: { type: "NONE" }, actionId: "push" });
    expect(pushed.currentRun.liveFeedPaused).toBe(false);
    expect(pushed.currentRun.authorPath).toBe("inside");
    expect(pushed.pollution).toBe(1);
  });

  it("未知输入不会伪装成询问住了几个人", () => {
    expect(classifyIntent("你好", "author")).toBe("SMALL_TALK");
    expect(classifyIntent("随便说点什么", "author")).toBe("UNKNOWN");
  });
});
