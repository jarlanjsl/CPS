# Sprint 7 — Testes de Integração + PWA Completo 🧪📱

**Duração:** 15/07/2026 a 28/07/2026 (2 semanas)
**Objetivo:** Completar a estratégia de testes automatizados com testes de integração e componentes UI, e implementar PWA completo com Service Worker, ícones reais e cache offline.
**Branch:** `sprint/7-testes-pwa` (criada a partir do `master` após merge do Sprint 6)

---

## 📋 Histórias do Sprint

| HU | Descrição | Estimativa | Prioridade | Branch |
|----|-----------|:----------:|:----------:|--------|
| HU-05c | Testes de integração + componentes UI | 🔴 L | Alta | `feature/HU-05c-testes-integracao` |
| HU-12 | Completar PWA (Service Worker + ícones) | 🔴 L | Média | `feature/HU-12-pwa-completo` |
| **Total** | | **≈ 10 pts** | | |

---

## 🎯 Definição de Pronto (DoD)

- [ ] Código implementado e revisado
- [ ] **Testes automatizados escritos** (obrigatório para services/contexts/páginas — ver `docs/testing-policy.md`)
- [ ] **Coverage mínimo atingido** (páginas 50%, conforme testing-policy.md)
- [ ] Critérios de aceite validados pelo QA
- [ ] **QA validou testes** (existem, passam, cobrem critérios)
- [ ] Documentação atualizada (architecture.md, changelog, backlog)
- [ ] Merge via Pull Request na branch do sprint
- [ ] Build validado após implementação
- [ ] `npm test` passando no CI
- [ ] **Lighthouse PWA score ≥ 90** (HU-12)
- [ ] **App instalável** na tela inicial (HU-12)

---

## 🧪 HU-05c — Testes de Integração + Componentes UI

### Escopo

| Sub-tarefa | Especialista | Descrição |
|---|---|---|
| T1 | Backend | Testes de integração do fluxo de Checklist (salvar + recalcular pontuação) |
| T2 | Backend | Testes de integração do fluxo de Vitaminas (sortear + check + histórico) |
| T3 | Frontend | Testes do componente `Home.tsx` (listagem de turmas, ordenação, seção concluídas) |
| T4 | Frontend | Testes do componente `Login.tsx` (formulário, validação, submit) |
| T5 | Frontend | Testes do componente `TurmaDetail.tsx` (CRUD de casais, modais, validações) |
| T6 | Frontend | Testes do componente `Acompanhamento.tsx` (checkboxes, save, cálculo de pontuação) |
| T7 | Frontend | Testes do componente `Desempenho.tsx` (ranking, filtros, animação) |
| T8 | Frontend | Testes do componente `Ajustes.tsx` (toggles, selects, logout) |
| T9 | QA | Validar: coverage ≥ 50% nas páginas |
| T10 | QA | Validar: todos os testes de integração passando |

### Critérios de Aceite HU-05c

#### Testes de Integração
1. Testes de integração cobrem fluxo de Checklist:
   - Salvar checklist com `runTransaction` (sucesso)
   - Recalcular `pontuacaoTotal` atomicamente
   - Tratar conflito (retry automático do Firestore)
   - Notificar usuário em caso de falha definitiva
2. Testes de integração cobrem fluxo de Vitaminas:
   - Sortear vitaminas via `sortearVitaminas()` (transação)
   - Salvar check individual via `saveVitaminaCheck()` (transação)
   - Obter histórico via `getHistoricoVitaminas()` (projeção)
   - Tratar edge cases (sem vitaminas sorteadas, vitamina excluída do catálogo)

#### Testes de Componentes UI
3. Testes do `Home.tsx` cobrem:
   - Listagem de turmas ativas (ordenadas por `createdAt` desc)
   - Seção de turmas concluídas (visual diferenciado)
   - Botão de criar turma (abre modal)
   - Navegação para detalhe da turma
4. Testes do `Login.tsx` cobrem:
   - Formulário de login (username + password)
   - Validação de campos obrigatórios
   - Submit chama `signInWithEmailAndPassword`
   - Tratamento de erro (credenciais inválidas)
   - Redirecionamento após login bem-sucedido
5. Testes do `TurmaDetail.tsx` cobrem:
   - Listagem de casais (com avatares/fotos)
   - Modal de criação de casal (validação de limites 1/1/5)
   - Modal de edição de casal (campos preenchidos)
   - Modal de exclusão de casal (digitar "Excluir")
   - Botão de concluir/reabrir turma
   - Navegação para acompanhamento semanal
6. Testes do `Acompanhamento.tsx` cobrem:
   - Checkboxes de presença, tarefas, tarefasExtras
   - Card de vitaminas sorteadas (checks individuais ele/ela)
   - Save automático (ou botão salvar)
   - Cálculo de pontuação da semana
7. Testes do `Desempenho.tsx` cobrem:
   - Ranking geral (ordenado por `pontuacaoTotal` desc)
   - Filtros por categoria (Geral, Presença, Vitamina, Tarefas)
   - Animação de transição de posições (Framer Motion)
   - Indicativo visual (seta verde/vermelha/cinza)
   - Fotos dos casais (lazy loading)
8. Testes do `Ajustes.tsx` cobrem:
   - Toggle de som (on/off)
   - Select de frequência (MANUAL, RANDOM, 30MIN)
   - Botão de logout (chama `auth.logout()`)

#### Coverage
9. Coverage de `Home.tsx` ≥ 50%
10. Coverage de `Login.tsx` ≥ 50%
11. Coverage de `TurmaDetail.tsx` ≥ 50%
12. Coverage de `Acompanhamento.tsx` ≥ 50%
13. Coverage de `Desempenho.tsx` ≥ 50%
14. Coverage de `Ajustes.tsx` ≥ 50%

#### Qualidade
15. Todos os testes passando (`npm test` = 0 failures)
16. Build passando após implementação (`npm run build`)

---

## 📱 HU-12 — Completar PWA (Service Worker + Ícones)

### Escopo

| Sub-tarefa | Especialista | Descrição |
|---|---|---|
| T1 | DevOps | Gerar ícones PWA reais (192x192 e 512x512) com identidade visual do CPS |
| T2 | DevOps | Atualizar `manifest.json` com ícones corretos, nome, descrição e theme_color |
| T3 | DevOps | Implementar Service Worker com cache de assets estáticos (Workbox ou manual) |
| T4 | DevOps | Implementar estratégia de cache para fonts e assets (Cache First) |
| T5 | Frontend | Exibir prompt de instalação customizado (antes do browser default) |
| T6 | Frontend | Adicionar meta tags PWA no `index.html` (apple-touch-icon, theme-color) |
| T7 | QA | Validar: Lighthouse PWA score ≥ 90 |
| T8 | QA | Validar: app instalável na tela inicial |
| T9 | QA | Validar: app funciona offline (cache de assets) |

### Critérios de Aceite HU-12

#### Ícones e Manifest
1. Ícones PWA reais gerados (192x192 e 512x512) com identidade visual do CPS
   - Usar logotipo do CPS (duas alianças douradas + texto "Casados Para Sempre")
   - Fundo branco ou transparente
   - Formato PNG com transparência (se aplicável)
2. `manifest.json` atualizado com:
   - `name`: "Casados Para Sempre"
   - `short_name`: "CPS"
   - `description`: "Sistema de acompanhamento de turmas de casais"
   - `icons`: 192x192 e 512x512 (type: image/png)
   - `theme_color`: `#6366f1` (indigo — paleta atual)
   - `background_color`: `#ffffff`
   - `display`: `standalone`
   - `start_url`: `/`
   - `scope`: `/`

#### Service Worker
3. Service Worker implementado com cache de assets estáticos:
   - HTML, CSS, JS, imagens (logo, avatares)
   - Fonts (se houver)
   - Estratégia: **Cache First** (para assets estáticos)
   - Estratégia: **Network First** (para API calls — se houver)
4. Service Worker registrado no `index.html` ou `main.tsx`
5. Service Worker atualiza cache automaticamente quando há nova versão
6. Service Worker limpa caches antigos (versionamento)

#### Cache Offline
7. App funciona offline após primeiro carregamento:
   - Assets estáticos carregados do cache
   - Mensagem de erro amigável se tentar acessar dados não cacheados
8. Indicador visual de status de conexão (online/offline) — opcional, mas recomendado

#### Prompt de Instalação
9. Prompt de instalação customizado exibido:
   - Botão "Instalar App" na tela inicial ou ajustes
   - Usa `beforeinstallprompt` event do browser
   - Exibe modal explicativo antes de instalar
10. Meta tags PWA no `index.html`:
    - `<meta name="theme-color" content="#6366f1">`
    - `<link rel="apple-touch-icon" href="/icon-192x192.png">`
    - `<meta name="apple-mobile-web-app-capable" content="yes">`
    - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`

#### Qualidade
11. Lighthouse PWA score ≥ 90
    - Instalar e executar Lighthouse no Chrome DevTools
    - Verificar categorias: Performance, PWA, Best Practices, SEO
12. App instalável na tela inicial (Android e iOS)
    - Testar no Chrome (Android) e Safari (iOS)
    - Verificar se ícone e nome estão corretos
13. Build passando após implementação (`npm run build`)

---

## 📅 Cronograma

| Fase | Período | Foco |
|------|---------|------|
| HU-05c | Dias 1-5 | Testes de integração + componentes UI |
| QA Gate 1 | Dia 5 | Validação HU-05c (coverage + testes) |
| HU-12 | Dias 6-9 | PWA completo (Service Worker + ícones + manifest) |
| QA Gate 2 | Dia 9 | Validação HU-12 (Lighthouse + instalação) |
| Review | Dias 10-11 | Sprint Review e documentação final (REGRA 7) |

---

## 🔄 Dependências

```
HU-05c (testes integração) ──→ HU-12 (PWA)
```

> HU-05c deve ser implementada primeiro porque:
> 1. Testes não mudam código de produção, só adicionam cobertura
> 2. HU-12 (PWA) pode quebrar testes se não forem escritos antes
> 3. Ordem segura: **testes primeiro → PWA depois**
> 4. HU-05c e HU-12 são independentes (poderiam ser paralelas), mas sequencial é mais seguro

---

## 🔗 Branches de Feature

| História | Branch |
|----------|--------|
| HU-05c | `feature/HU-05c-testes-integracao` |
| HU-12 | `feature/HU-12-pwa-completo` |

---

## ⚠️ Riscos e Mitigações

| Risco | Nível | Mitigação |
|---|---|---|
| Testes de integração complexos (Firestore mocks) | Alto | Usar mocks já criados em `src/test/mocks/firebase.ts`; testar comportamento, não implementação |
| Service Worker quebra app em produção | Alto | Testar extensivamente em dev antes de mergear; usar `workbox-window` para controle de atualização |
| Ícones PWA com qualidade ruim | Médio | Usar ferramentas profissionais (Figma, Canva) ou gerar via script (sharp/jimp) |
| Lighthouse score < 90 | Médio | Otimizar performance (code splitting, lazy loading); verificar best practices |
| Prompt de instalação não funciona em iOS | Médio | iOS não suporta `beforeinstallprompt` — exibir instruções manuais (Safari → Compartilhar → Adicionar à Tela de Início) |
| Conflitos entre branches (HU-05c e HU-12) | Baixo | HU-05c só adiciona arquivos de teste; HU-12 muda `index.html`, `manifest.json`, adiciona Service Worker — sem sobreposição significativa |

---

## 📊 Métricas Alvo

| Métrica | Alvo |
|---------|------|
| Testes de integração criados | ~15-20 |
| Testes de componentes UI criados | ~30-40 |
| Coverage `Home.tsx` | ≥ 50% |
| Coverage `Login.tsx` | ≥ 50% |
| Coverage `TurmaDetail.tsx` | ≥ 50% |
| Coverage `Acompanhamento.tsx` | ≥ 50% |
| Coverage `Desempenho.tsx` | ≥ 50% |
| Coverage `Ajustes.tsx` | ≥ 50% |
| Coverage global | ≥ 90% |
| Ícones PWA gerados | 2 (192x192, 512x512) |
| Lighthouse PWA score | ≥ 90 |
| Build | passando |
| `npm test` | 0 failures |
| App instalável | sim (Android + iOS) |

---

## 📝 Retrospectiva do Sprint 6 (ações para este sprint)

1. ✅ **Sequência correta:** HU-05b (testes) antes de HU-06 (refatoração) funcionou bem — **manter padrão: testes primeiro**
2. ✅ **Mocks de Web Audio API:** Tech-lead criou mocks robustos — **reutilizar padrões para HU-05c**
3. ✅ **Nomenclatura CSS consistente:** Padrão BEM-like facilitou revisão — **manter padrão em HU-12 (classes CSS do prompt de instalação)**
4. 🔲 **MinhasVitaminas.tsx:** Possui 7 inline styles estáticos — **considerar refatorar neste sprint se sobrar tempo**
5. 🔲 **Chunk size warning:** Build gera aviso de chunk > 500kB — **avaliar code splitting no HU-12 (lazy loading de rotas)**

---

## 📚 Documentos de Referência

- [Política de Testes](testing-policy.md) — regras de coverage, fluxo, stack
- [ADR-001](adr/ADR-001-testes-automatizados.md) — decisão arquitetural de testes
- [Backlog](backlog.md) — HU-05, HU-12 detalhadas
- [Sprint 6](sprint-6.md) — testes de Contexts + refatoração CSS
- [MDN: PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) — guia completo de PWA
- [Workbox](https://developer.chrome.com/docs/workbox/) — biblioteca para Service Worker
