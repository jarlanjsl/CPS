/**
 * Factory functions para dados de teste (fixtures).
 *
 * Cada factory cria um objeto válido com valores padrão realistas.
 * Use o parâmetro `overrides` para customizar campos específicos.
 *
 * @example
 * const turma = mockTurma({ nome: 'Turma Teste' })
 * const casal = mockCasal({ pontuacaoTotal: 10, tipo: 'LIDER' })
 */

import type { Casal, SemanaCheck, Turma, Vitamina, SorteioVitaminas, VitaminaSorteio } from '../../services/db'

/**
 * Cria uma Turma válida para testes.
 */
export function mockTurma(overrides?: Partial<Turma>): Turma {
  return {
    id: 'turma-1',
    nome: 'Turma Piloto',
    dataInicio: '2026-01-01T00:00:00.000Z',
    concluida: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    datasSemanas: {},
    vitaminas: {},
    ...overrides,
  }
}

/**
 * Cria um Casal válido para testes.
 */
export function mockCasal(overrides?: Partial<Casal>): Casal {
  return {
    id: 'casal-1',
    turmaId: 'turma-1',
    tipo: 'ALUNO',
    nomeEle: 'João',
    nomeEla: 'Maria',
    pontuacaoTotal: 0,
    semanas: {},
    ...overrides,
  }
}

/**
 * Cria um SemanaCheck válido para testes.
 */
export function mockSemanaCheck(overrides?: Partial<SemanaCheck>): SemanaCheck {
  return {
    presenca: false,
    tarefas: false,
    tarefasExtras: false,
    ...overrides,
  }
}

/**
 * Cria uma Vitamina válida para testes.
 */
export function mockVitamina(overrides?: Partial<Vitamina>): Vitamina {
  return {
    id: 'vit-1',
    nome: 'Vitamina Teste',
    descricao: 'Descrição da vitamina teste',
    semanas: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

/**
 * Cria um VitaminaSorteio (snapshot de vitamina sorteada para uma pessoa).
 */
export function mockVitaminaSorteio(overrides?: Partial<VitaminaSorteio>): VitaminaSorteio {
  return {
    vitaminaId: 'vit-1',
    nome: 'Vitamina Teste',
    descricao: 'Descrição da vitamina teste',
    check: false,
    sorteadoEm: '2026-01-07T00:00:00.000Z',
    ...overrides,
  }
}

/**
 * Cria um SorteioVitaminas completo (ele + ela).
 */
export function mockSorteioVitaminas(overrides?: Partial<SorteioVitaminas>): SorteioVitaminas {
  return {
    ele: mockVitaminaSorteio({ vitaminaId: 'vit-ele', nome: 'Vitamina Ele' }),
    ela: mockVitaminaSorteio({ vitaminaId: 'vit-ela', nome: 'Vitamina Ela' }),
    ...overrides,
  }
}
