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

  it("搜索结果先打开页面，读完后才揭示线索", () => {
    let state = gameReducer(createInitialState(), { type: "SEARCH", query: "宋砚", actionId: "search-songyan" });
    state = gameReducer(state, { type: "OPEN_SEARCH_RESULT", resultId: "search-songyan", actionId: "open-result" });
    expect(state.currentRun.seenClueIds).not.toContain("C2");
    state = gameReducer(state, { type: "READ_SEARCH_RESULT", resultId: "search-songyan", actionId: "read-result" });
    expect(state.currentRun.seenClueIds).toContain("C2");
  });

  it("404 回复不打开宿管，收到联系提示后才解锁私信通知", () => {
    let state = gameReducer({ ...createInitialState(), phase: 2 }, { type: "REPLY_AUTHOR_COMMENT", actionId: "reply" });
    expect(state.currentRun.conversationSeenNpcIds).toContain("author");
    expect(state.currentRun.conversationSeenNpcIds).not.toContain("dormManager");
    state = gameReducer(state, { type: "CHAT_NPC", npc: "author", text: "你是谁？", reply: "之后会有人联系你。", actionId: "chat" });
    expect(state.currentRun.dmTriggerPending).toBe(true);
  });

  it("搜索结果不会单独解锁草稿，异常评论出现后证据门槛才满足", () => {
    let state = gameReducer(createInitialState(), { type: "SEARCH", query: "404", actionId: "gate-1" });
    state = gameReducer(state, { type: "OPEN_SEARCH_RESULT", resultId: "search-404", actionId: "gate-2" });
    state = gameReducer(state, { type: "READ_SEARCH_RESULT", resultId: "search-404", actionId: "gate-3" });
    expect(state.currentRun.draftAvailable).toBe(false);
    state = gameReducer(state, { type: "VIEW_CLUE", clueId: "C3", actionId: "gate-spatial" });
    state = gameReducer(state, { type: "OPEN_COMMENTS", actionId: "gate-4" });
    state = gameReducer(state, { type: "SHIFT_FOLDED_COUNT", actionId: "gate-5" });
    state = gameReducer(state, { type: "OPEN_FOLDED_COMMENTS", actionId: "gate-6" });
    expect(state.currentRun.draftAvailable).toBe(true);
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
    const state = { ...createInitialState(), phase: 3, currentRun: { ...createInitialState().currentRun, liveFeedStarted: true } };
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
