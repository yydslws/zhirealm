"use client";

import { useEffect, useState } from "react";
import { AnswerCard } from "@/src/components/AnswerCard";
import { CommentSection } from "@/src/components/CommentSection";
import { ChatPanel } from "@/src/components/ChatPanel";
import { DraftPanel } from "@/src/components/DraftPanel";
import { EndingPanel } from "@/src/components/EndingPanel";
import { EvidencePanel } from "@/src/components/EvidencePanel";
import { GlitchLayer } from "@/src/components/GlitchLayer";
import { MessagePanel } from "@/src/components/MessagePanel";
import { QuestionHeader } from "@/src/components/QuestionHeader";
import { RulePanel } from "@/src/components/RulePanel";
import { OwnAnswerCard } from "@/src/components/OwnAnswerCard";
import { secondRunText } from "@/src/content/p07";
import { ApiHealth } from "@/src/components/ApiHealth";
import { RiskChoicePanel } from "@/src/components/RiskChoicePanel";
import { useGameStore } from "@/src/store/gameStore";
import { isDemoMode } from "@/src/lib/demoMode";
import { pollutionBand } from "@/src/game/derive";

const id = () => crypto.randomUUID();

export default function Home() {
  const state = useGameStore();
  const [hydrated, setHydrated] = useState(false);
  const [demo, setDemo] = useState(false);
  useEffect(() => { state.hydrate(); setDemo(isDemoMode()); setHydrated(true); }, []);
  const dispatch = state.dispatch;
  const action = (type: Parameters<typeof dispatch>[0]["type"], extra: Record<string, string> = {}) =>
    dispatch({ type, actionId: id(), ...extra } as never);
  const runToPublish = (unlockDelete = false) => {
    action("READ_ANSWER");
    action("OPEN_FOLDED_COMMENTS");
    action("REPLY_USER_404");
    action("OPEN_DORM_MESSAGE");
    action("VIEW_CLUE", { clueId: "C2" });
    if (unlockDelete) action("CHOOSE_RISK", { node: "evidence", choice: "danger" });
    action("OPEN_DRAFT");
    action("PUBLISH_ANSWER");
  };
  const forceDelete = () => {
    if (!state.currentRun.hasPublishedOwnAnswer) {
      runToPublish(true);
    }
    action("CHOOSE_ENDING", { endingId: "delete" });
    action("CONFIRM_ENDING");
  };
  if (!hydrated) return <main className="layout"><section className="card">正在恢复本轮记录……</section></main>;
  const memory = secondRunText(state.previousRun);
  const endingPanel = <EndingPanel state={state} choose={(endingId) => action("CHOOSE_ENDING", { endingId })} triggerExit={(endingId) => action("TRIGGER_EXIT", { endingId })} confirm={() => action("CONFIRM_ENDING")} cancel={() => action("CANCEL_ACTION")} advance={() => action("ADVANCE_ENDING_SCREEN")} reenter={() => action("REENTER_NEXT_RUN")} retry={() => action("RETRY_AFTER_MELTDOWN")} />;
  if (state.currentRun.meltdown) return <><header className="topbar"><div className="topbar-inner"><div className="brand">知境 ZhiRealm</div><div className="time">02:07</div></div></header><main className="meltdown-stage">{endingPanel}</main></>;
  const status = pollutionBand(state.pollution) === "stable" ? "页面稳定" : pollutionBand(state.pollution) === "unstable" ? "页面不稳定" : "内容正在被替换";
  return <>
    <header className="topbar"><div className="topbar-inner"><div className="brand">知境 ZhiRealm</div><div className="time">{state.gameTime}</div></div></header>
    <main className="layout">
      <div>
        {state.run > 1 && memory && <section className="card glitch">{memory}</section>}
        <QuestionHeader state={state} onRead={() => action("READ_ANSWER")} />
        <AnswerCard state={state} onRead={() => action("OPEN_FOLDED_COMMENTS")} />
        {state.phase >= 2 && <><CommentSection state={state} open={() => action("OPEN_FOLDED_COMMENTS")} reply={() => action("REPLY_USER_404")} /><RiskChoicePanel state={state} node="comments" choose={(node, choice) => action("CHOOSE_RISK", { node, choice })} /></>}
        {state.phase >= 3 && <MessagePanel state={state} openDorm={() => action("OPEN_DORM_MESSAGE")} reply={() => action("REPLY_USER_404")} />}
        {state.phase >= 3 && <RiskChoicePanel state={state} node="dorm" choose={(node, choice) => action("CHOOSE_RISK", { node, choice })} />}
        {state.phase >= 3 && <ChatPanel phase={state.phase} run={state.run} context={state.currentRun.seenClueIds} history={state.currentRun.conversationHistory} onMessage={(npc, text, reply) => action("CHAT_NPC", { npc, text, reply })} />}
        {state.phase >= 4 && <><EvidencePanel state={state} view={(clueId) => action("VIEW_CLUE", { clueId })} /><RiskChoicePanel state={state} node="evidence" choose={(node, choice) => action("CHOOSE_RISK", { node, choice })} /></>}
        {state.currentRun.draftAvailable && <><DraftPanel state={state} open={() => action("OPEN_DRAFT")} publish={() => action("PUBLISH_ANSWER")} /><RiskChoicePanel state={state} node="draft" choose={(node, choice) => action("CHOOSE_RISK", { node, choice })} /></>}
        <OwnAnswerCard state={state} />
        {endingPanel}
      </div>
      <aside className="side">
        <GlitchLayer pollution={state.pollution} stopped={state.timeStopped} />
        {state.phase >= 3 && <><RulePanel state={state} view={(ruleId) => action("VIEW_RULE", { ruleId })} /><RiskChoicePanel state={state} node="rules" choose={(node, choice) => action("CHOOSE_RISK", { node, choice })} /></>}
        <section className="card"><h3>当前周目</h3><div className="meta">第 {state.run} 周目 · {status}</div><div className="actions"><button className="ghost" onClick={state.reset}>重置存档</button>{state.previousRun && <button className="ghost" onClick={() => action("CLEAR_PREVIOUS_RUN")}>清除上一轮记录</button>}</div></section>
        {demo && <section className="card"><h3>Demo Mode</h3><ApiHealth /><div className="actions"><button onClick={() => action("OPEN_FOLDED_COMMENTS")}>Force 02:00</button><button onClick={() => runToPublish()}>跳到发布</button><button onClick={forceDelete}>强制 C 结局</button><button className="ghost" onClick={state.reset}>Reset Save</button></div></section>}
      </aside>
    </main>
  </>;
}
