# Changelog

Todas as mudancas notaveis neste projeto serao documentadas neste arquivo.

O formato e baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/lang/pt-BR/).

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