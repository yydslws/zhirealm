import type { GameState } from "@/src/game/types";
import { migrateState } from "@/src/lib/saveMigration";

export const SAVE_KEY = "zhirealm-save-v1";

export function saveState(state: GameState) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* private mode/quota: gameplay continues */ }
}

export function loadState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    return raw ? migrateState(JSON.parse(raw)) : null;
  } catch { return null; }
}

export function clearState() {
  if (typeof window !== "undefined") window.localStorage.removeItem(SAVE_KEY);
}
