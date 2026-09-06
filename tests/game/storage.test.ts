import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "@/src/game/reducer";
import { loadState, saveState } from "@/src/lib/storage";
import { migrateState } from "@/src/lib/saveMigration";

describe("本地存档", () => {
  beforeEach(() => localStorage.clear());

  it("保存并读取当前轮，不自动增加周目", () => {
    const state = createInitialState();
    saveState(state);
    const loaded = loadState();
    expect(loaded?.run).toBe(1);
    expect(loaded?.currentRun.foldedCommentCount).toBe(17);
  });

  it("损坏存档返回 null", () => {
    localStorage.setItem("zhirealm-save-v1", "not-json");
    expect(loadState()).toBeNull();
  });

  it("旧摘要缺失历史字段时迁移为 unknown", () => {
    const state = createInitialState() as any;
    state.previousRun = { run: 1, endingId: "exit", published: true, ownAnswerId: "old", answerDeleted: false, bindingReleased: false, seenClueIds: [] };
    const migrated = migrateState(state);
    expect(migrated?.previousRun?.metAuthorSeen).toBe("unknown");
    expect(migrated?.previousRun?.firstTopics.author).toBe("unknown");
  });

  it("拒绝把其他周目的回答当作本轮回答", () => {
    const state = createInitialState();
    state.currentRun.hasPublishedOwnAnswer = true;
    state.currentRun.ownAnswerRunId = 2;
    expect(migrateState(state)).toBeNull();
  });

  it("旧存档缺失污染分支字段时补默认值", () => {
    const state = createInitialState() as any;
    delete state.currentRun.riskChoices;
    delete state.currentRun.riskConsequences;
    delete state.currentRun.unlockedExitIds;
    delete state.currentRun.meltdown;
    delete state.currentRun.meltdownReason;
    delete state.currentRun.retryAvailable;
    const migrated = migrateState(state);
    expect(migrated?.currentRun.riskChoices).toEqual({});
    expect(migrated?.currentRun.riskConsequences).toEqual({});
    expect(migrated?.currentRun.unlockedExitIds).toEqual([]);
    expect(migrated?.currentRun.meltdown).toBe(false);
    expect(migrated?.currentRun.meltdownReason).toBeNull();
    expect(migrated?.currentRun.retryAvailable).toBe(false);
  });
});
