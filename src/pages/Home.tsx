import { Link } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import { mockTurmas } from '../services/mockDb';
import '../styles/home.css';

export default function Home() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Minhas Turmas</h1>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          Nova Turma
        </button>
      </header>

      <div className="turmas-list">
        {mockTurmas.map((turma) => (
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
        {mockTurmas.length === 0 && (
          <p className="empty-state">Você ainda não tem nenhuma turma aberta.</p>
        )}
      </div>
    </div>
  );
}
