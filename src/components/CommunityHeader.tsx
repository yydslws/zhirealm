export function CommunityHeader({ onMessages, unread = false }: { onMessages: () => void; unread?: boolean }) {
  return <header className="topbar"><div className="topbar-inner"><div className="brand">知境</div><input className="search" aria-label="搜索问题" placeholder="搜索问题……" /><div className="header-actions"><button className="icon-button" aria-label="打开私信" onClick={onMessages}>💬{unread && <i className="unread-dot" />}</button><span className="avatar" aria-label="个人头像">知</span></div></div></header>;
}
