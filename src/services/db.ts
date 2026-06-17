import { collection, getDocs, addDoc, query, where, orderBy, updateDoc, doc, getDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

// Catálogo de vitaminas da turma — embutido em turmas/{turmaId}.vitaminas
export interface Vitamina {
  id: string;            // UUID gerado client-side (crypto.randomUUID())
  nome: string;
  descricao: string;
  semanas: number[];     // semanas em que está ativa (ex: [1,3,5] ou [] = inativa)
  createdAt: string;     // ISO timestamp
}

// Snapshot de uma vitamina sorteada para uma pessoa de um casal em uma semana
export interface VitaminaSorteio {
  vitaminaId: string;    // FK para turmas.vitaminas[id]
  nome: string;          // DENORMALIZADO — snapshot no momento do sorteio
  descricao: string;     // DENORMALIZADO — snapshot no momento do sorteio
  check: boolean;        // HU-27: check individual (Ele ✅ ou Ela ✅)
  sorteadoEm: string;    // ISO timestamp — usado para histórico HU-28
}

// Sorteio completo para um casal em uma semana (uma pra ele + uma pra ela)
export interface SorteioVitaminas {
  ele: VitaminaSorteio | null;
  ela: VitaminaSorteio | null;
}

export interface Turma {
  id: string;
  nome: string;
  dataInicio: string;
  concluida: boolean;
  createdAt?: string;
  datasSemanas?: Record<number, string>;
  vitaminas?: Record<string, Vitamina>;
}

export interface SemanaCheck {
  presenca: boolean;
  vitaminas?: boolean;          // Deprecated (compat retroativa) — substituído por sorteioVitaminas
  tarefas: boolean;
  tarefasExtras: boolean;
  sorteioVitaminas?: SorteioVitaminas;
}

export interface Casal {
  id: string;
  turmaId: string;
  tipo: 'LIDER' | 'CO-LIDER' | 'ALUNO';
  nomeEle: string;
  nomeEla: string;
  pontuacaoTotal: number;
  semanas?: Record<string, SemanaCheck>;
  fotoUrl?: string;
}

// HU-28: Projeção de uma semana do histórico de vitaminas de um casal.
// Consumido pela página MinhasVitaminas (lista ordenada da mais recente para a mais antiga).
export interface HistoricoVitaminasItem {
  semana: number;
  data: string | null;
  vitaminaEle: string | null;
  vitaminaEla: string | null;
  statusEle: 'CUMPRIDA' | 'PENDENTE' | 'NAO_SORTEADA';
  statusEla: 'CUMPRIDA' | 'PENDENTE' | 'NAO_SORTEADA';
}

export const dbService = {
  getTurmas: async (): Promise<Turma[]> => {
    if (!db) return [];
    try {
      const turmasRef = collection(db, "turmas");
      const q = query(turmasRef, orderBy("createdAt", "desc"));
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
        concluida: false,
        createdAt: new Date().toISOString()
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

  deleteCasal: async (casalId: string): Promise<boolean> => {
    if (!db) return false;
    try {
      await deleteDoc(doc(db, "casais", casalId));
      return true;
    } catch (e) {
      console.error("Erro ao excluir casal:", e);
      return false;
    }
  },

  toggleTurmaConcluida: async (turmaId: string, concluida: boolean) => {
    if (!db) return false;
    try {
      await updateDoc(doc(db, "turmas", turmaId), { concluida });
      return true;
    } catch (e) {
      console.error("Erro ao atualizar status da turma:", e);
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

  createCasal: async (turmaId: string, nomeEle: string, nomeEla: string, tipo: 'LIDER' | 'CO-LIDER' | 'ALUNO'): Promise<{success: boolean, error?: string, id?: string}> => {
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

      const ref = await addDoc(collection(db, "casais"), {
        turmaId,
        nomeEle,
        nomeEla,
        tipo,
        pontuacaoTotal: 0,
        semanas: {}
      });
      return { success: true, id: ref.id };
    } catch (e) {
      console.error("Erro ao criar casal:", e);
      return { success: false, error: 'Falha interna ao tentar salvar.' };
    }
  },

  updateCasal: async (casalId: string, dados: { nomeEle?: string; nomeEla?: string; tipo?: 'LIDER' | 'CO-LIDER' | 'ALUNO' }): Promise<{success: boolean, error?: string}> => {
    if (!db) return { success: false, error: 'DB não inicializado.' };
    try {
      const limiteLider = 1;
      const limiteCoLider = 1;
      const limiteAluno = 5;

      // Se o tipo está mudando, verificar limites
      if (dados.tipo) {
        const casalRef = doc(db, "casais", casalId);
        const casalSnap = await getDoc(casalRef);
        if (!casalSnap.exists()) return { success: false, error: 'Casal não encontrado.' };

        const casalData = casalSnap.data() as Casal;
        const turmaId = casalData.turmaId;
        const tipoAtual = casalData.tipo;

        // Só valida limites se o tipo está realmente mudando
        if (dados.tipo !== tipoAtual) {
          const currentCasais = await dbService.getCasais(turmaId);
          // Opção B: validação rígida — conta TODOS os casais (incluindo o editado)
          const countLider = currentCasais.filter(c => c.tipo === 'LIDER').length;
          const countCoLider = currentCasais.filter(c => c.tipo === 'CO-LIDER').length;
          const countAluno = currentCasais.filter(c => c.tipo === 'ALUNO').length;

          if (dados.tipo === 'LIDER' && countLider >= limiteLider) return { success: false, error: 'Limite de 1 Casal Líder excedido para esta turma.' };
          if (dados.tipo === 'CO-LIDER' && countCoLider >= limiteCoLider) return { success: false, error: 'Limite de 1 Casal Co-Líder excedido para esta turma.' };
          if (dados.tipo === 'ALUNO' && countAluno >= limiteAluno) return { success: false, error: 'Limite de 5 Casais Alunos excedido para esta turma.' };
        }
      }

      // Atualizar o documento do casal
      const casalRef = doc(db, "casais", casalId);
      const updateData: Record<string, string> = {};
      if (dados.nomeEle !== undefined) updateData.nomeEle = dados.nomeEle;
      if (dados.nomeEla !== undefined) updateData.nomeEla = dados.nomeEla;
      if (dados.tipo !== undefined) updateData.tipo = dados.tipo;

      await updateDoc(casalRef, updateData);
      return { success: true };
    } catch (e) {
      console.error("Erro ao editar casal:", e);
      return { success: false, error: 'Falha interna ao tentar salvar.' };
    }
  },

  updateCasalFotoUrl: async (casalId: string, fotoUrl: string): Promise<boolean> => {
    if (!db) return false;
    try {
      await updateDoc(doc(db, "casais", casalId), { fotoUrl });
      return true;
    } catch (e) {
      console.error("Erro ao atualizar foto do casal:", e);
      return false;
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
  },

  // ===== HU-26: Vitaminas da Semana (CRUD) =====
  // Catálogo embutido em turmas/{turmaId}.vitaminas (Record<string, Vitamina>)

  // Lê o documento da turma, gera id via crypto.randomUUID(), adiciona a nova vitamina
  // com semanas: [] e createdAt, e persiste o mapa completo via updateDoc.
  addVitamina: async (turmaId: string, nome: string, descricao: string): Promise<boolean> => {
    if (!db) return false;
    try {
      const turmaRef = doc(db, "turmas", turmaId);
      const turmaSnap = await getDoc(turmaRef);
      if (!turmaSnap.exists()) return false;

      const data = turmaSnap.data();
      const vitaminas = { ...(data.vitaminas || {}) };
      const id = crypto.randomUUID();
      vitaminas[id] = {
        id,
        nome,
        descricao,
        semanas: [],
        createdAt: new Date().toISOString()
      };

      await updateDoc(turmaRef, { vitaminas });
      return true;
    } catch (e) {
      console.error("Erro ao cadastrar vitamina:", e);
      return false;
    }
  },

  // Atualiza nome e/ou descricao via dot notation (vitaminas.{id}.nome / .descricao).
  updateVitamina: async (turmaId: string, vitaminaId: string, dados: { nome?: string; descricao?: string }): Promise<boolean> => {
    if (!db) return false;
    try {
      const updateData: Record<string, string> = {};
      if (dados.nome !== undefined) updateData[`vitaminas.${vitaminaId}.nome`] = dados.nome;
      if (dados.descricao !== undefined) updateData[`vitaminas.${vitaminaId}.descricao`] = dados.descricao;
      if (Object.keys(updateData).length === 0) return false;

      await updateDoc(doc(db, "turmas", turmaId), updateData);
      return true;
    } catch (e) {
      console.error("Erro ao editar vitamina:", e);
      return false;
    }
  },

  // Lê a turma, remove a vitamina do mapa e persiste o mapa atualizado.
  deleteVitamina: async (turmaId: string, vitaminaId: string): Promise<boolean> => {
    if (!db) return false;
    try {
      const turmaRef = doc(db, "turmas", turmaId);
      const turmaSnap = await getDoc(turmaRef);
      if (!turmaSnap.exists()) return false;

      const data = turmaSnap.data();
      const vitaminas = { ...(data.vitaminas || {}) };
      if (!vitaminas[vitaminaId]) return false;

      delete vitaminas[vitaminaId];
      await updateDoc(turmaRef, { vitaminas });
      return true;
    } catch (e) {
      console.error("Erro ao excluir vitamina:", e);
      return false;
    }
  },

  // Atualiza o array de semanas ativas da vitamina via dot notation.
  setVitaminaSemanas: async (turmaId: string, vitaminaId: string, semanas: number[]): Promise<boolean> => {
    if (!db) return false;
    try {
      await updateDoc(doc(db, "turmas", turmaId), {
        [`vitaminas.${vitaminaId}.semanas`]: semanas
      });
      return true;
    } catch (e) {
      console.error("Erro ao atualizar semanas da vitamina:", e);
      return false;
    }
  },

  // Retorna todas as vitaminas cadastradas na turma (usado pelo componente de admin HU-26).
  getVitaminas: async (turmaId: string): Promise<Vitamina[]> => {
    if (!db) return [];
    try {
      const turmaSnap = await getDoc(doc(db, "turmas", turmaId));
      if (!turmaSnap.exists()) return [];

      const data = turmaSnap.data();
      const vitaminas: Record<string, Vitamina> = data.vitaminas || {};
      return Object.values(vitaminas);
    } catch (e) {
      console.error("Erro ao carregar vitaminas:", e);
      return [];
    }
  },

  // ===== HU-25: Sorteio de Vitaminas (Roleta) =====
  // Filtra as vitaminas ativas em uma semana específica (consumido pela roleta HU-25).
  getVitaminasDaSemana: async (turmaId: string, semana: number): Promise<Vitamina[]> => {
    if (!db) return [];
    try {
      const turmaSnap = await getDoc(doc(db, "turmas", turmaId));
      if (!turmaSnap.exists()) return [];

      const data = turmaSnap.data();
      const vitaminas: Record<string, Vitamina> = data.vitaminas || {};
      return Object.values(vitaminas).filter(
        (v) => Array.isArray(v.semanas) && v.semanas.includes(semana)
      );
    } catch (e) {
      console.error("Erro ao carregar vitaminas da semana:", e);
      return [];
    }
  },

  // Persiste o snapshot do sorteio (uma vitamina pra ele + uma pra ela) na semana do casal
  // e recalcula a pontuação total atomicamente via runTransaction.
  sortearVitaminas: async (
    casalId: string,
    semanaId: string,
    vitaminaEle: Vitamina,
    vitaminaEla: Vitamina
  ): Promise<boolean> => {
    if (!db) return false;
    try {
      const casalRef = doc(db, "casais", casalId);

      await runTransaction(db, async (transaction) => {
        const casalSnap = await transaction.get(casalRef);
        if (!casalSnap.exists()) return;

        const data = casalSnap.data();
        const semanas = { ...(data.semanas || {}) };
        const semanaAtual: SemanaCheck = semanas[semanaId] || {
          presenca: false,
          tarefas: false,
          tarefasExtras: false
        };

        const agora = new Date().toISOString();
        const sorteioVitaminas: SorteioVitaminas = {
          ele: {
            vitaminaId: vitaminaEle.id,
            nome: vitaminaEle.nome,
            descricao: vitaminaEle.descricao,
            check: false,
            sorteadoEm: agora
          },
          ela: {
            vitaminaId: vitaminaEla.id,
            nome: vitaminaEla.nome,
            descricao: vitaminaEla.descricao,
            check: false,
            sorteadoEm: agora
          }
        };

        semanaAtual.sorteioVitaminas = sorteioVitaminas;
        semanas[semanaId] = semanaAtual;

        // Recalcular pontuação total do casal (soma todas as semanas).
        // Inclui branch legacy para `vitaminas: boolean` (compat retroativa) e
        // os novos checks individuais de sorteioVitaminas (ele/ela).
        let pontuacaoRecalculada = 0;
        Object.values(semanas).forEach((sem: any) => {
          if (sem.presenca) pontuacaoRecalculada += 1;
          if (sem.vitaminas) pontuacaoRecalculada += 1; // legacy
          if (sem.tarefas) pontuacaoRecalculada += 1;
          if (sem.tarefasExtras) pontuacaoRecalculada += 1;
          if (sem.sorteioVitaminas) {
            if (sem.sorteioVitaminas.ele && sem.sorteioVitaminas.ele.check) pontuacaoRecalculada += 1;
            if (sem.sorteioVitaminas.ela && sem.sorteioVitaminas.ela.check) pontuacaoRecalculada += 1;
          }
        });

        transaction.update(casalRef, {
          semanas,
          pontuacaoTotal: pontuacaoRecalculada
        });
      });

      return true;
    } catch (e) {
      console.error("Erro ao sortear vitaminas:", e);
      return false;
    }
  },

  // ===== HU-28: Histórico de Vitaminas do Aluno =====
  // Projeta o documento do casal em uma lista de semanas que possuem sorteioVitaminas,
  // com status individual (Ele/Ela). Ordenado da semana mais recente para a mais antiga.
  // A data de cada semana vem de turma.datasSemanas[semana] ou é calculada a partir de dataInicio.
  getHistoricoVitaminas: async (casalId: string): Promise<HistoricoVitaminasItem[]> => {
    if (!db) return [];
    try {
      const casalSnap = await getDoc(doc(db, "casais", casalId));
      if (!casalSnap.exists()) return [];

      const casalData = casalSnap.data() as Casal;
      const semanas = casalData.semanas || {};
      const turmaId = casalData.turmaId;

      // Lê a turma vinculada para obter datasSemanas (override) e dataInicio (fallback)
      let datasSemanas: Record<number, string> | undefined;
      let dataInicio: string | undefined;
      if (turmaId) {
        const turmaSnap = await getDoc(doc(db, "turmas", turmaId));
        if (turmaSnap.exists()) {
          const turmaData = turmaSnap.data() as Turma;
          datasSemanas = turmaData.datasSemanas;
          dataInicio = turmaData.dataInicio;
        }
      }

      // Calcula a data de uma semana: override personalizado > dataInicio + (semana-1)*7 dias
      const calcularData = (semanaNum: number): string | null => {
        if (datasSemanas && datasSemanas[semanaNum]) {
          return datasSemanas[semanaNum];
        }
        if (dataInicio) {
          const inicio = new Date(dataInicio);
          const diasParaAdicionar = (semanaNum - 1) * 7;
          const novaData = new Date(inicio);
          novaData.setDate(novaData.getDate() + diasParaAdicionar);
          return novaData.toISOString();
        }
        return null;
      };

      // Projeta o check individual em um status de três estados
      const statusDe = (check: boolean | null | undefined): 'CUMPRIDA' | 'PENDENTE' | 'NAO_SORTEADA' => {
        if (check === null || check === undefined) return 'NAO_SORTEADA';
        return check ? 'CUMPRIDA' : 'PENDENTE';
      };

      const itens: HistoricoVitaminasItem[] = [];
      Object.entries(semanas).forEach(([semanaKey, sem]) => {
        if (!sem.sorteioVitaminas) return;
        const semanaNum = Number(semanaKey);
        const sorteio = sem.sorteioVitaminas;
        itens.push({
          semana: semanaNum,
          data: calcularData(semanaNum),
          vitaminaEle: sorteio.ele?.nome ?? null,
          vitaminaEla: sorteio.ela?.nome ?? null,
          statusEle: sorteio.ele ? statusDe(sorteio.ele.check) : 'NAO_SORTEADA',
          statusEla: sorteio.ela ? statusDe(sorteio.ela.check) : 'NAO_SORTEADA',
        });
      });

      // Ordena da semana mais recente para a mais antiga
      itens.sort((a, b) => b.semana - a.semana);

      return itens;
    } catch (e) {
      console.error("Erro ao carregar histórico de vitaminas:", e);
      return [];
    }
  }
};

// @ts-ignore - Expor migração para console do navegador
(window as any).migrateCreatedAt = () => import('./migrateCreatedAt').then(m => m.migrateCreatedAt());
