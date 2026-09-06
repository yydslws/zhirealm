import { endings } from "@/src/content/endings";
import type { EndingId, GameState } from "@/src/game/types";

export function EndingPanel({ state, confirm, cancel, reenter, retry, returnHome }: { state: GameState; confirm: () => void; cancel: () => void; reenter: () => void; retry: () => void; returnHome: () => void }) {
  const r = state.currentRun;
  if ((!r.endingSettled && !r.pendingEndingId) || (r.endingSettled && r.endingViewDismissed)) return null;
  if (r.endingSettled) return <div className={r.meltdown ? "ending-stage meltdown-card" : "ending-stage"}><div className="glitch">{endings[r.endingId!].title}</div><p>{endings[r.endingId!].text}</p>{r.meltdown && <p className="meltdown-reason">你记得最后看见的是：{r.meltdownReason}</p>}<div className="actions">{r.meltdown ? <button onClick={retry}>重试本轮</button> : <><button onClick={returnHome}>返回问题</button><button onClick={reenter}>重新进入下一轮</button></>}</div></div>;
  const prompt = r.pendingEndingId === "delete" ? "确认删除这条回答？删除后无法恢复。" : "确定离开当前页面？";
  return <div className="dialog"><div className="dialog-card"><h3>{prompt}</h3><div className="actions"><button onClick={confirm}>{r.pendingEndingId === "delete" ? "删除" : "离开"}</button><button className="secondary" onClick={cancel}>取消</button></div></div></div>;
}
