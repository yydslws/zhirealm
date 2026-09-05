import { characterFallbacks } from "@/src/content/characters";
import type { NpcId } from "@/src/game/types";

export function fallbackForNpc(npc: NpcId) { return characterFallbacks[npc]; }
