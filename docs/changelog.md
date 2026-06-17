# Changelog

Todas as mudancas notaveis neste projeto serao documentadas neste arquivo.

O formato e baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/lang/pt-BR/).

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