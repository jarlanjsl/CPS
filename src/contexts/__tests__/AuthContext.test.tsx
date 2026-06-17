import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';

// ── Mocks Firebase (devem vir antes dos imports do módulo sob teste) ──
// Usa objeto mutável para permitir alteração entre testes.

const mockState = vi.hoisted(() => ({
  isFirebaseConfigured: true,
  auth: { currentUser: { uid: 'test-uid', email: 'test@test.com' } } as any,
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn(
    (_auth: unknown, callback: (user: unknown) => void) => {
      callback({ uid: 'test-uid', email: 'test@test.com' });
      return vi.fn(); // unsubscribe
    }
  ),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mockState.onAuthStateChanged,
  signOut: mockState.signOut,
}));

vi.mock('../../services/firebase', () => ({
  get auth() { return mockState.auth; },
  get isFirebaseConfigured() { return mockState.isFirebaseConfigured; },
}));

// ── Import do módulo sob teste ──

import { AuthProvider, useAuth } from '../AuthContext';

// ── Helpers ──

function createWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// ── Testes ──

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset do estado mutável para o padrão (usuário logado)
    mockState.isFirebaseConfigured = true;
    mockState.auth = { currentUser: { uid: 'test-uid' } };
    mockState.onAuthStateChanged.mockImplementation(
      (_auth: unknown, callback: (user: unknown) => void) => {
        callback({ uid: 'test-uid', email: 'test@test.com' });
        return vi.fn();
      }
    );
    mockState.signOut.mockResolvedValue(undefined);
  });

  // ============================================================
  // Inicialização e onAuthStateChanged
  // ============================================================
  describe('Inicialização e onAuthStateChanged', () => {
    it('deve definir currentUser quando usuário está logado', () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper });

      expect(result.current.currentUser).toEqual(
        expect.objectContaining({ uid: 'test-uid', email: 'test@test.com' })
      );
      expect(result.current.loading).toBe(false);
    });

    it('deve definir currentUser = null quando usuário está deslogado', () => {
      mockState.onAuthStateChanged.mockImplementation(
        (_auth: unknown, callback: (user: unknown) => void) => {
          callback(null);
          return vi.fn();
        }
      );

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper });

      expect(result.current.currentUser).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('deve manter loading = true até onAuthStateChanged resolver', () => {
      let authCallback: ((user: unknown) => void) | null = null;
      mockState.onAuthStateChanged.mockImplementation(
        (_auth: unknown, callback: (user: unknown) => void) => {
          authCallback = callback;
          // NÃO chama callback — simula auth ainda pendente
          return vi.fn();
        }
      );

      const capturedStates: (ReturnType<typeof useAuth> | undefined)[] = [];

      renderHook(
        () => {
          const ctx = useAuth();
          capturedStates.push(ctx);
          return ctx;
        },
        { wrapper: createWrapper }
      );

      // loading=true → children não renderizam → hook não executa
      expect(capturedStates).toHaveLength(0);

      // Resolver auth → loading=false → children renderizam → hook funciona
      act(() => {
        authCallback!({ uid: 'test-uid' });
      });

      expect(capturedStates).toHaveLength(1);
      expect(capturedStates[0]!.currentUser).toEqual(
        expect.objectContaining({ uid: 'test-uid' })
      );
      expect(capturedStates[0]!.loading).toBe(false);
    });

    it('deve chamar onAuthStateChanged com o objeto auth', () => {
      renderHook(() => useAuth(), { wrapper: createWrapper });

      expect(mockState.onAuthStateChanged).toHaveBeenCalledWith(
        mockState.auth,
        expect.any(Function)
      );
    });

    it('deve chamar unsubscribe no cleanup (unmount)', () => {
      const mockUnsubscribe = vi.fn();
      mockState.onAuthStateChanged.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useAuth(), { wrapper: createWrapper });
      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  // ============================================================
  // logout()
  // ============================================================
  describe('logout()', () => {
    it('deve chamar signOut(auth) corretamente', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockState.signOut).toHaveBeenCalledWith(mockState.auth);
    });

    it('deve definir currentUser = null após logout (simulando onAuthStateChanged)', async () => {
      let authCallback: ((user: unknown) => void) | null = null;
      mockState.onAuthStateChanged.mockImplementation(
        (_auth: unknown, callback: (user: unknown) => void) => {
          authCallback = callback;
          callback({ uid: 'test-uid' });
          return vi.fn();
        }
      );

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper });
      expect(result.current.currentUser).not.toBeNull();

      // logout → signOut → onAuthStateChanged(null) simulado
      await act(async () => {
        await result.current.logout();
        authCallback!(null);
      });

      expect(result.current.currentUser).toBeNull();
    });

    it('deve tratar erro do signOut graciosamente (não lança exceção)', async () => {
      mockState.signOut.mockRejectedValueOnce(new Error('SignOut failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper });

      // Não deve lançar — o erro é capturado internamente
      await act(async () => {
        await result.current.logout();
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('não deve chamar signOut quando auth é null (firebase não configurado)', async () => {
      mockState.auth = null;

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockState.signOut).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // firebaseConfigured
  // ============================================================
  describe('firebaseConfigured', () => {
    it('deve refletir isFirebaseConfigured = true', () => {
      mockState.isFirebaseConfigured = true;

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper });

      expect(result.current.firebaseConfigured).toBe(true);
    });

    it('deve refletir isFirebaseConfigured = false', () => {
      mockState.isFirebaseConfigured = false;
      mockState.auth = null;

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper });

      expect(result.current.firebaseConfigured).toBe(false);
    });
  });

  // ============================================================
  // useAuth() fora do Provider
  // ============================================================
  describe('useAuth() fora do Provider', () => {
    it('deve lançar erro quando usado fora do AuthProvider', () => {
      // renderHook sem wrapper → useAuth lança porque context é undefined
      // (loading=true bloqueia children, hook não renderiza, context undefined)
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });
});
