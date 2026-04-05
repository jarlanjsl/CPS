import { useParams, Link } from 'react-router-dom';
import { mockCasais, mockTurmas } from '../services/mockDb';
import '../styles/home.css';

export default function TurmaDetail() {
  const { id } = useParams();
  const turma = mockTurmas.find(t => t.id === id);
  const casais = mockCasais.filter(c => c.turmaId === id);

  if (!turma) return <div className="page-container">Turma não encontrada</div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Voltar
          </Link>
          <h1 style={{ marginTop: '0.5rem' }}>{turma.nome}</h1>
        </div>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Membros</h3>
        <div className="glass-effect" style={{ overflow: 'hidden' }}>
          {casais.map((c, idx) => (
            <div key={c.id} style={{ 
              padding: '1.25rem', 
              borderBottom: idx === casais.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{c.nomeEle} & {c.nomeEla}</div>
                {c.tipo === 'LIDER' && <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>Líder</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pontos</span>
                <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{c.pontuacaoTotal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <h3>Acompanhamento</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Escolha uma semana para dar check.</p>
        <Link to={`/turma/${id}/semana/1`} className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
          Preencher Semana 1
        </Link>
      </div>
    </div>
  );
}
