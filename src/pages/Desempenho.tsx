import { Star, LoaderCircle, Trophy, Leaf, CheckSquare, CalendarDays } from 'lucide-react';
import { dbService, type Casal, type Turma } from '../services/db';
import { useEffect, useState, useMemo } from 'react';
import AvatarCasado from '../components/AvatarCasado';

type Categoria = 'GERAL' | 'PRESENCA' | 'VITAMINA' | 'TAREFAS';

export default function Desempenho() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');
  const [casais, setCasais] = useState<Casal[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState<Categoria>('GERAL');
  const [fotoAmpliada, setFotoAmpliada] = useState<Casal | null>(null);

  useEffect(() => {
    dbService.getTurmas().then(res => {
      setTurmas(res);
      if (res.length > 0) {
        setSelectedTurmaId(res[0].id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedTurmaId) return;
    setLoading(true);
    dbService.getCasais(selectedTurmaId).then(res => {
      // Filtrar Criteriosamente: LIDERES E COLIDERES NAO PONTUAM
      const alunos = res.filter(c => c.tipo === 'ALUNO');
      setCasais(alunos);
      setLoading(false);
    });
  }, [selectedTurmaId]);

  // Função para calcular a pontuação ativa com base na aba escolhida
  const getPontos = (c: Casal, cat: Categoria): number => {
    if (cat === 'GERAL') return c.pontuacaoTotal || 0;
    
    let soma = 0;
    const semanas = c.semanas || {};
    
    Object.values(semanas).forEach(sem => {
      if (cat === 'PRESENCA' && sem.presenca) soma += 1;
      if (cat === 'VITAMINA') {
        // HU-27: vitamina vale 0, 1 ou 2 pts (checks individuais Ele/Ela).
        // else if preserva a compat retroativa com `vitaminas: true` (legacy).
        if (sem.sorteioVitaminas) {
          if (sem.sorteioVitaminas.ele && sem.sorteioVitaminas.ele.check) soma += 1;
          if (sem.sorteioVitaminas.ela && sem.sorteioVitaminas.ela.check) soma += 1;
        } else if (sem.vitaminas) {
          soma += 1; // legacy
        }
      }
      if (cat === 'TAREFAS') {
        if (sem.tarefas) soma += 1;
        if (sem.tarefasExtras) soma += 1; // max 2 pontos por semana nesse quesito
      }
    });
    
    return soma;
  };

  const casaisOrdenados = useMemo(() => {
    return [...casais].sort((a, b) => getPontos(b, categoria) - getPontos(a, categoria));
  }, [casais, categoria]);

  return (
    <>
      <div className="page-container">
      <header className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>Desempenho Setorial</h1>
        
        {turmas.length > 0 ? (
          <select 
            value={selectedTurmaId} 
            onChange={(e) => setSelectedTurmaId(e.target.value)}
            style={{ 
              background: 'rgba(15,23,42,0.8)', border: '1px solid var(--primary-dark)', 
              color: 'white', padding: '0.75rem', borderRadius: '8px', 
              width: '100%', fontFamily: 'inherit', fontWeight: 600 
            }}
          >
            {turmas.map(t => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Crie uma turma para visualizar o desempenho.</p>
        )}
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
           <LoaderCircle size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
        </div>
      ) : turmas.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="glass-effect" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Star size={40} className="text-muted" style={{ color: '#fbbf24', margin: '0 auto 0.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0' }}>Ranking da Turma</h2>
            
            {/* Tabs de Filtro */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              <button 
                onClick={() => setCategoria('GERAL')}
                style={{ flex: 1, minWidth: '80px', padding: '0.5rem', borderRadius: '8px', border: 'none', background: categoria === 'GERAL' ? 'var(--primary-dark)' : 'rgba(255,255,255,0.05)', color: categoria === 'GERAL' ? 'white' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
              >
                <Trophy size={16} /> <span style={{ fontSize: '0.75rem' }}>Geral</span>
              </button>
              <button 
                onClick={() => setCategoria('PRESENCA')}
                style={{ flex: 1, minWidth: '80px', padding: '0.5rem', borderRadius: '8px', border: 'none', background: categoria === 'PRESENCA' ? 'var(--success)' : 'rgba(255,255,255,0.05)', color: categoria === 'PRESENCA' ? 'white' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
              >
                <CalendarDays size={16} /> <span style={{ fontSize: '0.75rem' }}>Presença</span>
              </button>
              <button 
                onClick={() => setCategoria('VITAMINA')}
                style={{ flex: 1, minWidth: '80px', padding: '0.5rem', borderRadius: '8px', border: 'none', background: categoria === 'VITAMINA' ? '#fbbf24' : 'rgba(255,255,255,0.05)', color: categoria === 'VITAMINA' ? 'black' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
              >
                <Leaf size={16} /> <span style={{ fontSize: '0.75rem' }}>Vitamina</span>
              </button>
              <button 
                onClick={() => setCategoria('TAREFAS')}
                style={{ flex: 1, minWidth: '80px', padding: '0.5rem', borderRadius: '8px', border: 'none', background: categoria === 'TAREFAS' ? '#9333ea' : 'rgba(255,255,255,0.05)', color: categoria === 'TAREFAS' ? 'white' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
              >
                <CheckSquare size={16} /> <span style={{ fontSize: '0.75rem' }}>Tarefas</span>
              </button>
            </div>
          </div>

          {casaisOrdenados.length === 0 ? (
            <div className="glass-effect" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum aluno cadastrado nesta turma ainda. Vá até a turma e adicione membros!
            </div>
          ) : (
            <>
              {/* Listagem Ordenada por Categoria Selecionada */}
              {casaisOrdenados.map((c, index) => {
                const pontos = getPontos(c, categoria);
                return (
                  <div key={c.id} className="glass-effect" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '35px', color: index === 0 ? '#fbbf24' : index === 1 ? '#e2e8f0' : index === 2 ? '#b45309' : 'var(--text-muted)' }}>
                      #{index + 1}
                    </div>
                    <AvatarCasado
                      nomeEle={c.nomeEle}
                      nomeEla={c.nomeEla}
                      fotoUrl={c.fotoUrl}
                      size={40}
                      onClick={() => setFotoAmpliada(c)}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{c.nomeEle} & {c.nomeEla}</h3>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-light)' }}>
                      {pontos}
                      <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '4px' }}>pts</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      ) : null}
    </div>

      {fotoAmpliada && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '2rem', cursor: 'pointer'
        }} onClick={() => setFotoAmpliada(null)}>
          <div style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            {fotoAmpliada.fotoUrl ? (
              <img src={fotoAmpliada.fotoUrl} alt={`${fotoAmpliada.nomeEle} e ${fotoAmpliada.nomeEla}`}
                style={{ maxWidth: '300px', maxHeight: '300px', borderRadius: '16px', objectFit: 'cover' }} />
            ) : (
              <AvatarCasado nomeEle={fotoAmpliada.nomeEle} nomeEla={fotoAmpliada.nomeEla} size={120} />
            )}
            <p style={{ color: 'white', marginTop: '1rem', fontSize: '1.1rem' }}>
              {fotoAmpliada.nomeEle} & {fotoAmpliada.nomeEla}
            </p>
            <button onClick={() => setFotoAmpliada(null)} style={{
              background: 'var(--primary)', color: 'white', border: 'none',
              padding: '0.5rem 2rem', borderRadius: '8px', cursor: 'pointer'
            }}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}
