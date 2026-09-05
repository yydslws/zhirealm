"use client";
import { ChatPanel } from "@/src/components/ChatPanel";
import { messages } from "@/src/content/p03";
import type { ChatMessage, GameState, NpcId } from "@/src/game/types";

export function MessageDrawer({ state, open, close, phase, onOpen, onReply, onChat }: { state: GameState; open: boolean; close: () => void; phase: number; onOpen: () => void; onReply: () => void; onChat: (npc: NpcId, text: string, reply: string) => void }) {
  if (!open) return null;
  const history = state.currentRun.conversationHistory;
  return <div className="drawer-backdrop" onClick={close}><aside className="message-drawer" role="dialog" aria-modal="true" aria-label="私信" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><h2>私信</h2><button className="ghost" onClick={close}>关闭</button></div><article className="thread"><strong>用户不存在</strong><p>{messages.user404}</p><button className="link-button" onClick={onReply}>回复</button><ChatPanel fixedNpc="user404" label="回复用户不存在" phase={phase} run={state.run} context={state.currentRun.seenClueIds} history={history} onMessage={onChat} /></article><article className="thread"><strong>宿管阿姨</strong><p>{messages.dormManager}</p><button className="link-button" onClick={onOpen}>打开附件</button><ChatPanel fixedNpc="dormManager" label="回复宿管阿姨" phase={phase} run={state.run} context={state.currentRun.seenClueIds} history={history} onMessage={onChat} /></article></aside></div>;
}
