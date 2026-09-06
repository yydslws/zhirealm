import { messages } from "@/src/content/p03";
import type { GameState } from "@/src/game/types";

export function MessagePanel({ state, openDorm, reply }: { state: GameState; openDorm: () => void; reply: () => void }) {
  return <section className="card"><h3>私信</h3><div className="stack">{state.currentRun.hasRepliedAuthorComment && <div className="rule"><strong>南楼旧床板</strong><p>{messages.author}</p><button className="secondary" onClick={reply}>回复答主</button></div>}{state.currentRun.liveFeedReleasedIds.includes("dorm-warning") && <div className="rule"><strong>宿管阿姨</strong><p>{messages.dormManager}</p><button className="secondary" onClick={openDorm}>查看私信与附件</button></div>}{!state.currentRun.hasRepliedAuthorComment && !state.currentRun.liveFeedReleasedIds.includes("dorm-warning") && <p className="meta">暂无私信</p>}</div>{state.currentRun.conversationHistory.length > 0 && <div className="meta">对话已记录 {state.currentRun.conversationHistory.length} 条</div>}</section>;
}
