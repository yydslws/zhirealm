import { NextResponse } from "next/server";
import { askDeepSeek } from "@/src/ai/client";
import { fallbackForNpc } from "@/src/ai/fallback";
import { classifyIntent } from "@/src/ai/intents";
import { fallbackIntentEvent } from "@/src/ai/events";
import { buildPrompt, isForbiddenMessage } from "@/src/ai/prompt";
import { aiRequestSchema } from "@/src/ai/schema";
import { allowRequest } from "@/src/ai/rateLimit";

export function GET() {
  return NextResponse.json({ aiConfigured: Boolean(process.env.DEEPSEEK_API_KEY) });
}

export async function POST(request: Request) {
  const input = aiRequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { npc, phase, message, context, history, run } = input.data;
  const session = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!allowRequest(session, run)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const intent = classifyIntent(message, npc);
  if (isForbiddenMessage(message)) return NextResponse.json({ ...fallbackIntentEvent(intent, npc), text: fallbackForNpc(npc), tone: "guarded" });
  const prompt = buildPrompt(npc, phase, context, message, history);
  // One bounded model attempt keeps a slow/unstable upstream from making the
  // page look like it is reconnecting; deterministic intent fallbacks remain available.
  const result = await askDeepSeek(prompt);
  return NextResponse.json(result ?? fallbackIntentEvent(intent, npc));
}
