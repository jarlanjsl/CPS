import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockCasais } from '../services/mockDb';
import { useState } from 'react';

export default function Acompanhamento() {
  const { id, semanaId } = useParams();
  const navigate = useNavigate();
  const casais = mockCasais.filter(c => c.turmaId === id);
  
  // Estado mock simples para os checks
  const [checks, setChecks] = useState<Record<string, any>>({});

  const toggleCheck = (casalId: string, campo: string) => {
    setChecks(prev => ({
      ...prev,
      [`${casalId}-${campo}`]: !prev[`${casalId}-${campo}`]
    }));
  };

  const salvar = () => {
    alert('Dados salvos no mock!');
    navigate(`/turma/${id}`);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <Link to={`/turma/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Voltar
          </Link>
          <h1 style={{ marginTop: '0.5rem' }}>Semana {semanaId}</h1>
        </div>
        <button onClick={salvar} className="btn-primary">Salvar</button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {casais.map(c => (
          <div key={c.id} className="glass-effect" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-main)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              {c.nomeEle} & {c.nomeEla}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={!!checks[`${c.id}-presenca`]} 
                  onChange={() => toggleCheck(c.id, 'presenca')} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-light)' }}
                />
                <span style={{ fontSize: '1.1rem' }}>Presença</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={!!checks[`${c.id}-vitaminas`]} 
                  onChange={() => toggleCheck(c.id, 'vitaminas')} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-light)' }}
                />
                <span style={{ fontSize: '1.1rem' }}>Vitaminas Feitas</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={!!checks[`${c.id}-tarefas`]} 
                  onChange={() => toggleCheck(c.id, 'tarefas')} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-light)' }}
                />
                <span style={{ fontSize: '1.1rem' }}>Tarefas Base Completadas</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
