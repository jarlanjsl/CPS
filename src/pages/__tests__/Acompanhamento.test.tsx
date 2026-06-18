import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// ── Firebase Mocks ──
vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock('firebase/auth', () =>
  import('../../test/mocks/firebase').then((m) => m.authExports)
);
vi.mock('firebase/firestore', () =>
  import('../../test/mocks/firebase').then((m) => m.firestoreExports)
);
vi.mock('firebase/storage', () =>
  import('../../test/mocks/firebase').then((m) => m.storageExports)
);

import Acompanhamento from '../Acompanhamento';
import {
  mockGetDocs,
  mockRunTransaction,
  mockTransaction,
  resetFirebaseMocks,
} from '../../test/mocks/firebase';
import { mockTurma, mockCasal, mockSorteioVitaminas, mockVitaminaSorteio } from '../../test/helpers/fixtures';
import type { Casal } from '../../services/db';

// ── Helpers ──

function collectionSnapshot<T extends Record<string, unknown>>(
  items: Array<{ id: string; data: T }>
) {
  return {
    forEach: (cb: (doc: { id: string; data: () => T }) => void) => {
      items.forEach((item) => cb({ id: item.id, data: () => item.data }));
    },
    docs: items.map((item) => ({ id: item.id, data: () => item.data })),
    empty: items.length === 0,
    size: items.length,
  };
}

function getTurmaSnapshot() {
  const turma = mockTurma({
    id: 'turma-1', nome: 'Turma Piloto',
    dataInicio: '2026-01-05T00:00:00.000Z',
  });
  return collectionSnapshot([{ id: turma.id, data: turma }]);
}

function getCasaisSnapshot(casais: Casal[]) {
  return collectionSnapshot(casais.map((c) => ({ id: c.id, data: c })));
}

function renderComponent(route = '/turma/turma-1/semana/1') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/turma/:id/semana/:semanaId" element={<Acompanhamento />} />
        <Route path="/turma/:id" element={<div>Turma Detail</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const CASAL_COM_SORTEIO = mockCasal({
  id: 'casal-1', nomeEle: 'João', nomeEla: 'Maria', tipo: 'ALUNO',
  semanas: {
    '1': {
      presenca: false, tarefas: false, tarefasExtras: false,
      sorteioVitaminas: mockSorteioVitaminas({
        ele: mockVitaminaSorteio({ vitaminaId: 'v1', nome: 'Vitamina A', check: false }),
        ela: mockVitaminaSorteio({ vitaminaId: 'v2', nome: 'Vitamina B', check: false }),
      }),
    },
  },
});

const CASAL_SEM_SORTEIO = mockCasal({
  id: 'casal-1', nomeEle: 'João', nomeEla: 'Maria', tipo: 'ALUNO',
  semanas: { '1': { presenca: false, tarefas: false, tarefasExtras: false } },
});

// ── Testes ──

describe('Acompanhamento', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  // ── Estados de carregamento ──
  describe('Estados de carregamento', () => {
    it('deve exibir loading enquanto carrega', () => {
      mockGetDocs.mockImplementation(() => new Promise(() => {}));
      const { container } = renderComponent();
      expect(container.querySelector('.spinner')).toBeInTheDocument();
    });

    it('deve exibir título com número da semana', async () => {
      mockGetDocs.mockResolvedValue(getTurmaSnapshot());
      renderComponent();
      expect(await screen.findByText('Semana 1')).toBeInTheDocument();
    });
  });

  // ── Checkboxes de Presença, Tarefas e Tarefas Extras ──
  describe('Checkboxes básicos', () => {
    it('deve exibir checkboxes de presença, tarefas e extra para cada casal', async () => {
      mockGetDocs
        .mockResolvedValueOnce(getCasaisSnapshot([CASAL_COM_SORTEIO]))
        .mockResolvedValueOnce(getTurmaSnapshot());
      renderComponent();
      expect(await screen.findByText('Presença')).toBeInTheDocument();
      expect(await screen.findByText('Tarefas Base')).toBeInTheDocument();
      expect(await screen.findByText('Tarefa Extra (+1pt)')).toBeInTheDocument();
    });

    it('deve alternar checkbox de presença ao clicar', async () => {
      mockGetDocs
        .mockResolvedValueOnce(getCasaisSnapshot([CASAL_COM_SORTEIO]))
        .mockResolvedValueOnce(getTurmaSnapshot());
      renderComponent();
      const presencaLabel = await screen.findByText('Presença');
      await userEvent.click(presencaLabel);
      const checkbox = presencaLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('deve exibir mensagem quando não há membros', async () => {
      mockGetDocs
        .mockResolvedValueOnce(getCasaisSnapshot([]))
        .mockResolvedValueOnce(getTurmaSnapshot());
      renderComponent();
      expect(await screen.findByText('Nenhum membro nesta turma.')).toBeInTheDocument();
    });
  });

  // ── Card de Vitaminas Sorteadas ──
  describe('Card de Vitaminas Sorteadas', () => {
    it('deve exibir o header "Vitaminas Sorteadas"', async () => {
      mockGetDocs
        .mockResolvedValueOnce(getCasaisSnapshot([CASAL_COM_SORTEIO]))
        .mockResolvedValueOnce(getTurmaSnapshot());
      renderComponent();
      expect(await screen.findByText('Vitaminas Sorteadas')).toBeInTheDocument();
    });

    it('deve exibir checks individuais Ele/Ela com nomes das vitaminas', async () => {
      mockGetDocs
        .mockResolvedValueOnce(getCasaisSnapshot([CASAL_COM_SORTEIO]))
        .mockResolvedValueOnce(getTurmaSnapshot());
      renderComponent();
      expect(await screen.findByText('Vitamina A')).toBeInTheDocument();
      expect(await screen.findByText('Vitamina B')).toBeInTheDocument();
    });

    it('deve alternar check de vitamina Ele', async () => {
      // Mock da transação: precisa retornar um documento com semanas que tenham sorteioVitaminas
      const mockDocWithSorteio = {
        exists: () => true,
        data: () => ({
          semanas: {
            '1': {
              presenca: false,
              tarefas: false,
              tarefasExtras: false,
              sorteioVitaminas: {
                ele: { vitaminaId: 'v1', nome: 'Vitamina A', check: false, sorteadoEm: '2026-01-07T00:00:00.000Z' },
                ela: { vitaminaId: 'v2', nome: 'Vitamina B', check: false, sorteadoEm: '2026-01-07T00:00:00.000Z' },
              },
            },
          },
          pontuacaoTotal: 0,
        }),
        id: 'mock-doc-id',
      };
      mockRunTransaction.mockImplementation(
        async (_db: unknown, updateFn: (t: typeof mockTransaction) => Promise<unknown>) => {
          mockTransaction.get.mockResolvedValue(mockDocWithSorteio);
          return updateFn(mockTransaction);
        }
      );
      mockGetDocs
        .mockResolvedValueOnce(getCasaisSnapshot([CASAL_COM_SORTEIO]))
        .mockResolvedValueOnce(getTurmaSnapshot());
      renderComponent();
      await screen.findByText('Vitamina A');
      const checkbox = screen.getByText('João').closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      await userEvent.click(checkbox);
      await waitFor(() => {
        const updated = screen.getByText('João').closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(updated.checked).toBe(true);
      });
    });

    it('deve exibir "Sem vitamina sorteada" quando não há sorteio', async () => {
      mockGetDocs
        .mockResolvedValueOnce(getCasaisSnapshot([CASAL_SEM_SORTEIO]))
        .mockResolvedValueOnce(getTurmaSnapshot());
      renderComponent();
      expect(
        await screen.findByText(/Sem vitamina sorteada/)
      ).toBeInTheDocument();
    });
  });

  // ── Botão Salvar ──
  describe('Botão Salvar', () => {
    it('deve exibir botão "Salvar"', async () => {
      mockGetDocs
        .mockResolvedValueOnce(getCasaisSnapshot([CASAL_COM_SORTEIO]))
        .mockResolvedValueOnce(getTurmaSnapshot());
      renderComponent();
      expect(await screen.findByText('Salvar')).toBeInTheDocument();
    });

    it('deve processar salvamento e navegar', async () => {
      mockRunTransaction.mockImplementation(
        async (_db: unknown, updateFn: (t: typeof mockTransaction) => Promise<unknown>) => {
          return updateFn(mockTransaction);
        }
      );
      mockGetDocs
        .mockResolvedValueOnce(getCasaisSnapshot([CASAL_COM_SORTEIO]))
        .mockResolvedValueOnce(getTurmaSnapshot());
      renderComponent();
      const salvarBtn = await screen.findByText('Salvar');
      await userEvent.click(salvarBtn);
      await waitFor(() => {
        expect(screen.queryByText('Gravando...')).not.toBeInTheDocument();
      });
    });
  });
});
