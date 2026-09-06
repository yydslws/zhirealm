export const searchResults: Record<string, { title: string; summary: string; clueId?: "C1" | "C2" | "C3" | "C4" | "C5" }> = {
  "search-404": { title: "明德楼以前有 404 吗？", summary: "问题已删除", clueId: "C2" },
  "search-songyan": { title: "有人认识宋砚吗？", summary: "账号已注销", clueId: "C2" },
  "search-chendu": { title: "陈渡最后出现在哪里？", summary: "0 个回答", clueId: "C5" },
  "search-mingde": { title: "明德楼四楼旧照片", summary: "3 个结果", clueId: "C1" },
};

export const searchResultPages: Record<string, { title: string; status: string; body: string }> = {
  "search-404": { title: "明德楼以前有 404 吗？", status: "该问题已删除", body: "缓存摘要：\n2023 年明德楼四楼曾出现过一个没有登记的 404 房间。" },
  "search-songyan": { title: "有人认识宋砚吗？", status: "该问题已删除", body: "缓存摘要：\n2023 年明德楼，有人见过宋砚和一张门牌被擦掉的照片。" },
  "search-chendu": { title: "陈渡最后出现在哪里？", status: "0 个回答", body: "缓存摘要：\n最后一次有人回复：他在明德楼四楼，之后账号停止更新。" },
  "search-mingde": { title: "明德楼四楼旧照片", status: "3 个结果", body: "缓存摘要：\n照片里有一扇没有门牌的门，墙边是一截蓝色水管。" },
};

export const editVersions = [
  { id: "v1", label: "23:14", text: "那里曾经住过四个人。" },
  { id: "v2", label: "23:31", text: "那里曾经住过三个人。" },
  { id: "v3", label: "23:47", text: "那里没人住过。" },
  { id: "v4", label: "02:04", text: "[该段落已删除]" },
  { id: "v5", label: "02:07", text: "如果真是404，一会儿接着更。" },
];

export const profile = {
  id: "author",
  name: "南楼旧床板",
  bio: "毕业三年，偶尔回学校看猫",
  activities: ["今天终于搬出明德楼了。", "为什么总有人私信问我404？", "[动态已删除]"],
};

export const imageDetails: Record<string, { title: string; details: string[] }> = {
  "photo-404": { title: "门口照片·原图详情", details: ["门牌：404", "墙边：刷了半截蓝漆的水管", "窗户：磨砂玻璃，朝向楼后", "拍摄时间：2023-09-04 02:07"] },
  "register-404": { title: "住宿登记表·原图详情", details: ["404：周嘉树、梁可、宋砚、陈渡", "表格右下角有被擦掉的修改痕迹"] },
};

export const liveEvents = [
  { id: "author-arrived" as const, actor: "author" as const, surface: "comment" as const, text: "我到通道口了。" },
  { id: "author-door" as const, actor: "author" as const, surface: "comment" as const, text: "门牌被刮掉了，里面有人敲门。" },
  { id: "author-deleted" as const, actor: "author" as const, surface: "comment" as const, text: "门上没有号码。" },
  { id: "dorm-warning" as const, actor: "dormManager" as const, surface: "dm" as const, text: "谁让你联系他的？" },
];
