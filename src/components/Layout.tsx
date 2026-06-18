import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Bell, Settings } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';
import InstallPrompt from './InstallPrompt';
import '../styles/layout.css';

export default function Layout() {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Avião Ativo!', message: 'Você ativou o alarme automático nas configurações.', read: false }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    setHasUnreadNotification(false);
  };

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    if (notifications.length === 1) {
      setHasUnreadNotification(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout-container">
      <header className="mobile-header glass-effect">
        <div className="header-content" style={{ position: 'relative' }}>
          <Logo size={36} />
          
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} className={showNotifications ? "text-main" : "text-muted"} />
            {hasUnreadNotification && (
              <div style={{ position: 'absolute', top: '15px', right: '15px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></div>
            )}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Notificações
                </h4>
                {notifications.length === 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhuma notificação</span>
                )}
              </div>
              {notifications.map(notif => (
                <div key={notif.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', opacity: notif.read ? 0.6 : 1 }}>
                  <div style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '0.5rem', borderRadius: '50%' }}>🔔</div>
                  <div style={{ fontSize: '0.85rem', flex: 1 }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 500 }}>{notif.title}</p>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{notif.message}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {!notif.read && (
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Marcar como lida
                        </button>
                      )}
                      <button 
                        onClick={() => dismissNotification(notif.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#fca5a5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

      <InstallPrompt />
    </div>
  );
}
