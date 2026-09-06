import { comments } from "@/src/content/p01";
import { anomalyComment } from "@/src/content/p02";
import type { GameState } from "@/src/game/types";
import { liveEvents } from "@/src/content/investigation";
import { ChatPanel } from "@/src/components/ChatPanel";
import type { IntentId, NpcId, WorldEvent } from "@/src/game/types";

export function CommentSection({ state, open, reply, onChat }: { state: GameState; open: () => void; reply: () => void; onChat: (npc: NpcId, text: string, response: string, intent?: IntentId, event?: WorldEvent) => void }) {
  const r = state.currentRun;
  return <section className="card comments-card"><div className="comments-head"><strong>{r.foldedCommentCount + 7 + r.liveFeedReleasedIds.filter((id) => id !== "dorm-warning").length} 条评论</strong><span className="meta">按时间排序</span></div><div className="comments">{comments.map((text, index) => <div className="comment" key={text}><div className="comment-avatar">{["林", "周", "陈", "—", "叶", "唐"][index]}</div><div><strong>{["匿名用户", "南门吹风", "不想早八", "路过的人", "白天再看", "楼道观察员"][index]}</strong><div>{text}</div><small>2 小时前 · IP 属地北京 · 👍 {32 - index * 3}　回复</small></div></div>)}{r.hasSeenUser404Comment ? <div className="comment anomaly"><div className="comment-avatar empty"> </div><div><strong>{anomalyComment.author}</strong><div>{anomalyComment.text}</div><small>02:07 · 回复</small><div className="actions"><button className="link-button" onClick={reply}>回复</button></div>{r.inlineReplyOpen && <ChatPanel fixedNpc="user404" label="在评论区回复" phase={state.phase} run={state.run} context={r.seenClueIds} history={r.conversationHistory} onMessage={onChat} />}</div></div> : <button className="folded-link" onClick={open} disabled={!r.foldedCountShifted}>展开 {r.foldedCommentCount} 条折叠评论</button>}{liveEvents.filter((event) => r.liveFeedReleasedIds.includes(event.id)).map((event) => <div className="comment" key={event.id}><div className="comment-avatar">南</div><div><strong>南楼旧床板</strong><div>{event.text}</div><small>刚刚 · 回复</small></div></div>)}</div></section>;
}
