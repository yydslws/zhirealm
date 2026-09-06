import { aiResponseSchema } from "@/src/ai/schema";

export async function withOneRetry<T>(operation: () => Promise<T | null>) {
  return await operation() ?? await operation();
}

export async function askDeepSeek(prompt: string, timeoutMs = 5000) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const baseUrl = (process.env.AI_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.DEEPSEEK_MODEL || "deepseek-chat", temperature: 0.7, max_tokens: 300, response_format: { type: "json_object" }, messages: [{ role: "system", content: prompt }] }),
    });
    if (!response.ok) return null;
    const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = body.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = aiResponseSchema.safeParse(JSON.parse(content));
    return parsed.success ? parsed.data : null;
  } catch { return null; } finally { clearTimeout(timer); }
}
