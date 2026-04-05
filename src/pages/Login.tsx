import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/mockDb';
import '../styles/login.css';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.login(usuario, senha);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
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
