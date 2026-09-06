import { searchResultPages } from "@/src/content/investigation";
import type { GameState } from "@/src/game/types";

export function SearchResultPage({ state, back, read }: { state: GameState; back: () => void; read: () => void }) {
  const id = state.currentRun.searchResultPageId;
  const page = id ? searchResultPages[id] : null;
  if (!id || !page) return null;
  const isRead = state.currentRun.readSearchResultIds.includes(id);
  return <section className="card search-result-page"><button className="link-button" onClick={back}>← 返回搜索结果</button><h1 className="title">{page.title}</h1><p className="meta">{page.status}</p><hr /><p className="answer search-cache">{page.body}</p>{!isRead ? <button onClick={read}>查看缓存摘要</button> : <p className="meta">你已读完这条缓存记录。</p>}</section>;
}
