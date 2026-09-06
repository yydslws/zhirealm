import { buildDraft } from "@/src/game/derive";
import { canChooseEnding, canPublish } from "@/src/game/guards";
import { applyWorldEvent, validateIntentEvent } from "@/src/game/engine";
import { fallbackIntentEvent } from "@/src/ai/events";
import { classifyIntent } from "@/src/ai/intents";
import { canReleaseLiveEvent } from "@/src/game/liveFeed";
import type { CurrentRun, EndingId, ExitId, GameAction, GameState, PreviousRun, RiskChoice, RiskNodeId, WorldEvent } from "@/src/game/types";

const initialRun = (): CurrentRun => ({
  hasReadP01Answer: false, nightNoticeVisible: false, foldedCommentCount: 17,
  hasSeenUser404Comment: false, hasRepliedUser404: false, seenRuleIds: [], seenClueIds: [],
  conversationSeenNpcIds: [], user404FirstTopic: null, dormManagerFirstTopic: null, authorFirstTopic: null,
  conversationHistory: [], draftAvailable: false, phase05Available: false, draftUnlockedBy: [],
  draftPreviewText: null, publishSnapshotText: null, hasPublishedOwnAnswer: false, ownAnswerRegistered: false,
  ownAnswerId: null, ownAnswerRunId: null, ownAnswerText: null, ownAnswerVisible: false, ownAnswerDeleted: false,
  ownAnswerBindingActive: false, phase06Available: false, endingActionLock: false, endingSettled: false,
  endingId: null, endingEventId: null, endingScreenIndex: 0, pendingEndingId: null,
  bAutoCommentAdded: false, bAutoCommentId: null, questionAnswerCount: 118, actionIds: [], riskChoices: {}, riskConsequences: {}, unlockedExitIds: [], meltdown: false, meltdownReason: null, retryAvailable: false,
  intentHistory: [], worldEvents: [], npcAttitude: {}, liveFeedReleasedIds: [], searchHistory: [], searchResultIds: [], openedEditHistory: false, comparedEditVersionIds: [], profileViews: [], imageInspections: [], lastPlayerInput: null, commentsOpened: false, foldedCountShifted: false, liveFeedPaused: false, authorPath: "outside", photoInspectionOpen: false,
});

export function createInitialState(): GameState {
  return { saveVersion: 2, saveRevision: 0, run: 1, scene: "question", phase: 1, gameTime: "01:57", timeStopped: false, pollution: 0, currentRun: initialRun(), previousRun: null };
}

const mark = (state: GameState, actionId: string): GameState => ({
  ...state,
  saveRevision: state.saveRevision + 1,
  currentRun: { ...state.currentRun, actionIds: [...state.currentRun.actionIds, actionId] },
});

function summarizeRun(state: GameState, r = state.currentRun): PreviousRun {
  return {
    run: state.run, endingId: r.endingId!, published: r.hasPublishedOwnAnswer, ownAnswerId: r.endingId === "delete" ? null : r.ownAnswerId,
    answerDeleted: r.ownAnswerDeleted, bindingReleased: !r.ownAnswerBindingActive,
    metUser404Seen: r.hasSeenUser404Comment, user404Replied: r.hasRepliedUser404,
    hasSeenDormOpening: r.conversationSeenNpcIds.includes("dormManager"), hasChattedDormManager: r.conversationHistory.some((m) => m.role === "user"),
    seenClueIds: [...r.seenClueIds], firstTopics: { user404: r.user404FirstTopic, dormManager: r.dormManagerFirstTopic, author: r.authorFirstTopic }, playerInputs: r.intentHistory.slice(-3).map((item) => item.text), lastIntent: r.intentHistory.at(-1)?.intent ?? null,
  };
}

function resetForNextRun(state: GameState): GameState {
  return { ...createInitialState(), run: state.run + 1, previousRun: state.previousRun ?? summarizeRun(state), saveRevision: state.saveRevision + 1 };
}

const exitForRisk: Partial<Record<RiskNodeId, ExitId>> = { comments: "death_404", dorm: "exit", evidence: "delete" };
const minPhaseForRisk: Record<RiskNodeId, number> = { comments: 2, dorm: 3, rules: 3, evidence: 4, draft: 5 };
const consequenceForRisk: Record<RiskNodeId, Record<RiskChoice, string>> = {
  comments: { safe: "你停在第十八条之前。评论区暂时没有继续增长。", danger: "第十八条不是新增的。它一直在这里，只是之前没人能看见。" },
  dorm: { safe: "摘要没有署名，也没有时间。", danger: "原始附件的时间戳停在 02:07，像是有人提前替你打开过。" },
  rules: { safe: "你把规则标为待核实，暂时没有把它当成出口。", danger: "规则末尾多出一行：相信它的人，会先忘记自己为什么点开。" },
  evidence: { safe: "你只保留了能确认来源的证据。", danger: "模糊证据里出现了宋砚的名字，随后又被划掉。" },
  draft: { safe: "你把草稿留在这里，先回去核实。", danger: "草稿自动补完了最后一句：不要让它知道你已经看见。" },
};

function resultIds(query: string) {
  const q = query.toLowerCase();
  return [q.includes("404") && "search-404", q.includes("宋砚") && "search-songyan", q.includes("陈渡") && "search-chendu", q.includes("明德楼") && "search-mingde"].filter(Boolean) as string[];
}

function settleMeltdown(state: GameState): GameState {
  if (state.pollution < 4 || state.currentRun.meltdown || state.currentRun.endingSettled) return state;
  const r = { ...state.currentRun, meltdown: true, meltdownReason: state.currentRun.riskConsequences.evidence ?? "你在内容失真前继续相信了它。", retryAvailable: true, endingSettled: true, endingId: "meltdown" as const, endingEventId: `meltdown-${state.run}`, endingScreenIndex: 1 };
  return { ...state, pollution: 4, scene: "ending", phase: 6, timeStopped: true, currentRun: r, previousRun: summarizeRun(state, r) };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.currentRun.actionIds.includes(action.actionId)) return state;
  if (state.currentRun.endingSettled && !["ADVANCE_ENDING_SCREEN", "REENTER_NEXT_RUN", "RETRY_AFTER_MELTDOWN", "CANCEL_ACTION"].includes(action.type)) return state;
  let next = state;
  switch (action.type) {
    case "READ_ANSWER":
      next = { ...state, phase: Math.max(state.phase, 1), currentRun: { ...state.currentRun, hasReadP01Answer: true } };
      break;
    case "OPEN_COMMENTS":
      next = { ...state, scene: "comments", phase: Math.max(state.phase, 2), currentRun: { ...state.currentRun, commentsOpened: true, foldedCommentCount: 17 } };
      break;
    case "SHIFT_FOLDED_COUNT":
      if (state.currentRun.commentsOpened && !state.currentRun.foldedCountShifted) next = { ...state, currentRun: { ...state.currentRun, foldedCountShifted: true, foldedCommentCount: 18 } };
      break;
    case "OPEN_FOLDED_COMMENTS":
      if ((state.currentRun.commentsOpened && state.currentRun.foldedCountShifted || !state.currentRun.commentsOpened) && !state.currentRun.hasSeenUser404Comment) next = { ...state, scene: "comments", phase: 2, gameTime: "02:00", pollution: state.pollution + 1, currentRun: { ...state.currentRun, commentsOpened: true, foldedCountShifted: true, foldedCommentCount: 18, hasSeenUser404Comment: true, riskChoices: { ...state.currentRun.riskChoices, comments: "danger" }, riskConsequences: { ...state.currentRun.riskConsequences, comments: consequenceForRisk.comments.danger } } };
      break;
    case "CHOOSE_RISK": {
      if (state.currentRun.riskChoices[action.node] || state.currentRun.meltdown || state.currentRun.endingSettled || state.phase < minPhaseForRisk[action.node] || (action.node === "draft" && !state.currentRun.draftAvailable)) break;
      const choices = { ...state.currentRun.riskChoices, [action.node]: action.choice };
      const exit = action.choice === "danger" ? exitForRisk[action.node] : undefined;
      const exits = exit && !state.currentRun.unlockedExitIds.includes(exit) ? [...state.currentRun.unlockedExitIds, exit] : state.currentRun.unlockedExitIds;
      const consequences = { ...state.currentRun.riskConsequences, [action.node]: consequenceForRisk[action.node][action.choice] };
      const draft = action.node === "draft" && action.choice === "danger" ? buildDraft(state.currentRun) : state.currentRun.draftPreviewText;
      next = { ...state, scene: action.node === "draft" && action.choice === "danger" ? "draft" : state.scene, phase: action.node === "draft" && action.choice === "danger" ? 5 : state.phase, pollution: state.pollution + (action.choice === "danger" ? 1 : 0), currentRun: { ...state.currentRun, riskChoices: choices, riskConsequences: consequences, unlockedExitIds: exits, draftPreviewText: draft } };
      break;
    }
    case "REPLY_USER_404":
      next = { ...state, scene: "messages", phase: 3, currentRun: { ...state.currentRun, hasRepliedUser404: true, conversationSeenNpcIds: state.currentRun.conversationSeenNpcIds.includes("user404") ? state.currentRun.conversationSeenNpcIds : [...state.currentRun.conversationSeenNpcIds, "user404"] } };
      break;
    case "OPEN_DORM_MESSAGE":
      next = { ...state, scene: "messages", phase: Math.max(state.phase, 4), currentRun: { ...state.currentRun, conversationSeenNpcIds: state.currentRun.conversationSeenNpcIds.includes("dormManager") ? state.currentRun.conversationSeenNpcIds : [...state.currentRun.conversationSeenNpcIds, "dormManager"] } };
      break;
    case "VIEW_RULE":
      next = { ...state, scene: "investigation", phase: Math.max(state.phase, 3), currentRun: { ...state.currentRun, seenRuleIds: state.currentRun.seenRuleIds.includes(action.ruleId) ? state.currentRun.seenRuleIds : [...state.currentRun.seenRuleIds, action.ruleId] } };
      break;
    case "VIEW_CLUE": {
      const seen = state.currentRun.seenClueIds.includes(action.clueId) ? state.currentRun.seenClueIds : [...state.currentRun.seenClueIds, action.clueId];
      const unlock = action.clueId === "C2" || action.clueId === "C4";
      const safeExit: ExitId | null = action.clueId === "C2" ? "death_404" : action.clueId === "C4" ? "delete" : null;
      const exits = safeExit && !state.currentRun.unlockedExitIds.includes(safeExit) ? [...state.currentRun.unlockedExitIds, safeExit] : state.currentRun.unlockedExitIds;
      next = { ...state, scene: "investigation", phase: Math.max(state.phase, 4), gameTime: "02:07", currentRun: { ...state.currentRun, seenClueIds: seen, unlockedExitIds: exits, draftAvailable: state.currentRun.draftAvailable || unlock, phase05Available: state.currentRun.phase05Available || unlock, draftUnlockedBy: unlock && !state.currentRun.draftUnlockedBy.includes(action.clueId) ? [...state.currentRun.draftUnlockedBy, action.clueId] : state.currentRun.draftUnlockedBy } };
      break;
    }
    case "OPEN_DRAFT":
      if (state.currentRun.draftAvailable) next = { ...state, scene: "draft", phase: 5, currentRun: { ...state.currentRun, draftPreviewText: buildDraft(state.currentRun) } };
      break;
    case "PUBLISH_ANSWER":
      if (canPublish(state)) {
        const text = state.currentRun.draftPreviewText ?? buildDraft(state.currentRun);
        next = { ...state, scene: "ending", phase: 6, gameTime: "02:07", timeStopped: true, pollution: state.pollution + 1, currentRun: { ...state.currentRun, riskChoices: { ...state.currentRun.riskChoices, draft: "danger" }, riskConsequences: { ...state.currentRun.riskConsequences, draft: consequenceForRisk.draft.danger }, draftPreviewText: text, publishSnapshotText: text, hasPublishedOwnAnswer: true, ownAnswerRegistered: true, ownAnswerId: `answer-${state.run}`, ownAnswerRunId: state.run, ownAnswerText: text, ownAnswerVisible: true, ownAnswerDeleted: false, ownAnswerBindingActive: true, phase06Available: true, questionAnswerCount: 119 } };
      }
      break;
    case "CHOOSE_ENDING":
      if (canChooseEnding(state) && (!state.currentRun.unlockedExitIds.length || state.currentRun.unlockedExitIds.includes(action.endingId as ExitId))) next = { ...state, currentRun: { ...state.currentRun, pendingEndingId: action.endingId } };
      break;
    case "TRIGGER_EXIT":
      if (canChooseEnding(state) && state.currentRun.unlockedExitIds.includes(action.endingId)) next = { ...state, currentRun: { ...state.currentRun, pendingEndingId: action.endingId } };
      break;
    case "CANCEL_ACTION":
      next = { ...state, currentRun: { ...state.currentRun, pendingEndingId: null } };
      break;
    case "CONFIRM_ENDING": {
      const ending = state.currentRun.pendingEndingId;
      if (ending && ending !== "meltdown" && canChooseEnding(state)) {
        const r = { ...state.currentRun, endingSettled: true, endingId: ending, endingEventId: `${ending}-${state.run}`, endingScreenIndex: 1, pendingEndingId: null };
        if (ending === "exit") { r.bAutoCommentAdded = true; r.bAutoCommentId = `comment-${state.run}`; }
        if (ending === "death_404") r.ownAnswerVisible = false;
        if (ending === "delete") { r.ownAnswerRegistered = false; r.ownAnswerVisible = false; r.ownAnswerDeleted = true; r.ownAnswerBindingActive = false; r.ownAnswerText = null; r.draftPreviewText = null; r.publishSnapshotText = null; r.draftAvailable = false; r.phase05Available = false; r.ownAnswerId = null; r.questionAnswerCount = 118; }
        next = { ...state, scene: "ending", currentRun: r, previousRun: summarizeRun(state, r) };
      }
      break;
    }
    case "ADVANCE_ENDING_SCREEN":
      if (state.currentRun.endingSettled) next = { ...state, currentRun: { ...state.currentRun, endingScreenIndex: Math.min(3, state.currentRun.endingScreenIndex + 1) } };
      break;
    case "REENTER_NEXT_RUN":
      if (state.currentRun.endingSettled && !state.currentRun.meltdown && state.currentRun.endingScreenIndex >= 3) next = resetForNextRun(state);
      break;
    case "RETRY_AFTER_MELTDOWN":
      if (state.currentRun.meltdown && state.currentRun.retryAvailable && state.currentRun.endingScreenIndex >= 3) next = { ...createInitialState(), run: state.run, previousRun: state.previousRun ?? summarizeRun(state), saveRevision: state.saveRevision + 1 };
      break;
    case "CLEAR_PREVIOUS_RUN":
      next = { ...state, previousRun: null };
      break;
    case "CHAT_NPC":
      {
        const intent = action.intent ?? classifyIntent(action.text, action.npc);
        const fallback = fallbackIntentEvent(intent, action.npc);
        const event = validateIntentEvent(state, action.npc, intent, action.event ?? fallback.event);
        const chatted = { ...state, currentRun: { ...state.currentRun, conversationSeenNpcIds: state.currentRun.conversationSeenNpcIds.includes(action.npc) ? state.currentRun.conversationSeenNpcIds : [...state.currentRun.conversationSeenNpcIds, action.npc], conversationHistory: [...state.currentRun.conversationHistory, { role: "user" as const, text: action.text, npc: action.npc }, { role: "assistant" as const, text: action.reply || fallback.text, npc: action.npc }], intentHistory: [...state.currentRun.intentHistory, { npc: action.npc, intent, text: action.text }].slice(-20), lastPlayerInput: action.text } };
        next = applyWorldEvent(chatted, event);
        if (intent === "WARN_AUTHOR") next = { ...next, currentRun: { ...next.currentRun, liveFeedPaused: true, authorPath: "outside" } };
        if (intent === "PUSH_AUTHOR") next = { ...next, pollution: next.pollution + 1, currentRun: { ...next.currentRun, liveFeedPaused: false, authorPath: "inside" } };
        if (intent === "ASK_PHOTO" || intent === "CHECK_DOOR") next = { ...next, currentRun: { ...next.currentRun, photoInspectionOpen: true, liveFeedPaused: true } };
        if (intent === "TELL_RETURN" && !next.currentRun.unlockedExitIds.includes("exit")) next = { ...next, currentRun: { ...next.currentRun, unlockedExitIds: [...next.currentRun.unlockedExitIds, "exit"] } };
        if (intent === "DELETE_HINT" && !next.currentRun.unlockedExitIds.includes("delete")) next = { ...next, currentRun: { ...next.currentRun, unlockedExitIds: [...next.currentRun.unlockedExitIds, "delete"] } };
        if (intent === "ASK_CHEN_DU" && !next.currentRun.seenClueIds.includes("C5")) next = { ...next, currentRun: { ...next.currentRun, seenClueIds: [...next.currentRun.seenClueIds, "C5"], draftAvailable: true } };
      }
      break;
    case "SEARCH":
      next = { ...state, currentRun: { ...state.currentRun, searchHistory: [...state.currentRun.searchHistory, action.query].slice(-20), searchResultIds: resultIds(action.query) } };
      break;
    case "OPEN_SEARCH_RESULT":
      if (!state.currentRun.searchResultIds.includes(action.resultId)) break;
      next = { ...state, currentRun: { ...state.currentRun, searchResultIds: state.currentRun.searchResultIds, openedEditHistory: state.currentRun.openedEditHistory || action.resultId === "search-mingde", seenClueIds: action.resultId === "search-404" || action.resultId === "search-songyan" ? [...new Set([...state.currentRun.seenClueIds, "C2"])] : action.resultId === "search-mingde" ? [...new Set([...state.currentRun.seenClueIds, "C1"])] : action.resultId === "search-chendu" ? [...new Set([...state.currentRun.seenClueIds, "C5"])] : state.currentRun.seenClueIds, unlockedExitIds: ["search-404", "search-songyan"].includes(action.resultId) && !state.currentRun.unlockedExitIds.includes("death_404") ? [...state.currentRun.unlockedExitIds, "death_404"] : state.currentRun.unlockedExitIds, draftAvailable: state.currentRun.draftAvailable || ["search-404", "search-songyan", "search-mingde", "search-chendu"].includes(action.resultId) } };
      break;
    case "OPEN_EDIT_HISTORY":
      next = { ...state, currentRun: { ...state.currentRun, openedEditHistory: true } };
      break;
    case "COMPARE_EDIT_VERSION":
      next = { ...state, currentRun: { ...state.currentRun, comparedEditVersionIds: state.currentRun.comparedEditVersionIds.includes(action.versionId) ? state.currentRun.comparedEditVersionIds : [...state.currentRun.comparedEditVersionIds, action.versionId], seenClueIds: ["v2", "v4"].includes(action.versionId) && !state.currentRun.seenClueIds.includes("C4") ? [...state.currentRun.seenClueIds, "C4"] : state.currentRun.seenClueIds, draftAvailable: ["v2", "v4"].includes(action.versionId) || state.currentRun.draftAvailable, unlockedExitIds: ["v2", "v4"].includes(action.versionId) && !state.currentRun.unlockedExitIds.includes("delete") ? [...state.currentRun.unlockedExitIds, "delete"] : state.currentRun.unlockedExitIds } };
      break;
    case "OPEN_PROFILE":
      next = { ...state, currentRun: { ...state.currentRun, profileViews: state.currentRun.profileViews.includes(action.profileId) ? state.currentRun.profileViews : [...state.currentRun.profileViews, action.profileId] } };
      break;
    case "OPEN_IMAGE":
      next = { ...state, currentRun: { ...state.currentRun, imageInspections: state.currentRun.imageInspections.includes(action.imageId) ? state.currentRun.imageInspections : [...state.currentRun.imageInspections, action.imageId] } };
      break;
    case "INSPECT_IMAGE_REGION":
      next = { ...state, currentRun: { ...state.currentRun, imageInspections: [...new Set([...state.currentRun.imageInspections, `${action.imageId}:${action.regionId}`])] } };
      break;
    case "RELEASE_LIVE_EVENT":
      if (state.currentRun.liveFeedReleasedIds.includes(action.eventId) || state.phase < 3 || !canReleaseLiveEvent(state, action.eventId)) break;
      next = { ...state, currentRun: { ...state.currentRun, liveFeedReleasedIds: [...state.currentRun.liveFeedReleasedIds, action.eventId], worldEvents: [...state.currentRun.worldEvents, { type: "ADD_COMMENT", commentId: action.eventId } as WorldEvent] } };
      break;
    case "OPEN_IMAGE_REGION":
      next = { ...state, currentRun: { ...state.currentRun, photoInspectionOpen: true, imageInspections: [...new Set([...state.currentRun.imageInspections, `${action.imageId}:${action.regionId}`])] } };
      break;
  }
  if (next === state) return state;
  return mark(settleMeltdown(next), action.actionId);
}
