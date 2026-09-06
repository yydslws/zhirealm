import { searchResults } from "@/src/content/investigation";
import type { GameState } from "@/src/game/types";

export function SearchDrawer({ state, close, openResult }: { state: GameState; close: () => void; openResult: (id: string) => void }) {
  return <div className="sheet-backdrop" onClick={close}><section className="sheet" role="dialog" aria-label="搜索结果" onClick={(e) => e.stopPropagation()}><div className="sheet-head"><h2>搜索结果</h2><button className="ghost" onClick={close}>关闭</button></div>{state.currentRun.searchResultIds.length ? state.currentRun.searchResultIds.map((id) => <button className="saved-entry" key={id} onClick={() => openResult(id)}><strong>{searchResults[id]?.title}</strong><span className="meta">{searchResults[id]?.summary}</span></button>) : <p className="meta">没有找到相关内容。</p>}</section></div>;
}
