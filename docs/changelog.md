# Changelog

Todas as mudancas notaveis neste projeto serao documentadas neste arquivo.

O formato e baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/lang/pt-BR/).

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