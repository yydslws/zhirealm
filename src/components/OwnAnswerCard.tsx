import type { GameState } from "@/src/game/types";

export function OwnAnswerCard({ state }: { state: GameState }) {
  if (!state.currentRun.ownAnswerRegistered || !state.currentRun.ownAnswerVisible) return null;
  return <section className="card"><h3>你的回答</h3><p className="answer">{state.currentRun.ownAnswerText ?? "该回答已删除。"}</p>{state.currentRun.bAutoCommentAdded && <div className="comment anomaly">南楼旧床板：你只是回到了首页。你的回答还在。</div>}</section>;
}
