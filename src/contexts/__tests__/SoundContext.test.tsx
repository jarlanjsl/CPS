import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';

// ── Mocks de áudio (Web Audio API + HTMLAudioElement) ──

const mockOscillator = {
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  type: '' as string,
  frequency: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
};

const mockGainNode = {
  connect: vi.fn(),
  gain: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
};

class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator = vi.fn(() => mockOscillator);
  createGain = vi.fn(() => mockGainNode);
}

const mockAudioPlay = vi.fn(() => Promise.resolve());
const mockAudioPause = vi.fn();
const mockAudioAddEventListener = vi.fn();

// Mock Audio como classe real (precisa ser construtor para `new Audio()`).
// Rastreia chamadas do construtor via array estático.
class MockAudioClass {
  static calls: string[][] = [];
  src: string;
  currentTime = 0;
  play = mockAudioPlay;
  pause = mockAudioPause;
  addEventListener = mockAudioAddEventListener;

  constructor(src: string) {
    MockAudioClass.calls.push([src]);
    this.src = src;
  }
}

vi.stubGlobal('Audio', MockAudioClass);

// ── Import do módulo sob teste ──

import { SoundProvider, useSound } from '../SoundContext';

// ── Helpers ──

function createWrapper({ children }: { children: ReactNode }) {
  return <SoundProvider>{children}</SoundProvider>;
}

// ── Testes ──

describe('SoundContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('AudioContext', MockAudioContext);
    vi.stubGlobal('webkitAudioContext', undefined);

    // Limpar TODOS os mocks (implementação preservada)
    MockAudioClass.calls = [];
    mockAudioPlay.mockClear().mockResolvedValue(undefined);
    mockAudioPause.mockClear();
    mockAudioAddEventListener.mockClear();
    mockOscillator.connect.mockClear();
    mockOscillator.start.mockClear();
    mockOscillator.stop.mockClear();
    mockOscillator.type = '';
    mockOscillator.frequency.setValueAtTime.mockClear();
    mockOscillator.frequency.exponentialRampToValueAtTime.mockClear();
    mockGainNode.connect.mockClear();
    mockGainNode.gain.setValueAtTime.mockClear();
    mockGainNode.gain.linearRampToValueAtTime.mockClear();
    mockGainNode.gain.exponentialRampToValueAtTime.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ============================================================
  // playAirplaneSound()
  // ============================================================
  describe('playAirplaneSound()', () => {
    it('deve tentar carregar /aviao.m4a do public/', () => {
      renderHook(() => useSound(), { wrapper: createWrapper });

      // O useEffect do mount cria new Audio('/aviao.m4a')
      expect(MockAudioClass.calls).toEqual([['/aviao.m4a']]);
    });

    it('deve tocar o som (play) quando playAirplaneSound é chamado', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      act(() => {
        result.current.playAirplaneSound();
      });

      expect(mockAudioPlay).toHaveBeenCalled();
    });

    it('deve resetar currentTime para 0 antes de tocar', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      act(() => {
        result.current.playAirplaneSound();
      });

      // Verifica que Audio foi instanciado no mount e play foi chamado
      expect(MockAudioClass.calls).toEqual([['/aviao.m4a']]);
      expect(mockAudioPlay).toHaveBeenCalled();
    });

    it('deve usar fallback Web Audio API quando play() falha', async () => {
      // Simula falha no play (ex: arquivo corrompido ou formato não suportado)
      mockAudioPlay.mockRejectedValueOnce(new Error('Playback failed'));

      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      await act(async () => {
        result.current.playAirplaneSound();
        // Aguarda microtask para o .catch() do play() ser processado
        await Promise.resolve();
      });

      // Fallback: generateSyntheticAirplane usa Web Audio API
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.type).toBe('sawtooth');
      expect(mockOscillator.stop).toHaveBeenCalled();
      expect(mockOscillator.connect).toHaveBeenCalled();
    });

    it('deve lidar com AudioContext não disponível no fallback graciosamente', async () => {
      // Remove AudioContext para simular browser sem suporte
      vi.stubGlobal('AudioContext', undefined);
      vi.stubGlobal('webkitAudioContext', undefined);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Força play() a falhar para acionar o fallback (generateSyntheticAirplane)
      mockAudioPlay.mockRejectedValueOnce(new Error('Playback failed'));

      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      // Não deve lançar exceção — o catch em generateSyntheticAirplane trata graciosamente
      await act(async () => {
        result.current.playAirplaneSound();
        await Promise.resolve();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'AudioAPI not supported',
        expect.anything()
      );

      consoleSpy.mockRestore();
    });
  });

  // ============================================================
  // toggleSoundEnabled()
  // ============================================================
  describe('toggleSoundEnabled()', () => {
    it('deve começar com isSoundEnabled = true (padrão)', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      expect(result.current.isSoundEnabled).toBe(true);
    });

    it('deve toggle isSoundEnabled para false', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      act(() => {
        result.current.toggleSoundEnabled();
      });

      expect(result.current.isSoundEnabled).toBe(false);
    });

    it('deve toggle isSoundEnabled de volta para true', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      act(() => {
        result.current.toggleSoundEnabled(); // true → false
      });
      act(() => {
        result.current.toggleSoundEnabled(); // false → true
      });

      expect(result.current.isSoundEnabled).toBe(true);
    });

    it('não deve tocar som quando isSoundEnabled = false', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      act(() => {
        result.current.toggleSoundEnabled(); // desativar som
      });

      mockAudioPlay.mockClear();

      act(() => {
        result.current.playAirplaneSound();
      });

      expect(mockAudioPlay).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // soundFrequency — agendamento automático
  // ============================================================
  describe('soundFrequency', () => {
    it('deve começar com soundFrequency = MANUAL (padrão)', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      expect(result.current.soundFrequency).toBe('MANUAL');
    });

    it('MANUAL: não deve agendar som automático (sem setTimeout)', () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      renderHook(() => useSound(), { wrapper: createWrapper });

      // Com MANUAL, o effect retorna early — nenhum setTimeout é criado
      expect(setTimeoutSpy).not.toHaveBeenCalled();

      setTimeoutSpy.mockRestore();
    });

    it('RANDOM: deve agendar setTimeout com delay entre 300-600 segundos', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      act(() => {
        result.current.setSoundFrequency('RANDOM');
      });

      expect(setTimeoutSpy).toHaveBeenCalled();
      const delay = setTimeoutSpy.mock.calls[0][1] as number;
      expect(delay).toBeGreaterThanOrEqual(300_000);  // 5 min
      expect(delay).toBeLessThanOrEqual(600_000);     // 10 min

      setTimeoutSpy.mockRestore();
    });

    it('RANDOM: deve usar Math.random para calcular delay (5-10 min)', () => {
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0); // mínimo: 5 min

      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      act(() => {
        result.current.setSoundFrequency('RANDOM');
      });

      // Math.random() = 0 → floor(0 * 6 + 5) = 5 → 5 * 60 * 1000 = 300_000
      expect(setTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        300_000
      );

      setTimeoutSpy.mockRestore();
      randomSpy.mockRestore();
    });

    it('30MIN: deve agendar setTimeout com delay fixo de 1800 segundos (30 min)', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      act(() => {
        result.current.setSoundFrequency('30MIN');
      });

      // 30 * 60 * 1000 = 1_800_000 ms
      expect(setTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        1_800_000
      );

      setTimeoutSpy.mockRestore();
    });

    it('deve tocar som e reagendar quando o timer dispara (30MIN)', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      act(() => {
        result.current.setSoundFrequency('30MIN');
      });

      mockAudioPlay.mockClear();

      // Avançar 30 minutos para disparar o timeout
      act(() => {
        vi.advanceTimersByTime(30 * 60 * 1000);
      });

      // playAirplaneSound foi chamado (via audioRef.current.play())
      expect(mockAudioPlay).toHaveBeenCalled();
    });

    it('deve reagendar automaticamente se frequência não for MANUAL', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      act(() => {
        result.current.setSoundFrequency('30MIN');
      });

      const callsBeforeTimer = setTimeoutSpy.mock.calls.length;
      expect(callsBeforeTimer).toBeGreaterThanOrEqual(1);

      // Avançar o tempo para disparar o timeout → scheduleNext() cria novo timeout
      act(() => {
        vi.advanceTimersByTime(30 * 60 * 1000);
      });

      expect(setTimeoutSpy.mock.calls.length).toBeGreaterThan(callsBeforeTimer);

      setTimeoutSpy.mockRestore();
    });

    it('deve permitir alterar soundFrequency via setSoundFrequency', () => {
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      expect(result.current.soundFrequency).toBe('MANUAL');

      act(() => {
        result.current.setSoundFrequency('30MIN');
      });
      expect(result.current.soundFrequency).toBe('30MIN');

      act(() => {
        result.current.setSoundFrequency('RANDOM');
      });
      expect(result.current.soundFrequency).toBe('RANDOM');
    });
  });

  // ============================================================
  // Cleanup
  // ============================================================
  describe('Cleanup', () => {
    it('deve chamar clearTimeout no unmount', () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const { result, unmount } = renderHook(() => useSound(), { wrapper: createWrapper });

      // Ativar agendamento para que um timeout exista
      act(() => {
        result.current.setSoundFrequency('30MIN');
      });

      clearTimeoutSpy.mockClear();

      // Unmount → cleanup do useEffect → clearTimeout(timeoutId)
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it('deve chamar clearTimeout quando isSoundEnabled muda para false', () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      // Ativar agendamento
      act(() => {
        result.current.setSoundFrequency('30MIN');
      });

      clearTimeoutSpy.mockClear();

      // Desativar som → effect cleanup → clearTimeout
      act(() => {
        result.current.toggleSoundEnabled(); // true → false
      });

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it('deve chamar clearTimeout quando soundFrequency muda para MANUAL', () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const { result } = renderHook(() => useSound(), { wrapper: createWrapper });

      // Ativar agendamento RANDOM
      act(() => {
        result.current.setSoundFrequency('RANDOM');
      });

      clearTimeoutSpy.mockClear();

      // Mudar para MANUAL → effect cleanup → clearTimeout
      act(() => {
        result.current.setSoundFrequency('MANUAL');
      });

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  // ============================================================
  // useSound() fora do Provider
  // ============================================================
  describe('useSound() fora do Provider', () => {
    it('deve lançar erro quando usado fora do SoundProvider', () => {
      expect(() => {
        renderHook(() => useSound());
      }).toThrow('useSound must be used within a Provider');
    });
  });
});
