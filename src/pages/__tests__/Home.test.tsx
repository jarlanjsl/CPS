import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// ── Mocks ──

const mockDbService = vi.hoisted(() => ({
  getTurmas: vi.fn(),
  createTurma: vi.fn(),
  seedInitialData: vi.fn(),
}))

vi.mock('../../services/db', () => ({
  dbService: mockDbService,
}))

// ── Import do módulo sob teste ──

import Home from '../Home'

// ── Helpers ──

function criarTurmaAtiva(
  nome: string,
  overrides: Partial<{ dataInicio: string; createdAt: string }> = {}
) {
  return {
    id: `id-${nome.replace(/\s+/g, '-').toLowerCase()}`,
    nome,
    dataInicio: overrides.dataInicio ?? '2026-01-01T00:00:00.000Z',
    concluida: false,
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
  }
}

function criarTurmaConcluida(nome: string) {
  return { ...criarTurmaAtiva(nome), concluida: true }
}

function renderizarHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

// ── Testes ──

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================
  // Loading
  // ============================================================
  describe('Estado de carregamento', () => {
    it('deve exibir indicador de carregamento enquanto dados não chegam', () => {
      // Promise que nunca resolve para manter loading = true
      mockDbService.getTurmas.mockReturnValue(new Promise(() => {}))

      const { container } = renderizarHome()

      // O header sempre aparece
      expect(screen.getByText('Minhas Turmas')).toBeInTheDocument()

      // O conteúdo das turmas não deve estar visível
      expect(screen.queryByText('Turmas Ativas')).not.toBeInTheDocument()
      expect(screen.queryByText('Turmas Concluídas')).not.toBeInTheDocument()
      expect(screen.queryByText('O seu Banco de Dados ainda está vazio.')).not.toBeInTheDocument()

      // O container de loading deve estar presente
      expect(container.querySelector('.loading-container')).toBeTruthy()
    })
  })

  // ============================================================
  // Listagem de turmas ativas
  // ============================================================
  describe('Listagem de turmas ativas', () => {
    it('deve exibir as turmas ativas ordenadas por createdAt desc', async () => {
      mockDbService.getTurmas.mockResolvedValue([
        criarTurmaAtiva('Turma B', { createdAt: '2026-02-01T00:00:00.000Z' }),
        criarTurmaAtiva('Turma A', { createdAt: '2026-01-01T00:00:00.000Z' }),
      ])

      renderizarHome()

      // Aguarda o fim do carregamento
      await waitFor(() => {
        expect(screen.getByText('Turmas Ativas')).toBeInTheDocument()
      })

      // Ambas as turmas são exibidas
      expect(screen.getByText('Turma B')).toBeInTheDocument()
      expect(screen.getByText('Turma A')).toBeInTheDocument()
    })

    it('deve exibir o status "Ativa" para turmas ativas', async () => {
      mockDbService.getTurmas.mockResolvedValue([
        criarTurmaAtiva('Turma Ativa Teste'),
      ])

      renderizarHome()

      await waitFor(() => {
        expect(screen.getByText('Ativa')).toBeInTheDocument()
      })
    })
  })

  // ============================================================
  // Turmas concluídas
  // ============================================================
  describe('Turmas concluídas', () => {
    it('deve exibir seção de turmas concluídas com visual diferenciado', async () => {
      mockDbService.getTurmas.mockResolvedValue([
        criarTurmaConcluida('Turma Antiga'),
      ])

      const { container } = renderizarHome()

      await waitFor(() => {
        expect(screen.getByText('Turmas Concluídas')).toBeInTheDocument()
      })

      const turmaCard = container.querySelector('.turma-card--concluded')
      expect(turmaCard).toBeTruthy()
      expect(turmaCard).toHaveTextContent('Turma Antiga')
    })

    it('deve exibir o status "Concluída" para turmas concluídas', async () => {
      mockDbService.getTurmas.mockResolvedValue([
        criarTurmaConcluida('Turma Passada'),
      ])

      renderizarHome()

      await waitFor(() => {
        expect(screen.getByText('Concluída')).toBeInTheDocument()
      })
    })
  })

  // ============================================================
  // Estado vazio
  // ============================================================
  describe('Estado vazio', () => {
    it('deve exibir mensagem de vazio e botão de seed quando não há turmas', async () => {
      mockDbService.getTurmas.mockResolvedValue([])

      renderizarHome()

      await waitFor(() => {
        expect(
          screen.getByText('O seu Banco de Dados ainda está vazio.')
        ).toBeInTheDocument()
      })

      expect(screen.getByText('Preencher Dados (Seed)')).toBeInTheDocument()
    })

    it('deve chamar seedInitialData ao clicar no botão de seed', async () => {
      mockDbService.getTurmas.mockResolvedValue([])
      mockDbService.seedInitialData.mockResolvedValue(undefined)

      const user = userEvent.setup()
      renderizarHome()

      await waitFor(() => {
        expect(
          screen.getByText('O seu Banco de Dados ainda está vazio.')
        ).toBeInTheDocument()
      })

      await user.click(screen.getByText('Preencher Dados (Seed)'))

      expect(mockDbService.seedInitialData).toHaveBeenCalled()
      // Após seed, fetchTurmas é chamada novamente
      expect(mockDbService.getTurmas).toHaveBeenCalledTimes(2)
    })
  })

  // ============================================================
  // Modal de criar turma
  // ============================================================
  describe('Criar turma', () => {
    beforeEach(() => {
      mockDbService.getTurmas.mockResolvedValue([])
    })

    it('deve abrir o modal ao clicar em "Nova Turma"', async () => {
      const user = userEvent.setup()
      renderizarHome()

      // O modal não está visível inicialmente
      expect(screen.queryByText('Criar Nova Turma')).not.toBeInTheDocument()

      await user.click(screen.getByText('Nova Turma'))

      // Modal deve estar visível
      expect(screen.getByText('Criar Nova Turma')).toBeInTheDocument()
    })

    it('deve fechar o modal ao clicar no botão X', async () => {
      const user = userEvent.setup()
      renderizarHome()

      await user.click(screen.getByText('Nova Turma'))
      expect(screen.getByText('Criar Nova Turma')).toBeInTheDocument()

      // Clica no botão de fechar (X)
      const closeBtn = document.querySelector('.modal-close-btn')
      expect(closeBtn).toBeTruthy()
      await user.click(closeBtn!)

      expect(screen.queryByText('Criar Nova Turma')).not.toBeInTheDocument()
    })

    it('deve criar turma com nome e data preenchidos', async () => {
      mockDbService.createTurma.mockResolvedValue('nova-turma-id')
      const user = userEvent.setup()

      const { container } = renderizarHome()

      // Abrir modal
      await user.click(screen.getByText('Nova Turma'))

      // Preencher formulário
      const nomeInput = screen.getByPlaceholderText('Ex: Turma Primavera 2026')
      const dataInput = container.querySelector('input[type="date"]')!

      await user.type(nomeInput, 'Turma Teste')
      await user.type(dataInput, '2026-06-01')

      // Submeter
      await user.click(screen.getByText('Cadastrar'))

      await waitFor(() => {
        expect(mockDbService.createTurma).toHaveBeenCalledWith(
          'Turma Teste',
          expect.stringContaining('2026-06-01')
        )
      })

      // Após criar, fetchTurmas é chamado novamente
      expect(mockDbService.getTurmas).toHaveBeenCalledTimes(2)
    })

    it('deve desabilitar o botão de cadastrar quando campos estão vazios', async () => {
      const user = userEvent.setup()
      renderizarHome()

      await user.click(screen.getByText('Nova Turma'))

      const submitBtn = screen.getByText('Cadastrar').closest('button')
      expect(submitBtn).toBeDisabled()
    })
  })

  // ============================================================
  // Navegação
  // ============================================================
  describe('Navegação para detalhe da turma', () => {
    it('deve renderizar link com href correto para cada turma', async () => {
      mockDbService.getTurmas.mockResolvedValue([
        criarTurmaAtiva('Turma Navegar'),
      ])

      renderizarHome()

      await waitFor(() => {
        expect(screen.getByText('Turma Navegar')).toBeInTheDocument()
      })

      const link = screen.getByRole('link', { name: /Turma Navegar/i })
      expect(link).toHaveAttribute('href', '/turma/id-turma-navegar')
    })
  })
})
