import type { GameState, PreviousRun } from "@/src/game/types";

export function migrateState(value: unknown): GameState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Partial<GameState>;
  if (state.saveVersion !== 1 || !state.currentRun || typeof state.run !== "number") return null;
  if (state.currentRun.hasPublishedOwnAnswer && state.currentRun.ownAnswerRunId !== state.run) return null;
  if (state.currentRun.endingSettled && !state.currentRun.endingId) return null;
  if (state.currentRun.endingId === "delete" && state.currentRun.ownAnswerText) return null;
  const current = state.currentRun as GameState["currentRun"];
  current.riskChoices ??= {};
  current.unlockedExitIds ??= [];
  current.meltdown ??= false;
  current.retryAvailable ??= false;
  if (state.previousRun) {
    const previous = state.previousRun as Partial<PreviousRun>;
    state.previousRun = {
      ...(previous as NonNullable<GameState["previousRun"]>),
      metUser404Seen: previous.metUser404Seen ?? "unknown",
      user404Replied: previous.user404Replied ?? "unknown",
      hasSeenDormOpening: previous.hasSeenDormOpening ?? "unknown",
      hasChattedDormManager: previous.hasChattedDormManager ?? "unknown",
      firstTopics: {
        user404: previous.firstTopics?.user404 ?? "unknown",
        dormManager: previous.firstTopics?.dormManager ?? "unknown",
        author: previous.firstTopics?.author ?? "unknown",
      },
    };
  }
  return state as GameState;
}
