import { Bell, Plane, LogOut, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../contexts/SoundContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ajustes.css';

export default function Ajustes() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isSoundEnabled, toggleSoundEnabled, soundFrequency, setSoundFrequency, playAirplaneSound } = useSound();

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Ajustes</h1>
      </header>

      <div className="ajustes-content">
        <div className="glass-effect ajustes-card">
          <div className="ajustes-card-header">
            <h2 className="ajustes-card-title">
              <Plane size={20} className="text-muted" />
              Alarme do Avião
            </h2>
            <button 
              onClick={playAirplaneSound}
              className="btn-test">
              <Play size={16} /> Testar
            </button>
          </div>
          
          <div className="ajustes-toggle-row">
            <div>
              <div className="ajustes-toggle-label">Ativar Avião</div>
              <div className="ajustes-toggle-desc">Mestre ativado para o sistema</div>
            </div>
            {/* Toggle funcional */}
            <div 
              onClick={toggleSoundEnabled}
              className={`toggle-track ${isSoundEnabled ? 'toggle-track--active' : 'toggle-track--inactive'}`}>
              <div className={`toggle-knob ${isSoundEnabled ? 'toggle-knob--active' : 'toggle-knob--inactive'}`}></div>
            </div>
          </div>
          
          <div style={{ opacity: isSoundEnabled ? 1 : 0.5, pointerEvents: isSoundEnabled ? 'auto' : 'none' }}>
            <div className="ajustes-freq-label">Frequência Automática</div>
            <select 
              value={soundFrequency}
              onChange={(e) => setSoundFrequency(e.target.value as any)}
              className="ajustes-select">
              <option value="MANUAL">Apenas disparos manuais</option>
              <option value="RANDOM">Aleatório (Entre 5 e 10 minutos)</option>
              <option value="30MIN">A cada 30 minutos</option>
            </select>
            {soundFrequency === 'RANDOM' && (
               <p className="ajustes-freq-warning">
                 Cuidado! O avião passará aleatoriamente entre 5 e 10 minutos!
               </p>
            )}
          </div>
        </div>
        
        <div className="glass-effect ajustes-card">
          <h2 className="ajustes-card-title ajustes-card-title--mb">
            <Bell size={20} className="text-muted" />
            Notificações
          </h2>
          
          <div className="ajustes-toggle-row--no-border">
            <div>
              <div className="ajustes-toggle-label">Alertas Push</div>
              <div className="ajustes-toggle-desc">Lembrar tarefas na véspera</div>
            </div>
            <div className="toggle-track--disabled">
              <div className="toggle-knob--static"></div>
            </div>
          </div>
        </div>

        <button 
          onClick={async () => {
            await logout();
            navigate('/login', { replace: true });
          }}
          className="btn-logout">
          <LogOut size={20} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
