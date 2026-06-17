import { useParams, Link, useNavigate } from 'react-router-dom';
import { dbService, type Casal, type SemanaCheck, type SorteioVitaminas } from '../services/db';
import { useState, useEffect } from 'react';
import { LoaderCircle, Leaf, Check } from 'lucide-react';

export default function Acompanhamento() {
  const { id, semanaId } = useParams();
  const navigate = useNavigate();
  const [casais, setCasais] = useState<Casal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dataSemana, setDataSemana] = useState<string>('');

  // Checks do fluxo "Salvar" (presença, tarefas, tarefasExtras).
  // HU-27: sorteioVitaminas NÃO vive aqui — é gravado em tempo real via
  // saveVitaminaCheck e mantido num espelho à parte (sorteio).
  const [checks, setChecks] = useState<Record<string, SemanaCheck>>({});

  // Espelho local do sorteioVitaminas por casal (atualizado otimista em tempo real).
  const [sorteio, setSorteio] = useState<Record<string, SorteioVitaminas | undefined>>({});
  // Marca qual check de vitamina está sendo persistido ("casalId:pessoa").
  const [savingVitamina, setSavingVitamina] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
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

      // Povoando state com as escolhas antigas que possam estar no Firebase (Idempotência).
      // Os checks de vitamina (sorteioVitaminas) são carregados num espelho à parte
      // porque seguem fluxo real-time, distinto do botão "Salvar".
      const semanaKey = semanaId || '1';
      const initialChecks: Record<string, SemanaCheck> = {};
      const initialSorteio: Record<string, SorteioVitaminas | undefined> = {};
      res.forEach(c => {
        const sem = c.semanas?.[semanaKey];
        initialChecks[c.id] = {
          presenca: sem?.presenca ?? false,
          tarefas: sem?.tarefas ?? false,
          tarefasExtras: sem?.tarefasExtras ?? false
        };
        initialSorteio[c.id] = sem?.sorteioVitaminas;
      });
      setChecks(initialChecks);
      setSorteio(initialSorteio);
      setLoading(false);
    });
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

  // HU-27: toggle real-time do check individual da vitamina (Ele ✅ / Ela ✅).
  // Atualiza o espelho local otimista e persiste imediatamente via saveVitaminaCheck.
  const toggleVitaminaCheck = async (casalId: string, pessoa: 'ele' | 'ela') => {
    const atual = sorteio[casalId];
    if (!atual) return;
    const item = atual[pessoa];
    if (!item) return;

    const novoChecked = !item.check;
    const chave = `${casalId}:${pessoa}`;

    // Espelho otimista
    const novoSorteio: SorteioVitaminas = { ...atual };
    novoSorteio[pessoa] = { ...item, check: novoChecked };
    setSorteio(prev => ({ ...prev, [casalId]: novoSorteio }));

    setSavingVitamina(chave);
    try {
      const ok = await dbService.saveVitaminaCheck(casalId, semanaId || '1', pessoa, novoChecked);
      if (!ok) {
        // Reverte espelho — não havia vitamina sorteada para checkar
        const revertido: SorteioVitaminas = { ...atual };
        revertido[pessoa] = { ...item, check: !novoChecked };
        setSorteio(prev => ({ ...prev, [casalId]: revertido }));
        alert('Não há vitamina sorteada para este casal nesta semana.');
      }
    } catch {
      const revertido: SorteioVitaminas = { ...atual };
      revertido[pessoa] = { ...item, check: !novoChecked };
      setSorteio(prev => ({ ...prev, [casalId]: revertido }));
      alert('Erro ao salvar o check da vitamina.');
    } finally {
      setSavingVitamina(null);
    }
  };

  const salvar = async () => {
    setSaving(true);
    try {
      // Para cada casal mapeado, gravar o checklist definitivo daquela semana usando dbService.
      // saveChecklist faz merge preservando o sorteioVitaminas gravado em tempo real.
      for (const casalId in checks) {
        await dbService.saveChecklist(casalId, semanaId || '1', checks[casalId]);
      }
      alert('Sincronizado! O desempenho de todos os casais foi calculado globalmente.');
      navigate(`/turma/${id}`);
    } catch {
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
        {casais.map(c => {
          const sorteioCasal = sorteio[c.id];
          const temSorteio = !!sorteioCasal && (!!sorteioCasal.ele || !!sorteioCasal.ela);
          return (
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

                {/* HU-27: Vitaminas Sorteadas — checks individuais Ele/Ela em tempo real */}
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '12px', padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                    <Leaf size={18} />
                    <span style={{ fontSize: '0.95rem' }}>Vitaminas Sorteadas</span>
                  </div>

                  {temSorteio ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(['ele', 'ela'] as const).map(p => {
                        const item = sorteioCasal?.[p];
                        if (!item) return null;
                        const chave = `${c.id}:${p}`;
                        const emProgresso = savingVitamina === chave;
                        return (
                          <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: emProgresso ? 'wait' : 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={item.check}
                              disabled={emProgresso}
                              onChange={() => toggleVitaminaCheck(c.id, p)}
                              style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-light)' }}
                            />
                            <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <strong style={{ color: 'var(--text-main)' }}>{p === 'ele' ? c.nomeEle : c.nomeEla}</strong>
                              <span style={{ color: 'var(--text-muted)' }}>·</span>
                              <span style={{ color: 'var(--text-muted)' }}>{item.nome}</span>
                              {item.check && <Check size={15} style={{ color: 'var(--success)' }} />}
                            </span>
                          </label>
                        );
                      })}
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                        Cada check vale 1 pt (máx. 2 pts/semana). Salvo automaticamente.
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                      Sem vitamina sorteada para esta semana. Vá à tela da turma para sortear.
                    </p>
                  )}
                </div>

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
                    style={{ width: '1.2rem', height: '1.2rem', accentColor: '#fbbf24' }}
                  />
                  <span style={{ fontSize: '1.1rem', color: '#fbbf24', fontWeight: 600 }}>Tarefa Extra (+1pt)</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
