import { question } from "@/src/content/p01";
import type { GameState } from "@/src/game/types";

export function AnswerCard({ state, onRead, onComments, onAuthorChat }: { state: GameState; onRead: () => void; onComments: () => void; onAuthorChat?: () => void }) {
  return <section className={`card answer-card ${state.currentRun.hasReadP01Answer ? "answer-read" : ""}`}><div className="author-row"><div className="avatar">南</div><div><strong>{question.author}</strong><div className="meta">学生 · 校园话题答主 · {question.publishedAt} · 第5次编辑</div></div><button className="link-button" onClick={onAuthorChat}>私信</button></div><div className={`answer ${state.currentRun.hasReadP01Answer ? "expanded" : "excerpt"}`}>{question.answer}</div>{state.currentRun.hasReadP01Answer && <p className="answer-reveal">评论区里有人说，这栋楼从来没有四层。</p>}{!state.currentRun.hasReadP01Answer && <button className="link-button" onClick={onRead}>展开阅读全文</button>}<div className="post-actions"><button className="plain-action">👍 赞同 1.2K</button><button className="plain-action" onClick={onComments}>💬 24 条评论</button><button className="plain-action">收藏</button><button className="plain-action">分享</button></div></section>;
}
