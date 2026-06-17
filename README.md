# CPS - Casados Para Sempre

Sistema de gestão e acompanhamento para turmas do programa **Casados Para Sempre**, um curso de fortalecimento matrimonial. O app permite lideres acompanharem semanalmente a presença, vitaminas e tarefas de cada casal, com ranking em tempo real.

---

## Stack Tecnológica

| Tecnologia | Versao | Uso |
|---|---|---|
| React | 19.2.4 | UI (SPA monolitica) |
| TypeScript | 5.9.3 | Tipagem estatica |
| Vite | 8.0.1 | Bundler e dev server |
| Firebase | 12.11.0 | Auth + Firestore (BaaS) |
| React Router DOM | 7.14.0 | Roteamento SPA |
| Lucide React | 1.7.0 | Icones SVG |
| ESLint | 9.39.4 | Lint (flat config) |
| typescript-eslint | 8.57.0 | Regras TS para ESLint |

**Design System:**
- CSS com variaveis CSS customizadas (glassmorphism dark theme)
- Outfit (Google Fonts) como fonte principal
- Mobile-first, max-width 320px+ (viewport lock)

---

## Funcionalidades Implementadas

- **Autenticacao Firebase**: Login via email/senha com email sintetico (`{username}@cps.app`)
- **Gestao de Turmas**: Criar, editar e excluir turmas com data de inicio
- **Gestao de Membros**: Adicionar casais (Lider, Co-Lider, Aluno) com limite por tipo
- **Acompanhamento Semanal**: Checklist de presenca, vitaminas, tarefas e tarefa extra por casal/semana
- **Ranking e Desempenho**: Pontuacao geral e por categorias (Presenca, Vitaminas, Tarefas), filtrando alunos
- **Alarme do Aviao**: Som de alerta com 3 modos (manual, aleatorio, 30min) e sintetizador Web Audio como fallback
- **Error Boundary**: Tela de fallback para erros nao tratados na camada protegida
- **PWA**: Manifest e theme-color para instalacao como app nativo
- **Protecao de Rotas**: Auth guard + verificacao dinamica de Firebase config

---

## Estrutura do Projeto

```
src/
├── App.tsx                 # Composition root (roteamento + providers + ErrorBoundary)
├── main.tsx                # Entry point (StrictMode + createRoot)
├── index.css               # Design system global (CSS variables, glassmorphism, Outfit)
├── vite-env.d.ts           # Tipos Vite (import.meta.env)
│
├── components/
│   ├── Layout.tsx           # Shell (header + bottom nav + Outlet)
│   ├── ProtectedRoute.tsx   # Auth guard + Firebase config check
│   └── ErrorBoundary.tsx   # Error boundary com UI de fallback
│
├── contexts/
│   ├── AuthContext.tsx      # Firebase Auth (login, logout, currentUser, loading)
│   └── SoundContext.tsx     # Alarme do aviao (manual/random/30min + Web Audio fallback)
│
├── pages/
│   ├── Login.tsx            # Firebase email/password auth (email sintetico)
│   ├── Home.tsx             # Lista de turmas + criar modal + seed
│   ├── TurmaDetail.tsx      # Detalhe da turma (membros, semanas, editar, excluir)
│   ├── Acompanhamento.tsx   # Checklist semanal por casal (4 checkboxes)
│   ├── Desempenho.tsx       # Ranking por categorias (apenas ALUNO pontuam)
│   └── Ajustes.tsx          # Config: alarme, notificacoes, logout
│
├── services/
│   ├── firebase.ts          # Firebase init + isFirebaseConfigured dinamico
│   └── db.ts                # Firestore CRUD (Turmas, Casais, Checklists com runTransaction)
│
└── styles/
    ├── error-boundary.css
    ├── home.css
    ├── layout.css
    └── login.css
```

---

## Configuracao

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

Copie `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

**`.env.example`:**

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Passos no console Firebase:
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto Web
3. Em **Configuracoes do Projeto**, copie as credenciais para o `.env`
4. Ative a autenticacao por **Email/Senha** no menu Authentication
5. Crie usuarios manualmente no Firebase Auth (email formato: `{username}@cps.app`)
6. Configure as regras de seguranca do Firestore. Para producao, utilize o modo restrito:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

   > **Importante**: Nao use regras em modo teste (`allow read, write: if true`) em producao. O modo restrito acima exige autenticacao para qualquer acesso.

> **Nota**: O app verifica dinamicamente se `VITE_FIREBASE_API_KEY` e `VITE_FIREBASE_PROJECT_ID` estao preenchidos. Se ausentes, exibe tela de aviso em vez de crashar.

### 3. Rodar

```bash
npm run dev
```

O servidor inicia em `http://localhost:5173`

---

## Scripts Disponiveis

| Comando | Descricao |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento (Vite) |
| `npm run build` | Compila TypeScript + build de producao (Vite) |
| `npm run lint` | Executa ESLint com flat config |
| `npm run preview` | Preview local da build de producao |

---

## Arquitetura

**Padrao**: SPA Monolitica + Thin Client + BaaS (Firebase)

- **Frontend**: React 19 SPA com roteamento client-side (React Router DOM v7)
- **Backend**: Firebase (Auth + Firestore) — zero codigo de servidor
- **Comunicacao**: SDK Firebase diretamente no cliente (thin client)
- **Persistencia**: Firestore NoSQL (collections `turmas` e `casais`)
- **Seguranca**: Auth guard (ProtectedRoute) + verificacao dinamica de config

> Documentacao completa em [docs/architecture.md](docs/architecture.md)

---

## Regras de Negocio

### Limites de casais por turma

| Tipo | Limite | Pontua no ranking? |
|---|---|---|
| LIDER | 1 | Nao |
| CO-LIDER | 1 | Nao |
| ALUNO | 5 | Sim |

### Pontuacao

- Cada checkbox marcado = **1 ponto**
- 4 checkboxes por semana por casal: presenca, vitaminas, tarefas, tarefasExtras
- Maximo: **4 pontos/semana/casal**
- 14 semanas por turma = **56 pontos possiveis** por casal (aluno)
- `pontuacaoTotal` e recalculado atomicamente via `runTransaction` a cada save

### Autenticacao

- Email sintetico: `{username}@cps.app` (ex: login `lider` vira `lider@cps.app`)
- Apenas autenticacao email/senha (Firebase Auth)
- Nao ha fluxo de cadastro no app — usuarios devem ser criados no console Firebase

---

## Modelo de Dados

### Collection `turmas`

```typescript
interface Turma {
  id: string;              // Firestore document ID
  nome: string;            // Ex: "Turma Primavera 2026"
  dataInicio: string;      // ISO 8601 (ex: "2026-06-17T12:00:00Z")
  concluida: boolean;      // Status da turma
  datasSemanas?: Record<number, string>;  // Datas customizadas por semana (opcional)
}
```

### Collection `casais`

```typescript
interface Casal {
  id: string;              // Firestore document ID
  turmaId: string;         // FK para turma (denormalizado)
  tipo: 'LIDER' | 'CO-LIDER' | 'ALUNO';
  nomeEle: string;         // Nome do marido
  nomeEla: string;         // Nome da esposa
  pontuacaoTotal: number;  // Soma de todos os checks (recalculado via transaction)
  semanas?: Record<string, SemanaCheck>;  // Map semanaId -> SemanaCheck
}

interface SemanaCheck {
  presenca: boolean;
  vitaminas: boolean;
  tarefas: boolean;
  tarefasExtras: boolean;
}
```

### Relacionamentos

- `casais.turmaId` -> `turmas.id` (N:1, denormalizado, sem FK constraint no Firestore)
- `casais.semanas` e um mapa embutido (subdocumento), nao uma collection separada

---

## PWA

O app inclui configuracao basica de PWA:
- `public/manifest.json` — nome, start_url, display standalone, icones
- `index.html` — meta theme-color, link para manifest, viewport lock
- **Limitacao**: Nao possui Service Worker (nao e offline-first). O manifest permite apenas "adicionar a tela inicial" no mobile.

---

## Como Contribuir

### Branches

- `main` — branch estavel (producao)
- `feature/HU-XX-descricao` — novas funcionalidades
- `fix/HU-XX-descricao` — correcoes

### Padroes de Commit

Formato: `tipo(HU-XX): descricao curta`

Tipos:
- `feat`: Nova funcionalidade
- `fix`: Correcao de bug
- `refactor`: Refatoracao sem mudanca de comportamento
- `docs`: Documentacao
- `chore`: Tarefas de manutencao (deps, config)

Exemplos:
```
feat(HU-03): adiciona ranking por categoria no Desempenho
fix(HU-01): fluxo de logout chama auth.logout() corretamente
refactor(HU-07): remove mockDb.ts (codigo morto)
```

### Padroes de Codigo

- TypeScript strict (via tsconfig)
- ESLint flat config com react-hooks + react-refresh
- Componentes funcionais com hooks (sem class components, exceto ErrorBoundary)
- CSS com variaveis CSS (nao CSS-in-JS)
- Servicos isolados em `services/` (dbService como facade para Firestore)

---

## Licenca

Projeto privado — Uso interno.