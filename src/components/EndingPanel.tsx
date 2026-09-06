import { endings } from "@/src/content/endings";
import { endingPrompt } from "@/src/content/p06";
import type { EndingId, GameState } from "@/src/game/types";

export function EndingPanel({ state, choose, triggerExit, confirm, cancel, advance, reenter, retry }: { state: GameState; choose: (id: EndingId) => void; triggerExit: (id: Exclude<EndingId, "meltdown">) => void; confirm: () => void; cancel: () => void; advance: () => void; reenter: () => void; retry: () => void }) {
  const r = state.currentRun;
  if (!r.hasPublishedOwnAnswer && !r.meltdown) return null;
  return <section className={`card ${r.meltdown ? "meltdown-card" : ""}`}><h3>{r.meltdown ? "失控" : "出口"}</h3>{r.endingSettled ? <><div className="glitch">{endings[r.endingId!].title}</div><p>{endings[r.endingId!].text}</p>{r.meltdown && <p className="meltdown-reason">你记得最后看见的是：{r.meltdownReason}</p>}<p className="meta">结局屏幕 {r.endingScreenIndex}/3</p>{r.endingScreenIndex < 3 ? <button onClick={advance}>继续</button> : r.meltdown ? <button onClick={retry}>重试本轮</button> : <button onClick={reenter}>重新进入</button>}</> : <><p>{endingPrompt}</p>{r.unlockedExitIds.length ? <div className="actions">{r.unlockedExitIds.map((id) => <button key={id} onClick={() => triggerExit(id)}>{id === "death_404" ? "关闭此页" : id === "exit" ? "回到首页" : "删除回答"}</button>)}</div> : <p className="meta">你还没有找到可信的出口。</p>}{r.pendingEndingId && <div className="dialog"><div className="dialog-card"><h3>确认这个动作？</h3><p>一旦确认，当前回答和页面状态将被固定。</p><div className="actions"><button onClick={confirm}>确认</button><button className="secondary" onClick={cancel}>取消</button></div></div></div>}</>}</section>;
}
