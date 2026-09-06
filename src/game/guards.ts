import type { GameState } from "@/src/game/types";

export const canPublish = (state: GameState) => {
  const clues = state.currentRun.seenClueIds;
  const spatial = clues.some((id) => ["C1", "C3"].includes(id));
  const historical = clues.some((id) => ["C2", "C4", "C5"].includes(id));
  return state.currentRun.draftAvailable && state.currentRun.hasSeenAnomalyComment && spatial && historical && !state.currentRun.hasPublishedOwnAnswer && !state.currentRun.endingSettled && !state.currentRun.meltdown;
};
export const canChooseEnding = (state: GameState) => state.currentRun.hasPublishedOwnAnswer && !state.currentRun.endingSettled;
