# Sprint 4 — Vitamina da Semana 🎰

**Duração:** 17/06/2026 a 01/07/2026 (2 semanas)
**Objetivo:** Implementar o sistema completo de vitaminas — roleta animada de sorteio, gestão editável das vitaminas por semana, check individual de execução (dele/dela) e histórico para o aluno.
**Branch:** `sprint/4-vitaminas` (criada a partir do `master` após merge do Sprint 3)

---

## 📋 Histórias do Sprint

| HU | Descrição | Estimativa | Prioridade | Branch |
|----|-----------|:----------:|:----------:|--------|
| HU-26 | Seção editável de vitaminas da semana (CRUD) | 🟡 M | Alta | `feature/HU-26-vitaminas-crud` |
| HU-25 | Roleta animada para sortear vitaminas (dele + dela) | 🔴 L | Alta | `feature/HU-25-roleta-vitaminas` |
| HU-27 | Check individual de execução (Ele ✅ / Ela ✅) | 🟢 S | Alta | `feature/HU-27-check-vitaminas` |
| HU-28 | Aluno acessa histórico de vitaminas | 🟢 S | Média | `feature/HU-28-historico-aluno` |
| **Total** | | **≈ 7 pts** | | |

---

## 🎯 Definição de Pronto (DoD)

- [ ] Código implementado e revisado
- [ ] Critérios de aceite validados pelo QA
- [ ] Documentação atualizada (architecture.md, changelog, backlog)
- [ ] Merge via Pull Request na branch do sprint
- [ ] Agente commitou na branch correta (ação da retrospectiva do Sprint 3)
- [ ] Build validado após implementação (ação da retrospectiva do Sprint 3)

---

## 🏗️ Modelo de Dados (decisão do Tech Lead)

### Decisão: Embedding (sem novas collections)

Estende o ADR-002 (embedding de semanas no documento do casal) para o sistema de vitaminas.

```
turmas/{turmaId}
  ├── nome, dataInicio, concluida, createdAt, datasSemanas   (existentes)
  └── vitaminas?: Record<string, Vitamina>                   ⭐ NOVO (catálogo da turma)

casais/{casalId}
  ├── turmaId, tipo, nomeEle, nomeEla, fotoUrl, pontuacaoTotal   (existentes)
  └── semanas: Record<string, SemanaCheck>
                  ├── presenca, tarefas, tarefasExtras             (existentes)
                  ├── vitaminas?: boolean                          ⚠️ DEPRECATED (legacy)
                  └── sorteioVitaminas?: SorteioVitaminas          ⭐ NOVO
                          ├── ele?: VitaminaSorteio { vitaminaId, nome, descricao, check, sorteadoEm }
                          └── ela?: VitaminaSorteio { vitaminaId, nome, descricao, check, sorteadoEm }
```

### Interfaces TypeScript (a serem commitadas no T0 pelo Tech Lead)

```typescript
export interface Vitamina {
  id: string;            // crypto.randomUUID()
  nome: string;
  descricao: string;
  semanas: number[];     // semanas ativas ([] = inativa)
  createdAt: string;     // ISO
}

export interface VitaminaSorteio {
  vitaminaId: string;    // FK para turmas.vitaminas[id]
  nome: string;          // snapshot denormalizado
  descricao: string;     // snapshot denormalizado
  check: boolean;        // HU-27: check individual
  sorteadoEm: string;    // ISO — usado no histórico HU-28
}

export interface SorteioVitaminas {
  ele: VitaminaSorteio | null;
  ela: VitaminaSorteio | null;
}

// SemanaCheck estendida (retrocompatível)
export interface SemanaCheck {
  presenca: boolean;
  vitaminas?: boolean;                  // DEPRECATED — mantido p/ compatibilidade
  sorteioVitaminas?: SorteioVitaminas;  // NOVO — substitui `vitaminas`
  tarefas: boolean;
  tarefasExtras: boolean;
}

// Turma estendida
export interface Turma {
  // ...campos existentes...
  vitaminas?: Record<string, Vitamina>;   // NOVO
}
```

### Impacto no modelo existente

| Item | Antes | Depois |
|---|---|---|
| `SemanaCheck.vitaminas` | boolean obrigatório | boolean **opcional deprecated** |
| Pontos por semana (vitamina) | 0 ou 1 | **0, 1 ou 2** (check dele + check dela) |
| Máx pontos/semana | 4 | **5** |
| Máx pontos/casal (14 sem) | 56 | **70** |
| `saveChecklist` | soma binária | branch legacy/novo (compat retroativa) |
| Ranking VITAMINA (Desempenho) | conta `vitaminas === true` | soma checks ele/ela (0/1/2) + branch legacy |
| Regras Firestore | — | **Sem alteração** (embedding coberto) |

> **Snapshot denormalizado**: o sorteio guarda `nome` e `descricao` no momento do sorteio. Se o líder editar a vitamina no catálogo depois, o histórico daquela semana não muda retroativamente.

---

## 📅 Cronograma

| Fase | Período | Foco |
|------|---------|------|
| Setup (T0) | Dia 1 | Tech Lead commita interfaces + ADR-004 + atualiza architecture.md |
| Rodada 1 | Dias 2-5 | HU-26 (CRUD vitaminas) + HU-25 (roleta) em paralelo |
| QA Gate 1 | Dias 5-6 | Validação HU-26 e HU-25 pelo QA |
| Rodada 2 | Dias 6-8 | HU-27 (check individual) + HU-28 (histórico) em paralelo |
| QA Gate 2 | Dias 8-9 | Validação HU-27 e HU-28 |
| Review | Dia 10 | Sprint Review e documentação final (REGRA 7) |

---

## 🔄 Dependências

```
T0 (interfaces) ──→ HU-26 (catálogo CRUD)
                ──→ HU-25 (roleta consome catálogo)

HU-26 (catálogo) ──→ HU-25 (roleta usa getVitaminasDaSemana)
HU-25 (sorteio)  ──→ HU-27 (check do que foi sorteado)
HU-25 (sorteio)  ──→ HU-28 (histórico dos sorteios)
```

> HU-25 pode ser desenvolvida com mock local até o merge da HU-26. Ordem de merge da Rodada 1: **HU-26 → HU-25**.

---

## 🔗 Branches de Feature

| História | Branch |
|----------|--------|
| T0 (Tech Lead) | commit direto em `sprint/4-vitaminas` |
| HU-26 | `feature/HU-26-vitaminas-crud` |
| HU-25 | `feature/HU-25-roleta-vitaminas` |
| HU-27 | `feature/HU-27-check-vitaminas` |
| HU-28 | `feature/HU-28-historico-aluno` |

---

## 🎨 Decisão de Animação (Tech Lead)

| Peça | Tecnologia | Justificativa |
|---|---|---|
| Roleta giratória | **CSS puro** (`transform: rotate()` + `transition` com `cubic-bezier`) | Animação simples, 0 KB de bundle |
| Confete do resultado | **`canvas-confetti`** (~6 KB gzip) | Lib padrão de facto, custo aceitável |
| Toast/destaque | **CSS + state React** | Trivial, sem dependência |

> **Não adicionar Framer Motion neste sprint.** Postergar para Sprint 5 (HU-24 — animação do ranking) onde brilha com layout animations.

---

## 📝 Quebra de Tarefas por HU

### HU-26 — Seção editável de vitaminas (M)

| Sub-tarefa | Especialista | Descrição |
|---|---|---|
| T0 | Tech Lead | Definir interfaces `Vitamina`, estender `Turma` |
| T1 | Backend | `dbService`: addVitamina, updateVitamina, deleteVitamina, setVitaminaSemanas, getVitaminasDaSemana |
| T2 | Frontend | Criar `VitaminasSection.tsx`: listagem + modais CRUD + chips toggle semanas |
| T3 | Frontend | Integrar `<VitaminasSection>` em `TurmaDetail.tsx` |

### HU-25 — Roleta animada (L)

| Sub-tarefa | Especialista | Descrição |
|---|---|---|
| T0 | Tech Lead | Definir interfaces `VitaminaSorteio`, `SorteioVitaminas`, estender `SemanaCheck` |
| T1 | Backend | `dbService.sortearVitaminas()` via `runTransaction` (grava sorteio, recalcula pontuação) |
| T2 | Frontend | Criar `RoletaVitaminas.tsx`: roleta CSS com setores + animação cubic-bezier |
| T3 | Frontend | Criar `SorteioVitaminasModal.tsx`: seleciona casal, duas roletas (ele/ela), confete, sortear novamente |
| T4 | Frontend | Adicionar botão "Girar Roleta" nos cards de semana em `TurmaDetail.tsx` |

### HU-27 — Check individual (S)

| Sub-tarefa | Especialista | Descrição |
|---|---|---|
| T1 | Backend | Atualizar `saveChecklist` (nova fórmula) + `saveVitaminaCheck()` (real-time via transação) |
| T2 | Frontend | `Acompanhamento.tsx`: remover checkbox antigo, adicionar card "Vitaminas Sorteadas" com checks Ele/Ela |
| T3 | Backend/Frontend | Atualizar `Desempenho.tsx` categoria VITAMINA (0/1/2 + legacy) |

### HU-28 — Histórico do aluno (S)

| Sub-tarefa | Especialista | Descrição |
|---|---|---|
| T1 | Backend | `dbService.getHistoricoVitaminas(casalId)`: percorre `semanas` em ordem desc |
| T2 | Frontend | Criar `MinhasVitaminas.tsx`: lista com semana, data, vitamina, status (badge) |
| T3 | Frontend | Rota `/aluno/:casalId/vitaminas` + botão de entrada em `TurmaDetail.tsx` |

---

## ⚠️ Riscos e Mitigações

| Risco | Nível | Mitigação |
|---|---|---|
| Conflito em `db.ts` (4 histórias) | Alto | Tech Lead commita T0 (interfaces) antes; métodos novos ao final do `dbService` |
| Conflito em `TurmaDetail.tsx` (3 histórias) | Médio | Toda UI nova em componentes filho; `TurmaDetail` só recebe imports + pontos de inserção |
| Quebra de dados existentes (`vitaminas: boolean`) | Alto | Campo vira opcional deprecated; branch legacy/novo no recálculo |
| Teto de pontuação muda (56→70) | Baixo | Atualizar docs; casais existentes preservados até próximo save |
| HU-25 depende do catálogo da HU-26 | Médio | HU-25 desenvolve com mock local; integra após merge da HU-26 |
| Real-time save muitas writes | Médio | Apenas checks de vitamina são real-time; debounce 400-500ms |

---

## 🔍 Mapa de Conflitos em Arquivos Compartilhados

```
                     HU-26   HU-25   HU-27   HU-28
db.ts                 ✗       ✗       ✗       ✗     ← 4 histórias
TurmaDetail.tsx       ✗       ✗               ✗     ← 3 histórias
Acompanhamento.tsx                    ✗             ← só HU-27
Desempenho.tsx                        ✗             ← só HU-27
App.tsx                                       ✗     ← só HU-28
```

**Ordem de merge:** Rodada 1: HU-26 → HU-25 | Rodada 2: HU-27 e HU-28 em paralelo

---

## 🏁 Sprint Review

**Data:** 17/06/2026

**Histórias concluídas:**
- [x] HU-26 — Seção editável de vitaminas da semana ✅ (6/6 critérios)
- [x] HU-25 — Roleta animada para sortear vitaminas ✅ (8/8 critérios)
- [x] HU-27 — Check individual de execução ✅ (4/4 critérios)
- [x] HU-28 — Aluno acessa histórico de vitaminas ✅ (4/4 critérios)

**QA:** 4/4 histórias aprovadas ✅ (22/22 critérios de aceite atendidos)

**Métricas:**
- Commits: 6 (T0 + 4 features + correção doc HU-20)
- Merges: 4 (HU-26, HU-25, HU-27, HU-28)
- Conflitos resolvidos: 3 (db.ts x2, TurmaDetail.tsx x1)
- Novos arquivos: 6 (VitaminasSection, RoletaVitaminas, SorteioVitaminasModal, MinhasVitaminas, 3 CSS)
- Novos métodos dbService: 8 (addVitamina, updateVitamina, deleteVitamina, setVitaminaSemanas, getVitaminas, getVitaminasDaSemana, sortearVitaminas, saveVitaminaCheck, getHistoricoVitaminas)
- Nova dependência: canvas-confetti
- Build: passando (tsc 0 erros, vite build OK)

**Lições aprendidas:**
- O que deu bem:
  - Tech Lead commitou T0 (interfaces) antes de despachar especialistas — base sólida para ambos os lados
  - Rodada 1 e Rodada 2 em paralelo dentro de cada rodada — economia de tempo
  - Embedding (sem novas collections) funcionou perfeitamente — zero mudança nas regras Firestore
  - Fórmula de pontuação canônica compartilhada entre 4 pontos (saveChecklist, sortearVitaminas, saveVitaminaCheck, Desempenho) — consistência garantida
  - QA encontrou zero bugs bloqueantes em ambas as rodadas
  - saveChecklist preserva sorteioVitaminas com merge (spread) em vez de clobber — coexistência real-time + Salvar funciona
- O que melhorar:
  - Concorrência de agentes no mesmo workspace causou troca de branch sob o desenvolvedor da HU-27 (recuperado, mas gera risco)
  - Conflitos de merge em db.ts aconteceram em ambas as rodadas — agents adicionam métodos ao final do objeto
  - Prop `key` na interface do RoletaVitaminas é anti-pattern React (não bloqueante, mas dívida técnica)

## 🔄 Retrospectiva

### O que funcionou
- 🟢 **T0 do Tech Lead**: commitar interfaces antes de despachar especialistas evitou divergência de tipos
- 🟢 **Embedding sobre subcollection**: zero mudança nas regras Firestore, transação atômica cobre sorteio + pontuação
- 🟢 **Fórmula canônica de pontuação**: mesma lógica em 4 pontos (saveChecklist, sortearVitaminas, saveVitaminaCheck, Desempenho) — QA validou consistência
- 🟢 **Snapshot denormalizado no sorteio**: histórico preserva nome/descrição mesmo se a vitamina for editada depois
- 🟢 **Merge preserva sorteioVitaminas**: saveChecklist faz spread merge, não clobber — coexistência de fluxos real-time + Salvar
- 🟢 **QA rigoroso em 2 rodadas**: 22/22 critérios validados, zero bugs bloqueantes

### O que melhorar
- 🔴 **Concorrência de agentes no workspace**: dois agentes despachados em paralelo compartilham o mesmo working directory. O agente da HU-28 fez checkout que afetou o agente da HU-27. Mitigação: despachar agentes paralelos em workdirs separados, ou serializar quando há risco de conflito
- 🟡 **Conflitos recorrentes em db.ts**: ambas as rodadas tiveram conflito em db.ts (métodos adicionados ao final). Mitigação: tech-lead poderia commitar stubs de métodos vazios no T0, e os agentes apenas preenchem o corpo
- 🟡 **Prop `key` em interface React**: anti-pattern não bloqueante mas deve ser corrigido em sprint futuro

### Ações para o próximo sprint
1. Avaliar separação de workdirs para agentes paralelos (ou serializar quando há sobreposição de arquivos)
2. Considerar commit de stubs de métodos no T0 para reduzir conflitos de merge
3. Corrigir prop `key` na interface do RoletaVitaminas (task técnica menor)
4. Considerar testes automatizados para dbService (dívida técnica apontada pelo QA — HU-05 no backlog)
