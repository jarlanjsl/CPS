import { useCallback, useEffect, useState } from 'react';
import { dbService, type Vitamina } from '../services/db';
import { AlertCircle, Check, LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import '../styles/vitaminas-section.css';

interface VitaminasSectionProps {
  turmaId: string;
}

// Semanas do curso (1 a 14) — mesmo range usado em TurmaDetail/Acompanhamento.
const TOTAL_SEMANAS = 14;
const SEMANAS = Array.from({ length: TOTAL_SEMANAS }, (_, i) => i + 1);

// Estilo compartilhado do overlay dos modais (mesmo padrão do TurmaDetail).
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1.5rem'
};

const modalCloseBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'transparent',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer'
};

export default function VitaminasSection({ turmaId }: VitaminasSectionProps) {
  const [vitaminas, setVitaminas] = useState<Vitamina[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);

  // Modal Novo/Editar
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formDescricao, setFormDescricao] = useState('');

  // Modal Excluir
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteNome, setDeleteNome] = useState('');

  // Toast de feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    // Auto-oculta após 3s
    window.setTimeout(() => setToast(null), 3000);
  };

  const carregar = useCallback(async () => {
    setLoading(true);
    const lista = await dbService.getVitaminas(turmaId);
    setVitaminas(lista);
    setLoading(false);
  }, [turmaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNovo = () => {
    setEditandoId(null);
    setFormNome('');
    setFormDescricao('');
    setIsFormOpen(true);
  };

  const abrirEditar = (v: Vitamina) => {
    setEditandoId(v.id);
    setFormNome(v.nome);
    setFormDescricao(v.descricao);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) return;

    setProcessando(true);
    if (editandoId) {
      const ok = await dbService.updateVitamina(turmaId, editandoId, {
        nome: formNome.trim(),
        descricao: formDescricao.trim()
      });
      if (ok) {
        showToast('success', 'Vitamina atualizada com sucesso!');
        setIsFormOpen(false);
        carregar();
      } else {
        showToast('error', 'Erro ao atualizar vitamina.');
      }
    } else {
      const ok = await dbService.addVitamina(turmaId, formNome.trim(), formDescricao.trim());
      if (ok) {
        showToast('success', 'Vitamina cadastrada com sucesso!');
        setIsFormOpen(false);
        carregar();
      } else {
        showToast('error', 'Erro ao cadastrar vitamina.');
      }
    }
    setProcessando(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setProcessando(true);
    const ok = await dbService.deleteVitamina(turmaId, deleteId);
    setProcessando(false);
    if (ok) {
      showToast('success', 'Vitamina excluída.');
      setIsDeleteOpen(false);
      carregar();
    } else {
      showToast('error', 'Erro ao excluir vitamina.');
    }
  };

  // Toggle de semana com atualização otimista — reverte se falhar.
  const toggleSemana = async (v: Vitamina, semana: number) => {
    const tem = v.semanas.includes(semana);
    const novas = tem
      ? v.semanas.filter((s) => s !== semana)
      : [...v.semanas, semana].sort((a, b) => a - b);

    const anteriores = v.semanas;
    setVitaminas((prev) =>
      prev.map((item) => (item.id === v.id ? { ...item, semanas: novas } : item))
    );

    const ok = await dbService.setVitaminaSemanas(turmaId, v.id, novas);
    if (!ok) {
      setVitaminas((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, semanas: anteriores } : item))
      );
      showToast('error', 'Erro ao atualizar semana da vitamina.');
    }
  };

  return (
    <div className="vitaminas-section">
      <div className="vitaminas-section__header">
        <h3 className="vitaminas-section__title">Vitaminas da Semana</h3>
        <button
          onClick={abrirNovo}
          className="btn-primary"
          style={{
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          <Plus size={16} />
          Nova Vitamina
        </button>
      </div>

      <div className="glass-effect">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <LoaderCircle size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : vitaminas.length === 0 ? (
          <div className="vitaminas-section__empty">
            Nenhuma vitamina cadastrada. Clique em &ldquo;Nova Vitamina&rdquo; para começar.
          </div>
        ) : (
          <div className="vitaminas-section__list">
            {vitaminas.map((v) => (
              <div key={v.id} className="vitamina-card">
                <div className="vitamina-card__top">
                  <div className="vitamina-card__info">
                    <div className="vitamina-card__nome">{v.nome}</div>
                    {v.descricao && (
                      <div className="vitamina-card__descricao">{v.descricao}</div>
                    )}
                  </div>
                  <div className="vitamina-card__actions">
                    <button
                      className="vitamina-card__action-btn"
                      onClick={() => abrirEditar(v)}
                      title="Editar vitamina"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="vitamina-card__action-btn vitamina-card__action-btn--danger"
                      onClick={() => {
                        setDeleteId(v.id);
                        setDeleteNome(v.nome);
                        setIsDeleteOpen(true);
                      }}
                      title="Excluir vitamina"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="vitamina-semanas">
                  <span className="vitamina-semanas__label">
                    Semanas ativas (1-{TOTAL_SEMANAS}):
                  </span>
                  <div className="vitamina-semanas__chips">
                    {SEMANAS.map((sem) => (
                      <button
                        key={sem}
                        type="button"
                        className={`vitamina-semana-chip${
                          v.semanas.includes(sem) ? ' vitamina-semana-chip--active' : ''
                        }`}
                        onClick={() => toggleSemana(v, sem)}
                        title={
                          v.semanas.includes(sem)
                            ? `Remover da semana ${sem}`
                            : `Ativar na semana ${sem}`
                        }
                      >
                        {sem}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: NOVA / EDITAR VITAMINA */}
      {isFormOpen && (
        <div style={modalOverlayStyle}>
          <form
            className="glass-effect"
            onSubmit={handleSubmit}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              style={modalCloseBtnStyle}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>
              {editandoId ? 'Editar Vitamina' : 'Nova Vitamina'}
            </h2>
            <input
              className="vitamina-modal-field"
              autoFocus
              placeholder="Nome (Ex: Vitamina A — Leitura)"
              value={formNome}
              onChange={(e) => setFormNome(e.target.value)}
            />
            <textarea
              className="vitamina-modal-field vitamina-modal-textarea"
              placeholder="Descrição / desafio da vitamina"
              value={formDescricao}
              onChange={(e) => setFormDescricao(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={processando || !formNome.trim()}
            >
              {processando ? (
                <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                'Salvar'
              )}
            </button>
          </form>
        </div>
      )}

      {/* MODAL: EXCLUIR VITAMINA */}
      {isDeleteOpen && (
        <div style={modalOverlayStyle}>
          <div
            className="glass-effect"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              style={modalCloseBtnStyle}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginTop: 0, color: '#ef4444' }}>
              Excluir Vitamina
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Tem certeza que deseja excluir a vitamina <strong>{deleteNome}</strong>? Esta ação
              não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={processando}
                style={{
                  flex: 1,
                  background: 'rgba(100, 116, 139, 0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-muted)',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={processando}
                style={{
                  flex: 1,
                  background: 'var(--danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontFamily: 'inherit'
                }}
              >
                {processando ? (
                  <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <Trash2 size={18} />
                    Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST DE FEEDBACK */}
      {toast && (
        <div className={`vitamina-toast vitamina-toast--${toast.type}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
