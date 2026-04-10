import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import '../styles/login.css';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFirebaseConfigured || !auth) {
      setError("Erro interno: O arquivo firebase.ts não possui as chaves válidas. Configure-o primeiro.");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Usa email fantasma para autenticação no Firebase
      const emailFantasma = `${usuario.trim().toLowerCase()}@cps.app`;
      await signInWithEmailAndPassword(auth, emailFantasma, senha);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Usuário ou senha inválidos.');
      } else {
        setError('Falha de conexão com Firebase: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-effect">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {/* Pode adicionar uma Logo aqui */}
          <span style={{ fontSize: '3rem' }}>💍</span>
        </div>
        <h1 className="login-title gradient-text">Casados Para Sempre</h1>
        <p className="login-subtitle">Gestão Viva e Dinâmica</p>
        
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label>Usuário</label>
            <input 
              type="text" 
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Digite seu usuário"
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required 
            />
          </div>
          
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Acessando...' : 'Entrar'}
          </button>
        </form>
        <p className="hint">Mock padrão: lider / 123</p>
      </div>
    </div>
  );
}
