import { describe, expect, it } from "vitest";
import { initial, reduce } from "@/src/story-v2/reducer";

const act = (type: any, value?: string) => ({ type, value });

describe("story v2 reducer", () => {
  it("hydrates a saved state without mutating the current object", () => {
    const state = initial();
    const saved = { ...state, stage: "door" as const, baseDate: "2026-09-07" };
    const next = reduce(state, { type: "HYDRATE", state: saved });
    expect(next).toEqual(saved);
    expect(next).not.toBe(state);
  });

  it("keeps puzzle hints progressive and restores B choice snapshot", () => {
    let state = initial();
    state = reduce(state, act("COMMENT", "后续呢？"));
    state = reduce(state, act("CLOCK", "16:58"));
    state = reduce(state, act("DATE"));
    expect(state.stage).toBe("dateReveal");
    state = reduce(state, act("DATE_CONTINUE"));
    state = reduce(state, act("DOOR", "403"));
    expect(state.doorHintLevel).toBe(0);
    state = reduce(state, act("DOOR_HINT"));
    expect(state.doorHintLevel).toBe(1);
    state = reduce(state, act("DOOR", "404"));
    state = reduce(state, act("ROOM"));
    state = reduce(state, act("MUTATE"));
    state = reduce(state, act("HISTORY"));
    state = reduce(state, act("HISTORY"));
    state = reduce(state, act("NAME", "陈渡"));
    state = reduce(state, act("NOTE"));
    state = reduce(state, act("OUTSIDE"));
    state = reduce(state, act("FINAL_DATE", "9月7日"));
    state = reduce(state, act("CHOICE_B"));
    expect(state.stage).toBe("bConfirm");
    state = reduce(state, act("B_BACK"));
    expect(state.stage).toBe("choice");
    expect(state.comment).toBe("后续呢？");
  });

  it("restarts from the opening after either completed ending", () => {
    const state = { ...initial(), stage: "aDone" as const, ending: "A" as const };
    expect(reduce(state, act("RESTART")).stage).toBe("opening");
  });
});
