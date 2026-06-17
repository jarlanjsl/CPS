import { collection, getDocs, addDoc, query, where, updateDoc, doc, getDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

export interface Turma {
  id: string;
  nome: string;
  dataInicio: string;
  concluida: boolean;
  datasSemanas?: Record<number, string>;
}

export interface SemanaCheck {
  presenca: boolean;
  vitaminas: boolean;
  tarefas: boolean;
  tarefasExtras: boolean;
}

export interface Casal {
  id: string;
  turmaId: string;
  tipo: 'LIDER' | 'CO-LIDER' | 'ALUNO';
  nomeEle: string;
  nomeEla: string;
  pontuacaoTotal: number;
  semanas?: Record<string, SemanaCheck>;
}

export const dbService = {
  getTurmas: async (): Promise<Turma[]> => {
    if (!db) return [];
    try {
      const q = collection(db, "turmas");
      const querySnapshot = await getDocs(q);
      const turmas: Turma[] = [];
      querySnapshot.forEach((doc) => {
        turmas.push({ id: doc.id, ...(doc.data() as any) } as Turma);
      });
      return turmas;
    } catch (e) {
      console.error("Erro ao carregar turmas:", e);
      return [];
    }
  },

  createTurma: async (nome: string, dataInicio: string) => {
    if (!db) return null;
    try {
      const refTurma = await addDoc(collection(db, "turmas"), {
        nome,
        dataInicio,
        concluida: false
      });
      return refTurma.id;
    } catch (e) {
      console.error("Erro ao criar turma:", e);
      return null;
    }
  },

  updateTurma: async (turmaId: string, novoNome: string, novaDataInicio?: string) => {
    if (!db) return false;
    try {
      const data: any = { nome: novoNome };
      if (novaDataInicio) data.dataInicio = novaDataInicio;
      await updateDoc(doc(db, "turmas", turmaId), data);
      return true;
    } catch (e) {
      console.error("Erro ao editar turma:", e);
      return false;
    }
  },

  deleteTurma: async (turmaId: string) => {
    if (!db) return false;
    try {
      await deleteDoc(doc(db, "turmas", turmaId));
      return true;
    } catch (e) {
      console.error("Erro ao excluir turma:", e);
      return false;
    }
  },

  updateSemanaData: async (turmaId: string, semana: number, dataPersonalizada?: string) => {
    if (!db) return false;
    try {
      const turmaRef = doc(db, "turmas", turmaId);
      const turmaSnap = await getDoc(turmaRef);
      if (!turmaSnap.exists()) return false;

      const data = turmaSnap.data();
      const datasSemanas = data.datasSemanas || {};

      if (dataPersonalizada) {
        datasSemanas[semana] = dataPersonalizada;
      } else {
        delete datasSemanas[semana];
      }

      await updateDoc(turmaRef, { datasSemanas });
      return true;
    } catch (e) {
      console.error("Erro ao editar data da semana:", e);
      return false;
    }
  },

  createCasal: async (turmaId: string, nomeEle: string, nomeEla: string, tipo: 'LIDER' | 'CO-LIDER' | 'ALUNO'): Promise<{success: boolean, error?: string}> => {
    if (!db) return { success: false, error: 'DB não inicializado.' };
    try {
      // Regra de Trava e Verificação Limite
      const limiteLider = 1;
      const limiteCoLider = 1;
      const limiteAluno = 5;

      const currentCasais = await dbService.getCasais(turmaId);
      const countLider = currentCasais.filter(c => c.tipo === 'LIDER').length;
      const countCoLider = currentCasais.filter(c => c.tipo === 'CO-LIDER').length;
      const countAluno = currentCasais.filter(c => c.tipo === 'ALUNO').length;

      if (tipo === 'LIDER' && countLider >= limiteLider) return { success: false, error: 'Limite de 1 Casal Líder excedido para esta turma.' };
      if (tipo === 'CO-LIDER' && countCoLider >= limiteCoLider) return { success: false, error: 'Limite de 1 Casal Co-Líder excedido para esta turma.' };
      if (tipo === 'ALUNO' && countAluno >= limiteAluno) return { success: false, error: 'Limite de 5 Casais Alunos excedido para esta turma.' };

      await addDoc(collection(db, "casais"), {
        turmaId,
        nomeEle,
        nomeEla,
        tipo,
        pontuacaoTotal: 0,
        semanas: {}
      });
      return { success: true };
    } catch (e) {
      console.error("Erro ao criar casal:", e);
      return { success: false, error: 'Falha interna ao tentar salvar.' };
    }
  },

  getCasais: async (turmaId?: string): Promise<Casal[]> => {
    if (!db) return [];
    try {
      let q = collection(db, "casais") as any;
      if (turmaId) {
        q = query(collection(db, "casais"), where("turmaId", "==", turmaId));
      }
      const querySnapshot = await getDocs(q);
      const casais: Casal[] = [];
      querySnapshot.forEach((doc) => {
        casais.push({ id: doc.id, ...(doc.data() as any) } as Casal);
      });
      return casais;
    } catch (e) {
      console.error("Erro ao carregar casais:", e);
      return [];
    }
  },

  // Grava as caixinhas de uma semana pra um casal específico e recalcula os pontos dele.
  // Usa transação Firestore para evitar race condition quando dois líderes salvam ao mesmo tempo.
  saveChecklist: async (casalId: string, semanaId: string, checklist: SemanaCheck) => {
    if (!db) return;
    try {
      const casalRef = doc(db, "casais", casalId);

      await runTransaction(db, async (transaction) => {
        const casalSnap = await transaction.get(casalRef);
        if (!casalSnap.exists()) return;

        const data = casalSnap.data();
        const semanas = { ...(data.semanas || {}) };

        // Atualiza o mapa dessa semana específica
        semanas[semanaId] = checklist;

        // Recalcular Total Global do Casal (Soma todas as semanas gravadas)
        let pontuacaoRecalculada = 0;
        Object.values(semanas).forEach((sem: any) => {
          if (sem.presenca) pontuacaoRecalculada += 1;
          if (sem.vitaminas) pontuacaoRecalculada += 1;
          if (sem.tarefas) pontuacaoRecalculada += 1;
          if (sem.tarefasExtras) pontuacaoRecalculada += 1;
        });

        // Atualiza atomicamente dentro da transação
        transaction.update(casalRef, {
          semanas,
          pontuacaoTotal: pontuacaoRecalculada
        });
      });

    } catch (e) {
      console.error("Erro ao gravar semana (transação):", e);
      throw e;
    }
  },

  seedInitialData: async () => {
    if (!db) return;
    try {
      // 1. Criar turma base
      const refTurma = await addDoc(collection(db, "turmas"), {
        nome: "Turma de Lançamento (Piloto)",
        dataInicio: new Date().toISOString(),
        concluida: false
      });
      
      const turmaId = refTurma.id;

      // 2. Criar Casais
      const c1 = { turmaId, tipo: 'LIDER', nomeEle: 'João', nomeEla: 'Maria', pontuacaoTotal: 15 };
      const c2 = { turmaId, tipo: 'ALUNO', nomeEle: 'Pedro', nomeEla: 'Ana', pontuacaoTotal: 10 };
      const c3 = { turmaId, tipo: 'ALUNO', nomeEle: 'Marcos', nomeEla: 'Julia', pontuacaoTotal: 8 };

      await addDoc(collection(db, "casais"), c1);
      await addDoc(collection(db, "casais"), c2);
      await addDoc(collection(db, "casais"), c3);

      alert("Dados iniciais injetados com sucesso no Firestore!");
      window.location.reload();
    } catch(err) {
      console.error("Erro de Seed:", err);
      alert("Falha. Verifique as regras de segurança do Firestore. Elas precisam estar em modo de teste.");
    }
  }
};
