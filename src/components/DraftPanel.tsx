import type { GameState } from "@/src/game/types";

export function DraftPanel({ state, open, publish }: { state: GameState; open: () => void; publish: () => void }) {
  return <section className="card"><h3>我的草稿</h3>{state.currentRun.draftPreviewText ? <><p className="answer">{state.currentRun.draftPreviewText}</p><button onClick={publish}>确认发布</button></> : <button onClick={open} disabled={!state.currentRun.draftAvailable}>打开草稿</button>}</section>;
}
