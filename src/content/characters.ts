import type { NpcId } from "@/src/game/types";

export const characterFallbacks: Record<NpcId, string> = {
  dormManager: "同学，你是不是还在看那个帖子？别再联系他。那条检修通道三年前就封了。",
  author: "我不记得自己写过404。也许你看到的是旧版本。",
};
