import { question } from "@/src/content/p01";
import type { GameState } from "@/src/game/types";

export function QuestionHeader({ state }: { state: GameState }) {
  return <section className="post-header"><div className="meta">知乎 · 问题</div><h1 className="title">{question.title}</h1><div className="meta">328 人关注 · 126,731 次浏览 · {state.currentRun.questionAnswerCount} 个回答</div></section>;
}
