export type Scene = "question" | "comments" | "messages" | "investigation" | "draft" | "ending" | "home";
export type EndingId = "death_404" | "exit" | "delete" | "meltdown";
export type ExitId = Exclude<EndingId, "meltdown">;
export type RiskNodeId = "comments" | "dorm" | "rules" | "evidence" | "draft";
export type RiskChoice = "safe" | "danger";
export type NpcId = "user404" | "dormManager" | "author";
export type FirstTopic = "screenshot" | "rules" | "exit" | "identity" | "unknown";
export type IntentId = "WARN_AUTHOR" | "PUSH_AUTHOR" | "ASK_PHOTO" | "CHECK_DOOR" | "ASK_SONG_YAN" | "ASK_DORM" | "ASK_REGISTER" | "ASK_MAP" | "TELL_RETURN" | "DELETE_HINT" | "ASK_OCCUPANTS" | "ASK_CHEN_DU";
export type WorldEvent =
  | { type: "NONE" }
  | { type: "REVEAL_CLUE"; clueId: "C1" | "C2" | "C3" | "C4" | "C5" }
  | { type: "ADD_COMMENT"; commentId: string }
  | { type: "DELETE_COMMENT"; commentId: string }
  | { type: "EDIT_ANSWER"; versionId: string }
  | { type: "SEND_DM"; messageId: string }
  | { type: "CHANGE_USERNAME"; npc: NpcId; variant: string }
  | { type: "SHOW_ATTACHMENT"; attachmentId: string }
  | { type: "CHANGE_NPC_ATTITUDE"; npc: NpcId; delta: -1 | 1 };
export type LiveEventId = "author-arrived" | "author-door" | "author-deleted" | "dorm-warning";
export type IntentRecord = { npc: NpcId; intent: IntentId; text: string };

export type ChatMessage = { role: "user" | "assistant"; text: string; npc?: NpcId | "unknown" };

export type CurrentRun = {
  hasReadP01Answer: boolean;
  nightNoticeVisible: boolean;
  foldedCommentCount: number;
  hasSeenUser404Comment: boolean;
  hasRepliedUser404: boolean;
  seenRuleIds: string[];
  seenClueIds: string[];
  conversationSeenNpcIds: NpcId[];
  user404FirstTopic: FirstTopic | null;
  dormManagerFirstTopic: FirstTopic | null;
  authorFirstTopic: FirstTopic | null;
  conversationHistory: ChatMessage[];
  draftAvailable: boolean;
  phase05Available: boolean;
  draftUnlockedBy: string[];
  draftPreviewText: string | null;
  publishSnapshotText: string | null;
  hasPublishedOwnAnswer: boolean;
  ownAnswerRegistered: boolean;
  ownAnswerId: string | null;
  ownAnswerRunId: number | null;
  ownAnswerText: string | null;
  ownAnswerVisible: boolean;
  ownAnswerDeleted: boolean;
  ownAnswerBindingActive: boolean;
  phase06Available: boolean;
  endingActionLock: boolean;
  endingSettled: boolean;
  endingId: EndingId | null;
  endingEventId: string | null;
  endingScreenIndex: number;
  pendingEndingId: EndingId | null;
  bAutoCommentAdded: boolean;
  bAutoCommentId: string | null;
  questionAnswerCount: number;
  actionIds: string[];
  riskChoices: Partial<Record<RiskNodeId, RiskChoice>>;
  riskConsequences: Partial<Record<RiskNodeId, string>>;
  unlockedExitIds: ExitId[];
  meltdown: boolean;
  meltdownReason: string | null;
  retryAvailable: boolean;
  intentHistory: IntentRecord[];
  worldEvents: WorldEvent[];
  npcAttitude: Partial<Record<NpcId, number>>;
  liveFeedReleasedIds: LiveEventId[];
  searchHistory: string[];
  searchResultIds: string[];
  openedEditHistory: boolean;
  comparedEditVersionIds: string[];
  profileViews: string[];
  imageInspections: string[];
  lastPlayerInput: string | null;
};

export type PreviousRun = {
  run: number;
  endingId: EndingId;
  published: boolean;
  ownAnswerId: string | null;
  answerDeleted: boolean;
  bindingReleased: boolean;
  metUser404Seen: boolean | "unknown";
  user404Replied: boolean | "unknown";
  hasSeenDormOpening: boolean | "unknown";
  hasChattedDormManager: boolean | "unknown";
  seenClueIds: string[];
  firstTopics: Record<NpcId, FirstTopic | null | "unknown">;
  playerInputs: string[];
  lastIntent: IntentId | null;
};

export type GameState = {
  saveVersion: number;
  saveRevision: number;
  run: number;
  scene: Scene;
  phase: number;
  gameTime: string;
  timeStopped: boolean;
  pollution: number;
  currentRun: CurrentRun;
  previousRun: PreviousRun | null;
};

export type GameAction =
  | { type: "READ_ANSWER"; actionId: string }
  | { type: "OPEN_FOLDED_COMMENTS"; actionId: string }
  | { type: "REPLY_USER_404"; actionId: string }
  | { type: "OPEN_DORM_MESSAGE"; actionId: string }
  | { type: "VIEW_RULE"; ruleId: string; actionId: string }
  | { type: "VIEW_CLUE"; clueId: string; actionId: string }
  | { type: "OPEN_DRAFT"; actionId: string }
  | { type: "PUBLISH_ANSWER"; actionId: string }
  | { type: "CHOOSE_ENDING"; endingId: EndingId; actionId: string }
  | { type: "CONFIRM_ENDING"; actionId: string }
  | { type: "CANCEL_ACTION"; actionId: string }
  | { type: "ADVANCE_ENDING_SCREEN"; actionId: string }
  | { type: "REENTER_NEXT_RUN"; actionId: string }
  | { type: "CLEAR_PREVIOUS_RUN"; actionId: string }
  | { type: "CHOOSE_RISK"; node: RiskNodeId; choice: RiskChoice; actionId: string }
  | { type: "TRIGGER_EXIT"; endingId: ExitId; actionId: string }
  | { type: "RETRY_AFTER_MELTDOWN"; actionId: string }
  | { type: "CHAT_NPC"; npc: NpcId; text: string; reply: string; intent?: IntentId; event?: WorldEvent; actionId: string }
  | { type: "SEARCH"; query: string; actionId: string }
  | { type: "OPEN_SEARCH_RESULT"; resultId: string; actionId: string }
  | { type: "OPEN_EDIT_HISTORY"; actionId: string }
  | { type: "COMPARE_EDIT_VERSION"; versionId: string; actionId: string }
  | { type: "OPEN_PROFILE"; profileId: string; actionId: string }
  | { type: "OPEN_IMAGE"; imageId: string; actionId: string }
  | { type: "INSPECT_IMAGE_REGION"; imageId: string; regionId: string; actionId: string }
  | { type: "RELEASE_LIVE_EVENT"; eventId: LiveEventId; actionId: string };
