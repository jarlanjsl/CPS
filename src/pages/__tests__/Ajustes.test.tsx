import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// ── Mocks dos contexts ──

const mockSound = vi.hoisted(() => ({
  playAirplaneSound: vi.fn(),
  isSoundEnabled: true,
  toggleSoundEnabled: vi.fn(),
  soundFrequency: 'MANUAL',
  setSoundFrequency: vi.fn(),
}))

const mockAuth = vi.hoisted(() => ({
  currentUser: { uid: 'test-uid' },
  loading: false,
  logout: vi.fn(() => Promise.resolve()),
  firebaseConfigured: true,
}))

vi.mock('../../contexts/SoundContext', () => ({
  useSound: vi.fn(() => mockSound),
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => mockAuth),
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

import Ajustes from '../Ajustes'

// ── Helpers ──

function renderizarAjustes() {
  return render(
    <MemoryRouter>
      <Ajustes />
    </MemoryRouter>
  )
}

// ── Testes ──

describe('Ajustes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Restaurar valores padrão
    mockSound.isSoundEnabled = true
    mockSound.toggleSoundEnabled = vi.fn(() => {
      mockSound.isSoundEnabled = !mockSound.isSoundEnabled
    })
    mockSound.soundFrequency = 'MANUAL'
    mockSound.setSoundFrequency = vi.fn()
    mockSound.playAirplaneSound = vi.fn()
    mockAuth.logout = vi.fn(() => Promise.resolve())
  })

  // ============================================================
  // Título da página
  // ============================================================
  describe('Título da página', () => {
    it('deve exibir o título "Ajustes"', () => {
      renderizarAjustes()
      expect(screen.getByText('Ajustes')).toBeInTheDocument()
    })
  })

  // ============================================================
  // Toggle de som (on/off)
  // ============================================================
  describe('Toggle de som', () => {
    it('deve exibir o toggle de som com estado ativo por padrão', () => {
      const { container } = renderizarAjustes()

      const toggleTrack = container.querySelector('.toggle-track--active')
      expect(toggleTrack).toBeTruthy()
    })

    it('deve chamar toggleSoundEnabled ao clicar no toggle', async () => {
      const user = userEvent.setup()
      const { container } = renderizarAjustes()

      const toggleTrack = container.querySelector('.toggle-track')
      expect(toggleTrack).toBeTruthy()

      await user.click(toggleTrack!)

      expect(mockSound.toggleSoundEnabled).toHaveBeenCalled()
    })

    it('deve exibir o toggle com estado inativo quando som está desabilitado', () => {
      mockSound.isSoundEnabled = false

      const { container } = renderizarAjustes()

      const toggleTrack = container.querySelector('.toggle-track--inactive')
      expect(toggleTrack).toBeTruthy()
    })
  })

  // ============================================================
  // Select de frequência
  // ============================================================
  describe('Select de frequência', () => {
    it('deve exibir o select de frequência com valor MANUAL por padrão', () => {
      renderizarAjustes()

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('MANUAL')
    })

    it('deve exibir as três opções de frequência', () => {
      renderizarAjustes()

      expect(
        screen.getByText('Apenas disparos manuais')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Aleatório (Entre 5 e 10 minutos)')
      ).toBeInTheDocument()
      expect(
        screen.getByText('A cada 30 minutos')
      ).toBeInTheDocument()
    })

    it('deve chamar setSoundFrequency ao selecionar RANDOM', async () => {
      const user = userEvent.setup()
      renderizarAjustes()

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'RANDOM')

      expect(mockSound.setSoundFrequency).toHaveBeenCalledWith('RANDOM')
    })

    it('deve chamar setSoundFrequency ao selecionar 30MIN', async () => {
      const user = userEvent.setup()
      renderizarAjustes()

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, '30MIN')

      expect(mockSound.setSoundFrequency).toHaveBeenCalledWith('30MIN')
    })

    it('deve exibir aviso de cuidado quando RANDOM está selecionado', () => {
      mockSound.soundFrequency = 'RANDOM'

      renderizarAjustes()

      expect(
        screen.getByText(
          'Cuidado! O avião passará aleatoriamente entre 5 e 10 minutos!'
        )
      ).toBeInTheDocument()
    })

    it('não deve exibir aviso de cuidado quando frequência é MANUAL', () => {
      renderizarAjustes()

      expect(
        screen.queryByText(
          'Cuidado! O avião passará aleatoriamente entre 5 e 10 minutos!'
        )
      ).not.toBeInTheDocument()
    })

    it('deve desabilitar o select quando som está desativado', () => {
      mockSound.isSoundEnabled = false

      const { container } = renderizarAjustes()

      // O container do select fica com opacity reduzida e pointerEvents none
      // O select em si não fica disabled, mas o wrapper do ajustes-freq fica com estilo
      const freqContainer = container.querySelector(
        'div[style*="opacity: 0.5"]'
      )
      expect(freqContainer).toBeTruthy()
    })
  })

  // ============================================================
  // Botão "Testar"
  // ============================================================
  describe('Botão "Testar"', () => {
    it('deve chamar playAirplaneSound ao clicar em Testar', async () => {
      const user = userEvent.setup()
      renderizarAjustes()

      await user.click(screen.getByText('Testar'))

      expect(mockSound.playAirplaneSound).toHaveBeenCalled()
    })
  })

  // ============================================================
  // Botão de logout
  // ============================================================
  describe('Botão de logout', () => {
    it('deve exibir o botão "Sair da Conta"', () => {
      renderizarAjustes()

      expect(
        screen.getByRole('button', { name: /Sair da Conta/i })
      ).toBeInTheDocument()
    })

    it('deve chamar auth.logout() e navegar para /login ao clicar em Sair', async () => {
      const user = userEvent.setup()
      renderizarAjustes()

      await user.click(screen.getByRole('button', { name: /Sair da Conta/i }))

      await waitFor(() => {
        expect(mockAuth.logout).toHaveBeenCalled()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })
})
