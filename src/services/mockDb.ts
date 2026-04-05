export interface Turma {
  id: string;
  nome: string;
  dataInicio: string; // ISO date
  concluida: boolean;
}

export interface Casal {
  id: string;
  turmaId: string;
  tipo: 'LIDER' | 'ALUNO';
  nomeEle: string;
  nomeEla: string;
  pontuacaoTotal: number;
}

export const mockTurmas: Turma[] = [
  { id: '1', nome: 'Turma de Sábado', dataInicio: '2026-04-10T00:00:00Z', concluida: false },
  { id: '2', nome: 'Turma de Domingo', dataInicio: '2026-05-01T00:00:00Z', concluida: false },
];

export const mockCasais: Casal[] = [
  { id: 'c1', turmaId: '1', tipo: 'LIDER', nomeEle: 'João', nomeEla: 'Maria', pontuacaoTotal: 15 },
  { id: 'c2', turmaId: '1', tipo: 'ALUNO', nomeEle: 'Pedro', nomeEla: 'Ana', pontuacaoTotal: 10 },
  { id: 'c3', turmaId: '1', tipo: 'ALUNO', nomeEle: 'Marcos', nomeEla: 'Julia', pontuacaoTotal: 8 },
];

export const authService = {
  login: async (usuario: string, senha: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (usuario === 'lider' && senha === '123') resolve({ uid: 'mock-user-1', nome: 'Líder' });
        else reject(new Error('Credenciais inválidas. Use lider / 123.'));
      }, 500);
    });
  }
};
