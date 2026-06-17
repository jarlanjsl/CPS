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

**Data:** 17/06/2026

**Histórias concluídas:**
- [x] HU-21 — Ordenar turmas por data de criação ✅
- [x] HU-20 — Nova identidade visual (cores + logo) ✅
- [x] HU-22 — Adicionar foto para cada casal (Firebase Storage) ✅
- [x] HU-23 — Exibir fotos no ranking ✅

**QA:** 4/4 histórias aprovadas ✅

**Lições aprendidas:**
- O que deu bem:
  - 3 agentes rodando em paralelo na Rodada 1 (HU-20, HU-21, HU-22) — economia de tempo significativa
  - Firebase Storage configurado e funcionando com redimensionamento Canvas
  - Componente `AvatarCasado` reutilizado na HU-23 sem retrabalho
  - Design da nova identidade visual bem recebido
- O que melhorar:
  - Agentes não commitaram código nas branches corretas — todo o código ficou no working directory
  - Necessário verificar commits dos agentes antes de dar como concluído
  - QA encontrou arquivo `migrateCreatedAt.ts` ausente (commit perdido)
  - Processo de merge manual após agentes poderia ser mais automatizado

## 🔄 Retrospectiva

### O que funcionou
- 🟢 **Paralelismo real**: HU-20, HU-21 e HU-22 rodaram simultaneamente
- 🟢 **Reuso de componente**: `AvatarCasado` criado na HU-22 e reusado na HU-23 sem alterações
- 🟢 **QA rigoroso**: Encontrou problemas de commit que passariam despercebidos
- 🟢 **Pré-requisitos bem definidos**: Storage e migração resolvidos antes da implementação

### O que melhorar
- 🔴 **Commits dos agentes**: Agentes precisam commitar nas branches corretas, não apenas deixar no working directory
- 🟡 **Verificação pós-agente**: Agile Master deve validar commits antes de liberar merge
- 🟡 **Documentação de dependências**: HU-22 precisou de Firebase Storage (upgrade Blaze) — antecipar em sprints futuros

### Ações para o próximo sprint
1. Adicionar checklist de verificação: "Agente commitou na branch correta?"
2. Validar build dos agentes após cada implementação
3. Documentar no plano do sprint se há dependências de infra (ex: ativar serviço no Firebase Console)
