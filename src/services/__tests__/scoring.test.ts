import { describe, it, expect } from 'vitest';
import { calcularPontuacao } from '../scoring';
import type { SemanaCheck } from '../db';

describe('calcularPontuacao', () => {
  it('should return 0 for empty weeks', () => {
    expect(calcularPontuacao({})).toBe(0);
  });

  it('should return 0 for week with all false', () => {
    const semanas: Record<string, SemanaCheck> = {
      '1': { presenca: false, tarefas: false, tarefasExtras: false }
    };
    expect(calcularPontuacao(semanas)).toBe(0);
  });

  it('should calculate 4 pts for complete week (legacy)', () => {
    const semanas: Record<string, SemanaCheck> = {
      '1': { presenca: true, tarefas: true, tarefasExtras: true, vitaminas: true }
    };
    expect(calcularPontuacao(semanas)).toBe(4);
  });

  it('should calculate 5 pts for complete week (sorteioVitaminas with both checks)', () => {
    const semanas: Record<string, SemanaCheck> = {
      '1': {
        presenca: true,
        tarefas: true,
        tarefasExtras: true,
        sorteioVitaminas: {
          ele: { vitaminaId: 'v1', nome: 'V1', descricao: 'D1', check: true, sorteadoEm: '2026-01-01' },
          ela: { vitaminaId: 'v2', nome: 'V2', descricao: 'D2', check: true, sorteadoEm: '2026-01-01' }
        }
      }
    };
    expect(calcularPontuacao(semanas)).toBe(5);
  });

  it('should calculate 4 pts when only ele check is true', () => {
    const semanas: Record<string, SemanaCheck> = {
      '1': {
        presenca: true,
        tarefas: true,
        tarefasExtras: true,
        sorteioVitaminas: {
          ele: { vitaminaId: 'v1', nome: 'V1', descricao: 'D1', check: true, sorteadoEm: '2026-01-01' },
          ela: { vitaminaId: 'v2', nome: 'V2', descricao: 'D2', check: false, sorteadoEm: '2026-01-01' }
        }
      }
    };
    expect(calcularPontuacao(semanas)).toBe(4);
  });

  it('should calculate 4 pts when only ela check is true', () => {
    const semanas: Record<string, SemanaCheck> = {
      '1': {
        presenca: true,
        tarefas: true,
        tarefasExtras: true,
        sorteioVitaminas: {
          ele: { vitaminaId: 'v1', nome: 'V1', descricao: 'D1', check: false, sorteadoEm: '2026-01-01' },
          ela: { vitaminaId: 'v2', nome: 'V2', descricao: 'D2', check: true, sorteadoEm: '2026-01-01' }
        }
      }
    };
    expect(calcularPontuacao(semanas)).toBe(4);
  });

  it('should NOT double count when both sorteioVitaminas and vitaminas exist', () => {
    const semanas: Record<string, SemanaCheck> = {
      '1': {
        presenca: true,
        tarefas: true,
        tarefasExtras: true,
        vitaminas: true,
        sorteioVitaminas: {
          ele: { vitaminaId: 'v1', nome: 'V1', descricao: 'D1', check: true, sorteadoEm: '2026-01-01' },
          ela: { vitaminaId: 'v2', nome: 'V2', descricao: 'D2', check: true, sorteadoEm: '2026-01-01' }
        }
      }
    };
    // sorteioVitaminas tem precedência, vitaminas é ignorado
    expect(calcularPontuacao(semanas)).toBe(5);
  });

  it('should sum multiple weeks correctly', () => {
    const semanas: Record<string, SemanaCheck> = {
      '1': { presenca: true, tarefas: true, tarefasExtras: false, vitaminas: true }, // 3 pts
      '2': { presenca: true, tarefas: false, tarefasExtras: true, vitaminas: true }, // 3 pts
      '3': { presenca: false, tarefas: true, tarefasExtras: true, vitaminas: true }  // 3 pts
    };
    expect(calcularPontuacao(semanas)).toBe(9);
  });

  it('should handle null/undefined sorteioVitaminas gracefully', () => {
    const semanas: Record<string, SemanaCheck> = {
      '1': {
        presenca: true,
        tarefas: true,
        tarefasExtras: true,
        sorteioVitaminas: {
          ele: null,
          ela: null
        }
      }
    };
    expect(calcularPontuacao(semanas)).toBe(3);
  });
});
