# Sprint 6 — Testes de Contexts + Refatoração CSS 🧪🎨

**Duração:** 01/07/2026 a 14/07/2026 (2 semanas)
**Objetivo:** Completar a estratégia de testes automatizados com testes dos Contexts (Auth, Sound) e realizar refatoração CSS extraindo inline styles para arquivos dedicados.
**Branch:** `sprint/6-testes-css` (criada a partir do `master` após merge do Sprint 5)

---

## 📋 Histórias do Sprint

| HU | Descrição | Estimativa | Prioridade | Branch |
|----|-----------|:----------:|:----------:|--------|
| HU-05b | Testes de Contexts (Auth, Sound) | 🟡 M | Alta | `feature/HU-05b-testes-contexts` |
| HU-06 | Extrair inline styles para arquivos CSS | 🟡 M | Média | `feature/HU-06-inline-styles` |
| **Total** | | **≈ 7 pts** | | |

---

## 🎯 Definição de Pronto (DoD)

- [ ] Código implementado e revisado
- [ ] **Testes automatizados escritos** (obrigatório para services/contexts — ver `docs/testing-policy.md`)
- [ ] **Coverage mínimo atingido** (contexts 70%, conforme testing-policy.md)
- [ ] Critérios de aceite validados pelo QA
- [ ] **QA validou testes** (existem, passam, cobrem critérios)
- [ ] Documentação atualizada (architecture.md, changelog, backlog)
- [ ] Merge via Pull Request na branch do sprint
- [ ] Build validado após implementação
- [ ] `npm test` passando no CI
- [ ] **UI visualmente idêntica** após refatoração CSS (HU-06)

---

## 🧪 HU-05b — Testes de Contexts (Auth, Sound)

### Escopo

| Sub-tarefa | Especialista | Descrição |
|---|---|---|
| T1 | Backend | Testes do AuthContext: `onAuthStateChanged` (login/logout/loading) |
| T2 | Backend | Testes do AuthContext: `logout()` chama `signOut` corretamente |
| T3 | Backend | Testes do AuthContext: `firebaseConfigured` delegado de `isFirebaseConfigured` |
| T4 | Backend | Testes do SoundContext: `playAirplaneSound()` (arquivo + fallback sintetizador) |
| T5 | Backend | Testes do SoundContext: `toggleSoundEnabled()` (on/off) |
| T6 | Backend | Testes do SoundContext: `soundFrequency` (MANUAL, RANDOM, 30MIN) |
| T7 | Backend | Testes do SoundContext: agendamento automático (RANDOM 5-10min, 30MIN) |
| T8 | Backend | Testes do SoundContext: cleanup no unmount e quando `isSoundEnabled` muda |
| T9 | QA | Validar: coverage ≥ 70% em AuthContext e SoundContext |

### Critérios de Aceite HU-05b

1. Testes do AuthContext cobrem: `onAuthStateChanged` (usuário logado/deslogado/loading)
2. Testes do AuthContext cobrem: `logout()` chama `signOut(auth)` corretamente
3. Testes do AuthContext cobrem: `firebaseConfigured` reflete `isFirebaseConfigured`
4. Testes do SoundContext cobrem: `playAirAlarmSound()` (arquivo `/aviao.m4a` + fallback Web Audio API)
5. Testes do SoundContext cobrem: `toggleSoundEnabled()` (toggle on/off)
6. Testes do SoundContext cobrem: `soundFrequency` (MANUAL, RANDOM, 30MIN)
7. Testes do SoundContext cobrem: agendamento automático (RANDOM gera timeout 5-10min, 30MIN gera timeout 30min)
8. Testes do SoundContext cobrem: cleanup no unmount (clearTimeout) e quando `isSoundEnabled` muda para false
9. Coverage de `AuthContext.tsx` ≥ 70%
10. Coverage de `SoundContext.tsx` ≥ 70%
11. Todos os testes passando (`npm test` = 0 failures)
12. Build passando após implementação

---

## 🎨 HU-06 — Extrair Inline Styles para CSS

### Escopo

| Sub-tarefa | Especialista | Descrição |
|---|---|---|
| T1 | Frontend | Mover inline styles de `TurmaDetail.tsx` para `styles/turma-detail.css` |
| T2 | Frontend | Mover inline styles de `Acompanhamento.tsx` para `styles/acompanhamento.css` |
| T3 | Frontend | Mover inline styles de `Desempenho.tsx` para `styles/desempenho.css` |
| T4 | Frontend | Mover inline styles de `Ajustes.tsx` para `styles/ajustes.css` |
| T5 | Frontend | Mover inline styles de `Login.tsx` para `styles/login.css` |
| T6 | Frontend | Mover inline styles de `Home.tsx` para `styles/home.css` |
| T7 | Frontend | Garantir que nenhum `style={{}}` permaneça (exceto estilos dinâmicos calculados) |
| T8 | Frontend | Verificar que a UI permanece visualmente idêntica após refatoração |
| T9 | QA | Validar: UI idêntica antes/depois (screenshot comparison ou visual inspection) |
| T10 | QA | Validar: todos os testes existentes continuam passando |

### Critérios de Aceite HU-06

1. Todos os inline styles de `TurmaDetail.tsx` movidos para `styles/turma-detail.css`
2. Todos os inline styles de `Acompanhamento.tsx` movidos para `styles/acompanhamento.css`
3. Todos os inline styles de `Desempenho.tsx` movidos para `styles/desempenho.css`
4. Todos os inline styles de `Ajustes.tsx` movidos para `styles/ajustes.css`
5. Todos os inline styles de `Login.tsx` movidos para `styles/login.css`
6. Todos os inline styles de `Home.tsx` movidos para `styles/home.css`
7. Nenhum `style={{}}` permanece nos componentes (exceto estilos dinâmicos calculados em runtime)
8. A UI permanece visualmente idêntica após a refatoração (mesmo layout, cores, espaçamentos)
9. Todos os testes existentes continuam passando (`npm test` = 0 failures)
10. Build passando após implementação

### Notas Técnicas HU-06

**O que PODE permanecer como `style={{}}`:**
- Estilos calculados dinamicamente (ex: `style={{ width: `${percent}%` }}`)
- Estilos que dependem de props ou estado (ex: `style={{ opacity: isActive ? 1 : 0.5 }}`)
- Estilos de animação que mudam em runtime (ex: `style={{ transform: `rotate(${angle}deg)` }}`)

**O que DEVE ser movido para CSS:**
- Estilos estáticos (cores, fontes, espaçamentos fixos)
- Estilos de layout (flexbox, grid, positioning)
- Estilos de componentes reutilizáveis (botões, cards, inputs)

**Estratégia de Nomes CSS:**
- Usar classes BEM (Block Element Modifier) ou nomes descritivos
- Exemplo: `.turma-card`, `.turma-card__header`, `.turma-card__header--active`
- Evitar conflitos com CSS global (usar prefixos ou escopo)

---

## 📅 Cronograma

| Fase | Período | Foco |
|------|---------|------|
| HU-05b | Dias 1-4 | Testes de AuthContext + SoundContext |
| QA Gate 1 | Dia 4 | Validação HU-05b (coverage + testes) |
| HU-06 | Dias 5-8 | Refatoração CSS (componente por componente) |
| QA Gate 2 | Dia 8 | Validação HU-06 (UI idêntica + testes passando) |
| Review | Dias 9-10 | Sprint Review e documentação final (REGRA 7) |

---

## 🔄 Dependências

```
HU-05b (testes contexts) ──→ HU-06 (refatoração CSS)
```

> HU-05b deve ser implementada primeiro porque:
> 1. Testes não mudam código de produção, só adicionam cobertura
> 2. HU-06 (refatoração CSS) pode quebrar testes se não forem escritos antes
> 3. Ordem segura: **testes primeiro → refatoração depois**

---

## 🔗 Branches de Feature

| História | Branch |
|----------|--------|
| HU-05b | `feature/HU-05b-testes-contexts` |
| HU-06 | `feature/HU-06-inline-styles` |

---

## ⚠️ Riscos e Mitigações

| Risco | Nível | Mitigação |
|---|---|---|
| Mocks complexos para Web Audio API | Alto | Usar `vi.mock()` para simular `Audio` e `AudioContext`; testar comportamento, não implementação |
| Refatoração CSS quebra UI | Alto | QA valida visualmente cada componente após refatoração; usar screenshot comparison se possível |
| Conflitos entre branches (HU-05b e HU-06) | Médio | HU-05b só adiciona arquivos de teste; HU-06 muda componentes e CSS — sem sobreposição |
| Estilos dinâmicos difíceis de extrair | Médio | Manter `style={{}}` apenas para cálculos dinâmicos; documentar exceções |
| Testes de Contexts falham por timing (setTimeout) | Médio | Usar `vi.useFakeTimers()` e `vi.advanceTimersByTime()` para controlar agendamentos |

---

## 📊 Métricas Alvo

| Métrica | Alvo |
|---------|------|
| Testes criados | ~20-30 (HU-05b) |
| Coverage `AuthContext.tsx` | ≥ 70% |
| Coverage `SoundContext.tsx` | ≥ 70% |
| Inline styles removidos | ~80-90% (exceto dinâmicos) |
| Arquivos CSS criados | 6 (um por componente) |
| Build | passando |
| `npm test` | 0 failures |
| UI visual | idêntica antes/depois |

---

## 📝 Retrospectiva do Sprint 5 (ações para este sprint)

1. ✅ Coverage global atingiu 87% (supera meta de 45%) — **manter padrão de qualidade**
2. ✅ Testes de transação (saveChecklist, sortear, check) já implementados no Sprint 5 — **HU-05b foca em Contexts**
3. 🔲 Corrigir prop `key` na interface do RoletaVitaminas — **pendente (task técnica menor, pode ser feita neste sprint se sobrar tempo)**

---

## 📚 Documentos de Referência

- [Política de Testes](testing-policy.md) — regras de coverage, fluxo, stack
- [ADR-001](adr/ADR-001-testes-automatizados.md) — decisão arquitetural de testes
- [Backlog](backlog.md) — HU-05, HU-06 detalhadas
- [Sprint 5](sprint-5.md) — fundação de testes (Vitest + RTL + mocks)
