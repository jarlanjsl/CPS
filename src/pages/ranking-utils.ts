import type { Casal, SemanaCheck } from '../services/db';

export type Categoria = 'GERAL' | 'PRESENCA' | 'VITAMINA' | 'TAREFAS';

/**
 * Calcula a pontuação de um casal em uma semana específica, por categoria.
 *
 * Regras por categoria:
 * - GERAL: soma de todos os pontos da semana (presença + tarefas + tarefasExtras + vitaminas)
 * - PRESENCA: 1 pt se presença
 * - VITAMINA: 0, 1 ou 2 pts (checks individuais Ele/Ela do sorteioVitaminas; legacy: vitaminas = 1 pt)
 * - TAREFAS: tarefas (1 pt) + tarefasExtras (1 pt) = max 2 pts
 */
export function getPontosSemana(
  c: Casal,
  semana: number,
  cat: Categoria
): number {
  if (!c.semanas) return 0;
  const sem: SemanaCheck | undefined = c.semanas[String(semana)];
  if (!sem) return 0;

  if (cat === 'GERAL') {
    let pts = 0;
    if (sem.presenca) pts += 1;
    if (sem.tarefas) pts += 1;
    if (sem.tarefasExtras) pts += 1;
    if (sem.sorteioVitaminas) {
      if (sem.sorteioVitaminas.ele?.check) pts += 1;
      if (sem.sorteioVitaminas.ela?.check) pts += 1;
    } else if (sem.vitaminas) {
      pts += 1; // legacy
    }
    return pts;
  }

  if (cat === 'PRESENCA') {
    return sem.presenca ? 1 : 0;
  }

  if (cat === 'VITAMINA') {
    if (sem.sorteioVitaminas) {
      let soma = 0;
      if (sem.sorteioVitaminas.ele?.check) soma += 1;
      if (sem.sorteioVitaminas.ela?.check) soma += 1;
      return soma;
    }
    if (sem.vitaminas) return 1; // legacy
    return 0;
  }

  if (cat === 'TAREFAS') {
    let soma = 0;
    if (sem.tarefas) soma += 1;
    if (sem.tarefasExtras) soma += 1;
    return soma;
  }

  return 0;
}

/**
 * Calcula a pontuação acumulada de um casal em todas as semanas, por categoria.
 * Soma getPontosSemana de 1 até 14.
 */
export function getPontosAcumulado(
  c: Casal,
  cat: Categoria,
  maxSemanas: number = 14
): number {
  let total = 0;
  for (let s = 1; s <= maxSemanas; s++) {
    total += getPontosSemana(c, s, cat);
  }
  return total;
}

/**
 * Calcula o delta de posição de cada casal entre a semana atual e a anterior.
 *
 * - Positivo = subiu (ex: +2 significa que subiu 2 posições)
 * - Negativo = desceu (ex: -1 significa que desceu 1 posição)
 * - Zero = manteve a posição
 *
 * Se `anterior` estiver vazio (ex: primeira semana ou modo "Todas"), retorna 0 para todos.
 */
export function calcularDeltas(
  atual: Pick<Casal, 'id'>[],
  anterior: Pick<Casal, 'id'>[]
): Map<string, number> {
  const deltas = new Map<string, number>();

  if (anterior.length === 0) {
    atual.forEach((c) => deltas.set(c.id, 0));
    return deltas;
  }

  atual.forEach((casal, indexAtual) => {
    const indexAnterior = anterior.findIndex((c) => c.id === casal.id);
    if (indexAnterior === -1) {
      // Novo casal (não existia na semana anterior)
      deltas.set(casal.id, 0);
    } else {
      const delta = indexAnterior - indexAtual;
      deltas.set(casal.id, delta);
    }
  });

  return deltas;
}
