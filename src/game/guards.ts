import type { GameState } from "@/src/game/types";

export const canPublish = (state: GameState) => state.currentRun.draftAvailable && !state.currentRun.hasPublishedOwnAnswer && !state.currentRun.endingSettled && !state.currentRun.meltdown;
export const canChooseEnding = (state: GameState) => state.currentRun.hasPublishedOwnAnswer && !state.currentRun.endingSettled;
