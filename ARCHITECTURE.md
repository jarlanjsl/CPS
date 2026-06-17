# ARCHITECTURE.md

> Este arquivo e um resumo executivo da arquitetura do projeto.
> Documentacao completa: [docs/architecture.md](docs/architecture.md)

## Padrao Arquitetural

**SPA Monolitica + Thin Client + BaaS (Firebase)**

```
Browser (React 19 SPA)
  ├── Firebase SDK (client-side)
  │     ├── Auth (email/password)
  │     └── Firestore (NoSQL)
  └── Sem servidor proprio
```

## Estrutura de Camadas

```
Pages (UI) → Contexts (Auth, Sound) → Services (dbService, firebase) → Firebase Cloud
```

## Decisoes Chave

| Decisao | Escolha | Alternativa descartada |
|---|---|---|
| Backend | Firebase BaaS | API REST propria |
| Persistencia | Firestore (NoSQL) | PostgreSQL + Prisma |
| Estado global | React Context | Zustand/Redux |
| Estilizacao | CSS Variables (glassmorphism) | Tailwind CSS |
| Semanas no casal | Embedding (Record) | Subcollection |

## Protecao de Rotas

```
AuthProvider → SoundProvider → BrowserRouter
  ├── /login (publico)
  └── ProtectedRoute → ErrorBoundary → Layout (privado)
```

## Modelo de Dados

- `turmas/` — { nome, dataInicio, concluida, datasSemanas? }
- `casais/` — { turmaId, tipo, nomeEle, nomeEla, pontuacaoTotal, semanas: Record<string, SemanaCheck> }

## Regras de Negocio

- Max 1 LIDER, 1 CO-LIDER, 5 ALUNO por turma
- Apenas ALUNO pontua no ranking
- 4 pts/semana/casal × 14 semanas = 56 pts max
- saveChecklist usa `runTransaction` (atomico)