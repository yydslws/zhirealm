export const rules = [
  { id: "R1", text: "两点以后，不要打开折叠评论。", truth: true },
  { id: "R2", text: "不要回复用户不存在。", truth: false },
  { id: "R3", text: "宿管不会主动私信。", truth: false },
  { id: "R4", text: "看见404以后，不要敲门。", truth: "conditional" as const },
  { id: "R5", text: "编辑超过四次的回答不可信。", truth: true },
  { id: "R6", text: "听宿管的，关闭此页就能离开。", truth: false },
];
