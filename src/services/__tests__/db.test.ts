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
import {
  mockGetDocs,
  mockGetDoc,
  mockAddDoc,
  mockUpdateDoc,
  resetFirebaseMocks,
} from '../../test/mocks/firebase';
import { mockCasal } from '../../test/helpers/fixtures';

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
