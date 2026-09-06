import type { IntentId, NpcId } from "@/src/game/types";

const rules: Array<[IntentId, RegExp]> = [
  ["WARN_AUTHOR", /别进去|不要进去|先别|停下/],
  ["PUSH_AUTHOR", /进去看看|继续|进去|开门/],
  ["ASK_PHOTO", /拍照|照片|拍门牌/],
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

export function classifyIntent(message: string, _npc: NpcId): IntentId {
  return rules.find(([, pattern]) => pattern.test(message))?.[0] ?? "ASK_OCCUPANTS";
}
