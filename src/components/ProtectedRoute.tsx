import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function ProtectedRoute() {
  const { currentUser, firebaseConfigured } = useAuth();
  
  if (!firebaseConfigured) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: 'var(--bg-gradient)' }}>
        <div className="glass-effect" style={{ padding: '2rem', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={48} color="var(--primary)" />
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.5rem' }}>Ação Necessária</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            O Banco de Dados Real ainda não foi configurado. Por favor, acesse o painel oficial do <strong>Firebase</strong>, crie as credenciais Web e substitua as chaves "em-branco" dentro do arquivo:<br/><br/>
            <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px' }}>src/services/firebase.ts</code>
          </p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}
