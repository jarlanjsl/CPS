# ADR-001: Adoção de Testes Automatizados com Abordagem Híbrida

> **Status:** Aceito ✅
> **Data:** 17/06/2026
> **Decisores:** Tech Lead, QA, Agile Master, Usuário (Product Owner)
> **Contexto:** Após 4 sprints (18 HUs entregues), projeto possui zero testes automatizados. QA identificou ausência de suíte de testes na validação do Sprint 4.

---

## Decisão

Adotar **abordagem híbrida pragmática** para testes automatizados:

1. **Vitest + React Testing Library** como stack oficial
2. **Testes obrigatórios para services/contexts** (onde vive a lógica de negócio)
3. **Testes opcionais para componentes UI** (focar em interação, não pixel)
4. **Setup incremental** integrado ao Sprint 5 (não adiar features)
5. **Fórmula de pontuação como área crítica** — testar todas as 4 cópias

## Contexto

### O que temos (Sprint 4 concluído):
- `db.ts`: 700 linhas, 20+ métodos, lógica de transação Firestore, fórmula de pontuação duplicada 4x
- `AuthContext.tsx`: 55 linhas, gerenciamento de sessão
- `SoundContext.tsx`: 115 linhas, lógica de frequência de áudio
- `storage.ts`: 87 linhas, upload com resize de imagem
- `Desempenho.tsx`: fórmula de pontuação duplicada (5ª cópia)
- ZERO arquivos de teste (*.test.ts / *.spec.ts)

### Risco identificado (CRÍTICO):
A fórmula de cálculo de pontuação está **duplicada 4 vezes** em `db.ts` (saveChecklist, sortearVitaminas, saveVitaminaCheck) + 1 vez em `Desempenho.tsx` (getPontos). Qualquer mudança na regra de negócio exige alteração em 5 lugares — surface area enorme para bugs.

## Abordagens Consideradas

### Opção A: TDD Puro (Red-Green-Refactor) para tudo
- **Prós:** Cobertura máxima, design mais limpo
- **Contras:** Curva de aprendizado íngreme, overhead para componentes UI, atrasaria features em 1-2 sprints
- **Veredito:** ❌ Rejeitado — custo/benefício ruim para projeto BaaS sem backend próprio

### Opção B: Sprint 0 dedicado exclusivamente a testes
- **Prós:** Base sólida antes de continuar
- **Contras:** Atraso de 2+ semanas na entrega de valor, perda de momentum da equipe
- **Veredito:** ❌ Rejeitado — muito conservador para o estágio do projeto

### Opção C: Abordagem Híbrida Incremental (ESCOLHIDA)
- **Prós:** Equilíbrio entre velocidade e qualidade, testes crescem com o projeto, não atrasa features
- **Contras:** Coverage inicial menor, código legado sem testes imediatos
- **Veredito:** ✅ Escolhido — pragmático, sustentável

### Opção D: Não adoptar testes, manter QA manual
- **Prós:** Velocidade máxima no curto prazo
- **Contras:** Regressões silenciosas, refatoração arriscada, fórmula de pontuação sem validação automatizada
- **Veredito:** ❌ Rejeitado — risco inaceitável dado o volume de lógica duplicada

## Regras Detalhadas

### Coverage Mínimo por Camada

| Camada | Coverage Mínimo | Justificativa |
|--------|:---------------:|---------------|
| `services/db.ts` — fórmula de pontuação | 100% | Duplicada 4x, bug aqui é crítico |
| `services/db.ts` — demais métodos | 80% | CRUD com regras de negócio (limites) |
| `services/storage.ts` | 60% | Upload é linear, menos lógica |
| `contexts/AuthContext.tsx` | 80% | Fluxo de auth é crítico |
| `contexts/SoundContext.tsx` | 60% | Lógica de frequência é testável |
| `pages/` — interações críticas | 40% | Focar em fluxo, não em layout |
| `components/` | 30% | Smoke tests para renderização |

### Fluxo de uma História (Definition of Done)

```
1. Especificação → 2. Testes dos services/contexts → 3. Implementação → 4. Testes de integração → 5. QA Manual → 6. Merge
```

- **Critério de aceite obrigatório:** Toda HU nova DEVE incluir testes para services/contexts alterados
- **Critério de aceite recomendado:** Testes de integração para fluxos críticos

### Prioridade de Testes Retroativos

| Prioridade | Alvo | Esforço |
|:----------:|------|:-------:|
| P0 | Fórmula de pontuação (4 cópias) | 4h |
| P0 | Validação de limites (1/1/5) | 3h |
| P1 | Transações Firestore (merge, retry) | 4h |
| P1 | CRUD vitaminas + sorteio | 3h |
| P1 | AuthContext (login/logout/estado) | 2h |
| P2 | SoundContext (frequências) | 2h |
| P2 | Histórico de vitaminas (projeção) | 2h |
| P2 | Storage (upload/resize) | 1h |

## Consequências

### Positivas
- Regressões na fórmula de pontuação serão detectadas automaticamente
- Refatoração futura (HU-16 Repository Pattern) terá rede de segurança
- Novos desenvolvedores entendem a lógica de negócio lendo os testes
- QA manual pode focar em UX em vez de re-testar lógica conhecida

### Negativas
- Overhead de 20-30% no tempo de desenvolvimento de cada HU
- Curva de aprendizado para a equipe (Vitest, mocks do Firebase)
- Código legado (Sprint 1-4) ficará sem testes até ser refatorado

### Riscos Mitigados
- Fórmula de pontuação duplicada → testes parametrizados cobrem todas as cópias
- Mudança de backend (HU-16) → testes definem o contrato esperado
- Race conditions em transações → testes com mocks de transação

## Referências

- HU-05: Implementar testes automatizados (backlog.md)
- test-plan-sprint-1.md — Seção 7 (Setup Futuro — Vitest + RTL)
- [Vitest docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
