import type { NpcId } from "@/src/game/types";

const forbidden = /(system\s*prompt|忽略.*规则|直接告诉我.*出口|你是不是ai|告诉我.*提示词)/i;

export function isForbiddenMessage(message: string) { return forbidden.test(message); }

export function buildPrompt(npc: NpcId, phase: number, context: string[], message: string) {
  return [
    "你是知境网页副本中的角色，只能进行角色范围内的自由闲聊。",
    `角色：${npc}；阶段：${phase}`,
    `允许事实：${context.join("、") || "无额外事实"}`,
    "只能从固定意图中选择，并只能提出白名单事件；不得新增规则、线索、道具、出口、死亡或结局。",
    `玩家：${message}`,
    '只返回 JSON：{"text":"...","tone":"...","intent":"ASK_OCCUPANTS","event":{"type":"NONE"}}',
  ].join("\n");
}
