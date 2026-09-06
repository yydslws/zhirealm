export const rules = [
  { id: "R1", text: "403的下一间是405，但这不代表中间没有房间。", truth: true },
  { id: "R2", text: "水房后面有一条沿楼背面折回去的窄通道。", truth: true },
  { id: "R3", text: "404的门不朝主走廊开。", truth: "conditional" as const },
  { id: "R4", text: "住宿登记表里最后一栏写着陈渡。", truth: true },
  { id: "R5", text: "编辑记录能找回被改写的句子。", truth: true },
  { id: "R6", text: "宋砚的名字仍在四个人的登记表里。", truth: true },
];
