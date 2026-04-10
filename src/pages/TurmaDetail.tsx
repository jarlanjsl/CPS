import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { dbService, type Casal, type Turma } from '../services/db';
import { LoaderCircle, Pencil, Plus, X } from 'lucide-react';
import '../styles/home.css';

export default function TurmaDetail() {
  const { id } = useParams();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [casais, setCasais] = useState<Casal[]>([]);
  const [loading, setLoading] = useState(true);

  // States para Edição de Turma
  const [isEditTurmaOpen, setIsEditTurmaOpen] = useState(false);
  const [novoNomeTurma, setNovoNomeTurma] = useState('');

  // States para Novo Membro
  const [isAddCasalOpen, setIsAddCasalOpen] = useState(false);
  const [nomeEle, setNomeEle] = useState('');
  const [nomeEla, setNomeEla] = useState('');
  const [casalTipo, setCasalTipo] = useState<'LIDER' | 'ALUNO'>('ALUNO');
  const [processando, setProcessando] = useState(false);

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
    const ok = await dbService.updateTurma(id, novoNomeTurma);
    setProcessando(false);
    if (ok) {
      setIsEditTurmaOpen(false);
      carregarDados();
    } else {
      alert("Erro ao editar turma.");
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
              <div>
                <div style={{ fontWeight: 500 }}>{c.nomeEle} & {c.nomeEla}</div>
                {c.tipo === 'LIDER' && <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>Líder</span>}
                {c.tipo === 'CO-LIDER' && <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Co-Líder</span>}
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
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Selecione a lição da semana do curso para preencher.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
          {semanas.map(sem => (
            <Link key={sem} to={`/turma/${id}/semana/${sem}`} className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', padding: '0.75rem 0' }}>
              Lição {sem}
            </Link>
          ))}
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
            <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>Renomear Turma</h2>
            <input 
              autoFocus placeholder="Novo nome da turma" value={novoNomeTurma} onChange={e => setNovoNomeTurma(e.target.value)}
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit' }}
            />
            <button type="submit" className="btn-primary" disabled={processando || !novoNomeTurma.trim()}>
              {processando ? <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Salvar'}
            </button>
          </form>
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

    </div>
  );
}
