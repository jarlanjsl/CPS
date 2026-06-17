# Sprint 2 — CPS (Casados Para Sempre)

**Duração:** 17/06/2026 a 01/07/2026 (2 semanas)  
**Objetivo:** Completar CRUD de casais, segurança das credenciais e ciclo de vida das turmas  
**Branch:** `sprint/2-gestao-casais`

---

## 📋 Histórias do Sprint

| HU | Descrição | Estimativa | Status |
|----|-----------|------------|--------|
| HU-03 | Remover credenciais Firebase do histórico Git | M | Backlog |
| HU-08 | Editar dados de um casal | M | Backlog |
| HU-09 | Remover casal de uma turma | M | Backlog |
| HU-10 | Marcar turma como concluída | S | Backlog |

---

## 🎯 Definição de Pronto (DoD)

- [ ] Código implementado e revisado
- [ ] Testes unitários escritos e passando
- [ ] Critérios de aceite validados
- [ ] Documentação atualizada (se aplicável)
- [ ] Merge via Pull Request na branch do sprint

---

## 📅 Cronograma

| Semana | Datas | Foco |
|--------|-------|------|
| Semana 1 | 17/06 - 24/06 | HU-03 (segurança) + HU-08 (editar casal) |
| Semana 2 | 24/06 - 01/07 | HU-09 (remover casal) + HU-10 (concluir turma) |

---

## 🔄 Daily Sprint (Checklist)

- [ ] O que foi feito ontem?
- [ ] O que será feito hoje?
- [ ] Existe algum impedimento?

---

## 📊 Métricas Alvo

- **Velocity esperado:** 3.5 pontos (M+M+M+S)
- **Coverage mínimo:** 60% nos services/contexts afetados
- **Zero bugs críticos** em produção

---

## 🔗 Branches de Feature

| História | Branch |
|----------|--------|
| HU-03 | `feature/HU-03-remover-credenciais` |
| HU-08 | `feature/HU-08-editar-casal` |
| HU-09 | `feature/HU-09-remover-casal` |
| HU-10 | `feature/HU-10-concluir-turma` |

---

## 📝 Notas do Sprint

- **Impedimentos:** Nenhum no início do sprint
- **Riscos:** HU-03 envolve reescrever histórico Git — requer cuidado com backup
- **Dependências:** Nenhuma crítica entre histórias

---

## 🏁 Sprint Review

**Data:** 17/06/2026

**Histórias concluídas:**
- [x] HU-03 — Remover credenciais Firebase do histórico Git ✅
- [x] HU-08 — Editar dados de um casal ✅
- [x] HU-09 — Remover casal de uma turma ✅
- [x] HU-10 — Marcar turma como concluída ✅

**QA:** 4/4 histórias aprovadas ✅

**Lições aprendidas:**
- O que deu bem:
  - CRUD de casais completo (criar + editar + excluir)
  - Ciclo de vida das turmas (ativa ↔ concluída)
  - Segurança das credenciais tratada
  - QA envolvido pela primeira vez no processo
- O que melhorar:
  - Agile Master não deve implementar código (REGRA 5 criada)
  - Perguntas de subagentes devem chegar ao usuário (REGRA 4 criada)
  - QA deve ser acionado em todo sprint (REGRA 6 criada)
  - Documentação de final de sprint deve ser obrigatória (REGRA 7 criada)