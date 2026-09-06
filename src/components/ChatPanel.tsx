"use client";

import { useState } from "react";
import type { ChatMessage, NpcId, IntentId, WorldEvent } from "@/src/game/types";

const npcs: Array<[NpcId, string]> = [["user404", "用户不存在"], ["dormManager", "宿管阿姨"], ["author", "南楼旧床板"]];

export function ChatPanel({ phase, run, context, history, onMessage, fixedNpc, label = "自由对话" }: { phase: number; run: number; context: string[]; history: ChatMessage[]; onMessage: (npc: NpcId, text: string, reply: string, intent?: IntentId, event?: WorldEvent) => void; fixedNpc?: NpcId; label?: string }) {
  const [npc, setNpc] = useState<NpcId>(fixedNpc ?? "user404");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  async function send() {
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true); setReply(null);
    try {
      const response = await fetch("/api/game", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ npc, phase, run, message: text, context, history }) });
      const data = await response.json();
      const nextReply = typeof data.text === "string" ? data.text : "对话暂时不可用。";
      setReply(nextReply); onMessage(npc, text, nextReply, data.intent as IntentId, data.event as WorldEvent); setMessage("");
    } catch { setReply("网络断开了。固定内容仍然可以继续。"); }
    finally { setBusy(false); }
  }
  const thread = history.filter((item) => item.npc === npc);
  return <section className={`chat-panel ${fixedNpc ? "inline-chat" : "card"}`}><h3>{label}</h3>{!fixedNpc && <div className="actions">{npcs.map(([id, npcLabel]) => <button key={id} className={npc === id ? "" : "secondary"} onClick={() => setNpc(id)}>{npcLabel}</button>)}</div>}<div className="chat-history">{thread.map((item, index) => <p className={`chat-message ${item.role}`} key={`${item.role}-${index}`}>{item.role === "user" ? "你：" : `${npc}：`}{item.text}<small>刚刚</small></p>)}{reply && !thread.some((item) => item.role === "assistant" && item.text === reply) && <p className="chat-message assistant">{npc}：{reply}<small>刚刚</small></p>}</div><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="输入一句话……" maxLength={300} /><div className="actions"><button onClick={send} disabled={busy || !message.trim()}>{busy ? "对方正在输入……" : "发送"}</button></div></section>;
}
