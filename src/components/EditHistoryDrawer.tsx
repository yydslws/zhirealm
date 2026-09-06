import { editVersions } from "@/src/content/investigation";
import type { GameState } from "@/src/game/types";

export function EditHistoryDrawer({ state, close, compare }: { state: GameState; close: () => void; compare: (id: string) => void }) {
  return <div className="sheet-backdrop" onClick={close}><section className="sheet" role="dialog" aria-label="回答编辑记录" onClick={(e) => e.stopPropagation()}><div className="sheet-head"><h2>回答编辑记录</h2><button className="ghost" onClick={close}>关闭</button></div>{editVersions.map((version) => <article className="saved-item" key={version.id}><strong>{version.label}</strong><p>{version.text}</p><button className="secondary" onClick={() => compare(version.id)}>比较版本</button></article>)}</section></div>;
}
