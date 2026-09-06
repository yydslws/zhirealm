import type { IntentId, NpcId } from "@/src/game/types";

const rules: Array<[IntentId, RegExp]> = [
  ["WARN_AUTHOR", /(别|不要|先别|停下).*(进去|开门|往里)/],
  ["PUSH_AUTHOR", /进去看看|继续(往里|向前|进去)|把门打开|开门看看/],
  ["ASK_PHOTO", /拍(张|个)?照|拍.*门牌|发.*照片/],
  ["CHECK_DOOR", /门牌|门后|敲门/],
  ["ASK_SONG_YAN", /宋砚/],
  ["ASK_DORM", /宿管|阿姨/],
  ["ASK_REGISTER", /登记表|住宿表/],
  ["ASK_MAP", /消防图|疏散图|地图/],
  ["TELL_RETURN", /回来|回到首页|离开/],
  ["DELETE_HINT", /删掉|删除回答|删除记录/],
  ["ASK_OCCUPANTS", /几个人|住了几|几名/],
  ["ASK_CHEN_DU", /陈渡/],
];

export function classifyIntent(message: string, npc: NpcId): IntentId {
  const text = message.trim();
  if (/^(你好|嗨|谢谢|感谢|早上好|晚安)[！!。\s]*$/.test(text)) return "SMALL_TALK";
  const intent = rules.find(([, pattern]) => pattern.test(text))?.[0] ?? "UNKNOWN";
  if (npc === "dormManager" && ["WARN_AUTHOR", "PUSH_AUTHOR", "ASK_PHOTO", "CHECK_DOOR", "ASK_MAP", "TELL_RETURN", "ASK_CHEN_DU"].includes(intent)) return "UNKNOWN";
  if (npc === "author" && ["ASK_DORM", "ASK_REGISTER", "ASK_OCCUPANTS"].includes(intent)) return "UNKNOWN";
  return intent;
}
