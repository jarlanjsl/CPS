import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

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

// ── Mock Framer Motion ──
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import Desempenho from '../Desempenho';
import {
  mockGetDocs,
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

function renderComponent() {
  return render(
    <MemoryRouter>
      <Desempenho />
    </MemoryRouter>
  );
}

const turmasPadrao: Turma[] = [
  mockTurma({ id: 'turma-1', nome: 'Turma Piloto' }),
  mockTurma({ id: 'turma-2', nome: 'Turma Extra' }),
];

const casaisPadrao: Casal[] = [
  mockCasal({
    id: 'casal-1', nomeEle: 'João', nomeEla: 'Maria', tipo: 'ALUNO', pontuacaoTotal: 25,
    semanas: {
      '1': { presenca: true, tarefas: true, tarefasExtras: true },
      '2': { presenca: true, tarefas: true, tarefasExtras: false },
    },
  }),
  mockCasal({
    id: 'casal-2', nomeEle: 'Pedro', nomeEla: 'Ana', tipo: 'ALUNO', pontuacaoTotal: 18,
    semanas: {
      '1': { presenca: true, tarefas: true, tarefasExtras: false },
      '2': { presenca: false, tarefas: true, tarefasExtras: false },
    },
  }),
  mockCasal({
    id: 'casal-3', nomeEle: 'Marcos', nomeEla: 'Julia', tipo: 'ALUNO', pontuacaoTotal: 30,
    semanas: {
      '1': { presenca: true, tarefas: true, tarefasExtras: true },
      '2': { presenca: true, tarefas: true, tarefasExtras: true },
    },
  }),
  mockCasal({
    id: 'casal-4', nomeEle: 'Líder', nomeEla: 'Líderesa', tipo: 'LIDER', pontuacaoTotal: 999, semanas: {},
  }),
];

function setupDefaultMocks(turmas?: Turma[], casais?: Casal[]) {
  resetFirebaseMocks();
  const turmasData = turmas ?? turmasPadrao;
  const casaisData = casais ?? casaisPadrao;

  let calls = 0;
  mockGetDocs.mockImplementation(() => {
    calls++;
    if (calls === 1) {
      return Promise.resolve(collectionSnapshot(turmasData.map((t) => ({ id: t.id, data: t }))));
    }
    return Promise.resolve(collectionSnapshot(casaisData.map((c) => ({ id: c.id, data: c }))));
  });
}

// ── Testes ──

describe('Desempenho', () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  // ── Estados de carregamento e vazio ──
  describe('Estados de carregamento e vazio', () => {
    it('deve exibir loading enquanto carrega', () => {
      mockGetDocs.mockImplementation(() => new Promise(() => {}));
      const { container } = renderComponent();
      expect(container.querySelector('.spinner')).toBeInTheDocument();
    });

    it('deve exibir mensagem quando não há turmas', async () => {
      mockGetDocs.mockResolvedValue(collectionSnapshot([]));
      renderComponent();
      expect(
        await screen.findByText('Crie uma turma para visualizar o desempenho.')
      ).toBeInTheDocument();
    });

    it('deve exibir mensagem quando não há alunos', async () => {
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
      // O texto é dividido em duas sentenças; usar função match
      expect(
        await screen.findByText((content) => content.includes('Nenhum aluno cadastrado'))
      ).toBeInTheDocument();
    });
  });

  // ── Seleção de Turma ──
  describe('Seleção de Turma', () => {
    it('deve exibir dropdown de seleção de turma', async () => {
      renderComponent();
      const select = await screen.findByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('turma-1');
    });

    it('deve carregar automaticamente a primeira turma', async () => {
      renderComponent();
      expect(await screen.findByRole('combobox')).toHaveValue('turma-1');
    });

    it('deve mudar o ranking ao selecionar outra turma', async () => {
      renderComponent();
      const select = await screen.findByRole('combobox');
      await userEvent.selectOptions(select, 'turma-2');
      expect(select).toHaveValue('turma-2');
    });
  });

  // ── Ranking Geral ──
  describe('Ranking Geral (ordenado por pontuacaoTotal)', () => {
    it('deve exibir ranking ordenado por pontuação decrescente', async () => {
      renderComponent();
      // O nome do casal aparece no h3, não na avatar placeholder
      // O primeiro (maior pontuação = 30) deve ser Marcos & Julia
      const nomes = await screen.findAllByRole('heading', { level: 3 });
      // O primeiro h3 deve conter o nome do primeiro colocado
      expect(nomes[0]).toHaveTextContent('Marcos & Julia');
    });

    it('deve exibir a pontuação total de cada casal', async () => {
      renderComponent();
      expect(await screen.findByText('30')).toBeInTheDocument();
      expect(await screen.findByText('25')).toBeInTheDocument();
      expect(await screen.findByText('18')).toBeInTheDocument();
    });

    it('deve exibir a label "pts" após cada pontuação', async () => {
      renderComponent();
      const ptsLabels = await screen.findAllByText('pts');
      expect(ptsLabels.length).toBeGreaterThanOrEqual(3);
    });

    it('deve filtrar líderes e co-líderes (não pontuam)', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.queryByText('Líder & Líderesa')).not.toBeInTheDocument();
      });
    });

    it('deve numerar as posições (#1, #2, #3)', async () => {
      renderComponent();
      expect(await screen.findByText('#1')).toBeInTheDocument();
      expect(await screen.findByText('#2')).toBeInTheDocument();
      expect(await screen.findByText('#3')).toBeInTheDocument();
    });
  });

  // ── Filtros por Categoria ──
  describe('Filtros por Categoria', () => {
    it('deve exibir todas as 4 abas de categoria', async () => {
      renderComponent();
      expect(await screen.findByText('Geral')).toBeInTheDocument();
      expect(await screen.findByText('Presença')).toBeInTheDocument();
      expect(await screen.findByText('Vitamina')).toBeInTheDocument();
      expect(await screen.findByText('Tarefas')).toBeInTheDocument();
    });

    it('deve ter aba "Geral" como selecionada por padrão', async () => {
      renderComponent();
      const geralTab = await screen.findByText('Geral');
      expect(geralTab.closest('button')).toHaveStyle({ background: 'var(--primary-dark)' });
    });

    it('deve filtrar por Presença ao clicar na aba', async () => {
      renderComponent();
      const presencaTab = await screen.findByText('Presença');
      await userEvent.click(presencaTab);
      expect(presencaTab.closest('button')).toHaveStyle({ background: 'var(--success)' });
    });

    it('deve filtrar por Vitamina ao clicar na aba', async () => {
      renderComponent();
      const vitaminaTab = await screen.findByText('Vitamina');
      await userEvent.click(vitaminaTab);
      expect(vitaminaTab.closest('button')).toHaveStyle({ background: '#fbbf24' });
    });

    it('deve filtrar por Tarefas ao clicar na aba', async () => {
      renderComponent();
      const tarefasTab = await screen.findByText('Tarefas');
      await userEvent.click(tarefasTab);
      expect(tarefasTab.closest('button')).toHaveStyle({ background: '#9333ea' });
    });

    it('deve reordenar ranking ao mudar categoria', async () => {
      renderComponent();
      const presencaTab = await screen.findByText('Presença');
      await userEvent.click(presencaTab);

      await waitFor(() => {
        const headings = screen.getAllByRole('heading', { level: 3 });
        const lastHeading = headings[headings.length - 1];
        // Pedro & Ana tem presenca=1 (semana 1) e presenca=0 (semana 2) = 1 pt
        // Os outros têm 2 pts cada, então Pedro fica em último
        expect(lastHeading).toHaveTextContent('Pedro & Ana');
      });
    });
  });

  // ── Seletor de Semanas ──
  describe('Seletor de Semanas', () => {
    it('deve exibir seletor de semanas', async () => {
      renderComponent();
      expect(await screen.findByLabelText(/selecionar semana/i)).toBeInTheDocument();
    });

    it('deve ter "Todas as Semanas" como padrão', async () => {
      renderComponent();
      const semanaSelect = (await screen.findByLabelText(/selecionar semana/i)) as HTMLSelectElement;
      expect(semanaSelect.value).toBe('TODAS');
    });

    it('deve mudar o ranking ao selecionar uma semana específica', async () => {
      renderComponent();
      const semanaSelect = (await screen.findByLabelText(/selecionar semana/i)) as HTMLSelectElement;
      await userEvent.selectOptions(semanaSelect, '1');
      expect(semanaSelect.value).toBe('1');
    });
  });

  // ── Indicadores de Variação (Deltas) ──
  describe('Indicadores de Variação (Deltas)', () => {
    it('deve exibir indicadores de delta quando semana específica é selecionada', async () => {
      renderComponent();
      const semanaSelect = (await screen.findByLabelText(/selecionar semana/i)) as HTMLSelectElement;
      await userEvent.selectOptions(semanaSelect, '2');
      await waitFor(() => {
        expect(screen.getByText('—')).toBeInTheDocument();
      });
    });

    it('não deve exibir deltas quando "Todas as Semanas" está selecionado', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.queryByLabelText(/subiu \d+ posiç/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/desceu \d+ posiç/i)).not.toBeInTheDocument();
      });
    });
  });

  // ── Fotos dos Casais ──
  describe('Fotos dos Casais', () => {
    it('deve exibir avatar placeholder com iniciais quando não há foto', async () => {
      renderComponent();
      expect(await screen.findByText('J&M')).toBeInTheDocument();
    });

    it('deve exibir imagem de avatar quando há fotoUrl', async () => {
      const casaisComFoto = [
        mockCasal({
          id: 'casal-1', nomeEle: 'João', nomeEla: 'Maria', tipo: 'ALUNO',
          pontuacaoTotal: 25, fotoUrl: 'https://example.com/foto.jpg', semanas: {},
        }),
      ];
      setupDefaultMocks(turmasPadrao, casaisComFoto);
      renderComponent();
      const img = await screen.findByRole('img');
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('src', 'https://example.com/foto.jpg');
    });
  });
});
