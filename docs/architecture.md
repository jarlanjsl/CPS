# Arquitetura — CPS (Casados Para Sempre)

> Versao: Sprint 1 | Ultima atualizacao: 17/06/2026

---

## 1. Visao Geral

O CPS adota a arquitetura **SPA Monolitica + Thin Client + BaaS (Backend as a Service)**:

- **Frontend**: React 19 SPA que roda inteiramente no browser
- **Backend**: Firebase (Auth + Firestore) — zero codigo de servidor
- **Comunicacao**: SDK Firebase diretamente no cliente (thin client pattern)
- **Persistencia**: Firestore NoSQL (collections `turmas` e `casais`)

### Diagrama de Fluxo de Dados

```
+-------------------+       +------------------+       +-------------------+
|    Browser (SPA)  |       |  Firebase SDK    |       |   Firebase Cloud  |
|                   |       |  (client-side)  |       |                   |
|  React 19         |------>|                  |------>|  Auth (email/pwd) |
|  TypeScript       |       |  firebase.ts    |       |                   |
|  React Router v7  |<------|  db.ts          |<------|  Firestore        |
|                   |       |                  |       |   - turmas/       |
|  AuthContext       |       +------------------+       |   - casais/       |
|  SoundContext       |                                   +-------------------+
|  dbService          |
+-------------------+
        |
        v
  +-------------+
  |  UI (JSX)    |
  |  Pages:      |
  |  Home, Login,|
  |  TurmaDetail,|
  |  Acomp, Desem|
  |  Ajustes     |
  +-------------+
```

**Fluxo tipico (save checklist):**

```
Usuario marca checkbox
  -> Acompanhamento.tsx atualiza state local
  -> Clica "Salvar"
  -> dbService.saveChecklist(casalId, semanaId, checklist)
  -> runTransaction(Firestore)
      -> Le casal atual
      -> Atualiza semanas[semanaId]
      -> Recalcula pontuacaoTotal
      -> Commit atomico
  -> navigate('/turma/:id')
```

---

## 2. Estrutura de Rotas e Protecao

```
AuthProvider
  └── SoundProvider
       └── BrowserRouter
            ├── /login → Login (sem protecao)
            └── ProtectedRoute (auth guard + Firebase config check)
                 └── ErrorBoundary (captura erros nao tratados)
                      └── Layout (header + bottom nav + Outlet)
                           ├── / → Home
                           ├── /desempenho → Desempenho
                           ├── /ajustes → Ajustes
                           ├── /turma/:id → TurmaDetail
                           └── /turma/:id/semana/:semanaId → Acompanhamento
```

### Camadas de Protecao

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| **Firebase Config Check** | `ProtectedRoute.tsx` | Se `isFirebaseConfigured === false`, exibe tela de acao (configurar `.env`) |
| **Auth Guard** | `ProtectedRoute.tsx` | Se `currentUser === null`, redireciona para `/login` |
| **Error Boundary** | `ErrorBoundary.tsx` | Captura erros nao tratados na arvore abaixo, exibe UI de fallback com botao "Tentar Novamente" |
| **Login** | `Login.tsx` | Pagina publica, verifica `isFirebaseConfigured` antes de tentar auth |

> **Nota**: `/login` e a unica rota publica. Todas as demais passam por `ProtectedRoute` + `ErrorBoundary`.

---

## 3. Contextos React

### AuthContext (`contexts/AuthContext.tsx`)

```
AuthProvider
  ├── currentUser: User | null   (Firebase Auth user)
  ├── loading: boolean           (true enquanto onAuthStateChanged resolve)
  ├── logout: () => Promise<void> (signOut do Firebase)
  └── firebaseConfigured: boolean (delegado de isFirebaseConfigured)
```

- Escuta `onAuthStateChanged` do Firebase Auth
- `loading` impede renderizacao ate que o estado de auth seja determinado
- `logout` chama `signOut(auth)` e nao faz navigate (o navigate e responsabilidade do componente)

### SoundContext (`contexts/SoundContext.tsx`)

```
SoundProvider
  ├── playAirplaneSound: () => void
  ├── isSoundEnabled: boolean      (toggle on/off)
  ├── toggleSoundEnabled: () => void
  ├── soundFrequency: 'MANUAL' | 'RANDOM' | '30MIN'
  └── setSoundFrequency: (freq) => void
```

- Tenta carregar `/aviao.m4a` do `public/`
- Se o arquivo de audio nao existir, usa **sintetizador Web Audio API** como fallback (oscillator sawtooth com pitch descendente)
- Agendamento automatico: `RANDOM` (5-10 min) ou `30MIN` (30 min)
- O scheduler limpa o timeout no unmount ou quando `isSoundEnabled` muda para false

---

## 4. Camada de Servicos

### firebase.ts — Inicializacao

```typescript
// Verificacao dinamica: checa env vars em tempo real
export const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

// Inicializacao condicional: se nao configurado, app = null, auth = null, db = null
export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
```

- Todos os exports podem ser `null` — os consumidores (`dbService`, `AuthContext`, `Login`) fazem early return se `!db` ou `!auth`

### db.ts — Facade Firestore

O `dbService` e um objeto com metodos que encapsulam toda a comunicacao com o Firestore:

| Metodo | Operacao | Descricao |
|---|---|---|
| `getTurmas()` | READ | Lista todas as turmas |
| `createTurma(nome, dataInicio)` | CREATE | Cria turma com `concluida: false` |
| `updateTurma(id, nome, dataInicio?)` | UPDATE | Atualiza nome e/ou data |
| `deleteTurma(id)` | DELETE | Remove turma |
| `updateSemanaData(turmaId, semana, data?)` | UPDATE | Atualiza data customizada da semana |
| `getCasais(turmaId?)` | READ | Lista casais (filtrado por turma ou todos) |
| `createCasal(turmaId, nomeEle, nomeEla, tipo)` | CREATE | Cria casal com **validacao de limite** |
| `saveChecklist(casalId, semanaId, checklist)` | TRANSACTION | Salva checklist + recalcula pontuacao atomicamente |
| `seedInitialData()` | CREATE | Popula dados iniciais para teste |

**Validacao de limites** (em `createCasal`):
- Antes de criar, consulta casais existentes da turma
- Rejeita se limite excedido: 1 LIDER, 1 CO-LIDER, 5 ALUNO

**Transacao** (em `saveChecklist`):
- Usa `runTransaction` para evitar race condition
- Le o casal atual, atualiza `semanas[semanaId]`, recalcula `pontuacaoTotal` somando todos os checks de todas as semanas
- Commit atomico: se dois lideres salvarem ao mesmo tempo, o Firestore retry automaticamente

---

## 5. Modelo de Dados

### Diagrama ER (texto)

```
+------------------+          +------------------+
|     turmas       |          |     casais       |
+------------------+          +------------------+
| id: string (PK)  |<---------| id: string (PK)  |
| nome: string     |          | turmaId: string  |
| dataInicio: str  |          | tipo: enum        |
| concluida: bool  |          | nomeEle: string   |
| datasSemanas?:   |          | nomeEla: string   |
|   Record<number, |          | pontuacaoTotal: n |
|   string>        |          | semanas?:         |
+------------------+          |   Record<string,  |
                              |   SemanaCheck>    |
                              +------------------+
                                       |
                                       v
                              +------------------+
                              |   SemanaCheck    |
                              +------------------+
                              | presenca: bool   |
                              | vitaminas: bool   |
                              | tarefas: bool     |
                              | tarefasExtras:bool|
                              +------------------+
```

### Collection `turmas`

| Campo | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `id` | string | Auto (Firestore) | Document ID |
| `nome` | string | Sim | Nome da turma (ex: "Turma Primavera 2026") |
| `dataInicio` | string (ISO) | Sim | Data de inicio da turma |
| `concluida` | boolean | Sim | Se a turma esta finalizada (default: `false`) |
| `datasSemanas` | Record\<number, string\> | Nao | Datas customizadas por numero de semana |

### Collection `casais`

| Campo | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `id` | string | Auto (Firestore) | Document ID |
| `turmaId` | string | Sim | FK para turma (denormalizado) |
| `tipo` | 'LIDER' \| 'CO-LIDER' \| 'ALUNO' | Sim | Papel do casal na turma |
| `nomeEle` | string | Sim | Nome do marido |
| `nomeEla` | string | Sim | Nome da esposa |
| `pontuacaoTotal` | number | Sim | Soma de todos os checks (recalculado via transaction) |
| `semanas` | Record\<string, SemanaCheck\> | Sim (default `{}`) | Map semanaId (ex: "1", "2") -> SemanaCheck |

### Interface `SemanaCheck` (subdocumento embutido)

| Campo | Tipo | Descricao |
|---|---|---|
| `presenca` | boolean | Casal presente na reuniao |
| `vitaminas` | boolean | Vitaminas feitas |
| `tarefas` | boolean | Tarefas base cumpridas |
| `tarefasExtras` | boolean | Tarefa extra cumprida (+1pt) |

### Decisoes de Modelagem

1. **Denormalizacao**: `casais.turmaId` e uma referencia manual, sem FK constraint do Firestore. Isso e intencional — o Firestore nao suporta JOINs, e o app sempre consulta casais por turmaId via `where("turmaId", "==", id)`.

2. **Embedding vs Subcollection**: `semanas` e um mapa embutido no documento do casal, nao uma subcollection. Motivo:
   - Sempre lemos/escrevemos todas as semanas de um casal junto
   - A transacao precisa ler/escrever semanas + pontuacaoTotal atomicamente
   - 14 semanas * 4 campos = dados pequenos, bem dentro do limite de 1MB/doc do Firestore

3. **Pontuacao denormalizada**: `pontuacaoTotal` e recalculado a cada save em vez de calculado on-the-fly. Motivo: evita N+1 queries no ranking (basta ordenar por pontuacaoTotal).

---

## 6. Regras de Negocio

### Limites de Membros

| Tipo | Limite por Turma | Impacto no Ranking |
|---|---|---|
| LIDER | 1 | Nao pontua |
| CO-LIDER | 1 | Nao pontua |
| ALUNO | 5 | Pontua |

### Sistema de Pontuacao

- Cada checkbox = **1 ponto**
- 4 checkboxes por semana: `presenca`, `vitaminas`, `tarefas`, `tarefasExtras`
- Maximo: **4 pontos/semana/casal**
- Total de semanas: **14 semanas** por turma
- Pontuacao maxima possivel: **56 pontos** por casal (aluno)

### Calculo no Ranking (Desempenho.tsx)

| Categoria | Logica |
|---|---|
| Geral | Soma todos os checks = `pontuacaoTotal` |
| Presenca | Conta `presenca === true` em todas as semanas |
| Vitamina | Conta `vitaminas === true` em todas as semanas |
| Tarefas | Conta `tarefas === true` + `tarefasExtras === true` em todas as semanas |

> **Nota**: Na categoria "Tarefas", `tarefasExtras` conta como ponto extra, totalizando max 2 pontos/semana nesse quesito.

### Exclusao de Lideres

- O ranking (Desempenho.tsx) filtra `tipo === 'ALUNO'` — lideres e co-lideres **nunca** aparecem no ranking
- Lideres e co-lideres ainda recebem checklist salvo (para registro), mas nao competem

---

## 7. Seguranca

### Autenticacao

- **Firebase Auth** com email/senha
- Email sintetico: login `lider` → `lider@cps.app` (formato interno, nao e email real)
- Nao ha fluxo de cadastro no app — usuarios sao criados manualmente no console Firebase
- Sessao gerenciada pelo Firebase SDK (`onAuthStateChanged`)

### Verificacao Dinamica de Config

```typescript
// firebase.ts — verifica env vars em tempo real
export const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);
```

- Se as variaveis nao estao configuradas, o app **nao inicializa o Firebase** (`app = null`, `auth = null`, `db = null`)
- `ProtectedRoute` exibe tela de acao em vez de crashar
- `dbService` faz early return (`if (!db) return []`) em todas as operacoes

### Limitacoes Atuais

- **Firestore Rules**: Em modo de teste (aberto para leitura/escrita). Regras de seguranca proprias precisam ser implementadas antes de producao.
- **Nao ha RBAC**: Qualquer usuario autenticado pode acessar todas as turmas e casais. Nao ha distincao de papeis no app.
- **Variaveis de ambiente**: As credenciais Firebase ficam no `.env` do cliente (visiveis no bundle). E o modelo padrao de apps Firebase BaaS, mas requer Firestore Rules para proteger os dados.

---

## 8. Limitacoes Conhecidas

### Last-Write-Wins em saveChecklist

O metodo `saveChecklist` salva a **semana inteira** (o mapa completo de `SemanaCheck`) para um casal. Se dois lideres abrirem a mesma semana do mesmo casal simultaneamente e salvarem:

1. Lider A salva com `{ presenca: true, vitaminas: false, tarefas: true, tarefasExtras: false }`
2. Lider B (que abriu antes do save de A) salva com `{ presenca: true, vitaminas: true, tarefas: false, tarefasExtras: false }`

A transacao resolve isso parcialmente:
- O Firestore retry automaticamente se o documento mudou entre a leitura e o commit
- Mas o **conteudo** do segundo save sobrescreve o primeiro (last-write-wins)

**Mitigacao futura**: Dividir o save por campo individual ou implementar merge semantico (OR logico entre os checks).

### Notificacoes Push

O toggle de "Alertas Push" em Ajustes.tsx e apenas visual (UI placeholder). Nao ha integracao com Firebase Cloud Messaging.

### PWA sem Service Worker

O manifest.json permite "adicionar a tela inicial", mas sem Service Worker o app nao funciona offline.

---

## 9. Decisoes Arquiteturais (ADRs)

### ADR-001: Firebase BaaS sobre API propria

**Contexto**: O app precisa de autenticacao e persistencia de dados.

**Decisao**: Usar Firebase (Auth + Firestore) diretamente no cliente.

**Consequencias**:
- (+) Zero codigo de servidor, deploy simplificado
- (+) Realtime updates nativos (nao utilizados ainda, mas disponiveis)
- (+) SDK maduro com suporte a transacoes
- (-) Firestore Rules como unica camada de seguranca no servidor
- (-) Vendor lock-in com Google
- (-) Limitacoes de query do Firestore (nao suporta JOINs, OR compostos)

### ADR-002: Embedding de semanas no documento do casal

**Contexto**: Cada casal tem 14 semanas de checklist.

**Decisao**: Usar `Record<string, SemanaCheck>` embutido no documento do casal em vez de subcollection.

**Consequencias**:
- (+) Leitura unica do documento para renderizar o checklist
- (+) Transacao atomica para salvar checklist + recalcula pontuacao
- (-) Tamanho do documento cresce com o numero de semanas (14 * ~50 bytes = ~700 bytes, bem dentro do limite)
- (-) Nao e escalavel se o modelo mudar para "turmas com centenas de semanas"

### ADR-003: Email sintetico para autenticacao

**Contexto**: Usuarios do programa nao tem email real.

**Decisao**: Usar formato `{username}@cps.app` como email fantasma no Firebase Auth.

**Consequencias**:
- (+) Simplicidade — o usuario so digita o username
- (-) Emails nao sao verificaveis (password reset nao funciona)
- (-) Nao escala para outros provedores de auth (Google, Facebook)