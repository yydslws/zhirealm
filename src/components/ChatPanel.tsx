"use client";

import { useState } from "react";
import type { ChatMessage, NpcId } from "@/src/game/types";

const npcs: Array<[NpcId, string]> = [["user404", "用户不存在"], ["dormManager", "宿管阿姨"], ["author", "南楼旧床板"]];

export function ChatPanel({ phase, run, context, history, onMessage }: { phase: number; run: number; context: string[]; history: ChatMessage[]; onMessage: (npc: NpcId, text: string, reply: string) => void }) {
  const [npc, setNpc] = useState<NpcId>("user404");
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
      setReply(nextReply); onMessage(npc, text, nextReply); setMessage("");
    } catch { setReply("网络断开了。固定内容仍然可以继续。"); }
    finally { setBusy(false); }
  }
  return <section className="card"><h3>自由对话</h3><div className="actions">{npcs.map(([id, label]) => <button key={id} className={npc === id ? "" : "secondary"} onClick={() => setNpc(id)}>{label}</button>)}</div>{reply && <p className="answer">{reply}</p>}<textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="输入一句话……" maxLength={300} /><div className="actions"><button onClick={send} disabled={busy || !message.trim()}>{busy ? "对方正在输入……" : "发送"}</button></div></section>;
}
