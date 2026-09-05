import { rules } from "@/src/content/rules";
import type { GameState } from "@/src/game/types";

export function RulePanel({ state, view }: { state: GameState; view: (id: string) => void }) {
  return <section className="card"><h3>已收集的提醒</h3>{rules.map((rule) => <div className="rule" key={rule.id}><strong>{rule.id}</strong> {rule.text}<small>{state.currentRun.seenRuleIds.includes(rule.id) ? "已查看来源" : "来源待查看"}</small><button className="ghost" onClick={() => view(rule.id)}>查看</button></div>)}</section>;
}
