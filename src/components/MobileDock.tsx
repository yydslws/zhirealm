export function MobileDock({ savedCount, unread, onSaved, onMessages }: { savedCount: number; unread: boolean; onSaved: () => void; onMessages: () => void }) {
  return <nav className="mobile-dock"><button onClick={onSaved}>已保存 {savedCount || ""}</button><button onClick={onMessages}>私信 {unread ? "·" : ""}</button></nav>;
}
