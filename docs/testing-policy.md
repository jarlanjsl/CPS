# Política de Testes Automatizados — CPS

> Aprovado em: 17/06/2026
> Versão: 1.0
> Responsável: Agile Master + Tech Lead

---

## 1. Abordagem: Híbrida Pragmática

O projeto CPS adota a **abordagem híbrida** para testes automatizados:

- Testes são escritos **junto com o código** (não antes, não depois)
- Testes são **pré-requisito para o PR ser aceito** (QA Gate)
- **NÃO** é TDD puro (Red-Green-Refactor) para todo o projeto

### Por que não TDD puro?

1. O projeto é uma SPA com Firebase — mocks complexos do Firestore
2. Componentes UI grandes (ex: `TurmaDetail.tsx` com 943 linhas) não se beneficiam de TDD
3. O time está em ritmo produtivo — TDD puro desaceleraria demais no início

---

## 2. Coverage Mínimo por Camada

| Camada | Arquivos | Mínimo | Justificativa |
|--------|----------|:------:|---------------|
| **Services** | `db.ts`, `storage.ts` | **80%** | Lógica de negócio concentrada aqui |
| **Contexts** | `AuthContext`, `SoundContext` | **70%** | Estado global, impacto transversal |
| **Páginas** | `Acompanhamento`, `Desempenho` | **50%** | Focar em fluxos críticos, não layout |
| **Componentes UI** | Modais, telas, widgets | **30%** | Smoke tests (renderiza sem crashar) |
| **Fórmula de pontuação** | Todas as cópias | **100%** | Área de maior risco (5 cópias) |
| **Global** | Todo o projeto | **60%** | Alinhado com HU-05 |

---

## 3. Testes como Critério de Aceite

### Obrigatório ✅

| Tipo de HU | Exemplo |
|-----------|---------|
| HU que altera **services/contexts** | HU-04 (transações), HU-27 (check individual) |
| HU que altera **lógica de pontuação** | Qualquer mudança na fórmula |
| HU que adiciona **nova feature de negócio** | HU-26 (CRUD vitaminas) |

### Recomendado ⚠️

| Tipo de HU | Exemplo |
|-----------|---------|
| HU que adiciona **nova feature UI** | HU-24 (animação) — testar lógica de posição |
| HU que cria **novos componentes complexos** | Roleta, modais com lógica |

### Opcional ❌

| Tipo de HU | Exemplo |
|-----------|---------|
| HU puramente **visual/CSS** | HU-06 (extrair inline styles) |
| HU de **configuração/infra** | HU-03 (credenciais), HU-12 (PWA) |

---

## 4. Fluxo de Trabalho com Testes

```
┌─────────────┐     ┌──────────────┐     ┌────────┐     ┌───────┐
│ Especificação│────▶│ Código+Testes │────▶│   QA   │────▶│ Merge │
│  (PO + TL)  │     │  (paralelo)   │     │ (valida│     │       │
│             │     │              │     │ testes)│     │       │
└─────────────┘     └──────────────┘     └────────┘     └───────┘
                           │
                    ┌──────┴──────┐
                    │  Definição  │
                    │   de Done   │
                    │             │
                    │ ✓ Código    │
                    │ ✓ Testes    │
                    │ ✓ Build OK  │
                    │ ✓ Lint OK   │
                    │ ✓ Coverage  │
                    └─────────────┘
```

### Regras do Fluxo

1. **Desenvolvedor** escreve código E testes no mesmo ciclo
2. **QA** valida:
   - Critérios de aceite funcionais
   - Testes automatizados existem e passam
   - Coverage mínimo da camada é atingido
3. **Se testes faltam ou falham** → QA reprova → volta para desenvolvedor
4. **Se tudo passa** → merge autorizado

---

## 5. Stack de Testes

| Ferramenta | Propósito |
|-----------|-----------|
| **Vitest** | Test runner (nativo Vite, zero config adicional) |
| **@testing-library/react** | Testes de componentes React |
| **@testing-library/jest-dom** | Matchers DOM (`toBeInTheDocument`, etc.) |
| **@testing-library/user-event** | Simulação de interação do usuário |
| **jsdom** | Ambiente DOM para testes |
| **@vitest/coverage-v8** | Coverage reports |

### Comandos

```bash
npm test              # Roda todos os testes
npm run test:watch    # Modo watch (desenvolvimento)
npm run test:coverage # Gera relatório de coverage
```

---

## 6. Estratégia de Mock para Firebase

O maior desafio técnico é mockar o Firebase. Estratégia definida:

- **Mock manual** (não bibliotecas de terceiros) — mais controle
- Criar **helper functions** (`mockTurma()`, `mockCasal()`, `mockSemanaCheck()`)
- Para `runTransaction`: mock que simula comportamento de read-write-retry
- Arquivos de mock em `src/test/mocks/`

---

## 7. Refatoração da Fórmula de Pontuação

**Ação prioritária (HU-05a):** Extrair a fórmula de pontuação para uma função pura em `services/scoring.ts`.

### Antes (problema)
Fórmula duplicada 5 vezes:
- `db.ts:saveChecklist`
- `db.ts:sortearVitaminas`
- `db.ts:saveVitaminaCheck`
- `Desempenho.tsx:getPontos()`
- Lógica legacy espalhada

### Depois (solução)
```typescript
// services/scoring.ts — FUNÇÃO PURA, 100% testável sem mocks
export function calcularPontuacao(semanas: Record<string, SemanaCheck>): number {
  let total = 0;
  Object.values(semanas).forEach(sem => {
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
```

Isso elimina 4 das 5 cópias e transforma um risco crítico em uma função de 15 linhas com 100% de coverage.

---

## 8.QA Gate — Validação de Testes

O QA deve verificar na validação de cada HU:

### Checklist do QA para Testes

- [ ] Testes automatizados existem para a HU (se obrigatório conforme seção 3)
- [ ] Todos os testes passam (`npm test`)
- [ ] Coverage da camada atinge o mínimo (conforme seção 2)
- [ ] Testes cobrem os critérios de aceite da HU
- [ ] Testes cobrem cenários de erro/borda (não apenas happy path)
- [ ] Não há testes quebrados ou ignorados (`skip`/`only`)

### Relatório de Testes do QA

O QA deve incluir no relatório:

```markdown
## Testes Automatizados

- **Status:** ✅ Aprovado / ❌ Reprovado
- **Total de testes:** X
- **Passando:** X
- **Falhando:** X
- **Coverage da camada:** X% (mínimo: Y%)
- **Testes novos para esta HU:** X

### Testes críticos para esta HU
- [ ] Teste 1: [descrição] — ✅/❌
- [ ] Teste 2: [descrição] — ✅/❌
```

---

## 9. Dívida Técnica de Testes (Sprints 1-4)

As HUs entregues nos sprints 1-4 não possuem testes. Estratégia:

| Prioridade | Ação | Quando |
|:----------:|------|--------|
| 🔴 P0 | Extrair fórmula de pontuação para função pura | Sprint 5 (HU-05a) |
| 🔴 P0 | Testes da fórmula (todas as cópias) | Sprint 5 (HU-05a) |
| 🔴 P0 | Testes de limites (createCasal, updateCasal) | Sprint 5 (HU-05a) |
| 🟡 P1 | Testes de transações (saveChecklist, sortear, check) | Sprint 5-6 |
| 🟡 P1 | Testes de CRUD vitaminas | Sprint 6 |
| 🟡 P1 | Testes de Contexts (Auth, Sound) | Sprint 6 |
| 🟢 P2 | Testes de integração (fluxo completo) | Sprint 7+ |
| 🟢 P2 | Smoke tests de componentes UI | Sprint 7+ |

---

## 10. Atualização do Backlog

A **HU-05** (Testes automatizados) foi dividida:

- **HU-05a**: Setup de testes + fórmula de pontuação + limites (Sprint 5)
- **HU-05b**: Testes retroativos de transações + contexts (Sprint 6)
- **HU-05c**: Testes de integração + componentes (Sprint 7+)

A HU-05 original permanece no backlog com status "Em Progresso" e será concluída incrementalmente.

---

## Histórico de Mudanças

| Data | Versão | Mudança |
|---|---|---|
| 17/06/2026 | 1.0 | Criação da política de testes (aprovada pelo usuário) |
