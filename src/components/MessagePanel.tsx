import { messages } from "@/src/content/p03";
import type { GameState } from "@/src/game/types";

export function MessagePanel({ state, openDorm, reply }: { state: GameState; openDorm: () => void; reply: () => void }) {
  return <section className="card"><h3>私信</h3><div className="stack"><div className="rule"><strong>用户不存在</strong><p>{messages.user404}</p><button className="secondary" onClick={reply}>回复他</button></div><div className="rule"><strong>宿管阿姨</strong><p>{messages.dormManager}</p><button className="secondary" onClick={openDorm}>查看私信与规则</button></div></div>{state.currentRun.conversationHistory.length > 0 && <div className="meta">对话已记录 {state.currentRun.conversationHistory.length} 条</div>}</section>;
}
