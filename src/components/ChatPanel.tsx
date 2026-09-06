"use client";

import { useState } from "react";
import type { ChatMessage, NpcId, IntentId, WorldEvent } from "@/src/game/types";
import { classifyIntent } from "@/src/ai/intents";
import { fallbackIntentEvent } from "@/src/ai/events";

const npcs: Array<[NpcId, string]> = [["author", "南楼旧床板"], ["dormManager", "宿管阿姨"]];
const npcLabels: Record<NpcId, string> = { author: "南楼旧床板", dormManager: "宿管阿姨" };
const attachmentMeta: Record<string, { label: string; icon: string }> = {
  "photo-404": { label: "IMG_404_0207.jpg", icon: "🖼" },
  "register-404": { label: "2023年明德楼住宿登记表.pdf", icon: "📄" },
};

export function ChatPanel({ phase, run, context, history, onMessage, fixedNpc, label = "自由对话", onAttachment }: { phase: number; run: number; context: string[]; history: ChatMessage[]; onMessage: (npc: NpcId, text: string, reply: string, intent?: IntentId, event?: WorldEvent) => void; fixedNpc?: NpcId; label?: string; onAttachment?: (id: string) => void }) {
  const [npc, setNpc] = useState<NpcId>(fixedNpc ?? "author");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  async function send() {
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true); setReply(null);
    try {
      const npcHistory = history.filter((item) => item.npc === npc);
      const response = await fetch("/api/game", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ npc, phase, run, message: text, context, history: npcHistory }) });
      if (!response.ok) throw new Error(`AI ${response.status}`);
      const data = await response.json();
      const nextReply = typeof data.text === "string" ? data.text : "对话暂时不可用。";
      setReply(nextReply); onMessage(npc, text, nextReply, data.intent as IntentId, data.event as WorldEvent); setMessage("");
    } catch {
      const intent = classifyIntent(text, npc);
      const fallback = fallbackIntentEvent(intent, npc);
      setReply(fallback.text);
      onMessage(npc, text, fallback.text, intent, fallback.event);
      setMessage("");
    }
    finally { setBusy(false); }
  }
  const thread = history.filter((item) => item.npc === npc);
  return <section className={`chat-panel ${fixedNpc ? "inline-chat" : "card"}`}><h3>{label}</h3>{!fixedNpc && <div className="actions">{npcs.map(([id, npcLabel]) => <button key={id} className={npc === id ? "" : "secondary"} onClick={() => setNpc(id)}>{npcLabel}</button>)}</div>}<div className="chat-history">{thread.map((item, index) => <div className={`chat-message ${item.role}`} key={`${item.role}-${index}`}><span>{item.role === "user" ? "你：" : `${npcLabels[npc]}：`}{item.text}<small>刚刚</small></span>{item.attachmentId && <button className="attachment-card" onClick={() => onAttachment?.(item.attachmentId!)}>{attachmentMeta[item.attachmentId]?.icon ?? "📎"} {attachmentMeta[item.attachmentId]?.label ?? "查看附件"}</button>}</div>)}{reply && !thread.some((item) => item.role === "assistant" && item.text === reply) && <p className="chat-message assistant">{npcLabels[npc]}：{reply}<small>刚刚</small></p>}</div><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="输入一句话……" maxLength={300} /><div className="actions"><button onClick={send} disabled={busy || !message.trim()}>{busy ? "对方正在输入……" : "发送"}</button></div></section>;
}
