// ponytail: process-local limiter is enough for the MVP; move to durable storage when multi-instance accuracy matters.
const requestCounts = new Map<string, number>();

export function allowRequest(session: string, run: number) {
  const key = `${session}:${run}`;
  const count = requestCounts.get(key) ?? 0;
  if (count >= 30) return false;
  requestCounts.set(key, count + 1);
  return true;
}
