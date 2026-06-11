import { useParams, Link, useNavigate } from 'react-router-dom';
import { dbService, type Casal, type SemanaCheck } from '../services/db';
import { useState, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

export default function Acompanhamento() {
  const { id, semanaId } = useParams();
  const navigate = useNavigate();
  const [casais, setCasais] = useState<Casal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dataSemana, setDataSemana] = useState<string>('');
  
  // Mapear checks. Formato: { "casalId": { presenca: true, ... } }
  const [checks, setChecks] = useState<Record<string, SemanaCheck>>({});

  useEffect(() => {
    if (id) {
      Promise.all([
        dbService.getCasais(id),
        dbService.getTurmas()
      ]).then(([res, turmas]) => {
        setCasais(res);
        
        // Buscar data da semana
        const turma = turmas.find(t => t.id === id);
        if (turma) {
          const semanaNum = parseInt(semanaId || '1');
          if (turma.datasSemanas && turma.datasSemanas[semanaNum]) {
            setDataSemana(new Date(turma.datasSemanas[semanaNum]).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
          } else if (turma.dataInicio) {
            const dataInicio = new Date(turma.dataInicio);
            const diasParaAdicionar = (semanaNum - 1) * 7;
            const novaData = new Date(dataInicio);
            novaData.setDate(novaData.getDate() + diasParaAdicionar);
            setDataSemana(novaData.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
          }
        }
        
        // Povoando state com as escolhas antigas que possam estar no Firebase (Idempotência)
        const initialState: Record<string, SemanaCheck> = {};
        res.forEach(c => {
           initialState[c.id] = c.semanas?.[semanaId || '1'] || { presenca: false, vitaminas: false, tarefas: false, tarefasExtras: false };
        });
        setChecks(initialState);
        setLoading(false);
      });
    }
  }, [id, semanaId]);

  const toggleCheck = (casalId: string, campo: keyof SemanaCheck) => {
    setChecks(prev => ({
      ...prev,
      [casalId]: {
        ...prev[casalId],
        [campo]: !prev[casalId][campo]
      }
    }));
  };

  const salvar = async () => {
    setSaving(true);
    try {
      // Para cada casal mapeado, gravar o checklist definitivo daquela semana usando dbService
      for (const casalId in checks) {
         await dbService.saveChecklist(casalId, semanaId || '1', checks[casalId]);
      }
      alert('Sincronizado! O desempenho de todos os casais foi calculado globalmente.');
      navigate(`/turma/${id}`);
    } catch (e) {
      alert('Houve um erro ao tentar salvar localmente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container" style={{ textAlign: 'center', padding: '3rem' }}><LoaderCircle size={32} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <Link to={`/turma/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Voltar
          </Link>
          <h1 style={{ marginTop: '0.5rem', color: 'var(--text-main)' }}>
            Semana {semanaId}
            {dataSemana && (
              <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.25rem' }}>
                {dataSemana}
              </span>
            )}
          </h1>
        </div>
        <button onClick={salvar} className="btn-primary" disabled={saving}>
          {saving ? 'Gravando...' : 'Salvar'}
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {casais.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum membro nesta turma.</p>}
        {casais.map(c => (
          <div key={c.id} className="glass-effect" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-main)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{c.nomeEle} & {c.nomeEla}</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={checks[c.id]?.presenca} 
                  onChange={() => toggleCheck(c.id, 'presenca')} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-light)' }}
                />
                <span style={{ fontSize: '1.1rem' }}>Presença</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={checks[c.id]?.vitaminas} 
                  onChange={() => toggleCheck(c.id, 'vitaminas')} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-light)' }}
                />
                <span style={{ fontSize: '1.1rem' }}>Vitaminas Feitas</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={checks[c.id]?.tarefas} 
                  onChange={() => toggleCheck(c.id, 'tarefas')} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-light)' }}
                />
                <span style={{ fontSize: '1.1rem' }}>Tarefas Base</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={checks[c.id]?.tarefasExtras} 
                  onChange={() => toggleCheck(c.id, 'tarefasExtras')} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: '#fbbf24' }} // Amarelo
                />
                <span style={{ fontSize: '1.1rem', color: '#fbbf24', fontWeight: 600 }}>Tarefa Extra (+1pt)</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
