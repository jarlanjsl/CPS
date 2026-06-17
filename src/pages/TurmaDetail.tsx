import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { dbService, type Casal, type Turma } from '../services/db';
import { LoaderCircle, Pencil, Plus, X, Trash2 } from 'lucide-react';
import '../styles/home.css';

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

  // States para Edição de Data da Lição
  const [isEditSemanaOpen, setIsEditSemanaOpen] = useState(false);
  const [semanaEditando, setSemanaEditando] = useState<number | null>(null);
  const [novaDataSemana, setNovaDataSemana] = useState('');

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
    const { success, error } = await dbService.createCasal(id, nomeEle, nomeEla, casalTipo);
    setProcessando(false);
    if (success) {
      setIsAddCasalOpen(false);
      setNomeEle('');
      setNomeEla('');
      carregarDados();
    } else {
      alert(error || "Erro ao cadastrar membros.");
    }
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

  if (loading && !turma) return <div className="page-container" style={{ textAlign: 'center', padding: '3rem' }}><LoaderCircle size={32} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (!turma) return <div className="page-container">Turma não encontrada no banco.</div>;

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <header className="page-header">
        <div>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Voltar
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <h1 style={{ margin: 0, color: 'var(--text-main)' }}>{turma.nome}</h1>
            <button onClick={() => setIsEditTurmaOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
              <Pencil size={18} />
            </button>
          </div>
        </div>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Membros</h3>
          <button onClick={() => setIsAddCasalOpen(true)} className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <Plus size={16} />
            Cadastrar
          </button>
        </div>

        <div className="glass-effect" style={{ overflow: 'hidden' }}>
          {casais.map((c, idx) => (
            <div key={c.id} style={{ 
              padding: '1.25rem', 
              borderBottom: idx === casais.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{c.nomeEle} & {c.nomeEla}</div>
                  {c.tipo === 'LIDER' && <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>Líder</span>}
                  {c.tipo === 'CO-LIDER' && <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Co-Líder</span>}
                  {c.tipo === 'ALUNO' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aluno</span>}
                </div>
                <button
                  onClick={() => {
                    setEditCasalId(c.id);
                    setEditNomeEle(c.nomeEle);
                    setEditNomeEla(c.nomeEla);
                    setEditCasalTipo(c.tipo);
                    setIsEditCasalOpen(true);
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                  title="Editar casal"
                >
                  <Pencil size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pontos</span>
                <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{c.pontuacaoTotal}</span>
              </div>
            </div>
          ))}
          {casais.length === 0 && (
             <div style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>Sem casais na turma</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <h3 style={{ color: 'var(--text-main)' }}>Acompanhamento (Semanas)</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Selecione a lição da semana do curso para preencher.
          {turma.dataInicio && (
            <span style={{ display: 'block', marginTop: '0.5rem' }}>
              <strong>Data de início:</strong> {new Date(turma.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          )}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
          {semanas.map(sem => {
            const dataSemana = calcularDataSemana(sem);
            return (
              <div key={sem} style={{ position: 'relative' }}>
                <Link 
                  to={`/turma/${id}/semana/${sem}`} 
                  className="btn-primary" 
                  style={{ 
                    textAlign: 'center', 
                    textDecoration: 'none', 
                    padding: '0.75rem 0.5rem',
                    display: 'block'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Lição {sem}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{dataSemana}</div>
                </Link>
                <button
                  onClick={() => {
                    setSemanaEditando(sem);
                    setNovaDataSemana(formatarDataInput(new Date(new Date(turma.dataInicio!).getTime() + (sem - 1) * 7 * 24 * 60 * 60 * 1000).toISOString()));
                    setIsEditSemanaOpen(true);
                  }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
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
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1.5rem'
        }}>
          <form className="glass-effect" onSubmit={handleEditTurma} style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            <button type="button" onClick={() => setIsEditTurmaOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>Editar Turma</h2>
            <input 
              autoFocus placeholder="Novo nome da turma" value={novoNomeTurma} onChange={e => setNovoNomeTurma(e.target.value)}
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit' }}
            />
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Data de Início</label>
              <input 
                type="date" value={novaDataInicio} onChange={e => setNovaDataInicio(e.target.value)}
                style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={processando || !novoNomeTurma.trim()}>
              {processando ? <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Salvar'}
            </button>
            <button 
              type="button" 
              onClick={() => { setIsEditTurmaOpen(false); setIsDeleteTurmaOpen(true); }}
              style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Trash2 size={20} />
              Excluir Turma
            </button>
          </form>
        </div>
      )}

      {/* MODAL: EXCLUIR TURMA */}
      {isDeleteTurmaOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1.5rem'
        }}>
          <div className="glass-effect" style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            <button type="button" onClick={() => setIsDeleteTurmaOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginTop: 0, color: '#ef4444' }}>Excluir Turma</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Tem certeza que deseja excluir a turma <strong>{turma.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Digite <strong>"Excluir"</strong> para confirmar:
              </label>
              <input 
                autoFocus
                placeholder="Excluir" 
                value={confirmDeleteText} 
                onChange={e => setConfirmDeleteText(e.target.value)}
                style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
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
              {processando ? <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Confirmar Exclusão'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR DATA DA LIÇÃO */}
      {isEditSemanaOpen && semanaEditando && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1.5rem'
        }}>
          <div className="glass-effect" style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            <button type="button" onClick={() => setIsEditSemanaOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>Editar Data da Lição {semanaEditando}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Altere a data desta lição específica. Isso não afetará as outras lições.
            </p>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Nova data:
              </label>
              <input 
                type="date" 
                value={novaDataSemana} 
                onChange={e => setNovaDataSemana(e.target.value)}
                style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button"
                onClick={() => {
                  setNovaDataSemana('');
                  handleEditSemanaData(semanaEditando, undefined);
                }}
                disabled={processando}
                style={{ 
                  flex: 1,
                  background: 'rgba(239, 68, 68, 0.2)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  color: '#fca5a5', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  cursor: 'pointer'
                }}
              >
                Redefinir
              </button>
              <button 
                onClick={() => handleEditSemanaData(semanaEditando, novaDataSemana)}
                disabled={processando || !novaDataSemana}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                {processando ? <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRAR MEMBROS */}
      {isAddCasalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1.5rem'
        }}>
          <form className="glass-effect" onSubmit={handleCreateCasal} style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            <button type="button" onClick={() => setIsAddCasalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>Novo Casal</h2>
            
            <input 
              placeholder="Nome dEle (Ex: João)" value={nomeEle} onChange={e => setNomeEle(e.target.value)}
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit' }}
            />
             <input 
              placeholder="Nome dEla (Ex: Maria)" value={nomeEla} onChange={e => setNomeEla(e.target.value)}
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit' }}
            />
             <select 
              value={casalTipo} onChange={e => setCasalTipo(e.target.value as any)}
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit' }}
            >
              <option value="ALUNO" style={{ color: 'black' }}>Casal Membro/Aluno</option>
              <option value="LIDER" style={{ color: 'black' }}>Casal Líder (Não pontua)</option>
              <option value="CO-LIDER" style={{ color: 'black' }}>Casal Co-Líder (Não pontua)</option>
            </select>

            <button type="submit" className="btn-primary" disabled={processando || !nomeEle.trim() || !nomeEla.trim()}>
              {processando ? <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Adicionar Casal'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL: EDITAR CASAL */}
      {isEditCasalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1.5rem'
        }}>
          <form className="glass-effect" onSubmit={handleEditCasal} style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            <button type="button" onClick={() => setIsEditCasalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>Editar Casal</h2>
            
            <input 
              autoFocus
              placeholder="Nome dEle" value={editNomeEle} onChange={e => setEditNomeEle(e.target.value)}
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit' }}
            />
             <input 
              placeholder="Nome dEla" value={editNomeEla} onChange={e => setEditNomeEla(e.target.value)}
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit' }}
            />
             <select 
              value={editCasalTipo} onChange={e => setEditCasalTipo(e.target.value as any)}
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit' }}
            >
              <option value="ALUNO" style={{ color: 'black' }}>Casal Membro/Aluno</option>
              <option value="LIDER" style={{ color: 'black' }}>Casal Líder (Não pontua)</option>
              <option value="CO-LIDER" style={{ color: 'black' }}>Casal Co-Líder (Não pontua)</option>
            </select>

            <button type="submit" className="btn-primary" disabled={processando || !editNomeEle.trim() || !editNomeEla.trim()}>
              {processando ? <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Salvar'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
