import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { dbService, type HistoricoVitaminasItem } from '../services/db';
import { LoaderCircle, ArrowLeft, Pill } from 'lucide-react';
import '../styles/home.css';
import '../styles/minhas-vitaminas.css';

type StatusVit = HistoricoVitaminasItem['statusEle'];

// Mapeia o status para a classe CSS do badge
const classeBadge = (status: StatusVit): string => {
  switch (status) {
    case 'CUMPRIDA': return 'mv-badge mv-badge--cumprida';
    case 'PENDENTE': return 'mv-badge mv-badge--pendente';
    case 'NAO_SORTEADA': return 'mv-badge mv-badge--nao-sortada';
  }
};

// Mapeia o status para o texto exibido no badge
const textoStatus = (status: StatusVit): string => {
  switch (status) {
    case 'CUMPRIDA': return 'Cumprida';
    case 'PENDENTE': return 'Pendente';
    case 'NAO_SORTEADA': return 'Não sorteada';
  }
};

// Formata uma string de data (ISO ou personalizada) em dd/mm/yyyy
const formatarData = (data: string | null): string => {
  if (!data) return 'Sem data';
  const d = new Date(data);
  if (isNaN(d.getTime())) return 'Sem data';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function MinhasVitaminas() {
  const { casalId } = useParams<{ casalId: string }>();
  const navigate = useNavigate();
  const [historico, setHistorico] = useState<HistoricoVitaminasItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!casalId) {
      setLoading(false);
      return;
    }
    dbService.getHistoricoVitaminas(casalId).then(res => {
      setHistorico(res);
      setLoading(false);
    });
  }, [casalId]);

  return (
    <div className="page-container">
      <header className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: 0, fontFamily: 'inherit' }}
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Pill size={24} style={{ color: 'var(--primary-light)' }} />
          <h1 style={{ margin: 0, color: 'var(--text-main)' }}>Minhas Vitaminas</h1>
        </div>
      </header>

      {loading ? (
        <div className="mv-loading">
          <LoaderCircle size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
        </div>
      ) : historico.length === 0 ? (
        <div className="mv-empty">Nenhuma vitamina sorteada ainda.</div>
      ) : (
        <div className="mv-list">
          {historico.map(item => (
            <div key={item.semana} className="glass-effect mv-item">
              <div className="mv-item__header">
                <span className="mv-item__semana">Semana {item.semana}</span>
                <span className="mv-item__data">{formatarData(item.data)}</span>
              </div>

              <div className="mv-pessoa">
                <div className="mv-pessoa__info">
                  <span className="mv-pessoa__label">Ele:</span>
                  <span className={item.vitaminaEle ? 'mv-pessoa__vitamina' : 'mv-pessoa__vitamina mv-pessoa__vitamina--vazia'}>
                    {item.vitaminaEle ?? 'Não sorteada'}
                  </span>
                </div>
                <span className={classeBadge(item.statusEle)}>{textoStatus(item.statusEle)}</span>
              </div>

              <div className="mv-pessoa">
                <div className="mv-pessoa__info">
                  <span className="mv-pessoa__label">Ela:</span>
                  <span className={item.vitaminaEla ? 'mv-pessoa__vitamina' : 'mv-pessoa__vitamina mv-pessoa__vitamina--vazia'}>
                    {item.vitaminaEla ?? 'Não sorteada'}
                  </span>
                </div>
                <span className={classeBadge(item.statusEla)}>{textoStatus(item.statusEla)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
