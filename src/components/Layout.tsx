import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Bell, Settings } from 'lucide-react';
import { useState } from 'react';
import '../styles/layout.css';

export default function Layout() {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout-container">
      <header className="mobile-header glass-effect">
        <div className="header-content" style={{ position: 'relative' }}>
          <span className="logo-text gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>CPS App</span>
          
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} className={showNotifications ? "text-main" : "text-muted"} />
            {/* Indicador visual de nova notificação simulado */}
            <div style={{ position: 'absolute', top: '15px', right: '15px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></div>
          </button>
          
          {showNotifications && (
            <div className="glass-effect" style={{
              position: 'absolute',
              top: '3rem',
              right: '1rem',
              width: '250px',
              padding: '1rem',
              zIndex: 50,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', gap: '0.75rem'
            }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                Notificações
              </h4>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '0.5rem', borderRadius: '50%' }}>🔔</div>
                <div style={{ fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: 500 }}>Avião Ativo!</p>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>Você ativou o alarme automático nas configurações.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="layout-main" onClick={() => setShowNotifications(false)}>
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
