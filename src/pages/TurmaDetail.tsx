import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { dbService, type Casal, type Turma } from '../services/db';
import { storageService } from '../services/storage';
import AvatarCasado from '../components/AvatarCasado';
import VitaminasSection from '../components/VitaminasSection';
import SorteioVitaminasModal from '../components/SorteioVitaminasModal';
import { LoaderCircle, Pencil, Plus, X, Trash2, Camera, Dices, History } from 'lucide-react';
import '../styles/home.css';
import '../styles/turma-detail.css';

export default function TurmaDetail() {
  const { id } = useParams();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [casais, setCasais] = useState<Casal[]>([]);
  const [loading, setLoading] = useState(true);

  // States para Edição de Turma
  const [isEditTurmaOpen, setIsEditTurmaOpen] = useState(false);
  const [novoNomeTurma, setNovoNomeTurma] = useState('');
  const [novaDataInicio, setNovaDataInicio] = useState('');

  // States para Exclusão de Turma
  const [isDeleteTurmaOpen, setIsDeleteTurmaOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');

  // States para Concluir/Reabrir Turma
  const [isConcluirTurmaOpen, setIsConcluirTurmaOpen] = useState(false);

  // States para Edição de Data da Lição
  const [isEditSemanaOpen, setIsEditSemanaOpen] = useState(false);
  const [semanaEditando, setSemanaEditando] = useState<number | null>(null);
  const [novaDataSemana, setNovaDataSemana] = useState('');

  // State para Sorteio de Vitaminas (Roleta) — HU-25
  const [semanaSorteio, setSemanaSorteio] = useState<number | null>(null);

  // States para Novo Membro
  const [isAddCasalOpen, setIsAddCasalOpen] = useState(false);
  const [nomeEle, setNomeEle] = useState('');
  const [nomeEla, setNomeEla] = useState('');
  const [casalTipo, setCasalTipo] = useState<'LIDER' | 'ALUNO'>('ALUNO');
  const [processando, setProcessando] = useState(false);

  // States para Edição de Casal
  const [isEditCasalOpen, setIsEditCasalOpen] = useState(false);
  const [editCasalId, setEditCasalId] = useState('');
  const [editNomeEle, setEditNomeEle] = useState('');
  const [editNomeEla, setEditNomeEla] = useState('');
  const [editCasalTipo, setEditCasalTipo] = useState<'LIDER' | 'CO-LIDER' | 'ALUNO'>('ALUNO');

  // States para Foto do Casal
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // States para Exclusão de Casal
  const [isDeleteCasalOpen, setIsDeleteCasalOpen] = useState(false);
  const [deleteCasalId, setDeleteCasalId] = useState('');
  const [deleteCasalNome, setDeleteCasalNome] = useState('');
  const [deleteCasalTipo, setDeleteCasalTipo] = useState<'LIDER' | 'CO-LIDER' | 'ALUNO'>('ALUNO');
  const [confirmDeleteCasalText, setConfirmDeleteCasalText] = useState('');

  const carregarDados = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      dbService.getTurmas(),
      dbService.getCasais(id)
    ]).then(([todasTurmas, todosCasais]) => {
      const encontrada = todasTurmas.find(t => t.id === id);
      setTurma(encontrada || null);
      setNovoNomeTurma(encontrada?.nome || '');
      setNovaDataInicio(encontrada?.dataInicio ? encontrada.dataInicio.split('T')[0] : '');
      setCasais(todosCasais);
      setLoading(false);
    });
  };

  useEffect(() => {
    carregarDados();
  }, [id]);

  const handleEditTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !novoNomeTurma.trim()) return;
    
    setProcessando(true);
    const ok = await dbService.updateTurma(id, novoNomeTurma, novaDataInicio || undefined);
    setProcessando(false);
    if (ok) {
      setIsEditTurmaOpen(false);
      carregarDados();
    } else {
      alert("Erro ao editar turma.");
    }
  };

  const handleDeleteTurma = async () => {
    if (!id || confirmDeleteText !== 'Excluir') return;
    
    setProcessando(true);
    const ok = await dbService.deleteTurma(id);
    setProcessando(false);
    if (ok) {
      alert('Turma excluída com sucesso!');
      window.location.href = '/';
    } else {
      alert("Erro ao excluir turma.");
    }
  };

  const handleToggleConcluirTurma = async () => {
    if (!id || !turma) return;
    
    setProcessando(true);
    const ok = await dbService.toggleTurmaConcluida(id, !turma.concluida);
    setProcessando(false);
    if (ok) {
      setIsConcluirTurmaOpen(false);
      carregarDados();
    } else {
      alert("Erro ao atualizar status da turma.");
    }
  };

  const handleEditSemanaData = async (semana: number, dataPersonalizada?: string) => {
    if (!id) return;
    
    setProcessando(true);
    const ok = await dbService.updateSemanaData(id, semana, dataPersonalizada);
    setProcessando(false);
    if (ok) {
      setIsEditSemanaOpen(false);
      carregarDados();
    } else {
      alert("Erro ao editar data da lição.");
    }
  };

  const handleCreateCasal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !nomeEle.trim() || !nomeEla.trim()) return;

    setProcessando(true);
    const { success, error, id: casalId } = await dbService.createCasal(id, nomeEle, nomeEla, casalTipo);

    if (success && casalId) {
      if (fotoFile) {
        setUploading(true);
        try {
          const downloadURL = await storageService.uploadFotoCasal(casalId, fotoFile, setUploadProgress);
          if (downloadURL) {
            await dbService.updateCasalFotoUrl(casalId, downloadURL);
          }
        } catch (err) {
          console.error('Erro no upload da foto:', err);
        }
        setUploading(false);
      }
      setIsAddCasalOpen(false);
      setNomeEle('');
      setNomeEla('');
      setFotoFile(null);
      setFotoPreview('');
      setUploadProgress(0);
      carregarDados();
    } else {
      alert(error || "Erro ao cadastrar membros.");
    }
    setProcessando(false);
  };

  const handleFotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.');
      e.target.value = '';
      return;
    }

    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleEditCasal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCasalId || !editNomeEle.trim() || !editNomeEla.trim()) return;

    setProcessando(true);
    const { success, error } = await dbService.updateCasal(editCasalId, {
      nomeEle: editNomeEle,
      nomeEla: editNomeEla,
      tipo: editCasalTipo
    });
    setProcessando(false);
    if (success) {
      setIsEditCasalOpen(false);
      carregarDados();
    } else {
      alert(error || "Erro ao editar casal.");
    }
  };

  const handleDeleteCasal = async () => {
    if (!deleteCasalId || confirmDeleteCasalText !== 'Excluir') return;

    setProcessando(true);
    const ok = await dbService.deleteCasal(deleteCasalId);
    setProcessando(false);
    if (ok) {
      setIsDeleteCasalOpen(false);
      setConfirmDeleteCasalText('');
      carregarDados();
    } else {
      alert("Erro ao excluir casal.");
    }
  };

  // Calcular data de cada semana baseado na data de início
  const calcularDataSemana = (semana: number): string => {
    if (!turma?.dataInicio) return '';
    
    // Verifica se há uma data personalizada para esta semana
    if (turma.datasSemanas && turma.datasSemanas[semana]) {
      return new Date(turma.datasSemanas[semana]).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    
    const dataInicio = new Date(turma.dataInicio);
    const diasParaAdicionar = (semana - 1) * 7;
    const novaData = new Date(dataInicio);
    novaData.setDate(novaData.getDate() + diasParaAdicionar);
    
    return novaData.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Formatar data para input type="date"
  const formatarDataInput = (dataStr: string): string => {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    const offset = data.getTimezoneOffset();
    const dataUTC = new Date(data.getTime() - (offset * 60 * 1000));
    return dataUTC.toISOString().split('T')[0];
  };

  // Gerador de array [1..14]
  const semanas = Array.from({ length: 14 }, (_, i) => i + 1);

  if (loading && !turma) return <div className="page-container turma-loading"><LoaderCircle size={32} className="spinner" /></div>;
  if (!turma) return <div className="page-container">Turma não encontrada no banco.</div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <Link to="/" className="turma-back-link">
            ← Voltar
          </Link>
          <div className="turma-name-row">
            <h1 className="turma-name">{turma.nome}</h1>
            <button onClick={() => setIsEditTurmaOpen(true)} className="turma-edit-btn">
              <Pencil size={18} />
            </button>
          </div>
          {turma.concluida ? (
            <button 
              onClick={() => setIsConcluirTurmaOpen(true)} 
              className="btn-primary btn-reabrir"
            >
              Reabrir Turma
            </button>
          ) : (
            <button 
              onClick={() => setIsConcluirTurmaOpen(true)} 
              className="btn-primary btn-concluir"
            >
              Concluir Turma
            </button>
          )}
        </div>
      </header>

      <div className="turma-section">
        <div className="turma-section-header">
          <h3 className="turma-section-title">Membros</h3>
          <button onClick={() => setIsAddCasalOpen(true)} className="btn-primary turma-add-btn">
            <Plus size={16} />
            Cadastrar
          </button>
        </div>

        <div className="glass-effect turma-casais-container">
          {casais.map((c) => (
            <div key={c.id} className="turma-casal-item">
              <div className="turma-casal-info">
                <div className="turma-avatar-wrapper">
                  <AvatarCasado nomeEle={c.nomeEle} nomeEla={c.nomeEla} fotoUrl={c.fotoUrl} size={40}
                    onClick={() => {
                      document.getElementById(`foto-input-${c.id}`)?.click();
                    }}
                  />
                  {c.fotoUrl && (
                    <button
                      onClick={async () => {
                        const ok = await storageService.deleteFotoCasal(c.id);
                        if (ok) {
                          await dbService.updateCasalFotoUrl(c.id, '');
                          carregarDados();
                        }
                      }}
                      className="turma-remove-photo-btn"
                      title="Remover foto"
                    >
                      <X size={10} />
                    </button>
                  )}
                  <input id={`foto-input-${c.id}`} type="file" accept="image/*"
                    className="hidden-input"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Arquivo muito grande. Máximo 5MB.');
                        e.target.value = '';
                        return;
                      }
                      try {
                        const downloadURL = await storageService.uploadFotoCasal(c.id, file);
                        if (downloadURL) {
                          await dbService.updateCasalFotoUrl(c.id, downloadURL);
                          carregarDados();
                        }
                      } catch (err) {
                        console.error('Erro ao alterar foto:', err);
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
                <div>
                  <div className="turma-casal-names">{c.nomeEle} & {c.nomeEla}</div>
                  {c.tipo === 'LIDER' && <span className="turma-tipo-lider">Líder</span>}
                  {c.tipo === 'CO-LIDER' && <span className="turma-tipo-colider">Co-Líder</span>}
                  {c.tipo === 'ALUNO' && <span className="turma-tipo-aluno">Aluno</span>}
                </div>
                <button
                  onClick={() => {
                    setEditCasalId(c.id);
                    setEditNomeEle(c.nomeEle);
                    setEditNomeEla(c.nomeEla);
                    setEditCasalTipo(c.tipo);
                    setIsEditCasalOpen(true);
                  }}
                  className="turma-icon-btn"
                  title="Editar casal"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    setDeleteCasalId(c.id);
                    setDeleteCasalNome(`${c.nomeEle} & ${c.nomeEla}`);
                    setDeleteCasalTipo(c.tipo);
                    setConfirmDeleteCasalText('');
                    setIsDeleteCasalOpen(true);
                  }}
                  className="turma-icon-btn"
                  title="Excluir casal"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="turma-casal-pontos">
                <span className="turma-pontos-label">Pontos</span>
                <span className="turma-pontos-value">{c.pontuacaoTotal}</span>
                <Link
                  to={`/aluno/${c.id}/vitaminas`}
                  className="turma-vitaminas-link"
                  title="Ver histórico de vitaminas do casal"
                >
                  <History size={13} />
                  Histórico de Vitaminas
                </Link>
              </div>
            </div>
          ))}
          {casais.length === 0 && (
             <div className="turma-casais-empty">Sem casais na turma</div>
          )}
        </div>
      </div>

      {/* HU-26: Seção editável de Vitaminas da Semana */}
      {id && <VitaminasSection turmaId={id} />}

      <div className="turma-semanas-section">
        <h3 className="turma-semanas-title">Acompanhamento (Semanas)</h3>
        <p className="turma-semanas-desc">
          Selecione a lição da semana do curso para preencher.
          {turma.dataInicio && (
            <span className="turma-data-inicio">
              <strong>Data de início:</strong> {new Date(turma.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          )}
        </p>
        
        <div className="turma-semanas-grid">
          {semanas.map(sem => {
            const dataSemana = calcularDataSemana(sem);
            return (
              <div key={sem} className="turma-semana-item">
                <Link 
                  to={`/turma/${id}/semana/${sem}`} 
                  className="btn-primary turma-semana-link"
                >
                  <div className="turma-semana-num">Lição {sem}</div>
                  <div className="turma-semana-data">{dataSemana}</div>
                </Link>
                <button
                  onClick={() => setSemanaSorteio(sem)}
                  className="turma-roleta-btn"
                  title="Sortear vitaminas desta semana"
                >
                  <Dices size={13} />
                  Girar Roleta
                </button>
                <button
                  onClick={() => {
                    setSemanaEditando(sem);
                    setNovaDataSemana(formatarDataInput(new Date(new Date(turma.dataInicio!).getTime() + (sem - 1) * 7 * 24 * 60 * 60 * 1000).toISOString()));
                    setIsEditSemanaOpen(true);
                  }}
                  className="turma-edit-semana-btn"
                  title="Editar data desta lição"
                >
                  <Pencil size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: EDITAR TURMA */}
      {isEditTurmaOpen && (
        <div className="modal-overlay">
          <form className="glass-effect modal-form--lg" onSubmit={handleEditTurma}>
            <button type="button" onClick={() => setIsEditTurmaOpen(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h2 className="modal-title">Editar Turma</h2>
            <input 
              autoFocus placeholder="Novo nome da turma" value={novoNomeTurma} onChange={e => setNovoNomeTurma(e.target.value)}
              className="glass-input"
            />
            <div>
              <label className="modal-label">Data de Início</label>
              <input 
                type="date" value={novaDataInicio} onChange={e => setNovaDataInicio(e.target.value)}
                className="glass-input glass-input--full"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={processando || !novoNomeTurma.trim()}>
              {processando ? <LoaderCircle size={20} className="spinner" /> : 'Salvar'}
            </button>
            <button 
              type="button" 
              onClick={() => { setIsEditTurmaOpen(false); setIsDeleteTurmaOpen(true); }}
              className="btn-delete"
            >
              <Trash2 size={20} />
              Excluir Turma
            </button>
          </form>
        </div>
      )}

      {/* MODAL: EXCLUIR TURMA */}
      {isDeleteTurmaOpen && (
        <div className="modal-overlay">
          <div className="glass-effect modal-form--lg">
            <button type="button" onClick={() => setIsDeleteTurmaOpen(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h2 className="modal-title modal-title--danger">Excluir Turma</h2>
            <p className="modal-desc">
              Tem certeza que deseja excluir a turma <strong>{turma.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div>
              <label className="modal-label">
                Digite <strong>"Excluir"</strong> para confirmar:
              </label>
              <input 
                autoFocus
                placeholder="Excluir" 
                value={confirmDeleteText} 
                onChange={e => setConfirmDeleteText(e.target.value)}
                className="glass-input glass-input--full"
              />
            </div>
            <button 
              onClick={handleDeleteTurma}
              disabled={processando || confirmDeleteText !== 'Excluir'}
              style={{ 
                background: confirmDeleteText === 'Excluir' ? 'var(--danger-bg)' : 'rgba(239, 68, 68, 0.3)', 
                border: 'none', 
                color: confirmDeleteText === 'Excluir' ? 'white' : '#94a3b8', 
                padding: '1rem', 
                borderRadius: '8px', 
                fontWeight: 600, 
                cursor: confirmDeleteText === 'Excluir' ? 'pointer' : 'not-allowed',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem' 
              }}
            >
              {processando ? <LoaderCircle size={20} className="spinner" /> : 'Confirmar Exclusão'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR DATA DA LIÇÃO */}
      {isEditSemanaOpen && semanaEditando && (
        <div className="modal-overlay">
          <div className="glass-effect modal-form--lg">
            <button type="button" onClick={() => setIsEditSemanaOpen(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h2 className="modal-title">Editar Data da Lição {semanaEditando}</h2>
            <p className="modal-desc">
              Altere a data desta lição específica. Isso não afetará as outras lições.
            </p>
            <div>
              <label className="modal-label">
                Nova data:
              </label>
              <input 
                type="date" 
                value={novaDataSemana} 
                onChange={e => setNovaDataSemana(e.target.value)}
                className="glass-input glass-input--full"
              />
            </div>
            <div className="modal-btn-row">
              <button 
                type="button"
                onClick={() => {
                  setNovaDataSemana('');
                  handleEditSemanaData(semanaEditando, undefined);
                }}
                disabled={processando}
                className="btn-reset"
              >
                Redefinir
              </button>
              <button 
                onClick={() => handleEditSemanaData(semanaEditando, novaDataSemana)}
                disabled={processando || !novaDataSemana}
                className="btn-primary btn-flex"
              >
                {processando ? <LoaderCircle size={20} className="spinner" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRAR MEMBROS */}
      {isAddCasalOpen && (
        <div className="modal-overlay">
          <form className="glass-effect modal-form" onSubmit={handleCreateCasal}>
            <button type="button" onClick={() => setIsAddCasalOpen(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h2 className="modal-title">Novo Casal</h2>
            
            <input 
              placeholder="Nome dEle (Ex: João)" value={nomeEle} onChange={e => setNomeEle(e.target.value)}
              className="glass-input"
            />
             <input 
              placeholder="Nome dEla (Ex: Maria)" value={nomeEla} onChange={e => setNomeEla(e.target.value)}
              className="glass-input"
            />
             <select 
              value={casalTipo} onChange={e => setCasalTipo(e.target.value as any)}
              className="glass-select"
            >
              <option value="ALUNO">Casal Membro/Aluno</option>
              <option value="LIDER">Casal Líder (Não pontua)</option>
              <option value="CO-LIDER">Casal Co-Líder (Não pontua)</option>
            </select>

            <div className="turma-foto-row">
              <label className="turma-foto-label">
                <Camera size={18} />
                {fotoFile ? fotoFile.name : 'Adicionar foto'}
                <input type="file" accept="image/*" onChange={handleFotoFileChange} className="hidden-input" />
              </label>
              {fotoPreview && (
                <div className="turma-foto-preview-wrapper">
                  <img src={fotoPreview} alt="Preview" width={48} height={48}
                    className="turma-foto-preview" />
                  <button type="button" onClick={() => { setFotoFile(null); setFotoPreview(''); }}
                    className="turma-foto-remove-btn">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary btn-primary--full" disabled={processando || uploading || !nomeEle.trim() || !nomeEla.trim()}>
              {processando || uploading ? <LoaderCircle size={20} className="spinner" /> : 'Adicionar Casal'}
            </button>
            {uploading && (
              <div className="turma-upload-bar">
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'linear-gradient(90deg, var(--primary), var(--primary-light))', transition: 'width 0.3s' }} />
              </div>
            )}
          </form>
        </div>
      )}

      {/* MODAL: CONCLUIR/REABRIR TURMA */}
      {isConcluirTurmaOpen && (
        <div className="modal-overlay">
          <div className="glass-effect modal-form--lg">
            <button type="button" onClick={() => setIsConcluirTurmaOpen(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h2 className="modal-title" style={{ color: turma.concluida ? 'var(--warning)' : 'var(--success)' }}>
              {turma.concluida ? 'Reabrir Turma' : 'Concluir Turma'}
            </h2>
            <p className="modal-desc">
              {turma.concluida 
                ? `Deseja reabrir a turma "${turma.nome}"? Ela voltará a aparecer na seção de turmas ativas.`
                : `Deseja concluir a turma "${turma.nome}"? Ela será movida para a seção de turmas concluídas.`
              }
            </p>
            <div className="modal-btn-row--lg">
              <button 
                onClick={() => setIsConcluirTurmaOpen(false)}
                disabled={processando}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button 
                onClick={handleToggleConcluirTurma}
                disabled={processando}
                className={`btn-confirm ${turma.concluida ? 'btn-confirm--reabrir' : 'btn-confirm--concluir'}`}
              >
                {processando ? <LoaderCircle size={20} className="spinner" /> : (turma.concluida ? 'Sim, Reabrir' : 'Sim, Concluir')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CASAL */}
      {isEditCasalOpen && (
        <div className="modal-overlay">
          <form className="glass-effect modal-form" onSubmit={handleEditCasal}>
            <button type="button" onClick={() => setIsEditCasalOpen(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            <h2 className="modal-title">Editar Casal</h2>
            
            <input 
              autoFocus
              placeholder="Nome dEle" value={editNomeEle} onChange={e => setEditNomeEle(e.target.value)}
              className="glass-input"
            />
             <input 
              placeholder="Nome dEla" value={editNomeEla} onChange={e => setEditNomeEla(e.target.value)}
              className="glass-input"
            />
             <select 
              value={editCasalTipo} onChange={e => setEditCasalTipo(e.target.value as any)}
              className="glass-select"
            >
              <option value="ALUNO">Casal Membro/Aluno</option>
              <option value="LIDER">Casal Líder (Não pontua)</option>
              <option value="CO-LIDER">Casal Co-Líder (Não pontua)</option>
            </select>

            <div className="turma-foto-row">
              <label className="turma-foto-label">
                <Camera size={18} />
                Alterar foto
                <input type="file" accept="image/*" className="hidden-input"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Arquivo muito grande. Máximo 5MB.');
                      e.target.value = '';
                      return;
                    }
                    setProcessando(true);
                    try {
                      const downloadURL = await storageService.uploadFotoCasal(editCasalId, file);
                      if (downloadURL) {
                        await dbService.updateCasalFotoUrl(editCasalId, downloadURL);
                        carregarDados();
                      }
                    } catch (err) {
                      console.error('Erro ao alterar foto:', err);
                    }
                    setProcessando(false);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            <button type="submit" className="btn-primary btn-primary--full" disabled={processando || !editNomeEle.trim() || !editNomeEla.trim()}>
              {processando ? <LoaderCircle size={20} className="spinner" /> : 'Salvar'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL: EXCLUIR CASAL */}
      {isDeleteCasalOpen && (
        <div className="modal-overlay">
          <div className="glass-effect modal-form--lg">
            <button type="button" onClick={() => { setIsDeleteCasalOpen(false); setConfirmDeleteCasalText(''); }} className="modal-close-btn">
              <X size={24} />
            </button>
            <h2 className="modal-title modal-title--danger">Excluir Casal</h2>
            <p className="modal-desc">
              Tem certeza que deseja excluir o casal <strong>{deleteCasalNome}</strong>? Esta ação não pode ser desfeita.
            </p>
            {deleteCasalTipo === 'LIDER' && (
              <p className="modal-warning">
                Atenção: esta turma ficará sem Líder!
              </p>
            )}
            {deleteCasalTipo === 'CO-LIDER' && (
              <p className="modal-warning">
                Atenção: esta turma ficará sem Co-Líder!
              </p>
            )}
            <div>
              <label className="modal-label">
                Digite <strong>"Excluir"</strong> para confirmar:
              </label>
              <input 
                autoFocus
                placeholder="Excluir" 
                value={confirmDeleteCasalText} 
                onChange={e => setConfirmDeleteCasalText(e.target.value)}
                className="glass-input glass-input--full"
              />
            </div>
            <button 
              onClick={handleDeleteCasal}
              disabled={processando || confirmDeleteCasalText !== 'Excluir'}
              style={{ 
                background: confirmDeleteCasalText === 'Excluir' ? 'var(--danger-bg)' : 'rgba(239, 68, 68, 0.3)', 
                border: 'none', 
                color: confirmDeleteCasalText === 'Excluir' ? 'white' : '#94a3b8', 
                padding: '1rem', 
                borderRadius: '8px', 
                fontWeight: 600, 
                cursor: confirmDeleteCasalText === 'Excluir' ? 'pointer' : 'not-allowed',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem' 
              }}
            >
              {processando ? <LoaderCircle size={20} className="spinner" /> : 'Confirmar Exclusão'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: SORTEIO DE VITAMINAS (HU-25) */}
      {semanaSorteio !== null && id && (
        <SorteioVitaminasModal
          turmaId={id}
          semanaId={semanaSorteio}
          casais={casais}
          onClose={() => setSemanaSorteio(null)}
        />
      )}

    </div>
  );
}
