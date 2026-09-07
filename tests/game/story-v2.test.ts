import { describe, expect, it } from "vitest";
import { createInitialState, gameReducer } from "@/src/game/reducer";

const act = (type: string, extra = {}) => ({ type, actionId: Math.random().toString(), ...extra }) as never;

describe("story v2", () => {
  it("accepts any non-empty comment and reveals the old reply", () => {
    let state = createInitialState();
    state = gameReducer(state, act("V2_READ_ANSWER"));
    state = gameReducer(state, act("V2_REPLY", { text: "？" }));
    expect(state.currentRun.v2PlayerComment).toBe("？");
    expect(state.currentRun.v2AuthorReply).toBe(true);
    expect(state.currentRun.v2Phase).toBe(2);
  });
});
