import { comments } from "@/src/content/p01";
import { anomalyComment } from "@/src/content/p02";
import type { GameState } from "@/src/game/types";

export function CommentSection({ state, open, reply }: { state: GameState; open: () => void; reply: () => void }) {
  return <section className="card"><div className="meta">{state.currentRun.foldedCommentCount + 7} 条评论 · {state.currentRun.foldedCommentCount} 条折叠</div><div className="comments">{comments.map((text) => <div className="comment" key={text}>{text}</div>)}{state.currentRun.hasSeenUser404Comment ? <div className="comment anomaly"><strong>{anomalyComment.author}</strong><br />{anomalyComment.text}<div className="actions"><button onClick={reply}>回复</button></div></div> : <button className="secondary" onClick={open}>展开折叠评论（{state.currentRun.foldedCommentCount}）</button>}</div></section>;
}
