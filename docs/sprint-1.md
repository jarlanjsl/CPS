# Sprint 1 — Estabilização

> **Período**: 17/06/2026
> **Branch**: `sprint/1-estabilizacao`
> **Objetivo**: Estabilizar a aplicação removendo bugs críticos e garantindo que ações básicas (logout, salvar dados) funcionem com segurança.

---

## Histórias Selecionadas

| HU | Título | Estimativa | Branch |
|---|---|---|---|
| HU-01 | Corrigir fluxo de logout | S | `feature/HU-01-corrigir-logout` |
| HU-02 | Adicionar Error Boundaries | S | `feature/HU-02-error-boundaries` |
| HU-04 | Transações Firestore no saveChecklist | S | `feature/HU-04-transacoes-checklist` |
| HU-07 | Remover código morto e inconsistente | S | `feature/HU-07-codigo-morto` |

**Total estimado**: 4S

---

## Metas do Sprint

1. ✅ Logout funciona corretamente (HU-01)
2. ✅ Erros não tratados exibem tela de fallback (HU-02)
3. ✅ Salvamento de checklist é atômico e seguro (HU-04)
4. ✅ Codebase limpo sem código morto (HU-07)

---

## Critérios de Aceite do Sprint

- Todas as 4 histórias com critérios de aceite validados
- Zero bugs conhecidos nas funcionalidades cobertas
- Código passando no ESLint sem warnings
- Commit atômicos por história em branches separadas