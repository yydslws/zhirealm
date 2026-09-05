import { question } from "@/src/content/p01";
import type { GameState } from "@/src/game/types";

export function QuestionHeader({ state, onRead }: { state: GameState; onRead: () => void }) {
  return <section className="card"><div className="meta">知乎 · 问题</div><h1 className="title">{question.title}</h1><div className="meta">{state.currentRun.questionAnswerCount} 个回答 · 关注问题</div><div className="actions"><button onClick={onRead}>阅读回答</button></div></section>;
}
