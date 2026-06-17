# Sprint 5 — Fundação de Testes + Animação do Ranking 🧪📈

**Duração:** 17/06/2026 a 01/07/2026 (2 semanas)
**Objetivo:** Estabelecer a fundação de testes automatizados (Vitest + RTL) com foco na fórmula de pontuação (área de maior risco) e implementar a animação de evolução no ranking.
**Branch:** `sprint/5-testes-animacao` (criada a partir do `master` após merge do Sprint 4)

---

## 📋 Histórias do Sprint

| HU | Descrição | Estimativa | Prioridade | Branch |
|----|-----------|:----------:|:----------:|--------|
| HU-05a | Setup Vitest + fórmula de pontuação (função pura) + limites (1/1/5) | 🔴 L | Alta | `feature/HU-05a-setup-testes` |
| HU-24 | Animação sobe/desce do ranking semana a semana | 🔴 L | Média | `feature/HU-24-animacao-ranking` |
| **Total** | | **≈ 10 pts** | | |

---

## 🎯 Definição de Pronto (DoD)

- [ ] Código implementado e revisado
- [ ] **Testes automatizados escritos** (obrigatório para services/contexts — ver `docs/testing-policy.md`)
- [ ] **Coverage mínimo atingido** (services 80%, fórmula pontuação 100%)
- [ ] Critérios de aceite validados pelo QA
- [ ] **QA validou testes** (existem, passam, cobrem critérios)
- [ ] Documentação atualizada (architecture.md, changelog, backlog)
- [ ] Merge via Pull Request na branch do sprint
- [ ] Build validado após implementação
- [ ] `npm test` passando no CI

---

## 🧪 HU-05a — Setup de Testes + Fórmula de Pontuação

### Escopo

| Sub-tarefa | Especialista | Descrição |
|---|---|---|
| T1 | Backend | Instalar Vitest + RTL + jsdom + coverage-v8 + configurar `vite.config.ts` |
| T2 | Backend | Criar `src/test/setup.ts` + mocks do Firebase (`firebase/auth`, `firebase/firestore`, `firebase/storage`) |
| T3 | Backend | **Refatoração crítica:** Extrair fórmula de pontuação para `services/scoring.ts` (função pura) |
| T4 | Backend | Testes da fórmula de pontuação (parametrizados, 5+ cenários) — **100% coverage** |
| T5 | Backend | Testes de limites de casais (createCasal: LIDER/CO-LIDER/ALUNO) — **100% coverage** |
| T6 | Backend | Testes de limites na edição (updateCasal: tipo muda/não muda) |
| T7 | Backend | Atualizar `db.ts` para usar `calcularPontuacao()` da função pura (eliminar 3 das 5 cópias) |
| T8 | Frontend | Atualizar `Desempenho.tsx` para usar `calcularPontuacao()` (eliminar a 5ª cópia) |
| T9 | QA | Validar: fórmula extraiada = fórmula original (mesmo resultado para todos os cenários) |

### Critérios de Aceite HU-05a

1. Vitest configurado e rodando (`npm test` funciona)
2. Script `test`, `test:watch`, `test:coverage` no `package.json`
3. Função pura `calcularPontuacao()` criada em `services/scoring.ts`
4. `db.ts` usa `calcularPontuacao()` em `saveChecklist`, `sortearVitaminas`, `saveVitaminaCheck`
5. `Desempenho.tsx` usa `calcularPontuacao()` no `getPontos()`
6. Testes da fórmula cobrem: semana completa, semana vazia, legacy (vitaminas boolean), mistura, vitaminas com check individual
7. Testes de limites cobrem: criar líder (máx 1), criar co-líder (máx 1), criar aluno (máx 5), erro ao exceder
8. Coverage de `scoring.ts` = 100%
9. Coverage de `db.ts` ≥ 60% (foco em fórmula + limites)
10. Build passando após refatoração

---

## 📈 HU-24 — Animação de Evolução no Ranking

### Escopo

| Sub-tarefa | Especialista | Descrição |
|---|---|---|
| T1 | Tech Lead | Definir modelo de dados para posições anteriores (snapshot semanal) |
| T2 | Backend | `dbService.getRankingComPosicoes()`: retorna ranking com posição atual + anterior |
| T3 | Frontend | Criar componente `RankingAnimado.tsx` com Framer Motion (layout animations) |
| T4 | Frontend | Indicativo visual: seta verde (subiu), seta vermelha (desceu), traço cinza (manteve) |
| T5 | Frontend | Integrar em `Desempenho.tsx` substituindo ranking estático |
| T6 | Frontend | Testes da lógica de transição de posições (cálculo delta) |

### Critérios de Aceite HU-24

1. Ao navegar entre semanas, ranking anima transições de posição
2. Casais que subiram: seta verde + nº de posições
3. Casais que desceram: seta vermelha + nº de posições
4. Casais que mantiveram: traço cinza
5. Animação suave (Framer Motion layout animations)
6. Funciona no ranking geral e por categoria
7. Testes da lógica de cálculo de delta de posições

---

## 📅 Cronograma

| Fase | Período | Foco |
|------|---------|------|
| Setup (T0) | Dia 1 | Tech Lead: install deps + config Vitest + mocks Firebase |
| HU-05a | Dias 1-3 | Fórmula pura + testes P0 (fórmula + limites) |
| QA Gate 1 | Dia 3 | Validação HU-05a (fórmula + coverage) |
| HU-24 | Dias 4-7 | Animação do ranking + testes de lógica |
| QA Gate 2 | Dia 8 | Validação HU-24 |
| Review | Dia 10 | Sprint Review e documentação final (REGRA 7) |

---

## 🔄 Dependências

```
T0 (setup Vitest) ──→ HU-05a (fórmula + testes)
HU-05a (fórmula pura) ──→ HU-24 (animação usa ranking já testado)
```

> HU-05a é pré-requisito para HU-24 ter base sólida. Ordem de execução: **HU-05a → HU-24**.

---

## 🔗 Branches de Feature

| História | Branch |
|----------|--------|
| T0 (Tech Lead) | commit direto em `sprint/5-testes-animacao` |
| HU-05a | `feature/HU-05a-setup-testes` |
| HU-24 | `feature/HU-24-animacao-ranking` |

---

## ⚠️ Riscos e Mitigações

| Risco | Nível | Mitigação |
|---|---|---|
| Mocks do Firebase complexos | Alto | Tech Lead cria mocks no T0; usar helper functions (`mockTurma()`, `mockCasal()`) |
| Refatoração da fórmula quebra código existente | Alto | QA valida que resultado é idêntico antes/depois (testes parametrizados) |
| Framer Motion adiciona bundle size | Médio | ~30KB gzip — aceitável para animação de ranking |
| Conflitos em `db.ts` (HU-05a) | Médio | Tech Lead commita `scoring.ts` antes; `db.ts` só recebe import |
| HU-24 depende de HU-05a | Baixo | HU-05a é dia 1-3, HU-24 é dia 4-7 — sem sobreposição |

---

## 📊 Métricas Alvo

| Métrica | Alvo |
|---------|------|
| Testes criados | ~30-40 |
| Coverage `scoring.ts` | 100% |
| Coverage `db.ts` | ≥ 60% |
| Coverage global | ≥ 45% |
| Build | passando |
| `npm test` | 0 failures |

---

## 📝 Retrospectiva do Sprint 4 (ações para este sprint)

1. ✅ Avaliar separação de workdirs para agentes paralelos — **aplicado: HU-05a e HU-24 são sequenciais, não paralelas**
2. ✅ Considerar commit de stubs de métodos no T0 para reduzir conflitos — **aplicado: T0 cria `scoring.ts` antes de mexer em `db.ts`**
3. 🔲 Corrigir prop `key` na interface do RoletaVitaminas — **pendente (task técnica menor)**
4. ✅ Considerar testes automatizados para dbService — **ESTE SPRINT**

---

## 📚 Documentos de Referência

- [Política de Testes](testing-policy.md) — regras de coverage, fluxo, stack
- [ADR-001](adr/ADR-001-testes-automatizados.md) — decisão arquitetural de testes
- [Backlog](backlog.md) — HU-05, HU-24 detalhadas
