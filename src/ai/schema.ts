import { z } from "zod";

export const aiResponseSchema = z.object({
  text: z.string().min(1).max(800),
  tone: z.string().max(80),
  intent: z.enum(["WARN_AUTHOR", "PUSH_AUTHOR", "ASK_PHOTO", "CHECK_DOOR", "ASK_SONG_YAN", "ASK_DORM", "ASK_REGISTER", "ASK_MAP", "TELL_RETURN", "DELETE_HINT", "ASK_OCCUPANTS", "ASK_CHEN_DU", "UNKNOWN", "SMALL_TALK"]),
  event: z.discriminatedUnion("type", [
    z.object({ type: z.literal("NONE") }),
    z.object({ type: z.literal("REVEAL_CLUE"), clueId: z.enum(["C1", "C2", "C3", "C4", "C5"]) }),
    z.object({ type: z.literal("ADD_COMMENT"), commentId: z.string().max(80) }),
    z.object({ type: z.literal("DELETE_COMMENT"), commentId: z.string().max(80) }),
    z.object({ type: z.literal("EDIT_ANSWER"), versionId: z.string().max(40) }),
    z.object({ type: z.literal("SEND_DM"), messageId: z.string().max(80) }),
    z.object({ type: z.literal("CHANGE_USERNAME"), npc: z.enum(["dormManager", "author"]), variant: z.string().max(80) }),
    z.object({ type: z.literal("SHOW_ATTACHMENT"), attachmentId: z.string().max(80) }),
    z.object({ type: z.literal("CHANGE_NPC_ATTITUDE"), npc: z.enum(["dormManager", "author"]), delta: z.union([z.literal(-1), z.literal(1)]) }),
  ]),
});

export const aiRequestSchema = z.object({
  npc: z.enum(["dormManager", "author"]),
  phase: z.number().int().min(1).max(7),
  message: z.string().min(1).max(300),
  context: z.array(z.string()).max(20).default([]),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(800) })).max(20).default([]),
  run: z.number().int().min(1).max(9999).default(1),
});
