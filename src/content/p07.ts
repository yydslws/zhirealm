import type { PreviousRun } from "@/src/game/types";

export function secondRunText(previous: PreviousRun | null) {
  if (!previous) return null;
  if (previous.endingId === "delete") return "你删掉了那篇回答。但折叠评论里，有人还记得你来过。";
  if (previous.endingId === "exit") return "你上次回到了首页。那篇署名为“你”的回答仍留在帖子里。";
  return "你上次按宿管的话关掉了页面。它记得你没有真正离开。";
}
