import type { GameState, IntentId, NpcId, WorldEvent } from "@/src/game/types";

const clueEvents: Partial<Record<IntentId, WorldEvent>> = {
  ASK_PHOTO: { type: "REVEAL_CLUE", clueId: "C3" },
  CHECK_DOOR: { type: "REVEAL_CLUE", clueId: "C3" },
  ASK_REGISTER: { type: "REVEAL_CLUE", clueId: "C2" },
  ASK_MAP: { type: "REVEAL_CLUE", clueId: "C1" },
};

export function validateIntentEvent(state: GameState, npc: NpcId, intent: IntentId, event: WorldEvent = { type: "NONE" }): WorldEvent {
  if (event.type === "REVEAL_CLUE" && clueEvents[intent]?.type === "REVEAL_CLUE" && clueEvents[intent].clueId === event.clueId) return event;
  if (event.type === "REVEAL_CLUE" && intent === "ASK_SONG_YAN" && npc === "author" && event.clueId === "C2") return event;
  if (event.type === "SHOW_ATTACHMENT" && ["photo-404", "register-404"].includes(event.attachmentId) && ["ASK_PHOTO", "CHECK_DOOR", "ASK_REGISTER"].includes(intent)) return event;
  if (event.type === "CHANGE_NPC_ATTITUDE" && event.npc === npc && Math.abs(event.delta) === 1) return event;
  if (event.type === "ADD_COMMENT" && intent === "PUSH_AUTHOR" && !state.currentRun.worldEvents.some((item) => item.type === "ADD_COMMENT" && item.commentId === event.commentId)) return event;
  if (event.type === "DELETE_COMMENT" && event.commentId.startsWith("live-")) return event;
  if (event.type === "EDIT_ANSWER" && /^v[1-5]$/.test(event.versionId)) return event;
  if (event.type === "SEND_DM" && event.messageId.length <= 80) return event;
  if (event.type === "CHANGE_USERNAME" && ["南楼旧床板", "宿管阿姨"].includes(event.variant)) return event;
  return { type: "NONE" };
}

export function applyWorldEvent(state: GameState, event: WorldEvent): GameState {
  if (event.type === "NONE") return state;
  const events = [...state.currentRun.worldEvents, event];
  if (event.type === "REVEAL_CLUE") {
    const seen = state.currentRun.seenClueIds.includes(event.clueId) ? state.currentRun.seenClueIds : [...state.currentRun.seenClueIds, event.clueId];
    return { ...state, phase: Math.max(state.phase, 4), currentRun: { ...state.currentRun, seenClueIds: seen, worldEvents: events, phase05Available: true } };
  }
  if (event.type === "CHANGE_NPC_ATTITUDE") return { ...state, currentRun: { ...state.currentRun, worldEvents: events, npcAttitude: { ...state.currentRun.npcAttitude, [event.npc]: (state.currentRun.npcAttitude[event.npc] ?? 0) + event.delta } } };
  if (event.type === "SHOW_ATTACHMENT") {
    return { ...state, phase: Math.max(state.phase, 4), currentRun: { ...state.currentRun, worldEvents: events, receivedAttachmentIds: state.currentRun.receivedAttachmentIds.includes(event.attachmentId) ? state.currentRun.receivedAttachmentIds : [...state.currentRun.receivedAttachmentIds, event.attachmentId], phase05Available: true } };
  }
  return { ...state, currentRun: { ...state.currentRun, worldEvents: events } };
}
