import { comments } from "@/src/content/p01";
import { anomalyComment } from "@/src/content/p02";
import type { GameState } from "@/src/game/types";

export function CommentSection({ state, open, reply }: { state: GameState; open: () => void; reply: () => void }) {
  return <section className="card comments-card"><div className="comments-head"><strong>{state.currentRun.foldedCommentCount + 7} 条评论</strong><span className="meta">按时间排序</span></div><div className="comments">{comments.map((text, index) => <div className="comment" key={text}><div className="comment-avatar">{["林", "周", "陈", "—", "叶", "唐"][index]}</div><div><strong>{["匿名用户", "南门吹风", "不想早八", "路过的人", "白天再看", "楼道观察员"][index]}</strong><div>{text}</div><small>2 小时前 · IP 属地北京 · 👍 {32 - index * 3}　回复</small></div></div>)}{state.currentRun.hasSeenUser404Comment ? <div className="comment anomaly"><div className="comment-avatar empty"> </div><div><strong>{anomalyComment.author}</strong><div>{anomalyComment.text}</div><small>02:07 · 回复</small><div className="actions"><button className="link-button" onClick={reply}>回复</button></div></div></div> : <button className="folded-link" onClick={open}>展开 18 条折叠评论</button>}</div></section>;
}
