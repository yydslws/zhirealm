import { question } from "@/src/content/p01";
import type { GameState } from "@/src/game/types";

export function AnswerCard({ state, onRead }: { state: GameState; onRead: () => void }) {
  return <section className="card"><div className="meta">{question.author} · {question.publishedAt} · 第5次编辑</div><div className="answer">{question.answer}</div><div className="meta">高赞回答 · 24 条评论</div><div className="actions"><button className="secondary" onClick={onRead}>阅读评论</button></div></section>;
}
