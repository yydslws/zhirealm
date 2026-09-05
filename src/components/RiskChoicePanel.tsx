import type { GameState, RiskChoice, RiskNodeId } from "@/src/game/types";

const nodes: Array<{ id: RiskNodeId; title: string; safe: string; danger: string; minPhase: number }> = [
  { id: "comments", title: "异常评论", safe: "停止阅读", danger: "深挖异常评论", minPhase: 2 },
  { id: "dorm", title: "宿管私信", safe: "查看摘要", danger: "打开原始附件", minPhase: 3 },
  { id: "rules", title: "规则卡", safe: "标记待核实", danger: "直接相信规则", minPhase: 3 },
  { id: "evidence", title: "证据面板", safe: "查看已知证据", danger: "强行揭示模糊证据", minPhase: 4 },
  { id: "draft", title: "草稿发布", safe: "返回调查", danger: "未完成核实直接发布", minPhase: 5 },
];

export function RiskChoicePanel({ state, choose }: { state: GameState; choose: (node: RiskNodeId, choice: RiskChoice) => void }) {
  if (state.currentRun.meltdown || state.currentRun.hasPublishedOwnAnswer || state.currentRun.endingSettled) return null;
  const visible = nodes.filter((node) => state.phase >= node.minPhase && (node.id !== "draft" || state.currentRun.draftAvailable));
  if (!visible.length) return null;
  return <section className="card risk-panel"><h3>今晚要怎么做</h3><p className="meta">选择后不可撤销。危险操作可能让页面更快失控。</p>{visible.map((node) => {
    const selected = state.currentRun.riskChoices[node.id];
    return <div className="risk-node" key={node.id}><strong>{node.title}</strong>{selected ? <span className={selected === "danger" ? "risk-danger" : "risk-safe"}>{selected === "danger" ? node.danger : node.safe} · 已选择</span> : <div className="actions"><button className="secondary" onClick={() => choose(node.id, "safe")}>{node.safe}</button><button className="danger" onClick={() => choose(node.id, "danger")}>{node.danger}</button></div>}</div>;
  })}</section>;
}
