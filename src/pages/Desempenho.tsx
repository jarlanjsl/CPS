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
import '../styles/desempenho.css';

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
      <header className="page-header desempenho-header">
        <h1 className="desempenho-title">Desempenho Setorial</h1>
        
        {turmas.length > 0 ? (
          <select 
            value={selectedTurmaId} 
            onChange={(e) => setSelectedTurmaId(e.target.value)}
            className="desempenho-select"
          >
            {turmas.map(t => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        ) : (
          <p className="desempenho-empty">Crie uma turma para visualizar o desempenho.</p>
        )}
      </header>

      {loading ? (
        <div className="desempenho-loading">
           <LoaderCircle size={32} className="spinner" />
        </div>
      ) : turmas.length > 0 ? (
        <div className="desempenho-content">
          
          {/* HU-24: Seletor de Semanas */}
          <div className="glass-effect desempenho-week-selector">
            <div className="desempenho-week-row">
              <label htmlFor="semana-select" className="desempenho-week-label">
                Semana:
              </label>
              <select
                id="semana-select"
                value={semanaSelecionada === 'TODAS' ? 'TODAS' : String(semanaSelecionada)}
                onChange={(e) => setSemanaSelecionada(e.target.value === 'TODAS' ? 'TODAS' : Number(e.target.value))}
                className="desempenho-week-select"
                aria-label="Selecionar semana para o ranking"
              >
                <option value="TODAS">Todas as Semanas (Acumulado)</option>
                {Array.from({ length: MAX_SEMANAS }, (_, i) => i + 1).map(num => (
                  <option key={num} value={String(num)}>Semana {num}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="glass-effect desempenho-ranking-card">
            <Star size={40} className="text-muted desempenho-star" />
            <h2 className="desempenho-ranking-title">
              {semanaSelecionada === 'TODAS' ? 'Ranking da Turma' : `Ranking — Semana ${semanaSelecionada}`}
            </h2>
            
            {/* Tabs de Filtro */}
            <div className="desempenho-tabs">
              <button 
                onClick={() => setCategoria('GERAL')}
                className="desempenho-tab"
                style={{ background: categoria === 'GERAL' ? 'var(--primary-dark)' : undefined, color: categoria === 'GERAL' ? 'white' : undefined }}
              >
                <Trophy size={16} /> <span className="desempenho-tab-label">Geral</span>
              </button>
              <button 
                onClick={() => setCategoria('PRESENCA')}
                className="desempenho-tab"
                style={{ background: categoria === 'PRESENCA' ? 'var(--success)' : undefined, color: categoria === 'PRESENCA' ? 'white' : undefined }}
              >
                <CalendarDays size={16} /> <span className="desempenho-tab-label">Presença</span>
              </button>
              <button 
                onClick={() => setCategoria('VITAMINA')}
                className="desempenho-tab"
                style={{ background: categoria === 'VITAMINA' ? '#fbbf24' : undefined, color: categoria === 'VITAMINA' ? 'black' : undefined }}
              >
                <Leaf size={16} /> <span className="desempenho-tab-label">Vitamina</span>
              </button>
              <button 
                onClick={() => setCategoria('TAREFAS')}
                className="desempenho-tab"
                style={{ background: categoria === 'TAREFAS' ? '#9333ea' : undefined, color: categoria === 'TAREFAS' ? 'white' : undefined }}
              >
                <CheckSquare size={16} /> <span className="desempenho-tab-label">Tarefas</span>
              </button>
            </div>
          </div>

          {casaisOrdenados.length === 0 ? (
            <div className="glass-effect desempenho-no-alunos">
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
                      className="glass-effect desempenho-card"
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
                      <div className="desempenho-casal-info">
                        <h3 className="desempenho-casal-name">{c.nomeEle} & {c.nomeEla}</h3>
                      </div>
                      <div className="desempenho-pontos">
                        {pontos}
                        <span className="desempenho-pts-label">pts</span>
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
        <div className="desempenho-photo-overlay" onClick={() => setFotoAmpliada(null)}>
          <div className="desempenho-photo-container" onClick={e => e.stopPropagation()}>
            {fotoAmpliada.fotoUrl ? (
              <img src={fotoAmpliada.fotoUrl} alt={`${fotoAmpliada.nomeEle} e ${fotoAmpliada.nomeEla}`}
                className="desempenho-photo" />
            ) : (
              <AvatarCasado nomeEle={fotoAmpliada.nomeEle} nomeEla={fotoAmpliada.nomeEla} size={120} />
            )}
            <p className="desempenho-photo-caption">
              {fotoAmpliada.nomeEle} & {fotoAmpliada.nomeEla}
            </p>
            <button onClick={() => setFotoAmpliada(null)} className="desempenho-photo-close">Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}
