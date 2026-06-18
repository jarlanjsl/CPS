import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// ── Mocks Firebase (devem vir antes dos imports do módulo sob teste) ──

const mockState = vi.hoisted(() => ({
  isFirebaseConfigured: true,
  auth: { name: 'mock-auth' } as any,
  signInWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: { uid: 'test-uid' } })
  ),
}))

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: mockState.signInWithEmailAndPassword,
}))

vi.mock('../../services/firebase', () => ({
  get auth() {
    return mockState.auth
  },
  get isFirebaseConfigured() {
    return mockState.isFirebaseConfigured
  },
}))

// ── Mock useNavigate ──

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// ── Import do módulo sob teste ──

import Login from '../Login'

// ── Helpers ──

function renderizarLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

// ── Testes ──

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Restaurar valores padrão do estado mutável
    mockState.isFirebaseConfigured = true
    mockState.auth = { name: 'mock-auth' }
    mockState.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-uid' },
    })
  })

  // ============================================================
  // Renderização do formulário
  // ============================================================
  describe('Renderização do formulário', () => {
    it('deve exibir o título da aplicação', () => {
      renderizarLogin()
      expect(screen.getByText('Casados Para Sempre')).toBeInTheDocument()
    })

    it('deve exibir campo de usuário', () => {
      renderizarLogin()
      expect(screen.getByPlaceholderText('Digite seu usuário')).toBeInTheDocument()
    })

    it('deve exibir campo de senha', () => {
      renderizarLogin()
      expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument()
    })

    it('deve exibir botão de Entrar', () => {
      renderizarLogin()
      expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    })
  })

  // ============================================================
  // Validação de campos obrigatórios
  // ============================================================
  describe('Validação de campos obrigatórios', () => {
    it('campos de usuário e senha devem ser required', () => {
      renderizarLogin()

      const usuarioInput = screen.getByPlaceholderText('Digite seu usuário')
      const senhaInput = screen.getByPlaceholderText('Digite sua senha')

      expect(usuarioInput).toHaveAttribute('required')
      expect(senhaInput).toHaveAttribute('required')
    })
  })

  // ============================================================
  // Submit do formulário
  // ============================================================
  describe('Submit do formulário', () => {
    it('deve chamar signInWithEmailAndPassword com email fantasma e senha', async () => {
      const user = userEvent.setup()
      renderizarLogin()

      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'lider')
      await user.type(screen.getByPlaceholderText('Digite sua senha'), '123')

      await user.click(screen.getByRole('button', { name: 'Entrar' }))

      await waitFor(() => {
        expect(mockState.signInWithEmailAndPassword).toHaveBeenCalledWith(
          mockState.auth,
          'lider@cps.app',
          '123'
        )
      })
    })

    it('deve navegar para / após login bem-sucedido', async () => {
      const user = userEvent.setup()
      renderizarLogin()

      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'lider')
      await user.type(screen.getByPlaceholderText('Digite sua senha'), '123')

      await user.click(screen.getByRole('button', { name: 'Entrar' }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('deve exibir "Acessando..." durante o loading do submit', async () => {
      // Promise que nunca resolve para manter loading ativo
      mockState.signInWithEmailAndPassword.mockReturnValue(new Promise(() => {}))

      const user = userEvent.setup()
      renderizarLogin()

      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'lider')
      await user.type(screen.getByPlaceholderText('Digite sua senha'), '123')

      await user.click(screen.getByRole('button', { name: 'Entrar' }))

      expect(screen.getByText('Acessando...')).toBeInTheDocument()
    })
  })

  // ============================================================
  // Tratamento de erro
  // ============================================================
  describe('Tratamento de erro', () => {
    it('deve exibir mensagem de erro para credenciais inválidas', async () => {
      mockState.signInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/invalid-credential',
      })

      const user = userEvent.setup()
      renderizarLogin()

      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'invalido')
      await user.type(screen.getByPlaceholderText('Digite sua senha'), 'errada')

      await user.click(screen.getByRole('button', { name: 'Entrar' }))

      await waitFor(() => {
        expect(screen.getByText('Usuário ou senha inválidos.')).toBeInTheDocument()
      })
    })

    it('deve exibir mensagem de erro para falha de conexão', async () => {
      mockState.signInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/network-request-failed',
        message: 'Network error',
      })

      const user = userEvent.setup()
      renderizarLogin()

      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'lider')
      await user.type(screen.getByPlaceholderText('Digite sua senha'), '123')

      await user.click(screen.getByRole('button', { name: 'Entrar' }))

      await waitFor(() => {
        expect(
          screen.getByText(/Falha de conexão com Firebase/)
        ).toBeInTheDocument()
      })
    })

    it('deve exibir erro quando Firebase não está configurado', async () => {
      mockState.isFirebaseConfigured = false
      mockState.auth = null

      const user = userEvent.setup()
      renderizarLogin()

      await user.type(screen.getByPlaceholderText('Digite seu usuário'), 'lider')
      await user.type(screen.getByPlaceholderText('Digite sua senha'), '123')

      await user.click(screen.getByRole('button', { name: 'Entrar' }))

      await waitFor(() => {
        expect(
          screen.getByText(
            'Erro interno: O arquivo firebase.ts não possui as chaves válidas. Configure-o primeiro.'
          )
        ).toBeInTheDocument()
      })

      // Não deve chamar signIn quando Firebase não está configurado
      expect(mockState.signInWithEmailAndPassword).not.toHaveBeenCalled()
    })
  })

  // ============================================================
  // Mock padrão
  // ============================================================
  describe('Mock padrão', () => {
    it('deve exibir o hint com credenciais mock', () => {
      renderizarLogin()
      expect(screen.getByText('Mock padrão: lider / 123')).toBeInTheDocument()
    })
  })
})
