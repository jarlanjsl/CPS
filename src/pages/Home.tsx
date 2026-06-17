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

  // Separar turmas ativas e concluídas
  const turmasAtivas = turmas.filter(t => !t.concluida);
  const turmasConcluidas = turmas.filter(t => t.concluida);

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
    <div className="page-container">
      <header className="page-header">
        <h1>Minhas Turmas</h1>
        <button className="btn-primary btn-icon" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Nova Turma
        </button>
      </header>

      {loading ? (
        <div className="loading-container">
           <LoaderCircle size={32} className="text-muted spinner" />
        </div>
      ) : (
        <div className="turmas-list">
          {/* Seção: Turmas Ativas */}
          {turmasAtivas.length > 0 && (
            <>
              <h3 className="section-heading">Turmas Ativas</h3>
              {turmasAtivas.map((turma) => (
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
            </>
          )}

          {/* Seção: Turmas Concluídas */}
          {turmasConcluidas.length > 0 && (
            <>
              <h3 className="section-heading section-heading--mt">Turmas Concluídas</h3>
              {turmasConcluidas.map((turma) => (
                <Link 
                  to={`/turma/${turma.id}`} 
                  key={turma.id} 
                  className="turma-card turma-card--concluded"
                >
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
            </>
          )}

          {turmas.length === 0 && (
            <div className="empty-state">
              <p>O seu Banco de Dados ainda está vazio.</p>
              <button 
                onClick={() => dbService.seedInitialData().then(() => fetchTurmas())}
                className="btn-seed">
                <DatabaseBackup size={18}/>
                Preencher Dados (Seed)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Glassmorphism para Criar Turma */}
      {isModalOpen && (
        <div className="modal-overlay">
          <form className="glass-effect modal-form" onSubmit={handleCriarTurma}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="modal-close-btn">
              <X size={24} />
            </button>
            
            <h2 className="modal-title">Criar Nova Turma</h2>
            
            <div className="form-field">
              <label className="form-label">Mês/Edição</label>
              <input 
                autoFocus
                placeholder="Ex: Turma Primavera 2026"
                value={novaTurmaNome}
                onChange={e => setNovaTurmaNome(e.target.value)}
                className="glass-input"
                disabled={criando}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Data de Início Oficial</label>
              <input 
                type="date"
                value={novaTurmaData}
                onChange={e => setNovaTurmaData(e.target.value)}
                className="glass-input"
                disabled={criando}
              />
            </div>

            <button type="submit" className="btn-primary btn-primary--full" disabled={criando || !novaTurmaNome.trim() || !novaTurmaData}>
              {criando ? <LoaderCircle size={20} className="spinner" /> : 'Cadastrar'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
