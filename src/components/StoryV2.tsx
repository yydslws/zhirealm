"use client";

import { useEffect, useReducer, useState } from "react";
import { question } from "@/src/content/p01";
import { formatDate, initial, reduce } from "@/src/story-v2/reducer";
import { load, save } from "@/src/story-v2/storage";
import type { MaterialId } from "@/src/story-v2/types";

const comments = [
  { author: "山楂汽水", text: "我们学校也跳号，这个真不一定有事。" },
  { author: "折叠椅", text: "住宿表呢，想看。" },
  { author: "南楼旧床板", replyTo: "折叠椅", text: "手机里只传了那张门口的照片，表还在电脑上，回去发。" },
  { author: "晚八不点名", text: "蹲。" },
];

const materialTitles: Record<MaterialId, string> = { register: "住宿登记表", editHistory: "编辑记录", songYanNote: "宋砚旧便签" };

function pastDate(baseDate: string) { const date = new Date(`${baseDate}T00:00:00`); date.setDate(date.getDate() - 3); return `${date.getMonth() + 1}月${date.getDate()}日`; }
function liveClock() { return new Date().toTimeString().slice(0, 5); }

export function StoryV2() {
  const [state, dispatch] = useReducer(reduce, undefined, initial);
  const [ready, setReady] = useState(false);
  const [comment, setComment] = useState("");
  const [commentNotice, setCommentNotice] = useState("");
  const [input, setInput] = useState("");
  const [clock, setClock] = useState(liveClock);
  const [material, setMaterial] = useState<MaterialId | null>(null);

  useEffect(() => { const saved = load(); if (saved) dispatch({ type: "HYDRATE", state: saved }); setReady(true); }, []);
  useEffect(() => { if (ready) save(state); }, [ready, state]);
  useEffect(() => { const timer = window.setInterval(() => setClock(liveClock()), 60000); return () => window.clearInterval(timer); }, []);

  const send = (action: Parameters<typeof dispatch>[0]) => dispatch(action);
  const todayLabel = formatDate(state.baseDate);
  const pastLabel = pastDate(state.baseDate);
  const original = question.answer;
  const mutated = original.replace("那里曾经住过四个人", "那里曾经住过三个人").replace("404那一栏填了四个名字，最后一个是我", "403那一栏填了三个名字。我当时看错了");
  const denied = mutated.replace("明德楼四楼没有404。", "明德楼从来没有404。");
  const answer = state.answerVersion === "original" || state.answerVersion === "endingA" ? original : state.answerVersion === "mutated" ? mutated : denied;

  const submitComment = (event: React.FormEvent) => { event.preventDefault(); if (!comment.trim()) { setCommentNotice("先写点什么吧。"); return; } if (!state.comment) { send({ type: "COMMENT", value: comment }); setComment(""); setCommentNotice(""); } };
  const submit = (type: "CLOCK" | "DOOR" | "NAME" | "FINAL_DATE") => { send({ type, value: input } as never); setInput(""); };

  return <>
    <header className="topbar"><div className="topbar-inner"><strong className="brand">知境</strong><span className="meta">问题社区</span></div></header>
    <main className="layout"><div>{commentNotice && <p className="error">{commentNotice}</p>}
      <section className="post-header"><div className="meta">知境 · 问题</div><h1 className="title">{question.title}</h1><div className="meta">328 人关注 · 126,731 次浏览 · 118 个回答</div></section>
      <article className="card answer-card"><div className="author-row"><div className="avatar">南</div><div><strong>{question.author}</strong><div className="meta">{question.authorSignature}</div></div></div><div className="answer">{answer}</div>{state.answerVersion !== "endingB" && <p className="answer-reveal">{question.answerTail}</p>}{state.answerVersion === "endingA" && <p className="answer-reveal">后续<br /><br />回来了。<br />比说好的晚了三天。<br />名单贴在下面了。<br />这次不删。</p>}{state.answerVersion === "endingB" && <p className="answer-reveal">补充<br /><br />回来了，没什么事。<br />检修通道已经封死，进不去。<br />住宿表应该是以前填错了，明德楼确实没有404。<br />别传了。</p>}<div className="meta">编辑于 {state.answerVersion === "original" ? "3 天前" : "刚刚"}</div></article>

      <section className="card comments-card"><h3>评论</h3>{comments.map(c => <div className="comment" key={c.author + c.text}><div className="comment-avatar">{c.author[0]}</div><div><strong>{c.author}{c.replyTo ? ` 回复 ${c.replyTo}` : ""}</strong><div>{c.text}</div><small>3 天前</small></div></div>)}{state.comment && <><div className="comment"><div className="comment-avatar">你</div><div><strong>你</strong><div>{state.comment}</div><small>刚刚</small></div></div><div className="comment anomaly"><div className="comment-avatar">南</div><div><strong>南楼旧床板 回复 你</strong><div>终于有人回了。<br />你那边现在几点？</div><small>3 天前</small><p className="meta">这条回复的时间早于你的评论。</p></div></div></>}{state.stage === "opening" && <form onSubmit={submitComment}><textarea aria-label="写下你的评论" value={comment} onChange={event => setComment(event.target.value)} placeholder="写下你的评论……" maxLength={500} /><button type="submit">回复</button>{!comment.trim() && comment.length > 0 && <small className="error">先写点什么吧。</small>}</form>}</section>

      {state.stage === "clock" && <section className="card"><p>我手机一直停在 {state.entryClock}。</p><p>刚进来就是这个时间。走了很久，再看，还是这个时间。</p><p>你看一下你那边。不是这页上的时间，是你手机或者电脑上的。</p><button onClick={() => send({ type: "CLOCK", value: clock })}>我这里现在是 {clock}</button><form onSubmit={event => { event.preventDefault(); submit("CLOCK"); }}><input aria-label="手动告诉他时间" placeholder="手动告诉他时间" value={input} onChange={event => setInput(event.target.value)} /><button>发送</button></form>{state.notice && <p className="error">{state.notice}</p>}</section>}
      {state.stage === "date" && <section className="card"><p>几点好像都一样。</p><p>你那边……今天几号？</p><p className="meta">今天是 {todayLabel}</p><button onClick={() => send({ type: "DATE" })}>告诉他今天是 {todayLabel}</button></section>}

      {state.stage === "dateReveal" && <section className="card"><p>{todayLabel}？</p><p>我是 {pastLabel} {state.entryClock} 进来的。</p><p>我以为才过了十几分钟。</p><button onClick={() => send({ type: "DATE_CONTINUE" })}>继续</button></section>}

      {state.stage === "door" && <section className="card"><p>我能看到你的评论了。</p><p>别打电话，先在这儿回。我试过拨号，屏幕会跳回这篇回答。</p><p>我走到照片里那扇门前了。<br />蓝水管还在，门牌没了。原来钉牌子的地方剩下两个孔。</p><p>有人用铅笔在上面写着：<br />“从少掉的地方进来。”</p><p>门把手上挂着一把三位数的密码锁。</p><form onSubmit={event => { event.preventDefault(); submit("DOOR"); }}><input aria-label="三位门牌号" placeholder="三位门牌号" value={input} onChange={event => setInput(event.target.value)} /><button>让他试试</button></form><button className="ghost" onClick={() => send({ type: "DOOR_HINT" })}>给我一点提示</button>{state.doorHintLevel >= 1 && <p className="meta">你还记得我最开始写的吗？403旁边直接就是405。</p>}{state.doorHintLevel >= 2 && <p className="meta">少掉的是404。试试这个数。</p>}{state.notice && <p className="error">{state.notice}</p>}</section>}
      {state.stage === "room" && <section className="card"><p>开了。</p><p>里面是个寝室。</p><p>四张床，四把椅子。离门最近的桌上还放着半杯水。</p><p>我的校卡在杯子下面。</p><button onClick={() => send({ type: "ROOM" })}>看看校卡</button></section>}
      {state.stage === "register" && <section className="card"><p>校卡下面压着一张纸。</p><p>抬头是“明德楼住宿登记表”。跟我旧电脑里那张一模一样。</p><div className="evidence-card"><strong>明德楼住宿登记表｜404</strong><p>床位　姓名</p><p>1　　周嘉树</p><p>2　　梁可</p><p>3　　宋砚</p><p>4　　陈渡</p></div><p>我叫陈渡。</p><p>这三个人，我现在全想起来了。</p><p>宋砚睡我对面。他夏天也盖着被子，总说走廊里冷。</p><button onClick={() => send({ type: "MUTATE" })}>再看看你的原回答</button></section>}
      {state.stage === "mutated" && <section className="card"><p>我没改。</p><p>我两只手都在拿着那张纸。</p><p>你刚才读到的不是这样，对不对？</p><button onClick={() => send({ type: "HISTORY" })}>查看改动</button></section>}
      {state.stage === "history" && <section className="card"><h3>回答编辑记录</h3><div className="version-diff"><strong>3 天前 · 进入通道前</strong><p>后来我才知道，那里曾经住过四个人。</p><p>404那一栏填了四个名字，最后一个是我。</p></div><div className="version-diff"><strong>刚刚 · 当前版本</strong><p>后来我才知道，那里曾经住过三个人。</p><p>403那一栏填了三个名字。我当时看错了。</p></div><button onClick={() => send({ type: "HISTORY" })}>查看改动</button></section>}
      {state.stage === "name" && <section className="card"><p>表上最后一行也开始淡了。</p><p>不是纸受潮。前面三行都还好，只有最后一行。</p><p>帮我写回来。</p><p>404的第四个人是谁？</p><form onSubmit={event => { event.preventDefault(); submit("NAME"); }}><input aria-label="写下他的名字" placeholder="写下他的名字" value={input} onChange={event => setInput(event.target.value)} /><button>回复他</button></form><button className="ghost" onClick={() => send({ type: "NAME_HINT" })}>给我一点提示</button>{state.nameHintLevel > 0 && <p className="meta">最后一行写的是“陈渡”。他刚才也告诉过你自己的名字。</p>}{state.notice && <p className="error">{state.notice}</p>}</section>}
      {state.stage === "note" && <section className="card"><p>抽屉里有张折起来的便签。字很小，是宋砚写的。</p><blockquote>陈渡：<br /><br />如果你又回来，别再改成三个人了。<br /><br />只要外面还有人记得404里住的是我们四个，这扇门就还在。<br /><br />走的时候，把四个名字留在外面。<br /><br />门口问哪天，就照外面的日期答。<br /><br />它一直拿我们进来的那天骗我们。<br /><br />——宋砚</blockquote><p>“又回来”。我不是第一次进来。</p><button onClick={() => send({ type: "NOTE" })}>门外有什么？</button></section>}
      {state.stage === "outside" && <section className="card"><p>门外有人拿钥匙。</p><p>她敲了两下，说：</p><blockquote>陈渡，查寝。</blockquote><p>声音跟以前宿管一样。她问我今天几号。我说我不知道。</p><p>她笑了，说：</p><blockquote>今天 {pastLabel} 啊，你才进来一会儿。</blockquote><div className="evidence-card"><strong>晚归更正单</strong><p>明德楼403，实住三人。</p><p>本人误记房间编号及住宿人数，现已核实。</p><p>签字后予以开门。</p></div><p>我想起来了。上次我就是这么出去的。</p><button onClick={() => send({ type: "OUTSIDE" })}>继续</button></section>}
      {state.stage === "datePuzzle" && <section className="card"><p>你别照她说的写。</p><p>宋砚说，门口认外面的日期。</p><p>你那边今天到底几月几号？</p><form onSubmit={event => { event.preventDefault(); submit("FINAL_DATE"); }}><input aria-label="把日期告诉他" placeholder="例如 9月5日" value={input} onChange={event => setInput(event.target.value)} /><button>把日期告诉他</button></form><button className="ghost" onClick={() => send({ type: "FINAL_DATE_HINT" })}>给我一点提示</button>{state.notice && <p className="error">{state.notice}</p>}</section>}
      {state.stage === "choice" && <section className="card"><p>她不说话了。门锁响了一声。</p><p>我现在能走。</p><p>但原回答还在改，已经改成“明德楼从来没有404”。我把那张表抄下来了。你帮我留在评论里，好吗？</p><div className="evidence-card"><p>明德楼404，住过四个人。</p><p>周嘉树、梁可、宋砚、陈渡。</p><p>不是记错，也不是三个人。</p><p>我看到了原来的登记表。</p></div><div className="actions"><button onClick={() => send({ type: "CHOICE_A" })}>留下四个人的名字</button><button onClick={() => send({ type: "CHOICE_B" })}>先让陈渡出来</button></div></section>}
      {state.stage === "a" && <section className="card"><div className="comment"><strong>你</strong><div>明德楼404，住过四个人。<br />周嘉树、梁可、宋砚、陈渡。<br />不是记错，也不是三个人。<br />我看到了原来的登记表。</div></div><p>发出来了。</p><p>表上的字不动了。</p><p>等等。我身后有人从床上坐起来。</p><p>周嘉树问谁把灯开了。梁可在找拖鞋。宋砚看了我一眼，说：</p><blockquote>你这回怎么去了这么久。</blockquote><button onClick={() => send({ type: "A_CONTINUE" })}>你们出来了吗？</button></section>}
      {state.stage === "aDone" && <section className="card"><p>出来了。</p><p>四个人。水房的灯还是坏的。</p><p>宋砚非说他去报修，走两步又退回来，让我们等他一起。</p><p>谢谢你。</p><p>不管你一开始想说什么，幸好你回了。</p><p><strong>404，有人住过。四个名字留在了页面上。</strong></p><div className="actions"><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>回看这篇回答</button><button onClick={() => send({ type: "RESTART" })}>重新阅读</button></div></section>}
      {state.stage === "bConfirm" && <section className="card"><p>陈渡：</p><blockquote>我能先走。<br /><br />但名字还没留住。<br /><br />上次我走以后，就全忘了。</blockquote><button onClick={() => send({ type: "B_CONFIRM" })}>让他先走</button><button className="ghost" onClick={() => send({ type: "B_BACK" })}>回到最后的选择</button></section>}
      {state.stage === "b" && <section className="card"><p>我出来了。</p><p>刚才在里面没信号，好像发了些乱七八糟的东西。</p><p>抱歉，让你担心了。</p><button onClick={() => send({ type: "B_ASK_SONGYAN" })}>那宋砚呢？</button></section>}
      {state.stage === "bReply" && <section className="card"><p>南楼旧床板：</p><blockquote>谁？</blockquote><button onClick={() => send({ type: "B_FINISH" })}>继续</button></section>}
      {state.stage === "bDone" && <section className="card"><div className="comment"><strong>宋砚　3 天前</strong><div>他到外面了吗？</div></div><p><strong>回来一个。</strong></p><p>陈渡回到了外面。</p><p>登记表上，另外三个名字还在变淡。</p><div className="actions"><button onClick={() => send({ type: "B_BACK" })}>回到最后的选择</button><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>回看这篇回答</button><button onClick={() => send({ type: "RESTART" })}>重新阅读</button></div></section>}
    </div><aside className="side"><section className="card"><h3>已看材料</h3>{state.seenMaterials.length===0&&<div className="meta">暂无</div>}{state.seenMaterials.map(id=><button className="link-button" key={id} onClick={()=>setMaterial(id)}>{materialTitles[id]}</button>)}</section></aside></main>
    {material && <div className="dialog" role="dialog" aria-modal="true"><section className="dialog-card"><div className="section-head"><h3>{materialTitles[material]}</h3><button className="ghost" onClick={()=>setMaterial(null)}>关闭</button></div>{material==="register"&&<div className="evidence-card"><strong>明德楼住宿登记表｜404</strong><p>1　周嘉树</p><p>2　梁可</p><p>3　宋砚</p><p>4　陈渡</p></div>}{material==="editHistory"&&<><p>3 天前：那里曾经住过四个人。404那一栏填了四个名字，最后一个是我。</p><p>刚刚：那里曾经住过三个人。403那一栏填了三个名字。我当时看错了。</p></>}{material==="songYanNote"&&<blockquote>陈渡：如果你又回来，别再改成三个人了。只要外面还有人记得404里住的是我们四个，这扇门就还在。走的时候，把四个名字留在外面。门口问哪天，就照外面的日期答。它一直拿我们进来的那天骗我们。<br /><br />——宋砚</blockquote>}</section></div>}
  </>;
}
