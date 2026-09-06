import { createInitialState } from "@/src/game/reducer";
import type { GameState, PreviousRun } from "@/src/game/types";

export function migrateState(value: unknown): GameState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Partial<GameState>;
  if (![1, 2].includes(state.saveVersion ?? 0) || !state.currentRun || typeof state.run !== "number") return null;
  if (state.currentRun.hasPublishedOwnAnswer && state.currentRun.ownAnswerRunId !== state.run) return null;
  if (state.currentRun.endingSettled && !state.currentRun.endingId) return null;
  if (state.currentRun.endingId === "delete" && state.currentRun.ownAnswerText) return null;
  const current = state.currentRun as GameState["currentRun"];
  current.conversationHistory = (current.conversationHistory ?? []).map((message) => ({ ...message, npc: message.npc ?? "unknown" }));
  current.riskChoices ??= {};
  current.riskConsequences ??= {};
  current.unlockedExitIds ??= [];
  current.meltdown ??= false;
  current.meltdownReason ??= null;
  current.retryAvailable ??= false;
  if (state.saveVersion === 1) {
    const fresh = createInitialState();
    state.currentRun = { ...fresh.currentRun, ...current };
    state.saveVersion = 2;
  }
  current.intentHistory ??= [];
  current.worldEvents ??= [];
  current.npcAttitude ??= {};
  current.liveFeedReleasedIds ??= [];
  current.searchHistory ??= [];
  current.searchResultIds ??= [];
  current.searchResultPageId ??= null;
  current.readSearchResultIds ??= [];
  current.openedEditHistory ??= false;
  current.comparedEditVersionIds ??= [];
  current.profileViews ??= [];
  current.imageInspections ??= [];
  current.lastPlayerInput ??= null;
  current.commentsOpened ??= current.hasSeenUser404Comment;
  current.foldedCountShifted ??= current.hasSeenUser404Comment;
  current.liveFeedPaused ??= false;
  current.authorPath ??= "outside";
  current.photoInspectionOpen ??= false;
  current.inlineReplyOpen ??= false;
  current.dmNotificationUnlocked ??= false;
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
      playerInputs: previous.playerInputs ?? [],
      lastIntent: previous.lastIntent ?? null,
    };
  }
  return state as GameState;
}
