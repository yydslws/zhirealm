import { rules } from "@/src/content/rules";
import type { GameState } from "@/src/game/types";

export function RulePanel({ state, view }: { state: GameState; view: (id: string) => void }) {
  const found = rules.filter((rule) => state.currentRun.seenRuleIds.includes(rule.id));
  if (!found.length) return null;
  return <section className="card"><h3>已保存的提醒</h3>{found.map((rule) => <div className="rule" key={rule.id}><strong>{rule.text}</strong><small>来源已查看</small><button className="ghost" onClick={() => view(rule.id)}>查看</button></div>)}</section>;
}
