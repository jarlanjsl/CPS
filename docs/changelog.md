# Changelog

Todas as mudancas notaveis neste projeto serao documentadas neste arquivo.

O formato e baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Sprint 5] - 2026-06-17

### Added

- Fundação de testes automatizados com Vitest + React Testing Library (HU-05a)
  - Configuração Vitest + jsdom + coverage-v8 em `vite.config.ts`
  - Mocks do Firebase em `src/test/mocks/firebase.ts` (auth, firestore, storage)
  - Helper functions em `src/test/helpers/fixtures.ts` (mockTurma, mockCasal, mockSemanaCheck, etc.)
  - Scripts `test`, `test:watch`, `test:coverage` no `package.json`
  - 108 testes automatizados passando (0 failures)
- Função pura `calcularPontuacao()` em `services/scoring.ts` (HU-05a)
  - Elimina 3 das 5 cópias da fórmula de pontuação no código
  - Coverage 100% (Stmts, Branch, Funcs, Lines)
  - Usada por `saveChecklist`, `sortearVitaminas`, `saveVitaminaCheck` em `db.ts`
- Testes de limites de casais (HU-05a)
  - createCasal: LIDER máx 1, CO-LIDER máx 1, ALUNO máx 5
  - updateCasal: validação rígida ao mudar tipo
  - Coverage de `db.ts`: 85.54%
- Animação de evolução no ranking com Framer Motion (HU-24)
  - Seletor de semanas (1-14 + "Todas as Semanas") em `Desempenho.tsx`
  - `AnimatePresence` + `motion.div` com layout animations (spring physics)
  - Indicadores visuais: seta verde ↑ (subiu), seta vermelha ↓ (desceu), traço cinza — (manteve)
  - Funciona em todas as categorias (GERAL, PRESENCA, VITAMINA, TAREFAS)
  - Funções puras extraídas em `ranking-utils.ts` (getPontosSemana, calcularDeltas)
  - 21 testes novos para lógica de ranking
  - Coverage de `ranking-utils.ts`: 95%
- Política de testes automatizados (`docs/testing-policy.md`)
  - Abordagem híbrida: testes escritos junto com o código
  - Coverage mínimo por camada: services 80%, contexts 70%, páginas 50%, fórmula 100%
  - QA Gate inclui validação de testes automatizados

### Changed

- `db.ts`: 3 cópias da fórmula de pontuação substituídas por `calcularPontuacao()` (scoring.ts)
- `Desempenho.tsx`: adicionado seletor de semanas + animações + indicadores de delta
- Coverage global: 0% → 87.44% Stmts / 77.53% Branch / 93.75% Funcs / 93.87% Lines

### Security

- Sem alteração nas regras do Firestore

---

## [Unreleased] - 2026-07-01

### Added (previsto)

- HU-05b: Testes automatizados dos Contexts (AuthContext, SoundContext)
  - Testes de `onAuthStateChanged` (login/logout/loading)
  - Testes de `logout()` (chama `signOut` corretamente)
  - Testes de `firebaseConfigured` (delegado de `isFirebaseConfigured`)
  - Testes de `playAirplaneSound()` (arquivo + fallback Web Audio API)
  - Testes de `toggleSoundEnabled()` (on/off)
  - Testes de `soundFrequency` (MANUAL, RANDOM, 30MIN)
  - Testes de agendamento automático (RANDOM 5-10min, 30MIN 30min)
  - Testes de cleanup no unmount
  - Coverage alvo: ≥ 70% em AuthContext e SoundContext

### Changed (previsto)

- HU-06: Refatoração CSS — extração de inline styles para arquivos dedicados
  - `TurmaDetail.tsx` → `styles/turma-detail.css`
  - `Acompanhamento.tsx` → `styles/acompanhamento.css`
  - `Desempenho.tsx` → `styles/desempenho.css`
  - `Ajustes.tsx` → `styles/ajustes.css`
  - `Login.tsx` → `styles/login.css`
  - `Home.tsx` → `styles/home.css`
  - Nenhum `style={{}}` permanece (exceto estilos dinâmicos calculados)
  - UI visualmente idêntica após refatoração

---

## [Unreleased] - 2026-06-17

### Added

- Política de testes automatizados (`docs/testing-policy.md`)
  - Abordagem híbrida: testes escritos junto com o código (não TDD puro)
  - Coverage mínimo por camada: services 80%, contexts 70%, páginas 50%, fórmula de pontuação 100%
  - Testes obrigatórios para HU que altere services/contexts/lógica de negócio
  - QA Gate inclui validação de testes automatizados
  - Stack: Vitest + React Testing Library + jsdom + @vitest/coverage-v8
- HU-05a (Setup de testes + fórmula de pontuação + limites) adicionada ao Sprint 5
- ADR-001: Estratégia de testes automatizados (ver `docs/adr/ADR-001-testes-automatizados.md`)

### Changed

- HU-05 dividida em 3 partes: HU-05a (Sprint 5), HU-05b (Sprint 6), HU-05c (Sprint 7+)
- Sprint 5 replanejado: "Fundação de Testes + Animação do Ranking" (HU-05a + HU-24)
- Fluxo de trabalho: testes são pré-requisito para PR ser aceito
- Definition of Done atualizada: inclui testes automatizados e coverage mínimo

---

## [Sprint 4] - 2026-06-17

### Added

- Sistema completo de Vitaminas da Semana com catálogo editável, roleta animada, check individual e histórico (HU-25, HU-26, HU-27, HU-28)
- Catálogo de vitaminas embutido em `turmas.vitaminas: Record<string, Vitamina>` com CRUD completo (HU-26)
  - `dbService`: addVitamina, updateVitamina, deleteVitamina, setVitaminaSemanas, getVitaminas, getVitaminasDaSemana
  - Componente `VitaminasSection.tsx` com listagem, modais de cadastro/edição, toggle de semanas ativas (chips 1-14)
  - Vitaminas reaproveitáveis entre semanas ou únicas por semana (campo `semanas: number[]`)
- Roleta animada para sortear vitaminas com CSS puro (HU-25)
  - Componente `RoletaVitaminas.tsx`: roleta circular com setores (conic-gradient), animação `transform: rotate()` + `cubic-bezier(0.17, 0.67, 0.3, 0.99)` (2.5s)
  - Componente `SorteioVitaminasModal.tsx`: duas roletas independentes (Ele e Ela), confete via `canvas-confetti`, save automático
  - `dbService.sortearVitaminas`: grava sorteio via `runTransaction` em `casais.semanas[semanaId].sorteioVitaminas` com snapshot denormalizado
  - Botão "Girar Roleta" integrado em cada card de semana em `TurmaDetail.tsx`
  - Dependência `canvas-confetti` adicionada
- Check individual de execução das vitaminas (Ele ✅ / Ela ✅) (HU-27)
  - `dbService.saveVitaminaCheck`: save em tempo real via `runTransaction`, atualiza apenas o check da pessoa preservando o snapshot
  - `Acompanhamento.tsx`: card "Vitaminas Sorteadas" com checkboxes individuais por pessoa (real-time)
  - `Desempenho.tsx`: categoria VITAMINA agora soma 0/1/2 pontos (era 0/1)
- Tela de histórico de vitaminas do aluno (HU-28)
  - Página `MinhasVitaminas.tsx` com lista ordenada (mais recente → mais antiga) e badges de status (Cumprida/Pendente/Não sorteada)
  - `dbService.getHistoricoVitaminas`: projeção do documento do casal (sem nova collection)
  - Rota `/aluno/:casalId/vitaminas` em `App.tsx`
  - Botão "Histórico de Vitaminas" nos cards de casal em `TurmaDetail.tsx`
- ADR-004: catálogo e sorteio de vitaminas via embedding (estende ADR-002)

### Changed

- `db.ts`: Interfaces `Vitamina`, `VitaminaSorteio`, `SorteioVitaminas` adicionadas; `SemanaCheck` estendida com `sorteioVitaminas?` e `vitaminas?` (deprecated); `Turma` estendida com `vitaminas?`
- `db.ts`: `saveChecklist` atualizado com nova fórmula de pontuação (vitamina vale 0/1/2 em vez de 0/1) + branch legacy `else if (sem.vitaminas)` para compat retroativa; preserva `sorteioVitaminas` ao salvar (merge em vez de clobber)
- `db.ts`: `sortearVitaminas` recalcula `pontuacaoTotal` com a mesma fórmula canônica
- `Desempenho.tsx`: categoria VITAMINA soma 0/1/2 pts com branch legacy; máx por categoria VITAMINA agora 28 pts (era 14)
- `Acompanhamento.tsx`: checkbox "Vitaminas Feitas" (boolean) substituído pelo card "Vitaminas Sorteadas" com checks individuais
- `architecture.md`: modelo de dados atualizado (Vitamina, SorteioVitaminas, VitaminaSorteio); pontuação máxima 70 pts (era 56); ADR-004 adicionado
- Pontuação máxima por semana: 5 pts (era 4); pontuação máxima por casal: 70 pts (era 56)

### Deprecated

- `SemanaCheck.vitaminas: boolean` — campo deprecated (mantido para compat retroativa com semanas gravadas antes do Sprint 4). Remoção prevista para Sprint 6+.

### Security

- Sem alteração nas regras do Firestore — embedding em `turmas.vitaminas` e `casais.semanas.sorteioVitaminas` é coberto pelas regras existentes de `turmas/{id}` e `casais/{id}`

---

## [Sprint 3] - 2026-06-17

### Added

- Ordenação de turmas por data de criação (mais recentes primeiro) via `orderBy('createdAt', 'desc')` (HU-21)
- Nova identidade visual: componente `Logo.tsx` com duas alianças douradas + texto "Casados Para Sempre" (HU-20)
  - Logo exibido no header (Layout) e na tela de Login
  - **Nota:** A paleta 2=1 Brasil foi aplicada e posteriormente revertida para a paleta original (indigo/roxo `#6366f1`) por decisão do usuário. Apenas o logotipo permaneceu da identidade visual nova.
- Upload de foto para cada casal no Firebase Storage com redimensionamento 400×400 via Canvas (HU-22)
  - Serviço `storage.ts` com upload, delete e validação de 5MB
  - Componente `AvatarCasado.tsx` com foto ou placeholder gradiente com iniciais
  - Preview antes do upload, suporte a câmera mobile
- Exibição de fotos dos casais no ranking com lazy loading e modal ampliado (HU-23)
- Script de migração `migrateCreatedAt.ts` para adicionar campo `createdAt` em turmas existentes
- Arquivo `migrate.html` para execução facilitada da migração via navegador

### Changed

- `db.ts`: Método `getTurmas` agora usa `orderBy('createdAt', 'desc')`; `createTurma` salva `createdAt`
- `db.ts`: Interface `Casal` ganhou campo `fotoUrl?`; `createCasal` agora retorna `id`
- `firebase.ts`: Adicionado `getStorage` e export `storage`
- `index.css`: Variáveis CSS mantidas na paleta original (indigo/roxo). A paleta 2=1 Brasil foi aplicada e revertida por decisão do usuário.
- `Layout.tsx`: Header agora exibe o logotipo `Logo.tsx`
- `Login.tsx`: Tela de login agora exibe o logotipo
- `Home.tsx`: Ordenação de turmas refletida automaticamente via Firestore
- `TurmaDetail.tsx`: Adicionado upload de foto na criação e edição de casais; avatar nos cards
- `Desempenho.tsx`: Ranking exibe fotos dos casais com lazy loading e modal ampliado
- `index.html`: `theme-color` mantido `#ffffff` (paleta 2=1 Brasil revertida)
- `manifest.json`: Cores mantidas como `#ffffff` (paleta 2=1 Brasil revertida)

### Security

- Firebase Storage configurado com regras de produção (apenas autenticados, máx 5MB, apenas imagens)

---

## [Sprint 2] - 2026-06-17

### Added

- Modal de edição de casais com campos preenchidos (nome dele, nome dela, tipo) e validação rígida de limites (HU-08)
- Modal de exclusão de casal com confirmação por digitação "Excluir" e alerta se Líder/Co-Líder (HU-09)
- Funcionalidade de Concluir/Reabrir turma com seção separada "Turmas Concluídas" na Home (HU-10)
- Seção "Turmas Concluídas" na Home com visual diferenciado (opacidade reduzida + grayscale)
- Arquivo `.env.example` com valores placeholder para configuração do Firebase (HU-03)

### Changed

- `db.ts`: Adicionado métodos `updateCasal`, `deleteCasal`, `toggleTurmaConcluida`
- `TurmaDetail.tsx`: Adicionado modais de editar casal, excluir casal, concluir/reabrir turma
- `Home.tsx`: Turmas separadas em "Ativas" e "Concluídas"
- `index.css`: Adicionadas variáveis `--warning` e `--warning-bg`
- README.md: Adicionada seção de configuração de ambiente com regras Firestore em modo production

### Fixed

- Validação de limites de tipo de casal alterada para Opção B (rígida) conforme decisão do usuário
- Modal de concluir turma alterado para Opção B (botões Cancelar/Confirmar sem digitação) conforme decisão do usuário
- `ErrorBoundary.tsx`: Import type corrigido para compatibilidade com `verbatimModuleSyntax`

### Security

- Credenciais Firebase removidas do código fonte — agora lidas exclusivamente de variáveis de ambiente via `import.meta.env.VITE_*` (HU-03)
- `.env.example` criado para documentar variáveis necessárias sem expor valores reais

---

## [Sprint 1] - 2026-06-17

### Fixed

- Fluxo de logout agora chama `auth.logout()` corretamente via `useAuth().logout()` em vez de `signOut` direto (HU-01)
- `saveChecklist` usa `runTransaction` para evitar race condition quando dois lideres salvam ao mesmo tempo (HU-04)
- Catch sem variavel nao utilizada em `Acompanhamento.tsx` — `catch (e)` removido em favor de `catch` sem binding (HU-07)

### Added

- Error Boundary com tela de fallback para erros nao tratados (HU-02)
  - Componente `ErrorBoundary.tsx` (class component) envolvendo a camada protegida
  - UI de fallback com icone, mensagem e botao "Tentar Novamente"
  - CSS dedicado em `styles/error-boundary.css`

### Changed

- `isFirebaseConfigured` agora verifica env vars dinamicamente em vez de hardcoded (HU-07)
  - Antes: valor booleano estatico no codigo
  - Depois: `!!(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID)`
  - Impacto: `ProtectedRoute` e `Login` verificam a config em tempo real

### Removed

- `mockDb.ts` — codigo morto removido (HU-07)
  - O app agora depende exclusivamente do Firebase Firestore via `db.ts`
  - Todas as operacoes fazem early return se `db === null`

---

## [Sprint 0] - 2026-06-15

### Added

- Setup inicial do projeto (Vite + React 19 + TypeScript)
- Autenticacao Firebase com email sintetico (`{username}@cps.app`)
- Gestao de turmas (criar, listar, editar nome, excluir)
- Gestao de casais por turma (criar com tipo LIDER/CO-LIDER/ALUNO)
- Acompanhamento semanal (checklist de 4 campos por casal/semana)
- Ranking por categorias (Geral, Presenca, Vitamina, Tarefas)
- Alarme do Aviao (manual, aleatorio, 30min + sintetizador Web Audio)
- Tela de ajustes (som, frequencia, logout)
- Design system com glassmorphism dark theme (CSS variables)
- PWA manifest basico
- Layout com header e bottom nav
- Protecao de rotas (ProtectedRoute)
- Seed de dados iniciais para teste