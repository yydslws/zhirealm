import type { GameState, LiveEventId } from "@/src/game/types";

export const liveFeedBranches = {
  outside: ["author-arrived"] as LiveEventId[],
  inside: ["author-arrived", "author-door", "author-deleted", "dorm-warning"] as LiveEventId[],
};

export function canReleaseLiveEvent(state: GameState, eventId: LiveEventId) {
  if (eventId === "dorm-warning") return state.currentRun.dmTriggerPending;
  if (state.currentRun.liveFeedPaused) return false;
  if (!state.currentRun.liveFeedStarted) return false;
  return liveFeedBranches[state.currentRun.authorPath].includes(eventId);
}
