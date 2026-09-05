import { clues } from "@/src/content/clues";
import { draftBase } from "@/src/content/p05";
import type { CurrentRun } from "@/src/game/types";

export type PollutionBand = "stable" | "unstable" | "critical" | "meltdown";

export function pollutionBand(pollution: number): PollutionBand {
  if (pollution >= 4) return "meltdown";
  if (pollution >= 3) return "critical";
  if (pollution >= 2) return "unstable";
  return "stable";
}

export function communityGlitch(pollution: number) {
  if (pollution >= 3) return { commentCount: "1", author: "南楼旧床板", time: "02:0█" };
  if (pollution >= 2) return { commentCount: "1", author: "南楼旧床……", time: "02:00" };
  if (pollution >= 1) return { commentCount: "18", author: "南楼旧床板", time: "02:00" };
  return { commentCount: "18", author: "南楼旧床板", time: "02:00" };
}

export function buildDraft(run: CurrentRun) {
  const extra = clues.filter((clue) => run.seenClueIds.includes(clue.id)).map((clue) => `\n【${clue.title}】${clue.text}`).join("");
  return `${draftBase}${extra}`;
}
