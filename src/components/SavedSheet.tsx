import { clues } from "@/src/content/clues";
import { rules } from "@/src/content/rules";
import type { GameState } from "@/src/game/types";

export function SavedSheet({ state, open, close, viewRule, viewClue, chooseDanger }: { state: GameState; open: boolean; close: () => void; viewRule: (id: string) => void; viewClue: (id: string) => void; chooseDanger: (node: "rules" | "evidence") => void }) {
  if (!open) return null;
  const savedRules = rules.filter((rule) => state.currentRun.seenRuleIds.includes(rule.id));
  const savedClues = clues.filter((clue) => state.currentRun.seenClueIds.includes(clue.id));
  return <div className="sheet-backdrop" onClick={close}><section className="sheet" role="dialog" aria-modal="true" aria-label="已保存" onClick={(event) => event.stopPropagation()}><div className="sheet-head"><h2>已保存</h2><button className="ghost" onClick={close} aria-label="关闭已保存">关闭</button></div>{savedRules.map((rule) => <article className="saved-item" key={rule.id}><strong>{rule.text}</strong><small>来源已查看</small><button className="link-button" onClick={() => viewRule(rule.id)}>查看来源</button></article>)}{savedClues.map((clue) => <article className="saved-item" key={clue.id}><strong>{clue.id} · {clue.title}</strong><p>{clue.text}</p><button className="link-button" onClick={() => viewClue(clue.id)}>打开记录</button></article>)}{state.phase >= 3 && !savedRules.length && <button className="mystery-link" onClick={() => viewRule("R1")}>查看一条夜间提醒</button>}{state.phase >= 4 && <button className="mystery-link" onClick={() => chooseDanger("evidence")}>查看一条来源不明的记录</button>}{!savedRules.length && !savedClues.length && <p className="meta">还没有保存内容。</p>}</section></div>;
}
