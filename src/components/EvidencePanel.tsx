import { clues } from "@/src/content/clues";
import type { GameState } from "@/src/game/types";

export function EvidencePanel({ state, view }: { state: GameState; view: (id: string) => void }) {
  return <section className="card"><h3>调查资料</h3>{clues.map((clue) => { const seen = state.currentRun.seenClueIds.includes(clue.id); return <div className="clue" key={clue.id}><strong>{clue.id} · {seen ? clue.title : "来源不明的记录"}</strong><small>{seen ? clue.text : "打开后查看内容"}</small><button className="secondary" onClick={() => view(clue.id)}>打开记录</button></div>; })}</section>;
}
