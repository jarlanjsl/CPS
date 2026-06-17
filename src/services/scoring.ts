import type { SemanaCheck } from './db';

/**
 * Calcula a pontuação total de um casal baseado nas semanas preenchidas.
 *
 * Regra:
 * - presenca: 1 pt
 * - tarefas: 1 pt
 * - tarefasExtras: 1 pt
 * - sorteioVitaminas.ele.check: 1 pt (se true)
 * - sorteioVitaminas.ela.check: 1 pt (se true)
 * - OU vitaminas (legacy): 1 pt (compat retroativa)
 *
 * Máximo por semana: 5 pts (com sorteioVitaminas) ou 4 pts (legacy)
 */
export function calcularPontuacao(semanas: Record<string, SemanaCheck>): number {
  let total = 0;
  Object.values(semanas).forEach((sem) => {
    if (sem.presenca) total += 1;
    if (sem.tarefas) total += 1;
    if (sem.tarefasExtras) total += 1;
    if (sem.sorteioVitaminas) {
      if (sem.sorteioVitaminas.ele?.check) total += 1;
      if (sem.sorteioVitaminas.ela?.check) total += 1;
    } else if (sem.vitaminas) {
      total += 1; // legacy
    }
  });
  return total;
}
