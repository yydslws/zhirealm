import { clues } from "@/src/content/clues";
import { draftBase } from "@/src/content/p05";
import type { CurrentRun } from "@/src/game/types";

export type PollutionBand = "stable" | "unstable" | "meltdown";

export function pollutionBand(pollution: number): PollutionBand {
  if (pollution >= 4) return "meltdown";
  if (pollution >= 2) return "unstable";
  return "stable";
}

export function buildDraft(run: CurrentRun) {
  const extra = clues.filter((clue) => run.seenClueIds.includes(clue.id)).map((clue) => `\n【${clue.title}】${clue.text}`).join("");
  return `${draftBase}${extra}`;
}
