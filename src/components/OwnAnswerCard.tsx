"use client";

import type { GameState } from "@/src/game/types";
import { useState } from "react";

export function OwnAnswerCard({ state, onDelete }: { state: GameState; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  if (!state.currentRun.ownAnswerRegistered || !state.currentRun.ownAnswerVisible) return null;
  return <section className="card own-answer"><div className="section-head"><h3>你的回答</h3><button className="ghost" aria-label="回答菜单" onClick={() => setMenuOpen((open) => !open)}>···</button></div>{menuOpen && <div className="answer-menu"><button className="link-button" onClick={onDelete}>删除回答</button></div>}<p className="answer">{state.currentRun.ownAnswerText ?? "该回答已删除。"}</p>{state.currentRun.bAutoCommentAdded && <div className="comment anomaly">南楼旧床板：你只是回到了首页。你的回答还在。</div>}</section>;
}
