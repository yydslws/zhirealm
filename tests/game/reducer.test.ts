import { describe, expect, it } from "vitest";
import { createInitialState, gameReducer } from "@/src/game/reducer";
import { pollutionBand } from "@/src/game/derive";

describe("知境主线状态机", () => {
  it("风险选择不可撤销，危险路线增加污染", () => {
    const initial = gameReducer(createInitialState(), { type: "OPEN_FOLDED_COMMENTS", actionId: "open-comments" });
    const danger = gameReducer(initial, { type: "CHOOSE_RISK", node: "comments", choice: "danger", actionId: "risk-1" });
    const repeated = gameReducer(danger, { type: "CHOOSE_RISK", node: "comments", choice: "safe", actionId: "risk-2" });

    expect(danger.currentRun.riskChoices.comments).toBe("danger");
    expect(danger.pollution).toBe(1);
    expect(repeated).toEqual(danger);
  });

  it("污染分三档，达到 4 时进入失控且可重试", () => {
    let state = { ...createInitialState(), phase: 5 };
    expect(pollutionBand(state.pollution)).toBe("stable");
    for (const node of ["comments", "dorm", "rules", "evidence"] as const) {
      state = gameReducer(state, { type: "CHOOSE_RISK", node, choice: "danger", actionId: `risk-${node}` });
    }
    expect(state.pollution).toBe(4);
    expect(pollutionBand(state.pollution)).toBe("meltdown");
    expect(state.currentRun.meltdown).toBe(true);
    expect(state.currentRun.retryAvailable).toBe(true);
    expect(state.timeStopped).toBe(true);
  });

  it("失控重试回到本轮开头且不增加周目", () => {
    let state = { ...createInitialState(), phase: 5 };
    for (const node of ["comments", "dorm", "rules", "evidence"] as const) {
      state = gameReducer(state, { type: "CHOOSE_RISK", node, choice: "danger", actionId: `risk-${node}` });
    }
    state = gameReducer(state, { type: "ADVANCE_ENDING_SCREEN", actionId: "meltdown-screen-2" });
    state = gameReducer(state, { type: "ADVANCE_ENDING_SCREEN", actionId: "meltdown-screen-3" });
    const retried = gameReducer(state, { type: "RETRY_AFTER_MELTDOWN", actionId: "retry" });
    expect(retried.run).toBe(1);
    expect(retried.pollution).toBe(0);
    expect(retried.currentRun.meltdown).toBe(false);
    expect(retried.currentRun.foldedCommentCount).toBe(17);
    expect(retried.previousRun?.endingId).toBe("meltdown");
  });

  it("AI 对话不增加污染", () => {
    const state = gameReducer(createInitialState(), { type: "CHAT_NPC", npc: "author", text: "你是谁？", reply: "不记得了。", actionId: "chat-risk" });
    expect(state.pollution).toBe(0);
  });

  it("危险路线只解锁对应出口", () => {
    let state = { ...createInitialState(), phase: 3 };
    state = gameReducer(state, { type: "CHOOSE_RISK", node: "dorm", choice: "danger", actionId: "unlock-exit" });
    expect(state.currentRun.unlockedExitIds).toEqual(["exit"]);
    const blocked = gameReducer({ ...state, currentRun: { ...state.currentRun, hasPublishedOwnAnswer: true } }, { type: "TRIGGER_EXIT", endingId: "delete", actionId: "blocked-delete" });
    expect(blocked.currentRun.pendingEndingId).toBeNull();
  });

  it("C2 为安全路线提供保底出口，危险证据显示专属后果", () => {
    let state = gameReducer(createInitialState(), { type: "VIEW_CLUE", clueId: "C2", actionId: "safe-clue" });
    expect(state.currentRun.unlockedExitIds).toEqual(["death_404"]);
    state = gameReducer(state, { type: "CHOOSE_RISK", node: "evidence", choice: "danger", actionId: "danger-evidence" });
    expect(state.currentRun.riskConsequences.evidence).toContain("宋砚");
  });

  it("污染 3 为临界状态，并记录失控原因", () => {
    expect(pollutionBand(3)).toBe("critical");
    let state = { ...createInitialState(), phase: 5 };
    for (const node of ["comments", "dorm", "rules", "evidence"] as const) {
      state = gameReducer(state, { type: "CHOOSE_RISK", node, choice: "danger", actionId: `critical-${node}` });
    }
    expect(state.currentRun.meltdownReason).toContain("模糊证据");
  });
  it("展开折叠评论只把 17 变成 18 一次", () => {
    const initial = createInitialState();
    const opened = gameReducer(initial, { type: "OPEN_FOLDED_COMMENTS", actionId: "a1" });
    const repeated = gameReducer(opened, { type: "OPEN_FOLDED_COMMENTS", actionId: "a2" });

    expect(opened.currentRun.foldedCommentCount).toBe(18);
    expect(opened.currentRun.hasSeenUser404Comment).toBe(true);
    expect(repeated).toEqual(opened);
  });

  it("正式网页动作不显示显式风险选项", () => {
    let state = createInitialState();
    state = gameReducer(state, { type: "READ_ANSWER", actionId: "read" });
    state = gameReducer(state, { type: "OPEN_FOLDED_COMMENTS", actionId: "open" });
    expect(state.currentRun.riskChoices.comments).toBe("danger");
    expect(state.currentRun.foldedCommentCount).toBe(18);
    expect(state.pollution).toBe(1);
  });

  it("发布后创建本轮回答并停在 02:07", () => {
    let state = createInitialState();
    state = gameReducer(state, { type: "VIEW_CLUE", clueId: "C2", actionId: "c2" });
    state = gameReducer(state, { type: "OPEN_DRAFT", actionId: "d1" });
    state = gameReducer(state, { type: "PUBLISH_ANSWER", actionId: "p1" });

    expect(state.currentRun.hasPublishedOwnAnswer).toBe(true);
    expect(state.currentRun.ownAnswerText).toContain("404");
    expect(state.timeStopped).toBe(true);
    expect(state.gameTime).toBe("02:07");
    expect(state.currentRun.phase06Available).toBe(true);
  });

  it("C 结局删除回答且结算只发生一次", () => {
    let state = createInitialState();
    state = gameReducer(state, { type: "VIEW_CLUE", clueId: "C4", actionId: "c4" });
    state = gameReducer(state, { type: "OPEN_DRAFT", actionId: "d1" });
    state = gameReducer(state, { type: "PUBLISH_ANSWER", actionId: "p1" });
    state = gameReducer(state, { type: "CHOOSE_ENDING", endingId: "delete", actionId: "e1" });
    state = gameReducer(state, { type: "CONFIRM_ENDING", actionId: "e2" });
    const repeated = gameReducer(state, { type: "CONFIRM_ENDING", actionId: "e3" });

    expect(state.currentRun.endingId).toBe("delete");
    expect(state.currentRun.endingSettled).toBe(true);
    expect(state.currentRun.ownAnswerText).toBeNull();
    expect(state.currentRun.ownAnswerBindingActive).toBe(false);
    expect(state.currentRun.ownAnswerRegistered).toBe(false);
    expect(state.previousRun?.endingId).toBe("delete");
    expect(state.previousRun?.ownAnswerId).toBeNull();
    expect(repeated).toEqual(state);
    expect(gameReducer(state, { type: "OPEN_DRAFT", actionId: "after-delete-draft" })).toEqual(state);
    expect(gameReducer(state, { type: "PUBLISH_ANSWER", actionId: "after-delete-publish" })).toEqual(state);
  });

  it("NPC 对话只写入当前轮历史，不改变剧情真相", () => {
    const state = gameReducer(createInitialState(), {
      type: "CHAT_NPC", npc: "user404", text: "你是谁？", reply: "我只记得截图。", actionId: "chat-1",
    });
    expect(state.currentRun.conversationHistory).toEqual([
      { role: "user", text: "你是谁？", npc: "user404" },
      { role: "assistant", text: "我只记得截图。", npc: "user404" },
    ]);
    expect(state.currentRun.hasPublishedOwnAnswer).toBe(false);
  });

  it("打开宿管私信后开放调查证据", () => {
    const state = gameReducer(createInitialState(), { type: "OPEN_DORM_MESSAGE", actionId: "m1" });
    expect(state.phase).toBe(4);
  });

  it("只有结局第三屏重新进入才增加周目并保留摘要", () => {
    let state = createInitialState();
    state = gameReducer(state, { type: "VIEW_CLUE", clueId: "C2", actionId: "c2" });
    state = gameReducer(state, { type: "CHOOSE_RISK", node: "dorm", choice: "danger", actionId: "dorm-exit" });
    state = gameReducer(state, { type: "PUBLISH_ANSWER", actionId: "p1" });
    state = gameReducer(state, { type: "CHOOSE_ENDING", endingId: "exit", actionId: "e1" });
    state = gameReducer(state, { type: "CONFIRM_ENDING", actionId: "e2" });
    expect(state.currentRun.bAutoCommentAdded).toBe(true);
    expect(gameReducer(state, { type: "REENTER_NEXT_RUN", actionId: "early" }).run).toBe(1);
    state = gameReducer(state, { type: "ADVANCE_ENDING_SCREEN", actionId: "s2" });
    state = gameReducer(state, { type: "ADVANCE_ENDING_SCREEN", actionId: "s3" });
    state = gameReducer(state, { type: "REENTER_NEXT_RUN", actionId: "reenter" });
    expect(state.run).toBe(2);
    expect(state.previousRun?.endingId).toBe("exit");
  });

  it("清除上一轮记录不改变当前轮", () => {
    const state = createInitialState();
    const withMemory = { ...state, run: 2, previousRun: { run: 1, endingId: "exit", published: true, ownAnswerId: "old", answerDeleted: false, bindingReleased: false, metUser404Seen: true, user404Replied: false, hasSeenDormOpening: true, hasChattedDormManager: false, seenClueIds: ["C2"], firstTopics: { user404: null, dormManager: null, author: null } } } as const;
    const cleared = gameReducer(withMemory, { type: "CLEAR_PREVIOUS_RUN", actionId: "clear" });
    expect(cleared.previousRun).toBeNull();
    expect(cleared.run).toBe(2);
    expect(cleared.currentRun.foldedCommentCount).toBe(17);
  });
});
