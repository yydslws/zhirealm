import type { PreviousRun } from "@/src/game/types";

export function secondRunText(previous: PreviousRun | null) {
  if (!previous) return null;
  if (previous.endingId === "delete") return "你删掉了那篇回答。但那场三天前的直播里，仍有人记得你来过。";
  if (previous.endingId === "exit") return "你上次回到了首页。那篇关于404的回答仍留在帖子里。";
  return "你上次关掉了页面。直播停在三天前，像是在等你回来。";
}
