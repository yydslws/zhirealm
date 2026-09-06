import type { IntentId, NpcId, WorldEvent } from "@/src/game/types";

export const fallbackIntentEvent = (intent: IntentId, npc: NpcId): { text: string; tone: string; intent: IntentId; event: WorldEvent } => {
  const base = { tone: "fixed", intent, event: { type: "NONE" } as WorldEvent };
  if (intent === "ASK_SONG_YAN" && npc === "author") return { ...base, text: "……你在哪看到宋砚这个名字的？", event: { type: "REVEAL_CLUE", clueId: "C2" } };
  if (intent === "ASK_PHOTO" || intent === "CHECK_DOOR") return { ...base, text: "我把门口拍清楚一点。", event: { type: "SHOW_ATTACHMENT", attachmentId: "photo-404" } };
  if (intent === "ASK_REGISTER") return { ...base, text: "登记表还在旧电脑里。", event: { type: "SHOW_ATTACHMENT", attachmentId: "register-404" } };
  if (intent === "ASK_MAP") return { ...base, text: "消防图上确实多了一条通道。", event: { type: "REVEAL_CLUE", clueId: "C1" } };
  if (intent === "WARN_AUTHOR") return { ...base, text: "好，我先不进去。", event: { type: "CHANGE_NPC_ATTITUDE", npc: "author", delta: 1 } };
  if (intent === "PUSH_AUTHOR") return { ...base, text: "那我继续往里走。", event: { type: "ADD_COMMENT", commentId: "live-author-arrived" } };
  if (intent === "DELETE_HINT") return { ...base, text: "如果你想删掉，现在还来得及。", event: { type: "CHANGE_NPC_ATTITUDE", npc, delta: -1 } };
  return { ...base, text: npc === "dormManager" ? "别问这些，按我说的做。" : npc === "user404" ? "我只记得那张照片。" : "我还在通道口。" };
};
