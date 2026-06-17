import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Dices, LoaderCircle, RefreshCw, Sparkles, X } from 'lucide-react';
import { dbService, type Casal, type Vitamina } from '../services/db';
import RoletaVitaminas from './RoletaVitaminas';
import '../styles/roleta-vitaminas.css';

interface SorteioVitaminasModalProps {
  turmaId: string;
  semanaId: number;
  casais: Casal[];
  onClose: () => void;
}

export default function SorteioVitaminasModal({ turmaId, semanaId, casais, onClose }: SorteioVitaminasModalProps) {
  // Apenas casais ALUNO são sorteados (líderes/co-líderes não pontuam)
  const casaisAlunos = casais.filter((c) => c.tipo === 'ALUNO');

  const [casalSelecionado, setCasalSelecionado] = useState<string>(casaisAlunos[0]?.id || '');
  const [vitaminas, setVitaminas] = useState<Vitamina[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [girando, setGirando] = useState(false);
  const [giroKey, setGiroKey] = useState(0);
  const [resultadoEle, setResultadoEle] = useState<Vitamina | null>(null);
  const [resultadoEla, setResultadoEla] = useState<Vitamina | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Carrega as vitaminas ativas da semana ao abrir o modal
  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    dbService.getVitaminasDaSemana(turmaId, semanaId).then((lista) => {
      if (!ativo) return;
      setVitaminas(lista);
      setCarregando(false);
    });
    return () => { ativo = false; };
  }, [turmaId, semanaId]);

  // Toast auto-descartável
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Quando ambas as roletas param, dispara confete + persiste o sorteio
  useEffect(() => {
    if (!resultadoEle || !resultadoEla || !girando) return;

    setGirando(false);
    disparaConfete();

    (async () => {
      setSalvando(true);
      const ok = await dbService.sortearVitaminas(
        casalSelecionado,
        String(semanaId),
        resultadoEle,
        resultadoEla
      );
      setSalvando(false);
      if (ok) {
        setSalvo(true);
        setToast('Vitaminas sorteadas e salvas!');
      } else {
        setToast('Erro ao salvar o sorteio. Tente novamente.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultadoEle, resultadoEla, girando]);

  const disparaConfete = () => {
    const cores = ['#6366f1', '#818cf8', '#10b981', '#fbbf24', '#f472b6'];
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 }, colors: cores });
    setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 }, colors: cores }), 220);
  };

  const iniciarGiro = () => {
    if (!casalSelecionado || vitaminas.length === 0) return;
    setResultadoEle(null);
    setResultadoEla(null);
    setSalvo(false);
    setToast(null);
    setGiroKey((k) => k + 1); // remonta as roletas (reset de estado)
    setGirando(true);
  };

  const sortearNovamente = () => {
    if (window.confirm('Deseja sortear novamente? O sorteio atual será substituído.')) {
      iniciarGiro();
    }
  };

  const bloqueado = girando || salvando;
  const semVitaminas = !carregando && vitaminas.length === 0;

  return (
    <div className="sorteio-modal-overlay" onClick={() => !bloqueado && onClose()}>
      <div className="glass-effect sorteio-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="sorteio-modal-close"
          onClick={() => !bloqueado && onClose()}
          title="Fechar"
        >
          <X size={24} />
        </button>

        <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} style={{ color: 'var(--primary-light)' }} />
          Sorteio de Vitaminas — Semana {semanaId}
        </h2>

        {carregando && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <LoaderCircle size={28} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {semVitaminas && (
          <div className="sorteio-empty">
            Nenhuma vitamina configurada para esta semana.
          </div>
        )}

        {!carregando && !semVitaminas && (
          <>
            {casaisAlunos.length === 0 ? (
              <div className="sorteio-empty">
                Não há casais alunos nesta turma para sortear.
              </div>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="sorteio-casal"
                    style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}
                  >
                    Casal
                  </label>
                  <select
                    id="sorteio-casal"
                    className="sorteio-select"
                    value={casalSelecionado}
                    onChange={(e) => setCasalSelecionado(e.target.value)}
                    disabled={bloqueado || salvo}
                  >
                    {casaisAlunos.map((c) => (
                      <option key={c.id} value={c.id} style={{ color: 'black' }}>
                        {c.nomeEle} & {c.nomeEla}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sorteio-roletas">
                  <div className="sorteio-roleta-col">
                    <span className="sorteiro-roleta-titulo"> Ele</span>
                    <RoletaVitaminas
                      key={`ele-${giroKey}`}
                      vitaminas={vitaminas}
                      girando={girando}
                      onResult={(v) => setResultadoEle(v)}
                    />
                    <ResultadoCard vencedor={resultadoEle} girando={girando} />
                  </div>

                  <div className="sorteio-roleta-col">
                    <span className="sorteiro-roleta-titulo"> Ela</span>
                    <RoletaVitaminas
                      key={`ela-${giroKey}`}
                      vitaminas={vitaminas}
                      girando={girando}
                      onResult={(v) => setResultadoEla(v)}
                    />
                    <ResultadoCard vencedor={resultadoEla} girando={girando} />
                  </div>
                </div>

                <div className="sorteio-actions">
                  {salvo ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={sortearNovamente}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem' }}
                    >
                      <RefreshCw size={18} />
                      Sortear Novamente
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={iniciarGiro}
                      disabled={bloqueado || !casalSelecionado}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem' }}
                    >
                      {girando ? (
                        <LoaderCircle size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Dices size={18} />
                      )}
                      {girando ? 'Girando...' : 'Girar Roleta'}
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {toast && (
        <div className="sorteio-toast">
          <Sparkles size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

// Card de resultado (vencedor) abaixo de cada roleta
function ResultadoCard({ vencedor, girando }: { vencedor: Vitamina | null; girando: boolean }) {
  if (girando) {
    return <div className="sorteio-resultado-card placeholder">Girando...</div>;
  }
  if (!vencedor) {
    return <div className="sorteio-resultado-card placeholder">Aguardando sorteio</div>;
  }
  return (
    <div className="sorteio-resultado-card is-vencedor">
      <div className="sorteio-resultado-nome">{vencedor.nome}</div>
      {vencedor.descricao && <div className="sorteio-resultado-desc">{vencedor.descricao}</div>}
    </div>
  );
}
