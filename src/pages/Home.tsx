import { Link } from 'react-router-dom';
import { Users, Plus, LoaderCircle, DatabaseBackup, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dbService, type Turma } from '../services/db';
import '../styles/home.css';

export default function Home() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaTurmaNome, setNovaTurmaNome] = useState('');
  const [novaTurmaData, setNovaTurmaData] = useState('');
  const [criando, setCriando] = useState(false);

  // Recarregar os dados do painel sempre que precisar (ex: apos criar turma)
  const fetchTurmas = () => {
    setLoading(true);
    dbService.getTurmas().then(res => {
      setTurmas(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchTurmas();
  }, []);

  const handleCriarTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaTurmaNome.trim() || !novaTurmaData) return;
    
    setCriando(true);
    // Convertendo a data do input (YYYY-MM-DD) para padronização ou usando ela direta
    const success = await dbService.createTurma(novaTurmaNome, new Date(`${novaTurmaData}T12:00:00Z`).toISOString());
    if (success) {
      setNovaTurmaNome('');
      setNovaTurmaData('');
      setIsModalOpen(false);
      fetchTurmas();
    } else {
      alert("Erro ao criar turma. Verifique a conexão com o Firebase.");
    }
    setCriando(false);
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <header className="page-header">
        <h1>Minhas Turmas</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          Nova Turma
        </button>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
           <LoaderCircle size={32} className="text-muted" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="turmas-list">
          {turmas.map((turma) => (
            <Link to={`/turma/${turma.id}`} key={turma.id} className="turma-card">
              <h2>
                <Users size={20} className="text-muted" />
                {turma.nome}
              </h2>
              <div className="turma-meta">
                <span>Início: {new Date(turma.dataInicio).toLocaleDateString('pt-BR')}</span>
                <span className={`status ${turma.concluida ? 'fechada' : 'aberta'}`}>
                  {turma.concluida ? 'Concluída' : 'Ativa'}
                </span>
              </div>
            </Link>
          ))}
          {turmas.length === 0 && (
            <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <p>O seu Banco de Dados ainda está vazio.</p>
              <button 
                onClick={() => dbService.seedInitialData().then(() => fetchTurmas())}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-dark)', padding: '0.75rem 1rem', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                <DatabaseBackup size={18}/>
                Preencher Dados (Seed)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Glassmorphism para Criar Turma */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1.5rem'
        }}>
          <form className="glass-effect" onSubmit={handleCriarTurma} style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>Criar Nova Turma</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mês/Edição</label>
              <input 
                autoFocus
                placeholder="Ex: Turma Primavera 2026"
                value={novaTurmaNome}
                onChange={e => setNovaTurmaNome(e.target.value)}
                style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit' }}
                disabled={criando}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Data de Início Oficial</label>
              <input 
                type="date"
                value={novaTurmaData}
                onChange={e => setNovaTurmaData(e.target.value)}
                style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit', colorScheme: 'dark' }}
                disabled={criando}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={criando || !novaTurmaNome.trim() || !novaTurmaData} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {criando ? <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Cadastrar'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
