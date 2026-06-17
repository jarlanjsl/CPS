import { Star, LoaderCircle, Trophy, Leaf, CheckSquare, CalendarDays } from 'lucide-react';
import { dbService, type Casal, type Turma } from '../services/db';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarCasado from '../components/AvatarCasado';
import {
  type Categoria,
  getPontosSemana,
  getPontosAcumulado,
  calcularDeltas,
} from './ranking-utils';

const MAX_SEMANAS = 14;

export default function Desempenho() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');
  const [casais, setCasais] = useState<Casal[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState<Categoria>('GERAL');
  const [fotoAmpliada, setFotoAmpliada] = useState<Casal | null>(null);
  const [semanaSelecionada, setSemanaSelecionada] = useState<number | 'TODAS'>('TODAS');

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

  // Helper: obtém os pontos de um casal conforme a semana/categoria selecionada
  const getPontos = (c: Casal, cat: Categoria): number => {
    if (semanaSelecionada === 'TODAS') {
      // Para GERAL acumulado, usa pontuacaoTotal do servidor (fonte canônica).
      // Para outras categorias, soma semanal projetada client-side.
      if (cat === 'GERAL') return c.pontuacaoTotal || 0;
      return getPontosAcumulado(c, cat, MAX_SEMANAS);
    }
    return getPontosSemana(c, semanaSelecionada, cat);
  };

  // Ranking da semana/categoria selecionada
  const casaisOrdenados = useMemo(() => {
    return [...casais].sort((a, b) => getPontos(b, categoria) - getPontos(a, categoria));
  }, [casais, categoria, semanaSelecionada]);

  // Ranking da semana anterior (para cálculo de deltas)
  const casaisOrdenadosSemanaAnterior = useMemo(() => {
    if (semanaSelecionada === 'TODAS' || semanaSelecionada === 1) return [];
    return [...casais].sort(
      (a, b) =>
        getPontosSemana(b, semanaSelecionada - 1, categoria) -
        getPontosSemana(a, semanaSelecionada - 1, categoria)
    );
  }, [casais, categoria, semanaSelecionada]);

  // Deltas de posição (subiu/desceu/manteve)
  const deltas = useMemo(() => {
    return calcularDeltas(casaisOrdenados, casaisOrdenadosSemanaAnterior);
  }, [casaisOrdenados, casaisOrdenadosSemanaAnterior]);

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
          
          {/* HU-24: Seletor de Semanas */}
          <div className="glass-effect" style={{ padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label htmlFor="semana-select" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
                Semana:
              </label>
              <select
                id="semana-select"
                value={semanaSelecionada === 'TODAS' ? 'TODAS' : String(semanaSelecionada)}
                onChange={(e) => setSemanaSelecionada(e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value))}
                style={{
                  flex: 1,
                  background: 'rgba(15,23,42,0.8)',
                  border: '1px solid var(--primary-dark)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                }}
                aria-label="Selecionar semana para o ranking"
              >
                <option value="TODAS">Todas as Semanas (Acumulado)</option>
                {Array.from({ length: MAX_SEMANAS }, (_, i) => i + 1).map(num => (
                  <option key={num} value={String(num)}>Semana {num}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="glass-effect" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Star size={40} className="text-muted" style={{ color: '#fbbf24', margin: '0 auto 0.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0' }}>
              {semanaSelecionada === 'TODAS' ? 'Ranking da Turma' : `Ranking — Semana ${semanaSelecionada}`}
            </h2>
            
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
              {/* HU-24: Listagem com animação de transição e indicadores de variação */}
              <AnimatePresence mode="popLayout">
                {casaisOrdenados.map((c, index) => {
                  const pontos = getPontos(c, categoria);
                  const delta = deltas.get(c.id) || 0;
                  const showDeltas = semanaSelecionada !== 'TODAS' && semanaSelecionada !== 1;

                  return (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="glass-effect"
                      style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                      {/* Posição no ranking */}
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '35px', color: index === 0 ? '#fbbf24' : index === 1 ? '#e2e8f0' : index === 2 ? '#b45309' : 'var(--text-muted)' }}>
                        #{index + 1}
                      </div>

                      {/* HU-24: Indicador de variação de posição */}
                      {showDeltas && (
                        <div
                          aria-label={delta > 0 ? `Subiu ${delta} posições` : delta < 0 ? `Desceu ${Math.abs(delta)} posições` : 'Manteve posição'}
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            color: delta > 0 ? '#10b981' : delta < 0 ? '#ef4444' : 'var(--text-muted)',
                            minWidth: '40px',
                            textAlign: 'center',
                          }}
                        >
                          {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : '—'}
                        </div>
                      )}

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
                    </motion.div>
                  );
                })}
              </AnimatePresence>
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
