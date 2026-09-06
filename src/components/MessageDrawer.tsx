"use client";
import { ChatPanel } from "@/src/components/ChatPanel";
import { messages } from "@/src/content/p03";
import type { ChatMessage, GameState, NpcId, IntentId, WorldEvent } from "@/src/game/types";

export function MessageDrawer({ state, open, close, phase, onOpenThread, onReply, onChat, onAttachment }: { state: GameState; open: boolean; close: () => void; phase: number; onOpenThread: () => void; onReply: () => void; onChat: (npc: NpcId, text: string, reply: string, intent?: IntentId, event?: WorldEvent) => void; onAttachment?: (id: string) => void }) {
  if (!open) return null;
  const history = state.currentRun.conversationHistory;
  return <div className="drawer-backdrop" onClick={close}><aside className="message-drawer" role="dialog" aria-modal="true" aria-label="私信" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><h2>私信</h2><button className="ghost" onClick={close}>关闭</button></div>{state.currentRun.hasRepliedAuthorComment ? <article className="thread"><strong>南楼旧床板</strong><p>{messages.author}</p><button className="link-button" onClick={onReply}>回复答主</button><ChatPanel fixedNpc="author" label="回复答主" phase={phase} run={state.run} context={state.currentRun.seenClueIds} history={history} onMessage={onChat} onAttachment={onAttachment} /></article> : null}{state.currentRun.liveFeedReleasedIds.includes("dorm-warning") ? <article className="thread"><strong>宿管阿姨</strong><p>{messages.dormManager}</p><button className="attachment-card" onClick={() => { onOpenThread(); onAttachment?.("register-404"); }}>📄 2023年明德楼住宿登记表.pdf · 1.2 MB</button><ChatPanel fixedNpc="dormManager" label="回复宿管阿姨" phase={phase} run={state.run} context={state.currentRun.seenClueIds} history={history} onMessage={onChat} onAttachment={onAttachment} /></article> : <p className="meta">暂无新的私信。</p>}</aside></div>;
}
