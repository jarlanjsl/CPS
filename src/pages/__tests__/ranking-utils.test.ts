import { describe, it, expect } from 'vitest';
import { calcularDeltas, getPontosSemana, getPontosAcumulado } from '../ranking-utils';
import type { Casal, SemanaCheck } from '../../services/db';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeCasal(
  id: string,
  semanas: Record<string, SemanaCheck> = {},
  overrides: Partial<Casal> = {}
): Casal {
  return {
    id,
    turmaId: 'turma-1',
    tipo: 'ALUNO',
    nomeEle: `Ele-${id}`,
    nomeEla: `Ela-${id}`,
    pontuacaoTotal: 0,
    semanas,
    ...overrides,
  };
}

function semanaCompleta(overrides: Partial<SemanaCheck> = {}): SemanaCheck {
  return {
    presenca: true,
    tarefas: true,
    tarefasExtras: true,
    sorteioVitaminas: {
      ele: { vitaminaId: 'v1', nome: 'V1', descricao: 'D1', check: true, sorteadoEm: '2026-01-01' },
      ela: { vitaminaId: 'v2', nome: 'V2', descricao: 'D2', check: true, sorteadoEm: '2026-01-01' },
    },
    ...overrides,
  };
}

// ─── calcularDeltas ─────────────────────────────────────────────────────────

describe('calcularDeltas', () => {
  it('should calculate positive delta when couple moves up', () => {
    const atual = [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }];
    const anterior = [{ id: 'c2' }, { id: 'c1' }, { id: 'c3' }];

    const deltas = calcularDeltas(atual, anterior);

    expect(deltas.get('c1')).toBe(1);  // Subiu 1 posição (de index 1 para 0)
    expect(deltas.get('c2')).toBe(-1); // Desceu 1 posição (de index 0 para 1)
    expect(deltas.get('c3')).toBe(0);  // Manteve
  });

  it('should return 0 for all when semana anterior is empty', () => {
    const atual = [{ id: 'c1' }, { id: 'c2' }];
    const anterior: { id: string }[] = [];

    const deltas = calcularDeltas(atual, anterior);

    expect(deltas.get('c1')).toBe(0);
    expect(deltas.get('c2')).toBe(0);
  });

  it('should handle new couple (not in anterior) with delta 0', () => {
    const atual = [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }];
    const anterior = [{ id: 'c1' }, { id: 'c3' }];

    const deltas = calcularDeltas(atual, anterior);

    expect(deltas.get('c1')).toBe(0);   // Manteve posição 0
    expect(deltas.get('c2')).toBe(0);   // Novo → 0
    expect(deltas.get('c3')).toBe(-1);  // Desceu 1 (de index 1 para 2, pois c2 foi inserido)
  });

  it('should handle big jump up', () => {
    const atual = [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }, { id: 'c4' }];
    const anterior = [{ id: 'c2' }, { id: 'c3' }, { id: 'c4' }, { id: 'c1' }];

    const deltas = calcularDeltas(atual, anterior);

    expect(deltas.get('c1')).toBe(3);  // De index 3 para 0 → subiu 3
    expect(deltas.get('c2')).toBe(-1); // De index 0 para 1 → desceu 1
    expect(deltas.get('c3')).toBe(-1); // De index 1 para 2 → desceu 1
    expect(deltas.get('c4')).toBe(-1); // De index 2 para 3 → desceu 1
  });

  it('should return empty map for empty atual', () => {
    const deltas = calcularDeltas([], [{ id: 'c1' }]);
    expect(deltas.size).toBe(0);
  });

  it('should handle identical orderings (all zero)', () => {
    const lista = [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }];
    const deltas = calcularDeltas(lista, [...lista]);

    expect(deltas.get('c1')).toBe(0);
    expect(deltas.get('c2')).toBe(0);
    expect(deltas.get('c3')).toBe(0);
  });
});

// ─── getPontosSemana ────────────────────────────────────────────────────────

describe('getPontosSemana', () => {
  it('should return 0 when casal has no semanas', () => {
    const c = makeCasal('c1');
    expect(getPontosSemana(c, 1, 'GERAL')).toBe(0);
    expect(getPontosSemana(c, 1, 'PRESENCA')).toBe(0);
    expect(getPontosSemana(c, 1, 'VITAMINA')).toBe(0);
    expect(getPontosSemana(c, 1, 'TAREFAS')).toBe(0);
  });

  it('should return 0 when the specific week does not exist', () => {
    const c = makeCasal('c1', { '1': semanaCompleta() });
    expect(getPontosSemana(c, 2, 'GERAL')).toBe(0);
  });

  it('should calculate GERAL points for a complete week (sorteioVitaminas)', () => {
    const c = makeCasal('c1', { '3': semanaCompleta() });
    // presenca(1) + tarefas(1) + tarefasExtras(1) + ele.check(1) + ela.check(1) = 5
    expect(getPontosSemana(c, 3, 'GERAL')).toBe(5);
  });

  it('should calculate GERAL points for a complete week (legacy vitaminas)', () => {
    const c = makeCasal('c1', {
      '1': { presenca: true, tarefas: true, tarefasExtras: true, vitaminas: true },
    });
    // presenca(1) + tarefas(1) + tarefasExtras(1) + vitaminas(1) = 4
    expect(getPontosSemana(c, 1, 'GERAL')).toBe(4);
  });

  it('should calculate PRESENCA correctly', () => {
    const c = makeCasal('c1', {
      '1': { presenca: true, tarefas: false, tarefasExtras: false },
      '2': { presenca: false, tarefas: true, tarefasExtras: false },
    });
    expect(getPontosSemana(c, 1, 'PRESENCA')).toBe(1);
    expect(getPontosSemana(c, 2, 'PRESENCA')).toBe(0);
  });

  it('should calculate VITAMINA with individual checks', () => {
    const c = makeCasal('c1', {
      '1': {
        presenca: false,
        tarefas: false,
        tarefasExtras: false,
        sorteioVitaminas: {
          ele: { vitaminaId: 'v1', nome: 'V1', descricao: 'D1', check: true, sorteadoEm: '2026-01-01' },
          ela: { vitaminaId: 'v2', nome: 'V2', descricao: 'D2', check: false, sorteadoEm: '2026-01-01' },
        },
      },
    });
    expect(getPontosSemana(c, 1, 'VITAMINA')).toBe(1);
  });

  it('should calculate VITAMINA with both checks', () => {
    const c = makeCasal('c1', { '1': semanaCompleta() });
    expect(getPontosSemana(c, 1, 'VITAMINA')).toBe(2);
  });

  it('should calculate VITAMINA legacy', () => {
    const c = makeCasal('c1', {
      '1': { presenca: false, tarefas: false, tarefasExtras: false, vitaminas: true },
    });
    expect(getPontosSemana(c, 1, 'VITAMINA')).toBe(1);
  });

  it('should calculate TAREFAS correctly', () => {
    const c = makeCasal('c1', {
      '1': { presenca: true, tarefas: true, tarefasExtras: true },
    });
    // tarefas(1) + tarefasExtras(1) = 2 (presenca não conta)
    expect(getPontosSemana(c, 1, 'TAREFAS')).toBe(2);
  });

  it('should calculate TAREFAS with only tarefas', () => {
    const c = makeCasal('c1', {
      '1': { presenca: true, tarefas: true, tarefasExtras: false },
    });
    expect(getPontosSemana(c, 1, 'TAREFAS')).toBe(1);
  });

  it('should handle null sorteioVitaminas entries', () => {
    const c = makeCasal('c1', {
      '1': {
        presenca: true,
        tarefas: true,
        tarefasExtras: false,
        sorteioVitaminas: { ele: null, ela: null },
      },
    });
    expect(getPontosSemana(c, 1, 'GERAL')).toBe(2); // presenca + tarefas only
    expect(getPontosSemana(c, 1, 'VITAMINA')).toBe(0);
  });
});

// ─── getPontosAcumulado ─────────────────────────────────────────────────────

describe('getPontosAcumulado', () => {
  it('should return 0 when no weeks data', () => {
    const c = makeCasal('c1');
    expect(getPontosAcumulado(c, 'GERAL')).toBe(0);
  });

  it('should sum across all weeks for GERAL', () => {
    const c = makeCasal('c1', {
      '1': { presenca: true, tarefas: true, tarefasExtras: false, vitaminas: true }, // 3
      '2': { presenca: true, tarefas: false, tarefasExtras: true, vitaminas: true }, // 3
      '3': { presenca: false, tarefas: true, tarefasExtras: true, vitaminas: true }, // 3
    });
    expect(getPontosAcumulado(c, 'GERAL')).toBe(9);
  });

  it('should sum PRESENCA across weeks', () => {
    const c = makeCasal('c1', {
      '1': { presenca: true, tarefas: false, tarefasExtras: false },
      '2': { presenca: false, tarefas: false, tarefasExtras: false },
      '3': { presenca: true, tarefas: false, tarefasExtras: false },
    });
    expect(getPontosAcumulado(c, 'PRESENCA')).toBe(2);
  });

  it('should sum TAREFAS across weeks', () => {
    const c = makeCasal('c1', {
      '1': { presenca: false, tarefas: true, tarefasExtras: true },   // 2
      '2': { presenca: false, tarefas: true, tarefasExtras: false },  // 1
      '3': { presenca: false, tarefas: false, tarefasExtras: false }, // 0
    });
    expect(getPontosAcumulado(c, 'TAREFAS')).toBe(3);
  });
});
