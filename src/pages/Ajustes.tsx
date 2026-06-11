import { Bell, Plane, LogOut, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../contexts/SoundContext';

export default function Ajustes() {
  const navigate = useNavigate();
  const { isSoundEnabled, toggleSoundEnabled, soundFrequency, setSoundFrequency, playAirplaneSound } = useSound();

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Ajustes</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-effect" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Plane size={20} className="text-muted" />
              Alarme do Avião
            </h2>
            <button 
              onClick={playAirplaneSound}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Play size={16} /> Testar
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Ativar Avião</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mestre ativado para o sistema</div>
            </div>
            {/* Toggle funcional */}
            <div 
              onClick={toggleSoundEnabled}
              style={{ 
                background: isSoundEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
                width: '40px', height: '24px', borderRadius: '12px', position: 'relative', cursor: 'pointer',
                transition: 'background 0.3s'
              }}>
              <div style={{ 
                background: isSoundEnabled ? 'white' : '#94a3b8', 
                width: '20px', height: '20px', borderRadius: '50%', position: 'absolute', 
                top: '2px', left: isSoundEnabled ? '18px' : '2px',
                transition: 'all 0.3s'
              }}></div>
            </div>
          </div>
          
          <div style={{ opacity: isSoundEnabled ? 1 : 0.5, pointerEvents: isSoundEnabled ? 'auto' : 'none' }}>
            <div style={{ fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Frequência Automática</div>
            <select 
              value={soundFrequency}
              onChange={(e) => setSoundFrequency(e.target.value as any)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit' }}>
              <option value="MANUAL">Apenas disparos manuais</option>
              <option value="RANDOM">Aleatório (Entre 5 e 10 minutos)</option>
              <option value="30MIN">A cada 30 minutos</option>
            </select>
            {soundFrequency === 'RANDOM' && (
               <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary-light)' }}>
                 Cuidado! O avião passará aleatoriamente entre 5 e 10 minutos!
               </p>
            )}
          </div>
        </div>
        
        <div className="glass-effect" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} className="text-muted" />
            Notificações
          </h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Alertas Push</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lembrar tarefas na véspera</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', width: '40px', height: '24px', borderRadius: '12px', position: 'relative' }}>
              <div style={{ background: '#94a3b8', width: '20px', height: '20px', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }}></div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/login')}
          style={{ padding: '1rem', background: 'var(--danger-bg)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1rem' }}>
          <LogOut size={20} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
