import { z } from "zod";

export const aiResponseSchema = z.object({
  text: z.string().min(1).max(800),
  tone: z.string().max(80),
  event: z.null(),
});

export const aiRequestSchema = z.object({
  npc: z.enum(["user404", "dormManager", "author"]),
  phase: z.number().int().min(1).max(7),
  message: z.string().min(1).max(300),
  context: z.array(z.string()).max(20).default([]),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(800) })).max(20).default([]),
  run: z.number().int().min(1).max(9999).default(1),
});
