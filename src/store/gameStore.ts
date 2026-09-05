import { create } from "zustand";
import { createInitialState, gameReducer } from "@/src/game/reducer";
import type { GameAction, GameState } from "@/src/game/types";
import { loadState, saveState } from "@/src/lib/storage";

type GameStore = GameState & { dispatch: (action: GameAction) => void; hydrate: () => void; reset: () => void };

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),
  dispatch: (action) => {
    const next = gameReducer(get(), action);
    if (next !== get()) { set(next); saveState(next); }
  },
  hydrate: () => { const saved = loadState(); if (saved) set(saved); },
  reset: () => { const fresh = createInitialState(); set(fresh); saveState(fresh); },
}));
