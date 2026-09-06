"use client";

import { useEffect, useState } from "react";
import { AnswerCard } from "@/src/components/AnswerCard";
import { CommentSection } from "@/src/components/CommentSection";
import { ChatPanel } from "@/src/components/ChatPanel";
import { DraftPanel } from "@/src/components/DraftPanel";
import { EndingPanel } from "@/src/components/EndingPanel";
import { EvidencePanel } from "@/src/components/EvidencePanel";
import { GlitchLayer } from "@/src/components/GlitchLayer";
import { QuestionHeader } from "@/src/components/QuestionHeader";
import { RulePanel } from "@/src/components/RulePanel";
import { OwnAnswerCard } from "@/src/components/OwnAnswerCard";
import { RelatedQuestions } from "@/src/components/RelatedQuestions";
import { CommunityHeader } from "@/src/components/CommunityHeader";
import { MessageDrawer } from "@/src/components/MessageDrawer";
import { SavedSheet } from "@/src/components/SavedSheet";
import { MobileDock } from "@/src/components/MobileDock";
import { secondRunText } from "@/src/content/p07";
import { ApiHealth } from "@/src/components/ApiHealth";
import { RiskChoicePanel } from "@/src/components/RiskChoicePanel";
import { SearchDrawer } from "@/src/components/SearchDrawer";
import { EditHistoryDrawer } from "@/src/components/EditHistoryDrawer";
import { ProfileSheet } from "@/src/components/ProfileSheet";
import { ImageInspectSheet } from "@/src/components/ImageInspectSheet";
import { SearchResultPage } from "@/src/components/SearchResultPage";
import { useGameStore } from "@/src/store/gameStore";
import { isDemoMode } from "@/src/lib/demoMode";
import type { IntentId, NpcId, WorldEvent } from "@/src/game/types";
import { liveFeedBranches } from "@/src/game/liveFeed";

let actionCounter = 0;
const id = () => `ui-${Date.now()}-${actionCounter++}`;

export default function Home() {
  const state = useGameStore();
  const [demo, setDemo] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [authorChatOpen, setAuthorChatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [imageId, setImageId] = useState<string | null>(null);
  useEffect(() => { state.hydrate(); setDemo(isDemoMode()); }, []);
  useEffect(() => {
    if (!state.currentRun.liveFeedStarted || state.currentRun.endingSettled || state.currentRun.liveFeedPaused) return;
    const ids = liveFeedBranches[state.currentRun.authorPath];
    const next = ids.find((item) => !state.currentRun.liveFeedReleasedIds.includes(item));
    if (!next) return;
    const timer = window.setTimeout(() => action("RELEASE_LIVE_EVENT", { eventId: next }), 2600);
    return () => window.clearTimeout(timer);
  }, [state.currentRun.liveFeedStarted, state.currentRun.liveFeedReleasedIds, state.currentRun.endingSettled, state.currentRun.liveFeedPaused, state.currentRun.authorPath]);
  useEffect(() => {
    if (!state.currentRun.dmTriggerPending || state.currentRun.liveFeedReleasedIds.includes("dorm-warning")) return;
    const timer = window.setTimeout(() => action("RELEASE_LIVE_EVENT", { eventId: "dorm-warning" }), 2000);
    return () => window.clearTimeout(timer);
  }, [state.currentRun.dmTriggerPending, state.currentRun.liveFeedReleasedIds]);
  useEffect(() => {
    if (!state.currentRun.commentsOpened || state.currentRun.foldedCountShifted) return;
    const timer = window.setTimeout(() => action("SHIFT_FOLDED_COUNT"), 1800);
    return () => window.clearTimeout(timer);
  }, [state.currentRun.commentsOpened, state.currentRun.foldedCountShifted]);
  const dispatch = state.dispatch;
  const action = (type: Parameters<typeof dispatch>[0]["type"], extra: Record<string, string> = {}) => dispatch({ type, actionId: id(), ...extra } as never);
  const onChat = (npc: NpcId, text: string, reply: string, intent?: IntentId, event?: WorldEvent) => dispatch({ type: "CHAT_NPC", npc, text, reply, intent, event, actionId: id() });
  const runToPublish = (unlockDelete = false) => { action("READ_ANSWER"); action("OPEN_COMMENTS"); action("SHIFT_FOLDED_COUNT"); action("OPEN_FOLDED_COMMENTS"); action("REPLY_AUTHOR_COMMENT"); action("OPEN_DORM_MESSAGE"); action("VIEW_CLUE", { clueId: "C2" }); action("VIEW_CLUE", { clueId: "C3" }); if (unlockDelete) action("CHOOSE_RISK", { node: "evidence", choice: "danger" }); action("OPEN_DRAFT"); action("PUBLISH_ANSWER"); };
  const forceDelete = () => { if (!state.currentRun.hasPublishedOwnAnswer) runToPublish(true); action("CHOOSE_ENDING", { endingId: "delete" }); action("CONFIRM_ENDING"); };
  const openMessages = () => { setMessagesOpen(true); if (state.currentRun.liveFeedReleasedIds.includes("dorm-warning")) action("MARK_DM_READ"); };
  const openAttachment = (attachmentId: string) => { action("OPEN_IMAGE", { imageId: attachmentId }); if (attachmentId === "register-404") action("VIEW_CLUE", { clueId: "C2" }); setImageId(attachmentId); };
  const handleHome = () => { if (state.currentRun.searchResultPageId) { action("CLOSE_SEARCH_RESULT"); setSearchOpen(false); return; } if (state.currentRun.hasPublishedOwnAnswer && state.currentRun.unlockedExitIds.includes("exit")) { action("TRIGGER_EXIT", { endingId: "exit" }); return; } window.scrollTo({ top: 0, behavior: "smooth" }); };
  // Static community content renders immediately; hydration only replaces saved state.
  const memory = secondRunText(state.previousRun);
  const endingPanel = <EndingPanel state={state} confirm={() => action("CONFIRM_ENDING")} cancel={() => action("CANCEL_ACTION")} reenter={() => action("REENTER_NEXT_RUN")} retry={() => action("RETRY_AFTER_MELTDOWN")} returnHome={() => action("RETURN_TO_QUESTION")} />;
  if (state.currentRun.meltdown) return <><CommunityHeader onMessages={openMessages} time={state.gameTime} /><main className="meltdown-stage">{endingPanel}{demo && <button className="meltdown-reset" onClick={state.reset}>重置存档</button>}</main></>;
  const savedCount = state.currentRun.seenRuleIds.length + state.currentRun.seenClueIds.length;
  const unread = state.currentRun.liveFeedReleasedIds.includes("dorm-warning") && !state.currentRun.conversationSeenNpcIds.includes("dormManager");
  return <>
    <CommunityHeader onMessages={openMessages} onHome={handleHome} time={state.gameTime} onExitReading={state.currentRun.hasPublishedOwnAnswer && state.currentRun.unlockedExitIds.includes("death_404") && !state.currentRun.endingSettled ? () => action("TRIGGER_EXIT", { endingId: "death_404" }) : undefined} onSearch={(query) => { action("SEARCH", { query }); setSearchOpen(true); }} unread={unread} />
    <main className="layout">
      <div>
        {state.run > 1 && memory && <section className="card glitch memory-note">{memory}</section>}
        {state.currentRun.searchResultPageId ? <SearchResultPage state={state} back={() => { action("CLOSE_SEARCH_RESULT"); setSearchOpen(true); }} read={() => action("READ_SEARCH_RESULT", { resultId: state.currentRun.searchResultPageId! })} /> : <><QuestionHeader state={state} /><AnswerCard state={state} onRead={() => action("READ_ANSWER")} onComments={() => action("OPEN_COMMENTS")} onAuthorChat={() => setAuthorChatOpen(true)} onProfile={() => { action("OPEN_PROFILE", { profileId: "author" }); setProfileOpen(true); }} onEditHistory={() => { action("OPEN_EDIT_HISTORY"); setEditOpen(true); }} /></>}
        {authorChatOpen && <ChatPanel fixedNpc="author" label="给答主发私信" phase={state.phase} run={state.run} context={state.currentRun.seenClueIds} history={state.currentRun.conversationHistory} onMessage={onChat} onAttachment={openAttachment} />}
        {!state.currentRun.searchResultPageId && state.currentRun.commentsOpened && <CommentSection state={state} open={() => action("OPEN_FOLDED_COMMENTS")} reply={() => action("REPLY_AUTHOR_COMMENT")} onChat={onChat} onAttachment={openAttachment} />}
        {demo && state.phase >= 3 && <EvidencePanel state={state} view={(clueId) => action("VIEW_CLUE", { clueId })} onImage={(id) => { action("OPEN_IMAGE", { imageId: id }); setImageId(id); }} />}
        {state.currentRun.draftAvailable && <DraftPanel state={state} open={() => action("OPEN_DRAFT")} publish={() => action("PUBLISH_ANSWER")} />}
        <OwnAnswerCard state={state} onDelete={() => action("TRIGGER_EXIT", { endingId: "delete" })} />
        {endingPanel}
      </div>
      <aside className="side">
        <RelatedQuestions state={state} />
        <section className="card saved-desktop"><button className="saved-entry" onClick={() => setSavedOpen(true)}>已保存 {savedCount || ""}</button></section>
        {demo && <><GlitchLayer pollution={state.pollution} stopped={state.timeStopped} /><RulePanel state={state} view={(ruleId) => action("VIEW_RULE", { ruleId })} />{(["comments", "dorm", "rules", "evidence", "draft"] as const).map((node) => <RiskChoicePanel key={node} state={state} node={node} choose={(selectedNode, choice) => action("CHOOSE_RISK", { node: selectedNode, choice })} />)}<section className="card"><h3>当前周目</h3><div className="meta">第 {state.run} 周目 · pollution {state.pollution}</div><div className="actions"><button className="ghost" onClick={state.reset}>重置存档</button><button onClick={() => runToPublish()}>跳到发布</button><button onClick={forceDelete}>强制 C 结局</button><ApiHealth /></div></section></>}
      </aside>
    </main>
    <MessageDrawer state={state} open={messagesOpen} close={() => setMessagesOpen(false)} phase={state.phase} onOpenThread={() => { action("OPEN_DORM_MESSAGE"); action("MARK_DM_READ"); }} onReply={() => action("REPLY_AUTHOR_COMMENT")} onChat={onChat} onAttachment={openAttachment} />
    <SavedSheet state={state} open={savedOpen} close={() => setSavedOpen(false)} viewRule={(ruleId) => action("VIEW_RULE", { ruleId })} viewClue={(clueId) => action("VIEW_CLUE", { clueId })} />
    <MobileDock savedCount={savedCount} unread={unread} onSaved={() => setSavedOpen(true)} onMessages={openMessages} />
    {searchOpen && <SearchDrawer state={state} close={() => setSearchOpen(false)} openResult={(resultId) => { action("OPEN_SEARCH_RESULT", { resultId }); setSearchOpen(false); }} />}
    {editOpen && <EditHistoryDrawer state={state} close={() => setEditOpen(false)} compare={(versionId) => action("COMPARE_EDIT_VERSION", { versionId })} />}
    {profileOpen && <ProfileSheet close={() => setProfileOpen(false)} />}
    {imageId && <ImageInspectSheet imageId={imageId} close={() => setImageId(null)} inspect={(regionId) => action("OPEN_IMAGE_REGION", { imageId, regionId })} />}
  </>;
}
