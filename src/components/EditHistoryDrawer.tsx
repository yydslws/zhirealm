"use client";

import { editVersions } from "@/src/content/investigation";
import type { GameState } from "@/src/game/types";
import { useState } from "react";

export function EditHistoryDrawer({ state, close, compare }: { state: GameState; close: () => void; compare: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedIndex = editVersions.findIndex((version) => version.id === selected);
  const previous = selectedIndex > 0 ? editVersions[selectedIndex - 1] : null;
  const current = selectedIndex >= 0 ? editVersions[selectedIndex] : null;
  return <div className="sheet-backdrop" onClick={close}><section className="sheet" role="dialog" aria-label="回答编辑记录" onClick={(e) => e.stopPropagation()}><div className="sheet-head"><h2>回答编辑记录</h2><button className="ghost" onClick={close}>关闭</button></div>{current && previous && <div className="version-diff"><strong>{previous.label} → {current.label}</strong><p className="diff-line removed">- {previous.text}</p><p className="diff-line added">+ {current.text}</p></div>}{editVersions.map((version) => <article className="saved-item" key={version.id}><strong>{version.label}</strong><p>{version.text}</p><button className="secondary" onClick={() => { setSelected(version.id); compare(version.id); }}>比较版本</button></article>)}</section></div>;
}
