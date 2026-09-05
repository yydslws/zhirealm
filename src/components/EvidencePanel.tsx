import { clues } from "@/src/content/clues";
import type { GameState } from "@/src/game/types";

export function EvidencePanel({ state, view }: { state: GameState; view: (id: string) => void }) {
  return <section className="card"><h3>调查与证据</h3>{clues.map((clue) => <div className="clue" key={clue.id}><strong>{clue.id} · {clue.title}</strong><small>{state.currentRun.seenClueIds.includes(clue.id) ? clue.text : "点击查看证据"}</small><button className="secondary" onClick={() => view(clue.id)}>查看</button></div>)}</section>;
}
