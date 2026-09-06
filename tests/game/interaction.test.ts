import { describe, expect, it } from "vitest";
import { classifyIntent } from "@/src/ai/intents";
import { createInitialState, gameReducer } from "@/src/game/reducer";

describe("三层互动", () => {
  it("将自然语言分类为有限意图", () => {
    expect(classifyIntent("别进去", "author")).toBe("WARN_AUTHOR");
    expect(classifyIntent("先拍门牌给我看", "author")).toBe("ASK_PHOTO");
    expect(classifyIntent("你认识宋砚吗", "author")).toBe("ASK_SONG_YAN");
    expect(classifyIntent("回来", "author")).toBe("TELL_RETURN");
  });

  it("搜索记录和结果可恢复", () => {
    const state = gameReducer(createInitialState(), { type: "SEARCH", query: "404", actionId: "search-1" });
    expect(state.currentRun.searchHistory).toEqual(["404"]);
    expect(state.currentRun.searchResultIds).toContain("search-404");
  });

  it("AI 事件经过引擎校验后才能揭示线索", () => {
    const state = gameReducer(createInitialState(), {
      type: "CHAT_NPC", npc: "author", text: "你认识宋砚吗？", reply: "……你在哪看到这个名字的？",
      intent: "ASK_SONG_YAN", event: { type: "REVEAL_CLUE", clueId: "C2" }, actionId: "chat-songyan",
    });
    expect(state.currentRun.seenClueIds).toContain("C2");
  });

  it("不匹配当前意图的事件会被降级为 NONE", () => {
    const state = gameReducer(createInitialState(), {
      type: "CHAT_NPC", npc: "author", text: "别进去", reply: "好。", intent: "WARN_AUTHOR",
      event: { type: "REVEAL_CLUE", clueId: "C5" }, actionId: "chat-invalid",
    });
    expect(state.currentRun.seenClueIds).not.toContain("C5");
  });

  it("直播事件只释放一次", () => {
    const state = { ...createInitialState(), phase: 3 };
    const once = gameReducer(state, { type: "RELEASE_LIVE_EVENT", eventId: "author-arrived", actionId: "live-1" });
    const twice = gameReducer(once, { type: "RELEASE_LIVE_EVENT", eventId: "author-arrived", actionId: "live-2" });
    expect(once.currentRun.liveFeedReleasedIds).toEqual(["author-arrived"]);
    expect(twice).toEqual(once);
  });

  it("编辑记录、主页和图片检查写入调查状态", () => {
    let state = createInitialState();
    state = gameReducer(state, { type: "OPEN_EDIT_HISTORY", actionId: "edit" });
    state = gameReducer(state, { type: "COMPARE_EDIT_VERSION", versionId: "v2", actionId: "compare" });
    state = gameReducer(state, { type: "OPEN_PROFILE", profileId: "author", actionId: "profile" });
    state = gameReducer(state, { type: "INSPECT_IMAGE_REGION", imageId: "photo-404", regionId: "door", actionId: "image" });
    expect(state.currentRun.openedEditHistory).toBe(true);
    expect(state.currentRun.comparedEditVersionIds).toEqual(["v2"]);
    expect(state.currentRun.profileViews).toEqual(["author"]);
    expect(state.currentRun.imageInspections).toContain("photo-404:door");
  });
});
