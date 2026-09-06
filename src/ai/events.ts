import type { IntentId, NpcId, WorldEvent } from "@/src/game/types";

export function canonicalEventForIntent(intent: IntentId, npc: NpcId): WorldEvent {
  if (intent === "ASK_SONG_YAN" && npc === "author") return { type: "REVEAL_CLUE", clueId: "C2" };
  if (intent === "ASK_PHOTO" || intent === "CHECK_DOOR") return { type: "SHOW_ATTACHMENT", attachmentId: "photo-404" };
  if (intent === "ASK_REGISTER") return { type: "SHOW_ATTACHMENT", attachmentId: "register-404" };
  if (intent === "ASK_MAP") return { type: "REVEAL_CLUE", clueId: "C1" };
  if (intent === "WARN_AUTHOR") return { type: "CHANGE_NPC_ATTITUDE", npc: "author", delta: 1 };
  if (intent === "PUSH_AUTHOR") return { type: "ADD_COMMENT", commentId: "live-author-arrived" };
  if (intent === "DELETE_HINT") return { type: "CHANGE_NPC_ATTITUDE", npc, delta: -1 };
  return { type: "NONE" };
}

export const fallbackIntentEvent = (intent: IntentId, npc: NpcId): { text: string; tone: string; intent: IntentId; event: WorldEvent } => {
  const text = intent === "ASK_SONG_YAN" && npc === "author" ? "……你在哪看到宋砚这个名字的？" : intent === "ASK_PHOTO" || intent === "CHECK_DOOR" ? "我把门口拍清楚一点。" : intent === "ASK_REGISTER" ? "登记表还在旧电脑里。" : intent === "ASK_MAP" ? "消防图上确实多了一条通道。" : intent === "WARN_AUTHOR" ? "好，我先不进去。" : intent === "PUSH_AUTHOR" ? "那我继续往里走。" : intent === "DELETE_HINT" ? "如果你想删掉，现在还来得及。" : npc === "dormManager" ? "别问这些，按我说的做。" : "我还在通道口。";
  return { text, tone: "fixed", intent, event: canonicalEventForIntent(intent, npc) };
};
