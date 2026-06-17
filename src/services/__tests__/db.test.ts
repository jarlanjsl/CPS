import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock firebase modules BEFORE importing dbService
vi.mock('firebase/firestore', () =>
  import('../../test/mocks/firebase').then(m => m.firestoreExports)
);
vi.mock('../firebase', () => ({
  db: {},
  auth: null,
  storage: null,
}));

import { dbService } from '../db';
import type { SemanaCheck } from '../db';
import {
  mockGetDocs,
  mockGetDoc,
  mockAddDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockRunTransaction,
  mockTransaction,
  mockTransactionDoc,
  resetFirebaseMocks,
} from '../../test/mocks/firebase';
import {
  mockCasal,
  mockTurma,
  mockVitamina,
  mockSorteioVitaminas,
} from '../../test/helpers/fixtures';

/** Helper: cria um QuerySnapshot mock com docs (cast p/ compatibilidade com vi.fn types) */
function mockSnapshot(docs: Array<{ id: string; data: () => unknown }>): any {
  return {
    forEach: (cb: (doc: { id: string; data: () => unknown }) => void) => {
      docs.forEach(cb);
    },
    docs,
    empty: docs.length === 0,
    size: docs.length,
  };
}

/** Helper: cria um DocumentSnapshot mock (cast p/ compatibilidade com vi.fn types) */
function mockDocSnap(data: Record<string, unknown>): any {
  return {
    exists: () => true,
    data: () => data,
    id: 'mock-doc-id',
  };
}

/** Helper: DocumentSnapshot que não existe */
function mockDocSnapNotExist(): any {
  return {
    exists: () => false,
    data: () => undefined,
    id: 'mock-doc-id',
  };
}

describe('dbService.createCasal', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  it('should create LIDER when no other LIDER exists', async () => {
    mockGetDocs.mockResolvedValueOnce(mockSnapshot([]));
    mockAddDoc.mockResolvedValueOnce({ id: 'casal1' });

    const result = await dbService.createCasal('turma1', 'João', 'Maria', 'LIDER');
    expect(result.success).toBe(true);
    expect(result.id).toBe('casal1');
  });

  it('should reject LIDER when 1 LIDER already exists', async () => {
    mockGetDocs.mockResolvedValueOnce(
      mockSnapshot([{ id: 'casal1', data: () => mockCasal({ tipo: 'LIDER' }) }])
    );

    const result = await dbService.createCasal('turma1', 'João', 'Maria', 'LIDER');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite de 1 Casal Líder');
  });

  it('should reject CO-LIDER when 1 CO-LIDER already exists', async () => {
    mockGetDocs.mockResolvedValueOnce(
      mockSnapshot([{ id: 'casal1', data: () => mockCasal({ tipo: 'CO-LIDER' }) }])
    );

    const result = await dbService.createCasal('turma1', 'João', 'Maria', 'CO-LIDER');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite de 1 Casal Co-Líder');
  });

  it('should reject ALUNO when 5 ALUNOS already exist', async () => {
    const docs = Array.from({ length: 5 }, (_, i) => ({
      id: `casal${i}`,
      data: () => mockCasal({ tipo: 'ALUNO' }),
    }));
    mockGetDocs.mockResolvedValueOnce(mockSnapshot(docs));

    const result = await dbService.createCasal('turma1', 'João', 'Maria', 'ALUNO');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite de 5 Casais Alunos');
  });

  it('should allow 5th ALUNO when only 4 exist', async () => {
    const docs = Array.from({ length: 4 }, (_, i) => ({
      id: `casal${i}`,
      data: () => mockCasal({ tipo: 'ALUNO' }),
    }));
    mockGetDocs.mockResolvedValueOnce(mockSnapshot(docs));
    mockAddDoc.mockResolvedValueOnce({ id: 'casal5' });

    const result = await dbService.createCasal('turma1', 'João', 'Maria', 'ALUNO');
    expect(result.success).toBe(true);
  });
});

describe('dbService.updateCasal', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  it('should allow changing tipo when limits are not exceeded', async () => {
    const casalAtual = mockCasal({ id: 'casal1', tipo: 'ALUNO', turmaId: 'turma1' });
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(casalAtual as any));
    mockGetDocs.mockResolvedValueOnce(
      mockSnapshot([{ id: 'casal1', data: () => casalAtual }])
    );
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.updateCasal('casal1', { tipo: 'LIDER' });
    expect(result.success).toBe(true);
  });

  it('should reject changing tipo when limits are exceeded', async () => {
    const casalAtual = mockCasal({ id: 'casal1', tipo: 'ALUNO', turmaId: 'turma1' });
    const outroLider = mockCasal({ id: 'casal2', tipo: 'LIDER', turmaId: 'turma1' });

    mockGetDoc.mockResolvedValueOnce(mockDocSnap(casalAtual as any));
    mockGetDocs.mockResolvedValueOnce(
      mockSnapshot([
        { id: 'casal1', data: () => casalAtual },
        { id: 'casal2', data: () => outroLider },
      ])
    );

    const result = await dbService.updateCasal('casal1', { tipo: 'LIDER' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite de 1 Casal Líder');
  });

  it('should allow updating names without changing tipo', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.updateCasal('casal1', { nomeEle: 'Pedro', nomeEla: 'Ana' });
    expect(result.success).toBe(true);
  });
});

// ============================================================
// P1: getTurmas
// ============================================================
describe('dbService.getTurmas', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  it('should return turmas ordered by createdAt', async () => {
    const turma1 = mockTurma({ id: 't1', nome: 'Turma A', createdAt: '2026-01-01T00:00:00Z' });
    const turma2 = mockTurma({ id: 't2', nome: 'Turma B', createdAt: '2026-02-01T00:00:00Z' });

    mockGetDocs.mockResolvedValueOnce(
      mockSnapshot([
        { id: 't2', data: () => turma2 },
        { id: 't1', data: () => turma1 },
      ])
    );

    const result = await dbService.getTurmas();
    expect(result).toHaveLength(2);
    expect(result[0].nome).toBe('Turma B');
    expect(result[1].nome).toBe('Turma A');
  });

  it('should return empty array when no turmas exist', async () => {
    mockGetDocs.mockResolvedValueOnce(mockSnapshot([]));

    const result = await dbService.getTurmas();
    expect(result).toEqual([]);
  });

  it('should return empty array on error', async () => {
    mockGetDocs.mockRejectedValueOnce(new Error('Firestore error'));

    const result = await dbService.getTurmas();
    expect(result).toEqual([]);
  });
});

// ============================================================
// P1: getCasais
// ============================================================
describe('dbService.getCasais', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  it('should return casais filtered by turmaId', async () => {
    const casal1 = mockCasal({ id: 'c1', turmaId: 'turma1' });
    const casal2 = mockCasal({ id: 'c2', turmaId: 'turma1' });

    mockGetDocs.mockResolvedValueOnce(
      mockSnapshot([
        { id: 'c1', data: () => casal1 },
        { id: 'c2', data: () => casal2 },
      ])
    );

    const result = await dbService.getCasais('turma1');
    expect(result).toHaveLength(2);
    expect(result[0].turmaId).toBe('turma1');
  });

  it('should return all casais when no turmaId filter', async () => {
    const casal1 = mockCasal({ id: 'c1', turmaId: 'turma1' });
    const casal2 = mockCasal({ id: 'c2', turmaId: 'turma2' });

    mockGetDocs.mockResolvedValueOnce(
      mockSnapshot([
        { id: 'c1', data: () => casal1 },
        { id: 'c2', data: () => casal2 },
      ])
    );

    const result = await dbService.getCasais();
    expect(result).toHaveLength(2);
  });

  it('should return empty array on error', async () => {
    mockGetDocs.mockRejectedValueOnce(new Error('Firestore error'));

    const result = await dbService.getCasais('turma1');
    expect(result).toEqual([]);
  });
});

// ============================================================
// CRUD Turmas (createTurma, updateTurma, deleteTurma, toggleTurmaConcluida, updateSemanaData)
// ============================================================
describe('dbService.createTurma', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should create a turma and return its id', async () => {
    mockAddDoc.mockResolvedValueOnce({ id: 'turma-new' });

    const result = await dbService.createTurma('Turma Teste', '2026-03-01');
    expect(result).toBe('turma-new');
    expect(mockAddDoc).toHaveBeenCalled();
  });

  it('should return null on error', async () => {
    mockAddDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.createTurma('Turma Teste', '2026-03-01');
    expect(result).toBeNull();
  });
});

describe('dbService.updateTurma', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should update turma nome', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.updateTurma('turma1', 'Novo Nome');
    expect(result).toBe(true);
  });

  it('should update turma nome and dataInicio', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.updateTurma('turma1', 'Novo Nome', '2026-04-01');
    expect(result).toBe(true);
  });

  it('should return false on error', async () => {
    mockUpdateDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.updateTurma('turma1', 'Novo Nome');
    expect(result).toBe(false);
  });
});

describe('dbService.deleteTurma', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should delete a turma', async () => {
    mockDeleteDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.deleteTurma('turma1');
    expect(result).toBe(true);
  });

  it('should return false on error', async () => {
    mockDeleteDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.deleteTurma('turma1');
    expect(result).toBe(false);
  });
});

describe('dbService.deleteCasal', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should delete a casal', async () => {
    mockDeleteDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.deleteCasal('casal1');
    expect(result).toBe(true);
  });

  it('should return false on error', async () => {
    mockDeleteDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.deleteCasal('casal1');
    expect(result).toBe(false);
  });
});

describe('dbService.toggleTurmaConcluida', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should toggle turma concluida to true', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.toggleTurmaConcluida('turma1', true);
    expect(result).toBe(true);
  });

  it('should return false on error', async () => {
    mockUpdateDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.toggleTurmaConcluida('turma1', false);
    expect(result).toBe(false);
  });
});

describe('dbService.updateCasalFotoUrl', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should update fotoUrl', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.updateCasalFotoUrl('casal1', 'https://foto.jpg');
    expect(result).toBe(true);
  });

  it('should return false on error', async () => {
    mockUpdateDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.updateCasalFotoUrl('casal1', 'https://foto.jpg');
    expect(result).toBe(false);
  });
});

describe('dbService.updateSemanaData', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should set custom date for a week', async () => {
    const turmaData = { datasSemanas: {}, dataInicio: '2026-01-01T00:00:00Z' };
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.updateSemanaData('turma1', 2, '2026-01-15T00:00:00Z');
    expect(result).toBe(true);
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ datasSemanas: expect.objectContaining({ 2: '2026-01-15T00:00:00Z' }) })
    );
  });

  it('should remove custom date when dataPersonalizada is falsy', async () => {
    const turmaData = { datasSemanas: { 2: '2026-01-15T00:00:00Z' }, dataInicio: '2026-01-01T00:00:00Z' };
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.updateSemanaData('turma1', 2, undefined);
    expect(result).toBe(true);
  });

  it('should return false when turma does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce(mockDocSnapNotExist());

    const result = await dbService.updateSemanaData('turma1', 1, '2026-01-10');
    expect(result).toBe(false);
  });

  it('should return false on error', async () => {
    mockGetDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.updateSemanaData('turma1', 1, '2026-01-10');
    expect(result).toBe(false);
  });
});

// ============================================================
// P0: saveChecklist (transação + calcularPontuacao)
// ============================================================
describe('dbService.saveChecklist', () => {
  beforeEach(() => {
    resetFirebaseMocks();
    mockTransaction.update.mockClear();
    mockTransaction.get.mockClear();
  });

  it('should save week and recalculate pontuacao', async () => {
    // Semana 1 já existe com legacy vitaminas: true (3 pts: presenca + tarefas + vitaminas legacy)
    const semanasExistentes = {
      '1': { presenca: true, tarefas: true, tarefasExtras: false, vitaminas: true } as any,
    };
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: semanasExistentes } as any);
    mockTransactionDoc.exists.mockReturnValue(true);

    const checklist: SemanaCheck = {
      presenca: true,
      tarefas: true,
      tarefasExtras: true,
      vitaminas: true,
    };

    await dbService.saveChecklist('casal1', '2', checklist);

    // Semana 1: presenca(1) + tarefas(1) + legacy vitaminas(1) = 3
    // Semana 2: presenca(1) + tarefas(1) + tarefasExtras(1) + legacy vitaminas(1) = 4
    // Total = 7
    expect(mockTransaction.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ pontuacaoTotal: 7 })
    );
  });

  it('should preserve sorteioVitaminas when saving checklist (merge, not clobber)', async () => {
    const sorteio = mockSorteioVitaminas();
    const semanasExistentes = {
      '1': {
        presenca: true,
        tarefas: false,
        tarefasExtras: false,
        sorteioVitaminas: sorteio,
      },
    };
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: semanasExistentes });
    mockTransactionDoc.exists.mockReturnValue(true);

    // Salvar checklist SEM sorteioVitaminas — deve preservar o existente via merge
    const checklist: SemanaCheck = {
      presenca: true,
      tarefas: true,
      tarefasExtras: false,
    };

    await dbService.saveChecklist('casal1', '1', checklist);

    const updateCall = (mockTransaction.update.mock.calls as any[])[0];
    const updateData = updateCall[1];
    const semanaAtualizada = updateData.semanas['1'];

    // sorteioVitaminas deve ser preservado (merge)
    expect(semanaAtualizada.sorteioVitaminas).toBeDefined();
    expect(semanaAtualizada.sorteioVitaminas.ele.vitaminaId).toBe(sorteio.ele!.vitaminaId);
    expect(semanaAtualizada.sorteioVitaminas.ela.vitaminaId).toBe(sorteio.ela!.vitaminaId);
    // Campos do checklist devem ser atualizados
    expect(semanaAtualizada.presenca).toBe(true);
    expect(semanaAtualizada.tarefas).toBe(true);
  });

  it('should recalculate correctly with sorteioVitaminas checks (new formula)', async () => {
    const sorteio = mockSorteioVitaminas({
      ele: { check: true } as any,
      ela: { check: false } as any,
    });
    const semanasExistentes = {
      '1': {
        presenca: true,
        tarefas: true,
        tarefasExtras: true,
        sorteioVitaminas: sorteio,
      },
    };
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: semanasExistentes });
    mockTransactionDoc.exists.mockReturnValue(true);

    const checklist: SemanaCheck = {
      presenca: false,
      tarefas: false,
      tarefasExtras: false,
    };

    await dbService.saveChecklist('casal1', '2', checklist);

    // Semana 1: presenca(1) + tarefas(1) + tarefasExtras(1) + ele.check(1) + ela.check(0) = 4
    // Semana 2: tudo false = 0
    // Total = 4
    expect(mockTransaction.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ pontuacaoTotal: 4 })
    );
  });

  it('should handle empty semanas (first week)', async () => {
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: {} });
    mockTransactionDoc.exists.mockReturnValue(true);

    const checklist: SemanaCheck = {
      presenca: true,
      tarefas: false,
      tarefasExtras: false,
    };

    await dbService.saveChecklist('casal1', '1', checklist);

    // Semana 1: presenca(1) = 1
    expect(mockTransaction.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ pontuacaoTotal: 1 })
    );
  });

  it('should throw when transaction fails', async () => {
    mockRunTransaction.mockRejectedValueOnce(new Error('Transaction failed'));

    const checklist: SemanaCheck = { presenca: true, tarefas: true, tarefasExtras: false };

    await expect(dbService.saveChecklist('casal1', '1', checklist)).rejects.toThrow('Transaction failed');
  });
});

// ============================================================
// P0: sortearVitaminas (transação + calcularPontuacao)
// ============================================================
describe('dbService.sortearVitaminas', () => {
  beforeEach(() => {
    resetFirebaseMocks();
    mockTransaction.update.mockClear();
    mockTransaction.get.mockClear();
  });

  const vitEle = mockVitamina({ id: 'vit-ele', nome: 'Vitamina Ele', descricao: 'Desc Ele' });
  const vitEla = mockVitamina({ id: 'vit-ela', nome: 'Vitamina Ela', descricao: 'Desc Ela' });

  it('should persist snapshot and recalculate pontuacao', async () => {
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: {} });
    mockTransactionDoc.exists.mockReturnValue(true);

    const result = await dbService.sortearVitaminas('casal1', '1', vitEle, vitEla);

    expect(result).toBe(true);
    expect(mockTransaction.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        semanas: expect.objectContaining({
          '1': expect.objectContaining({
            sorteioVitaminas: expect.objectContaining({
              ele: expect.objectContaining({
                vitaminaId: 'vit-ele',
                nome: 'Vitamina Ele',
                descricao: 'Desc Ele',
                check: false,
              }),
              ela: expect.objectContaining({
                vitaminaId: 'vit-ela',
                nome: 'Vitamina Ela',
                descricao: 'Desc Ela',
                check: false,
              }),
            }),
          }),
        }),
      })
    );
  });

  it('should recalculate pontuacao with initial checks (false) = 0 pts for sorteio', async () => {
    // Semana 1 já tem presenca + tarefas (2 pts)
    const semanasExistentes = {
      '1': { presenca: true, tarefas: true, tarefasExtras: false },
    };
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: semanasExistentes });
    mockTransactionDoc.exists.mockReturnValue(true);

    await dbService.sortearVitaminas('casal1', '2', vitEle, vitEla);

    // Semana 1: presenca(1) + tarefas(1) = 2
    // Semana 2: checks false = 0 pts do sorteio
    // Total = 2
    expect(mockTransaction.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ pontuacaoTotal: 2 })
    );
  });

  it('should merge when semana already exists (preserve existing data)', async () => {
    const semanasExistentes = {
      '1': { presenca: true, tarefas: true, tarefasExtras: true },
    };
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: semanasExistentes });
    mockTransactionDoc.exists.mockReturnValue(true);

    // Sortear na semana 1 que já existe
    await dbService.sortearVitaminas('casal1', '1', vitEle, vitEla);

    const updateCall = (mockTransaction.update.mock.calls as any[])[0];
    const updateData = updateCall[1];
    const semana1 = updateData.semanas['1'];

    // Dados existentes devem ser preservados
    expect(semana1.presenca).toBe(true);
    expect(semana1.tarefas).toBe(true);
    expect(semana1.tarefasExtras).toBe(true);
    // Sorteio deve ser adicionado
    expect(semana1.sorteioVitaminas).toBeDefined();
    expect(semana1.sorteioVitaminas.ele.vitaminaId).toBe('vit-ele');

    // Pontuação: presenca(1) + tarefas(1) + tarefasExtras(1) = 3
    expect(updateData.pontuacaoTotal).toBe(3);
  });

  it('should return false on transaction error', async () => {
    mockRunTransaction.mockRejectedValueOnce(new Error('Transaction failed'));

    const result = await dbService.sortearVitaminas('casal1', '1', vitEle, vitEla);
    expect(result).toBe(false);
  });

  it('should include sorteadoEm timestamp in snapshot', async () => {
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: {} });
    mockTransactionDoc.exists.mockReturnValue(true);

    await dbService.sortearVitaminas('casal1', '1', vitEle, vitEla);

    const updateCall = (mockTransaction.update.mock.calls as any[])[0];
    const sorteio = updateCall[1].semanas['1'].sorteioVitaminas;
    expect(sorteio.ele.sorteadoEm).toBeDefined();
    expect(sorteio.ela.sorteadoEm).toBeDefined();
    // Deve ser um ISO timestamp válido
    expect(new Date(sorteio.ele.sorteadoEm).toISOString()).toBe(sorteio.ele.sorteadoEm);
  });
});

// ============================================================
// P0: saveVitaminaCheck (transação + calcularPontuacao)
// ============================================================
describe('dbService.saveVitaminaCheck', () => {
  beforeEach(() => {
    resetFirebaseMocks();
    mockTransaction.update.mockClear();
    mockTransaction.get.mockClear();
  });

  it('should update ele check and recalculate pontuacao', async () => {
    const sorteio = mockSorteioVitaminas();
    const semanasExistentes = {
      '1': {
        presenca: true,
        tarefas: true,
        tarefasExtras: false,
        sorteioVitaminas: sorteio,
      },
    };
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: semanasExistentes });
    mockTransactionDoc.exists.mockReturnValue(true);

    const result = await dbService.saveVitaminaCheck('casal1', '1', 'ele', true);

    expect(result).toBe(true);

    const updateCall = (mockTransaction.update.mock.calls as any[])[0];
    const semana1 = updateCall[1].semanas['1'];

    // Check de ele deve ser true
    expect(semana1.sorteioVitaminas.ele.check).toBe(true);
    // Check de ela deve permanecer como estava (false)
    expect(semana1.sorteioVitaminas.ela.check).toBe(false);

    // Pontuação: presenca(1) + tarefas(1) + ele.check(1) + ela.check(0) = 3
    expect(updateCall[1].pontuacaoTotal).toBe(3);
  });

  it('should update ela check and preserve ele check', async () => {
    const sorteio = mockSorteioVitaminas({
      ele: { check: true } as any,
    });
    const semanasExistentes = {
      '1': {
        presenca: false,
        tarefas: false,
        tarefasExtras: false,
        sorteioVitaminas: sorteio,
      },
    };
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: semanasExistentes });
    mockTransactionDoc.exists.mockReturnValue(true);

    const result = await dbService.saveVitaminaCheck('casal1', '1', 'ela', true);

    expect(result).toBe(true);

    const updateCall = (mockTransaction.update.mock.calls as any[])[0];
    const semana1 = updateCall[1].semanas['1'];

    // ele deve ser preservado
    expect(semana1.sorteioVitaminas.ele.check).toBe(true);
    // ela deve ser atualizado
    expect(semana1.sorteioVitaminas.ela.check).toBe(true);

    // Pontuação: ele.check(1) + ela.check(1) = 2
    expect(updateCall[1].pontuacaoTotal).toBe(2);
  });

  it('should return false when no sorteioVitaminas exists', async () => {
    const semanasExistentes = {
      '1': { presenca: true, tarefas: true, tarefasExtras: false },
    };
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: semanasExistentes });
    mockTransactionDoc.exists.mockReturnValue(true);

    const result = await dbService.saveVitaminaCheck('casal1', '1', 'ele', true);

    expect(result).toBe(false);
    // transaction.update NÃO deve ter sido chamado (não há sorteio)
    expect(mockTransaction.update).not.toHaveBeenCalled();
  });

  it('should return false when sorteio is null for the person', async () => {
    const sorteio = { ele: null, ela: mockSorteioVitaminas().ela };
    const semanasExistentes = {
      '1': {
        presenca: false,
        tarefas: false,
        tarefasExtras: false,
        sorteioVitaminas: sorteio,
      },
    };
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: semanasExistentes });
    mockTransactionDoc.exists.mockReturnValue(true);

    const result = await dbService.saveVitaminaCheck('casal1', '1', 'ele', true);

    expect(result).toBe(false);
    expect(mockTransaction.update).not.toHaveBeenCalled();
  });

  it('should return false on transaction error', async () => {
    mockRunTransaction.mockRejectedValueOnce(new Error('Transaction failed'));

    const result = await dbService.saveVitaminaCheck('casal1', '1', 'ele', true);
    expect(result).toBe(false);
  });

  it('should preserve snapshot fields when updating check', async () => {
    const sorteio = mockSorteioVitaminas();
    const semanasExistentes = {
      '1': {
        presenca: true,
        tarefas: false,
        tarefasExtras: false,
        sorteioVitaminas: sorteio,
      },
    };
    (mockTransactionDoc.data as any).mockReturnValue({ semanas: semanasExistentes });
    mockTransactionDoc.exists.mockReturnValue(true);

    await dbService.saveVitaminaCheck('casal1', '1', 'ele', true);

    const updateCall = (mockTransaction.update.mock.calls as any[])[0];
    const elSnapshot = updateCall[1].semanas['1'].sorteioVitaminas.ele;

    // Snapshot fields devem ser preservados
    expect(elSnapshot.vitaminaId).toBe(sorteio.ele!.vitaminaId);
    expect(elSnapshot.nome).toBe(sorteio.ele!.nome);
    expect(elSnapshot.descricao).toBe(sorteio.ele!.descricao);
    expect(elSnapshot.sorteadoEm).toBe(sorteio.ele!.sorteadoEm);
    // Apenas check foi alterado
    expect(elSnapshot.check).toBe(true);
  });
});

// ============================================================
// P2: CRUD Vitaminas (HU-26)
// ============================================================
describe('dbService.addVitamina', () => {
  beforeEach(() => {
    resetFirebaseMocks();
    // Mock crypto.randomUUID for deterministic tests
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-123' as any);
  });

  it('should add a vitamina to the turma', async () => {
    const turmaData = { vitaminas: {} };
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.addVitamina('turma1', 'Vitamina A', 'Descrição A');

    expect(result).toBe(true);
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        vitaminas: expect.objectContaining({
          'test-uuid-123': expect.objectContaining({
            id: 'test-uuid-123',
            nome: 'Vitamina A',
            descricao: 'Descrição A',
            semanas: [],
          }),
        }),
      })
    );
  });

  it('should preserve existing vitaminas when adding new one', async () => {
    const existingVit = mockVitamina({ id: 'existing-vit', nome: 'Existente' });
    const turmaData = { vitaminas: { 'existing-vit': existingVit } };
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    await dbService.addVitamina('turma1', 'Vitamina Nova', 'Desc');

    const updateCall = (mockUpdateDoc.mock.calls as any[]).at(-1);
    const vitaminas = updateCall[1].vitaminas;
    expect(vitaminas['existing-vit']).toBeDefined();
    expect(vitaminas['test-uuid-123']).toBeDefined();
  });

  it('should return false when turma does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce(mockDocSnapNotExist());

    const result = await dbService.addVitamina('turma1', 'Vitamina A', 'Desc');
    expect(result).toBe(false);
  });

  it('should return false on error', async () => {
    mockGetDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.addVitamina('turma1', 'Vitamina A', 'Desc');
    expect(result).toBe(false);
  });
});

describe('dbService.updateVitamina', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should update vitamina nome via dot notation', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.updateVitamina('turma1', 'vit-1', { nome: 'Novo Nome' });

    expect(result).toBe(true);
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ 'vitaminas.vit-1.nome': 'Novo Nome' })
    );
  });

  it('should update vitamina descricao via dot notation', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.updateVitamina('turma1', 'vit-1', { descricao: 'Nova Desc' });

    expect(result).toBe(true);
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ 'vitaminas.vit-1.descricao': 'Nova Desc' })
    );
  });

  it('should update both nome and descricao', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.updateVitamina('turma1', 'vit-1', { nome: 'Novo', descricao: 'Desc' });

    expect(result).toBe(true);
  });

  it('should return false when no fields to update', async () => {
    const result = await dbService.updateVitamina('turma1', 'vit-1', {});
    expect(result).toBe(false);
  });

  it('should return false on error', async () => {
    mockUpdateDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.updateVitamina('turma1', 'vit-1', { nome: 'Novo' });
    expect(result).toBe(false);
  });
});

describe('dbService.deleteVitamina', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should delete a vitamina from the turma', async () => {
    const vit = mockVitamina({ id: 'vit-1' });
    const turmaData = { vitaminas: { 'vit-1': vit, 'vit-2': mockVitamina({ id: 'vit-2' }) } };
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.deleteVitamina('turma1', 'vit-1');

    expect(result).toBe(true);
    const updateCall = (mockUpdateDoc.mock.calls as any[]).at(-1);
    expect(updateCall[1].vitaminas['vit-1']).toBeUndefined();
    expect(updateCall[1].vitaminas['vit-2']).toBeDefined();
  });

  it('should return false when vitamina does not exist', async () => {
    const turmaData = { vitaminas: { 'vit-1': mockVitamina({ id: 'vit-1' }) } };
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));

    const result = await dbService.deleteVitamina('turma1', 'vit-999');
    expect(result).toBe(false);
  });

  it('should return false when turma does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce(mockDocSnapNotExist());

    const result = await dbService.deleteVitamina('turma1', 'vit-1');
    expect(result).toBe(false);
  });

  it('should return false on error', async () => {
    mockGetDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.deleteVitamina('turma1', 'vit-1');
    expect(result).toBe(false);
  });
});

describe('dbService.setVitaminaSemanas', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should update semanas array via dot notation', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    const result = await dbService.setVitaminaSemanas('turma1', 'vit-1', [1, 3, 5]);

    expect(result).toBe(true);
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ 'vitaminas.vit-1.semanas': [1, 3, 5] })
    );
  });

  it('should return false on error', async () => {
    mockUpdateDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.setVitaminaSemanas('turma1', 'vit-1', [1]);
    expect(result).toBe(false);
  });
});

describe('dbService.getVitaminas', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should return all vitaminas from a turma', async () => {
    const vit1 = mockVitamina({ id: 'vit-1', nome: 'Vit A' });
    const vit2 = mockVitamina({ id: 'vit-2', nome: 'Vit B' });
    const turmaData = { vitaminas: { 'vit-1': vit1, 'vit-2': vit2 } };
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));

    const result = await dbService.getVitaminas('turma1');

    expect(result).toHaveLength(2);
    expect(result.map(v => v.nome)).toEqual(['Vit A', 'Vit B']);
  });

  it('should return empty array when turma has no vitaminas', async () => {
    mockGetDoc.mockResolvedValueOnce(mockDocSnap({ vitaminas: {} }));

    const result = await dbService.getVitaminas('turma1');
    expect(result).toEqual([]);
  });

  it('should return empty array when turma does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce(mockDocSnapNotExist());

    const result = await dbService.getVitaminas('turma1');
    expect(result).toEqual([]);
  });

  it('should return empty array on error', async () => {
    mockGetDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.getVitaminas('turma1');
    expect(result).toEqual([]);
  });
});

describe('dbService.getVitaminasDaSemana', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should return vitaminas active in the given week', async () => {
    const vit1 = mockVitamina({ id: 'vit-1', nome: 'Vit A', semanas: [1, 3, 5] });
    const vit2 = mockVitamina({ id: 'vit-2', nome: 'Vit B', semanas: [2, 3] });
    const vit3 = mockVitamina({ id: 'vit-3', nome: 'Vit C', semanas: [1, 2] });
    const turmaData = { vitaminas: { 'vit-1': vit1, 'vit-2': vit2, 'vit-3': vit3 } };
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));

    const result = await dbService.getVitaminasDaSemana('turma1', 3);

    expect(result).toHaveLength(2);
    expect(result.map(v => v.nome)).toEqual(['Vit A', 'Vit B']);
  });

  it('should return empty array when no vitaminas match the week', async () => {
    const vit1 = mockVitamina({ id: 'vit-1', semanas: [1, 2] });
    const turmaData = { vitaminas: { 'vit-1': vit1 } };
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));

    const result = await dbService.getVitaminasDaSemana('turma1', 5);
    expect(result).toEqual([]);
  });

  it('should return empty array when turma does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce(mockDocSnapNotExist());

    const result = await dbService.getVitaminasDaSemana('turma1', 1);
    expect(result).toEqual([]);
  });

  it('should return empty array on error', async () => {
    mockGetDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.getVitaminasDaSemana('turma1', 1);
    expect(result).toEqual([]);
  });
});

// ============================================================
// HU-28: getHistoricoVitaminas
// ============================================================
describe('dbService.getHistoricoVitaminas', () => {
  beforeEach(() => { resetFirebaseMocks(); });

  it('should return history items sorted by week descending', async () => {
    const sorteio1 = mockSorteioVitaminas({
      ele: { check: true } as any,
      ela: { check: false } as any,
    });
    const sorteio2 = mockSorteioVitaminas({
      ele: { check: false } as any,
      ela: { check: true } as any,
    });

    const casalData = {
      turmaId: 'turma1',
      semanas: {
        '1': { presenca: true, tarefas: true, tarefasExtras: false, sorteioVitaminas: sorteio1 },
        '3': { presenca: true, tarefas: false, tarefasExtras: false, sorteioVitaminas: sorteio2 },
      },
    };

    const turmaData = {
      dataInicio: '2026-01-01T00:00:00Z',
      datasSemanas: { '1': '2026-01-05T00:00:00Z', '3': '2026-01-19T00:00:00Z' },
    };

    // Primeira chamada: getDoc casais
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(casalData));
    // Segunda chamada: getDoc turmas
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));

    const result = await dbService.getHistoricoVitaminas('casal1');

    expect(result).toHaveLength(2);
    // Ordenado da mais recente para a mais antiga
    expect(result[0].semana).toBe(3);
    expect(result[1].semana).toBe(1);
    // Status dos checks
    expect(result[0].statusEle).toBe('PENDENTE'); // check: false
    expect(result[0].statusEla).toBe('CUMPRIDA'); // check: true
    expect(result[1].statusEle).toBe('CUMPRIDA');
    expect(result[1].statusEla).toBe('PENDENTE');
  });

  it('should use datasSemanas override for dates', async () => {
    const sorteio = mockSorteioVitaminas();
    const casalData = {
      turmaId: 'turma1',
      semanas: {
        '2': { presenca: true, tarefas: true, tarefasExtras: false, sorteioVitaminas: sorteio },
      },
    };
    const turmaData = {
      dataInicio: '2026-01-01T00:00:00Z',
      datasSemanas: { '2': '2026-01-20T00:00:00Z' },
    };

    mockGetDoc.mockResolvedValueOnce(mockDocSnap(casalData));
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));

    const result = await dbService.getHistoricoVitaminas('casal1');

    expect(result).toHaveLength(1);
    expect(result[0].data).toBe('2026-01-20T00:00:00Z');
  });

  it('should calculate date from dataInicio when datasSemanas has no override', async () => {
    const sorteio = mockSorteioVitaminas();
    const casalData = {
      turmaId: 'turma1',
      semanas: {
        '2': { presenca: true, tarefas: true, tarefasExtras: false, sorteioVitaminas: sorteio },
      },
    };
    const turmaData = {
      dataInicio: '2026-01-01T00:00:00Z',
      datasSemanas: {},
    };

    mockGetDoc.mockResolvedValueOnce(mockDocSnap(casalData));
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));

    const result = await dbService.getHistoricoVitaminas('casal1');

    expect(result).toHaveLength(1);
    // dataInicio + (2-1)*7 = 2026-01-08
    expect(result[0].data).toBeDefined();
    const expectedDate = new Date('2026-01-01T00:00:00Z');
    expectedDate.setDate(expectedDate.getDate() + 7);
    expect(result[0].data).toBe(expectedDate.toISOString());
  });

  it('should return empty array when casal does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce(mockDocSnapNotExist());

    const result = await dbService.getHistoricoVitaminas('casal-inexistente');
    expect(result).toEqual([]);
  });

  it('should skip semanas without sorteioVitaminas', async () => {
    const casalData = {
      turmaId: 'turma1',
      semanas: {
        '1': { presenca: true, tarefas: true, tarefasExtras: false }, // sem sorteio
        '2': {
          presenca: true,
          tarefas: false,
          tarefasExtras: false,
          sorteioVitaminas: mockSorteioVitaminas(),
        },
      },
    };
    const turmaData = { dataInicio: '2026-01-01T00:00:00Z', datasSemanas: {} };

    mockGetDoc.mockResolvedValueOnce(mockDocSnap(casalData));
    mockGetDoc.mockResolvedValueOnce(mockDocSnap(turmaData));

    const result = await dbService.getHistoricoVitaminas('casal1');

    expect(result).toHaveLength(1);
    expect(result[0].semana).toBe(2);
  });

  it('should return empty array on error', async () => {
    mockGetDoc.mockRejectedValueOnce(new Error('fail'));

    const result = await dbService.getHistoricoVitaminas('casal1');
    expect(result).toEqual([]);
  });
});
