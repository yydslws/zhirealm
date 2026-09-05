import { pollutionBand } from "@/src/game/derive";

export function GlitchLayer({ pollution, stopped }: { pollution: number; stopped: boolean }) {
  const band = pollutionBand(pollution);
  if (band === "stable") return null;
  if (band === "meltdown") return <div className="card glitch glitch-critical" role="alert">页面失控。你看到的内容可能已经不是原文。{stopped ? " 时间停在02:07。" : ""}</div>;
  return <div className="card glitch" role="status">页面不稳定。有一部分内容无法确认。</div>;
}
