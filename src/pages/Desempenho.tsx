import { Star } from 'lucide-react';
import { mockCasais } from '../services/mockDb';

export default function Desempenho() {
  // Ordena os casais pelo total de pontos, mas FILTRANDO os líderes (eles pontuam, mas não entram no ranking)
  const casaisOrdenados = [...mockCasais]
    .filter(c => c.tipo !== 'LIDER')
    .sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Desempenho Geral</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-effect" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Star size={40} className="text-muted" style={{ color: '#fbbf24', margin: '0 auto 0.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', margin: '0' }}>Ranking de Pontuação</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Baseado em presenças, tarefas e vitaminas</p>
        </div>

        {casaisOrdenados.map((c, index) => (
          <div key={c.id} className="glass-effect" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '35px', color: index === 0 ? '#fbbf24' : index === 1 ? '#e2e8f0' : index === 2 ? '#b45309' : 'var(--text-muted)' }}>
              #{index + 1}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{c.nomeEle} & {c.nomeEla}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.tipo === 'LIDER' ? 'Líderes' : 'Alunos'}</p>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-light)' }}>
              {c.pontuacaoTotal}
              <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '4px' }}>pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
