# Sprint 3 — Identidade Visual + Ordenação + Fotos

**Duração:** 17/06/2026 a 01/07/2026 (2 semanas)
**Objetivo:** Aplicar nova identidade visual, ordenar turmas por data e adicionar fotos aos casais
**Branch:** `sprint/3-identidade-visual`

---

## 📋 Histórias do Sprint

| HU | Descrição | Estimativa | Status |
|----|-----------|:----------:|--------|
| HU-21 | Ordenar turmas por data de criação (mais recentes primeiro) | 🟢 S | Backlog |
| HU-20 | Nova identidade visual (cores + logo) | 🟡 M | Backlog |
| HU-22 | Adicionar foto para cada casal (upload Firebase Storage) | 🟡 M | Backlog |
| HU-23 | Exibir fotos no ranking (2ª rodada, depende HU-22) | 🟢 S | Backlog |

---

## 🎯 Definição de Pronto (DoD)

- [ ] Código implementado e revisado
- [ ] Critérios de aceite validados pelo QA
- [ ] Documentação atualizada (se aplicável)
- [ ] Merge via Pull Request na branch do sprint

---

## 📅 Cronograma

| Fase | Período | Foco |
|------|---------|------|
| Setup | Dia 1 | Regras Storage (Firebase Console) + Migração `createdAt` |
| Rodada 1 | Dias 2-4 | HU-21 + HU-20 + HU-22 em paralelo |
| QA Gate 1 | Dias 4-5 | Validação das 3 histórias pelo QA |
| Rodada 2 | Dias 5-6 | HU-23 (fotos no ranking) |
| QA Gate 2 | Dia 6 | Validação HU-23 |
| Review | Dia 7 | Sprint Review e documentação final |

---

## 🔄 Dependências

```
HU-21 ─── independente (pode rodar já)
HU-20 ─── independente (pode rodar já)
HU-22 ─── pré-requisito → HU-23
         └── depende de: Firebase Storage configurado (regras)
```

---

## 🔗 Branches de Feature

| História | Branch |
|----------|--------|
| HU-21 | `feature/HU-21-order-turmas` |
| HU-20 | `feature/HU-20-identidade-visual` |
| HU-22 | `feature/HU-22-foto-casal` |
| HU-23 | `feature/HU-23-fotos-ranking` |

---

## 📝 Notas do Sprint

- **Impedimentos iniciais:**
  - 🔴 Regras de segurança do Firebase Storage precisam ser aplicadas no Console
  - 🟡 Turmas existentes precisam de migração do campo `createdAt`
- **Riscos:**
  - Conflito em `db.ts` entre HU-21 e HU-22 — baixo (métodos diferentes)
  - HU-22 depende de Storage estar configurado corretamente
- **Paralelismo:** HU-20, HU-21 e HU-22 rodam em paralelo na Rodada 1
- **Ordem de merge sugerida:** HU-21 → HU-22 → HU-20 (ou HU-20 independente)

---

## 🏁 Sprint Review

*[A ser preenchido ao final do sprint]*

---

## 🔄 Retrospectiva

*[A ser preenchida ao final do sprint]*
