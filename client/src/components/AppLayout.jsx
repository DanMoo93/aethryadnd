import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Tabletop Ledger</div>
        <nav className="sidebar-nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Campaigns
          </Link>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <div className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            {user?.displayName}
          </div>
          <button className="btn btn-ghost" onClick={logout} style={{ width: '100%' }}>
            Log out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
