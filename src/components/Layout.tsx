import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Bell, Settings } from 'lucide-react';
import '../styles/layout.css';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout-container">
      <header className="mobile-header glass-effect">
        <div className="header-content">
          <span className="logo-text gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>CPS App</span>
          <button className="icon-btn">
            <Bell size={20} className="text-muted" />
          </button>
        </div>
      </header>
      
      <main className="layout-main">
        <Outlet />
      </main>

      <nav className="bottom-nav glass-effect">
        <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <Home size={24} />
          <span>Início</span>
        </Link>
        <Link to="/desempenho" className={`nav-item ${isActive('/desempenho') ? 'active' : ''}`}>
          <BarChart2 size={24} />
          <span>Desempenho</span>
        </Link>
        <Link to="/ajustes" className={`nav-item ${isActive('/ajustes') ? 'active' : ''}`}>
          <Settings size={24} />
          <span>Ajustes</span>
        </Link>
      </nav>
    </div>
  );
}
