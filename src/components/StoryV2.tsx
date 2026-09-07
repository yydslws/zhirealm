"use client";
import { useEffect, useState } from "react";
import { question } from "@/src/content/p01";
import { useGameStore } from "@/src/store/gameStore";

const oldComments = [
  { author: "山楂汽水", text: "我们学校也跳号，这个真不一定有事。", time: "3 天前" },
  { author: "折叠椅", text: "住宿表呢，想看。", time: "3 天前" },
  { author: "南楼旧床板", replyTo: "折叠椅", text: "手机里只传了那张门口的照片，表还在电脑上，回去发。", time: "3 天前" },
  { author: "晚八不点名", text: "蹲。", time: "3 天前" },
];
const steps = ["404", "住宿登记表", "原回答改写", "编辑记录", "宋砚旧便签"];

export function StoryV2() {
  const state = useGameStore();
  const [text, setText] = useState("");
  useEffect(() => { state.hydrate(); }, []);
  const send = (type: string, extra = {}) => state.dispatch({ type, actionId: `v2-${Date.now()}-${Math.random()}`, ...extra } as never);
  const r = state.currentRun;
  const next = steps[r.v2Materials.length];
  return <>
    <header className="topbar"><div className="topbar-inner"><strong className="brand">知境</strong><span className="meta">问题社区</span></div></header>
    <main className="layout"><div>
      <section className="post-header"><div className="meta">知境 · 问题</div><h1 className="title">{question.title}</h1><div className="meta">328 人关注 · 126,731 次浏览 · 118 个回答</div></section>
      <article className="card answer-card"><div className="author-row"><div className="avatar">南</div><div><strong>{question.author}</strong><div className="meta">{question.authorSignature}</div></div></div><div className="answer expanded">{question.answer}</div><p className="answer-reveal">{question.answerTail}</p><div className="meta">编辑于 3 天前</div></article>
      <section className="card comments-card"><h3>评论</h3>{oldComments.map(c => <div className="comment" key={c.author + c.text}><div className="comment-avatar">{c.author[0]}</div><div><strong>{c.author}{c.replyTo ? ` 回复 ${c.replyTo}` : ""}</strong><div>{c.text}</div><small>{c.time}</small></div></div>)}{r.v2PlayerComment && <><div className="comment"><div className="comment-avatar">你</div><div><strong>你</strong><div>{r.v2PlayerComment}</div><small>刚刚</small></div></div><div className="comment anomaly"><div className="comment-avatar">南</div><div><strong>{question.author} 回复 你</strong><div>终于有人回了。<br />你那边现在几点？</div><small>3 天前</small></div></div></>}{!r.v2AuthorReply && <form onSubmit={e => { e.preventDefault(); if (text.trim()) send("V2_REPLY", { text }); setText(""); }}><textarea aria-label="写下你的评论" value={text} onChange={e => setText(e.target.value)} placeholder="写下你的评论……" /><button type="submit">回复</button></form>}</section>
      {r.v2Phase === 2 && <section className="card"><h3>你那边现在几点？</h3><p>这条回复的时间早于你的评论。确认现实日期。</p><button onClick={() => send("V2_CONFIRM_DATE")}>2026 年 9 月 7 日</button></section>}
      {r.v2Phase >= 3 && !r.v2Ending && <section className="card"><h3>来自 3 天前</h3><p>南楼旧床板：我进了水房后的通道。门牌锁上写着四零四。</p>{next ? <><p className="meta">剧情材料</p><button onClick={() => send("V2_VIEW_MATERIAL", { material: next })}>继续：{next}</button></> : <><p>门外传来宿管的声音：“别把陈渡留在里面。”</p><div className="actions"><button onClick={() => send("V2_CHOOSE_ENDING", { ending: "END_A" })}>留下四个人名字</button><button onClick={() => send("V2_CHOOSE_ENDING", { ending: "END_B" })}>让陈渡先走</button></div></>}</section>}
      {r.v2Ending && <section className="card"><h2>{r.v2Ending === "END_A" ? "END_A · 四个人" : "END_B · 回来一个"}</h2><p>{r.v2Ending === "END_A" ? "你把周嘉树、梁可、宋砚、陈渡四个人的名字留在登记表上。门后的声音安静下来。" : "你让陈渡先走。天亮后，通道里只回来一个人。"}</p></section>}
    </div><aside className="side"><section className="card"><h3>已看材料</h3>{r.v2Materials.length ? r.v2Materials.map(m => <div className="related-item" key={m}><strong>{m}</strong></div>) : <div className="meta">暂无</div>}</section></aside></main>
  </>;
}
