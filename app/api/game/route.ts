import { NextResponse } from "next/server";
import { askDeepSeek, withOneRetry } from "@/src/ai/client";
import { fallbackForNpc } from "@/src/ai/fallback";
import { buildPrompt, isForbiddenMessage } from "@/src/ai/prompt";
import { aiRequestSchema } from "@/src/ai/schema";
import { allowRequest } from "@/src/ai/rateLimit";

export function GET() {
  return NextResponse.json({ aiConfigured: Boolean(process.env.DEEPSEEK_API_KEY) });
}

export async function POST(request: Request) {
  const input = aiRequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { npc, phase, message, context, run } = input.data;
  const session = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!allowRequest(session, run)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  if (isForbiddenMessage(message)) return NextResponse.json({ text: fallbackForNpc(npc), tone: "guarded", event: null });
  const prompt = buildPrompt(npc, phase, context, message);
  const result = await withOneRetry(() => askDeepSeek(prompt));
  return NextResponse.json(result ?? { text: fallbackForNpc(npc), tone: "fixed", event: null });
}
