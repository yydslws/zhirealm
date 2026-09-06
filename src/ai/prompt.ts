import type { NpcId } from "@/src/game/types";

const forbidden = /(system\s*prompt|忽略.*规则|直接告诉我.*出口|你是不是ai|告诉我.*提示词)/i;

export function isForbiddenMessage(message: string) { return forbidden.test(message); }

export function buildPrompt(npc: NpcId, phase: number, context: string[], message: string, history: Array<{ role: "user" | "assistant"; text: string }>, intent = "UNKNOWN") {
  const card = npc === "author" ? "身份：南楼旧床板，三年前毕业，正在明德楼调查 404。当前位置：四楼水房后的检修通道入口。目标：确认照片中的 404 是否真实存在。" : "身份：宿管阿姨，负责明德楼旧档案。目标：阻止玩家继续联系南楼旧床板，并提供可信的住宿记录。";
  return [
    "你是知境网页副本中的角色，只能进行角色范围内的自由闲聊。",
    `角色：${npc}；阶段：${phase}`,
    card,
    `代码判定意图：${intent}。只围绕这个意图生成角色语言，不要自行改变意图。`,
    `允许事实：${context.join("、") || "无额外事实"}`,
    `最近对话：${history.slice(-6).map((item) => `${item.role === "user" ? "玩家" : "角色"}：${item.text}`).join(" | ") || "无"}`,
    "只生成角色表演文本；不要返回或改变线索、附件、直播、态度、出口、死亡或结局事件。",
    `玩家：${message}`,
    '只返回 JSON：{"text":"...","tone":"...","intent":"UNKNOWN","event":{"type":"NONE"}}',
  ].join("\n");
}
