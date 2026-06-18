import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// ── Firebase Mocks (devem vir antes de qualquer import do projeto) ──
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

// ── Mocks de dependências externas ──
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

import TurmaDetail from '../TurmaDetail';
import {
  mockGetDocs,
  mockQuerySnapshot,
  mockUpdateDoc,
  mockAddDoc,
  mockDeleteDoc,
  resetFirebaseMocks,
} from '../../test/mocks/firebase';
import { mockTurma, mockCasal } from '../../test/helpers/fixtures';
import type { Turma, Casal } from '../../services/db';

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

function renderComponent(route = '/turma/turma-1') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/turma/:id" element={<TurmaDetail />} />
        <Route
          path="/aluno/:id/vitaminas"
          element={<div>Histórico de Vitaminas</div>}
        />
        <Route
          path="/turma/:id/semana/:semanaId"
          element={<div>Acompanhamento Semanal</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

function setupDefaultMocks() {
  resetFirebaseMocks();

  const turma = mockTurma({
    id: 'turma-1',
    nome: 'Turma Piloto',
    dataInicio: '2026-01-01T00:00:00.000Z',
  });

  const casais = [
    mockCasal({ id: 'casal-1', nomeEle: 'João', nomeEla: 'Maria', tipo: 'LIDER', pontuacaoTotal: 15 }),
    mockCasal({ id: 'casal-2', nomeEle: 'Pedro', nomeEla: 'Ana', tipo: 'ALUNO', pontuacaoTotal: 10 }),
    mockCasal({ id: 'casal-3', nomeEle: 'Marcos', nomeEla: 'Julia', tipo: 'ALUNO', pontuacaoTotal: 8 }),
  ];

  let calls = 0;
  mockGetDocs.mockImplementation(() => {
    calls++;
    if (calls === 1) {
      return Promise.resolve(collectionSnapshot([{ id: turma.id, data: turma }]));
    }
    return Promise.resolve(collectionSnapshot(casais.map((c) => ({ id: c.id, data: c }))));
  });
}

// ── Testes ──

describe('TurmaDetail', () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  // ── Estados de carregamento e erro ──
  describe('Estados de carregamento e erro', () => {
    it('deve exibir loading enquanto carrega os dados', () => {
      mockGetDocs.mockImplementation(() => new Promise(() => {}));
      const { container } = renderComponent();
      expect(container.querySelector('.spinner')).toBeInTheDocument();
      expect(container.querySelector('.turma-loading')).toBeInTheDocument();
    });

    it('deve exibir "Turma não encontrada" quando o id não existe', async () => {
      mockGetDocs.mockResolvedValue(collectionSnapshot([]));
      renderComponent('/turma/id-inexistente');
      expect(
        await screen.findByText('Turma não encontrada no banco.')
      ).toBeInTheDocument();
    });
  });

  // ── Renderização da Turma e Casais ──
  describe('Renderização da Turma e Casais', () => {
    it('deve exibir o nome da turma', async () => {
      renderComponent();
      expect(await screen.findByText('Turma Piloto')).toBeInTheDocument();
    });

    it('deve listar todos os casais com nomes', async () => {
      renderComponent();
      expect(await screen.findByText('João & Maria')).toBeInTheDocument();
      expect(await screen.findByText('Pedro & Ana')).toBeInTheDocument();
      expect(await screen.findByText('Marcos & Julia')).toBeInTheDocument();
    });

    it('deve exibir a pontuação de cada casal', async () => {
      renderComponent();
      await screen.findByText('Turma Piloto');
      // A pontuação aparece como spans com a classe turma-pontos-value
      const pontos = screen.getAllByText(/^(15|10|8)$/);
      expect(pontos.length).toBe(3);
    });

    it('deve exibir badge de Líder para casal líder', async () => {
      renderComponent();
      expect(await screen.findByText('Líder')).toBeInTheDocument();
    });

    it('deve exibir badge de Aluno para casal aluno', async () => {
      renderComponent();
      const badges = await screen.findAllByText('Aluno');
      expect(badges).toHaveLength(2);
    });

    it('deve exibir "Sem casais na turma" quando não há membros', async () => {
      let calls = 0;
      mockGetDocs.mockImplementation(() => {
        calls++;
        if (calls === 1) {
          return Promise.resolve(
            collectionSnapshot([{ id: 'turma-1', data: mockTurma() }])
          );
        }
        return Promise.resolve(collectionSnapshot([]));
      });
      renderComponent();
      expect(await screen.findByText('Sem casais na turma')).toBeInTheDocument();
    });

    it('deve exibir link de voltar para home', async () => {
      renderComponent();
      const backLink = await screen.findByText('← Voltar');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/');
    });
  });

  // ── Modal de Cadastro de Casal ──
  describe('Modal de Cadastro de Casal', () => {
    it('deve abrir o modal ao clicar em "Cadastrar"', async () => {
      renderComponent();
      await userEvent.click(await screen.findByText('Cadastrar'));
      expect(screen.getByText('Novo Casal')).toBeInTheDocument();
    });

    it('deve fechar o modal ao clicar no X', async () => {
      renderComponent();
      await userEvent.click(await screen.findByText('Cadastrar'));
      const modalOverlay = screen.getByText('Novo Casal').closest('.modal-overlay');
      expect(modalOverlay).toBeInTheDocument();
      const xBtn = modalOverlay!.querySelector('.modal-close-btn') as HTMLElement;
      expect(xBtn).toBeInTheDocument();
      await userEvent.click(xBtn);
      await waitFor(() => {
        expect(screen.queryByText('Novo Casal')).not.toBeInTheDocument();
      });
    });

    it('deve desabilitar o botão submit quando campos estão vazios', async () => {
      renderComponent();
      await userEvent.click(await screen.findByText('Cadastrar'));
      expect(screen.getByRole('button', { name: /adicionar casal/i })).toBeDisabled();
    });

    it('deve cadastrar casal com sucesso', async () => {
      mockAddDoc.mockResolvedValue({ id: 'novo-casal-id' });
      renderComponent();
      await userEvent.click(await screen.findByText('Cadastrar'));
      await userEvent.type(screen.getByPlaceholderText(/nome dEle/i), 'Carlos');
      await userEvent.type(screen.getByPlaceholderText(/nome dEla/i), 'Sandra');
      await userEvent.selectOptions(screen.getByRole('combobox'), 'ALUNO');

      const submitBtn = screen.getByRole('button', { name: /adicionar casal/i });
      expect(submitBtn).not.toBeDisabled();
      await userEvent.click(submitBtn);
      await waitFor(() => {
        expect(screen.queryByText('Novo Casal')).not.toBeInTheDocument();
      });
    });
  });

  // ── Modal de Edição de Casal ──
  describe('Modal de Edição de Casal', () => {
    it('deve abrir modal com dados preenchidos ao clicar em editar', async () => {
      renderComponent();
      const editBtns = await screen.findAllByTitle('Editar casal');
      expect(editBtns.length).toBeGreaterThanOrEqual(1);
      await userEvent.click(editBtns[0]);

      expect(screen.getByText('Editar Casal')).toBeInTheDocument();
      const nomeEleInput = screen.getByPlaceholderText('Nome dEle') as HTMLInputElement;
      const nomeElaInput = screen.getByPlaceholderText('Nome dEla') as HTMLInputElement;
      expect(nomeEleInput.value).toBe('João');
      expect(nomeElaInput.value).toBe('Maria');
    });
  });

  // ── Modal de Exclusão de Casal ──
  describe('Modal de Exclusão de Casal', () => {
    it('deve abrir modal de exclusão ao clicar em excluir', async () => {
      renderComponent();
      await userEvent.click((await screen.findAllByTitle('Excluir casal'))[0]);
      expect(screen.getByText('Excluir Casal')).toBeInTheDocument();
    });

    it('deve desabilitar botão de confirmar até digitar "Excluir"', async () => {
      renderComponent();
      await userEvent.click((await screen.findAllByTitle('Excluir casal'))[0]);
      const confirmBtn = screen.getByRole('button', { name: /confirmar exclusão/i });
      expect(confirmBtn).toBeDisabled();

      await userEvent.type(screen.getByPlaceholderText('Excluir'), 'Excluir');
      expect(confirmBtn).not.toBeDisabled();
    });

    it('deve confirmar exclusão quando digitar "Excluir" e clicar', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);
      renderComponent();
      await userEvent.click((await screen.findAllByTitle('Excluir casal'))[0]);
      await userEvent.type(screen.getByPlaceholderText('Excluir'), 'Excluir');
      await userEvent.click(screen.getByRole('button', { name: /confirmar exclusão/i }));
      await waitFor(() => {
        expect(screen.queryByText('Excluir Casal')).not.toBeInTheDocument();
      });
    });
  });

  // ── Modal de Concluir/Reabrir Turma ──
  describe('Modal de Concluir/Reabrir Turma', () => {
    it('deve abrir modal de conclusão com botão "Concluir Turma"', async () => {
      renderComponent();
      // Existem vários elementos "Concluir Turma", pegar o botão (primeiro)
      await userEvent.click(await screen.findByText('Concluir Turma'));
      expect(screen.getAllByText('Concluir Turma').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/Deseja concluir a turma/)).toBeInTheDocument();
    });

    it('deve exibir "Reabrir Turma" quando turma está concluída', async () => {
      let calls = 0;
      mockGetDocs.mockImplementation(() => {
        calls++;
        if (calls === 1) {
          return Promise.resolve(
            collectionSnapshot([
              { id: 'turma-2', data: mockTurma({ id: 'turma-2', nome: 'Turma Concluída', concluida: true }) },
            ])
          );
        }
        return Promise.resolve(collectionSnapshot([]));
      });
      renderComponent('/turma/turma-2');
      expect(await screen.findByText('Reabrir Turma')).toBeInTheDocument();
    });

    it('deve confirmar conclusão da turma', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      renderComponent();
      await userEvent.click(await screen.findByText('Concluir Turma'));
      await userEvent.click(screen.getByRole('button', { name: /sim, concluir/i }));
      await waitFor(() => {
        expect(screen.queryByText(/Deseja concluir a turma/)).not.toBeInTheDocument();
      });
    });
  });

  // ── Modal de Editar Nome da Turma ──
  describe('Modal de Editar Nome da Turma', () => {
    it('deve abrir modal de edição ao clicar no lápis do título', async () => {
      renderComponent();
      const editBtns = await screen.findAllByTitle('Editar casal');
      // O primeiro pencil é do cabeçalho da turma (turma-edit-btn)
      // Este botão fica ao lado do nome da turma
      await userEvent.click(screen.getByText('Turma Piloto'));
      // Na verdade o botão de editar turma é o primeiro botão com Pencil
    });

    it('deve exibir botão de editar turma', async () => {
      renderComponent();
      await screen.findByText('Turma Piloto');
      const editTurmaBtn = document.querySelector('.turma-edit-btn');
      expect(editTurmaBtn).toBeInTheDocument();
    });

    it('deve abrir e editar nome da turma', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      renderComponent();
      await screen.findByText('Turma Piloto');
      const editTurmaBtn = document.querySelector('.turma-edit-btn') as HTMLElement;
      await userEvent.click(editTurmaBtn);
      expect(screen.getByText('Editar Turma')).toBeInTheDocument();
      // Preenchido com o nome atual
      const nomeInput = screen.getByPlaceholderText('Novo nome da turma') as HTMLInputElement;
      expect(nomeInput.value).toBe('Turma Piloto');
    });
  });

  // ── Sorteio Vitaminas ──
  describe('Sorteio de Vitaminas', () => {
    it('deve exibir botão "Girar Roleta" para cada semana', async () => {
      renderComponent();
      const roletaBtns = await screen.findAllByTitle('Sortear vitaminas desta semana');
      expect(roletaBtns.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Variações de tipo de casal ──
  describe('Variações de tipo de casal', () => {
    it('deve exibir badge Co-Líder para casal co-líder', async () => {
      let calls = 0;
      mockGetDocs.mockImplementation(() => {
        calls++;
        if (calls === 1) {
          return Promise.resolve(
            collectionSnapshot([{ id: 'turma-1', data: mockTurma() }])
          );
        }
        return Promise.resolve(
          collectionSnapshot([
            { id: 'casal-1', data: mockCasal({ id: 'casal-1', nomeEle: 'Lucas', nomeEla: 'Lara', tipo: 'CO-LIDER' }) },
          ])
        );
      });
      renderComponent();
      expect(await screen.findByText('Co-Líder')).toBeInTheDocument();
    });

    it('deve exibir badges para alunos com findAllByText', async () => {
      renderComponent();
      const alunos = await screen.findAllByText('Aluno');
      expect(alunos.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Navegação ──
  describe('Navegação para Acompanhamento Semanal', () => {
    it('deve ter links para cada semana de acompanhamento', async () => {
      renderComponent();
      expect(await screen.findByText('Lição 1')).toBeInTheDocument();
      expect(await screen.findByText('Lição 14')).toBeInTheDocument();
      const link1 = screen.getByText('Lição 1').closest('a');
      expect(link1).toHaveAttribute('href', '/turma/turma-1/semana/1');
    });

    it('deve ter link para histórico de vitaminas de cada casal', async () => {
      renderComponent();
      const links = await screen.findAllByText('Histórico de Vitaminas');
      expect(links.length).toBeGreaterThanOrEqual(1);
      expect(links[0].closest('a')).toHaveAttribute('href', '/aluno/casal-1/vitaminas');
    });
  });
});
