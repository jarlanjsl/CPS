# Plano de Testes — Sprint 1 (Estabilização)

> **Projeto**: CPS — Casados Para Sempre  
> **Data**: 17/06/2026  
> **QA**: Engenheiro QA  
> **Ambiente de teste**: Browser (Chrome/Edge) — `npm run dev`  
> **Branch base**: `sprint/1-estabilizacao`

---

## Sumário

1. [Instruções Gerais](#1-instruções-gerais)
2. [HU-01: Corrigir fluxo de logout](#2-hu-01-corrigir-fluxo-de-logout)
3. [HU-02: Adicionar Error Boundaries](#3-hu-02-adicionar-error-boundaries)
4. [HU-04: Transações Firestore no saveChecklist](#4-hu-04-transações-firestore-no-savechecklist)
5. [HU-07: Remover código morto e inconsistente](#5-hu-07-remover-código-morto-e-inconsistente)
6. [Teste de Regressão Cruzada](#6-teste-de-regressão-cruzada)
7. [Setup Futuro — Vitest + RTL](#7-setup-futuro--vitest--rtl)
8. [Resumo Final](#8-resumo-final)

---

## 1. Instruções Gerais

### Pré-requisitos

- [ ] Node.js instalado (v18+)
- [ ] Dependências atualizadas: `npm install`
- [ ] Arquivo `.env` com credenciais Firebase válidas configuradas
- [ ] App rodando: `npm run dev` → acessível em `http://localhost:5173`
- [ ] DevTools do browser aberto (F12) com aba **Console** visível
- [ ] aba **Network** disponível para inspecionar chamadas Firebase

### Convenções do Checklist

| Símbolo | Significado |
|---------|-------------|
| ✅ | Passou |
| ❌ | Falhou |
| ⚠️ | Parcial / Observação |

Cada item do checklist segue o formato:

> **Passo N** — Ação a realizar  
> **Verificar**: O que observar  
> **Resultado esperado**: Comportamento correto  
> **Se falhar**: O que isso indica

---

## 2. HU-01: Corrigir fluxo de logout

**Arquivo alterado**: `src/pages/Ajustes.tsx`  
**Arquivo dependente**: `src/contexts/AuthContext.tsx`, `src/components/ProtectedRoute.tsx`

### Critério de Aceite 1: `logout()` do AuthContext é chamado

> **Passo 1** — Fazer login no sistema  
> **Verificar**: Página Home carrega com navegação inferior  
> **Resultado esperado**: Usuário autenticado, tela principal visível  
> **Se falhar**: Problema no Firebase Auth ou credenciais — verificar `.env`

> **Passo 2** — Navegar até Ajustes (ícone ⚙️ na barra inferior)  
> **Verificar**: Página de Ajustes carrega com seções "Alarme do Avião", "Notificações" e botão "Sair da Conta"  
> **Resultado esperado**: Botão "Sair da Conta" visível com ícone LogOut e cor vermelha  
> **Se falhar**: Rota `/ajustes` inacessível — verificar App.tsx

> **Passo 3** — Abrir DevTools → aba Console  
> **Verificar**: Console limpo, sem erros  
> **Resultado esperado**: Nenhum erro no console antes de clicar em logout

> **Passo 4** — Clicar no botão "Sair da Conta"  
> **Verificar**: (a) Console exibe chamada ao `signOut()` do Firebase; (b) redirecionamento ocorre  
> **Resultado esperado**: `signOut(auth)` é executado (verificar ausência de erro no console); redirecionamento para `/login`  
> **Se falhar**: Se não houver chamada ao `signOut`, o `logout()` não foi chamado — regressão na HU-01

### Critério de Aceite 2: `currentUser = null` após logout

> **Passo 5** — Após o redirecionamento para `/login`, abrir DevTools → Console  
> **Verificar**: Digitar no console: `document.querySelector('[data-testid]')` ou inspecionar React DevTools  
> **Resultado esperado**: AuthContext `currentUser` deve ser `null`  
> **Dica**: Instalar React DevTools para inspecionar o contexto diretamente

> **Passo 6 (alternativo)** — Verificar via Firebase Auth  
> **Verificar**: No Console do DevTools, executar:  
> ```js
> // Se Firebase Auth estiver acessível globalmente:
> // Não é direto, mas dá para checar se não há mais auth state:
> // Observar que a aba Application → Cookies → Session cookies foram limpos
> ```
> **Resultado esperado**: Nenhum token de autenticação ativo no localStorage ou cookies do Firebase

### Critério de Aceite 3: Redirecionamento para `/login`

> **Passo 7** — Após clicar "Sair da Conta", observar a URL do browser  
> **Verificar**: URL muda para `/login`  
> **Resultado esperado**: URL é `http://localhost:5173/login`  
> **Se falhar**: Se URL fica em branco ou em outra rota, `navigate('/login', { replace: true })` não funcionou

> **Passo 8** — Verificar que `replace: true` foi usado  
> **Verificar**: Após logout, clicar no botão "Voltar" do browser  
> **Resultado esperado**: NÃO deve voltar para a página anterior (Home/Ajustes), deve permanecer em `/login` ou ir para a página anterior ao login no histórico do browser  
> **Se falhar**: Se ao clicar "Voltar" a página retorna para Home/Ajustes, o `replace: true` não foi aplicado — **BUG CRÍTICO**

### Critério de Aceite 4: Rotas protegidas redirecionam para Login

> **Passo 9** — Sem estar logado, digitar na URL: `http://localhost:5173/`  
> **Verificar**: Redirecionamento automático para `/login`  
> **Resultado esperado**: URL muda para `/login`, página de login visível  
> **Se falhar**: ProtectedRoute não está funcionando — verificar `ProtectedRoute.tsx`

> **Passo 10** — Sem estar logado, digitar na URL: `http://localhost:5173/ajustes`  
> **Verificar**: Redirecionamento automático para `/login`  
> **Resultado esperado**: URL muda para `/login`

> **Passo 11** — Sem estar logado, digitar na URL: `http://localhost:5173/desempenho`  
> **Verificar**: Redirecionamento automático para `/login`  
> **Resultado esperado**: URL muda para `/login`

> **Passo 12** — Sem estar logado, digitar na URL: `http://localhost:5173/turma/abc123`  
> **Verificar**: Redirecionamento automático para `/login`  
> **Resultado esperado**: URL muda para `/login`

### Critério de Aceite 5: Botão "Voltar" não permite acesso pós-logout

> **Passo 13** — Fazer login → navegar até Ajustes → clicar "Sair da Conta"  
> **Verificar**: Estar na tela de login  
> **Resultado esperado**: Página de login renderizada corretamente

> **Passo 14** — Clicar no botão "Voltar" (←) do browser  
> **Verificar**: Página não volta para Home/Ajustes  
> **Resultado esperado**: Permanece em `/login` (por causa do `replace: true`)  
> **Se falhar**: Usuário consegue acessar páginas protegidas após logout — **BUG CRÍTICO**

> **Passo 15** — Clicar "Voltar" múltiplas vezes (3x)  
> **Verificar**: Em nenhum momento a aplicação exibe conteúdo protegido  
> **Resultado esperado**: Permanece na tela de login ou sai do escopo da aplicação (histórico anterior do browser)

### Cenário de Erro — Logout com problema de rede

> **Passo E1** — Habilitar offline no DevTools (aba Network → checkbox "Offline")  
> **Verificar**: App perde conexão com Firebase  
> **Ação**: Clicar em "Sair da Conta"  
> **Resultado esperado**: O `signOut()` pode falhar, mas o `logout()` no AuthContext faz `catch(e)` e loga o erro no console. A navegação para `/login` ainda deve ocorrer (o `await logout()` não lança erro pois tem try/catch interno)  
> **Se falhar**: Se a aplicação crashar ou ficar travada, o tratamento de erro no `logout()` é insuficiente

> **Passo E2** — Com rede restaurada (desmarcar "Offline"), tentar acessar rota protegida  
> **Verificar**: Redireciona para `/login`  
> **Resultado esperado**: Firebase Auth percebe que não há sessão e ProtectedRoute barra o acesso

---

## 3. HU-02: Adicionar Error Boundaries

**Arquivos criados**: `src/components/ErrorBoundary.tsx`, `src/styles/error-boundary.css`  
**Arquivo alterado**: `src/App.tsx`

### Critério de Aceite 1: Error Boundary envolvendo rotas protegidas

> **Passo 1** — Inspecionar `src/App.tsx` no código  
> **Verificar**: `<ErrorBoundary>` envolve `<Layout />` dentro do `<Route element={<ProtectedRoute />}>`  
> **Resultado esperado**: Estrutura: `<ProtectedRoute>` → `<ErrorBoundary><Layout /></ErrorBoundary>` → rotas filhas  
> **Código de referência** (App.tsx linha 25):  
> ```tsx
> <Route element={<ProtectedRoute />}>
>   <Route element={<ErrorBoundary><Layout /></ErrorBoundary>}>
>     ...
>   </Route>
> </Route>
> ```

> **Passo 2** — Verificar que a rota `/login` NÃO está dentro do ErrorBoundary  
> **Verificar**: Login é rota independente, fora de `<ProtectedRoute>` e `<ErrorBoundary>`  
> **Resultado esperado**: Erro na tela de login NÃO é capturado pelo ErrorBoundary (comportamento correto — login é página raiz)

### Critério de Aceite 2: Tela de fallback com mensagem clara

> **Passo 3** — Provocar um erro intencionalmente  
> **Como forçar o erro**: Adicionar temporariamente no início de um componente filho (ex: `src/pages/Home.tsx`) o código:  
> ```tsx
> throw new Error("Erro de teste — ErrorBoundary");
> ```
> Adicionar como primeira linha dentro da função do componente Home, antes do return.  
> **Verificar**: A tela de fallback do ErrorBoundary aparece  
> **Resultado esperado**: Tela com fundo escuro (bg-gradient), card centralizado com:  
> - Ícone amarelo AlertTriangle dentro de um círculo vermelho  
> - Título "Algo deu errado" em texto branco  
> - Descrição "Ocorreu um erro inesperado. Tente recarregar a página." em texto cinza  
> - Detalhe do erro em caixa escura menor: "Erro de teste — ErrorBoundary"  
> - Botão "Tentar Novamente" com fundo `var(--primary)` e texto branco  
> **Se falhar**: Se aparecer tela branca, o ErrorBoundary não capturou o erro — **BUG CRÍTICO**

> **Passo 4** — Verificar que NÃO é uma tela branca (blank screen)  
> **Verificar**: Página renderiza conteúdo visual completo  
> **Resultado esperado**: Card estilizado com glass-effect, tipografia legível, botão clicável  
> **Se falhar**: Qualquer tela branca ou sem estilo indica que o CSS `error-boundary.css` não foi importado corretamente

### Critério de Aceite 3: Botão "Tentar Novamente" recarrega a página

> **Passo 5** — Na tela de fallback, clicar no botão "Tentar Novamente"  
> **Verificar**: A página é recarregada  
> **Resultado esperado**: `window.location.reload()` é executado — a página recarrega completamente  
> **Se falhar**: Se nada acontecer, o `handleReload` não está conectado ao `onClick`

> **Passo 6** — Após recarregar (com o `throw` ainda no código), verificar que a tela de fallback aparece novamente  
> **Verificar**: Ciclo de erro → fallback → reload → erro → fallback é infinito enquanto o erro existir  
> **Resultado esperado**: Comportamento correto — enquanto o erro existir, o fallback aparece

> **Passo 7** — **Restaurar o código**: Remover o `throw new Error(...)` temporário do Home.tsx  
> **Verificar**: Após recarregar, a aplicação volta ao normal  
> **Resultado esperado**: Home renderiza normalmente, sem tela de fallback

### Critério de Aceite 4: Erro logado no console

> **Passo 8** — Provocar erro novamente (adicionar `throw` temporário)  
> **Verificar**: DevTools → aba Console  
> **Resultado esperado**: Console exibe:  
> ```
> [ErrorBoundary] Erro capturado: Error: Erro de teste — ErrorBoundary
> [ErrorBoundary] Component stack:    at Home (http://localhost:5173/src/pages/Home.tsx:...)
> ```  
> **Se falhar**: Se o erro não aparecer no console, `componentDidCatch` não está sendo chamado

> **Passo 9** — **Limpar**: Remover o `throw` temporário e recarregar a página

### Critério de Aceite 5: Error Boundary envolvendo rotas protegidas E Layout

> **Passo 10** — Inspecionar `App.tsx` no código fonte  
> **Verificar**: `<ErrorBoundary>` envolve `<Layout />`, que contém `<Outlet />` (que renderiza as rotas filhas)  
> **Resultado esperado**: Erros em QUALQUER página protegida (Home, Desempenho, Ajustes, TurmaDetail, Acompanhamento) são capturados pelo ErrorBoundary, E erros no próprio Layout (header, bottom-nav) também são capturados  
> **Observação**: O Layout inclui o header com notificações e a barra de navegação inferior. Se qualquer parte do Layout crashar, o ErrorBoundary captura.

### Cenário de Erro — Erro em componente diferente

> **Passo E1** — Adicionar `throw new Error("Teste Ajustes")` dentro de `Ajustes.tsx` (primeira linha da função)  
> **Verificar**: Navegar até `/ajustes`  
> **Resultado esperado**: Tela de fallback aparece — ErrorBoundary captura erros de qualquer rota filha

> **Passo E2** — Adicionar `throw new Error("Teste Layout")` dentro de `Layout.tsx` (primeira linha da função)  
> **Verificar**: Navegar para qualquer rota protegida  
> **Resultado esperado**: Tela de fallback aparece — ErrorBoundary captura erros no Layout também

> **Passo E3** — **Limpar**: Remover todos os `throw` temporários e recarregar a página

### Cenário de Erro — Erro na página de Login (NÃO deve ser capturado)

> **Passo E4** — Adicionar `throw new Error("Teste Login")` dentro de `Login.tsx`  
> **Verificar**: Acessar `/login`  
> **Resultado esperado**: O erro NÃO é capturado pelo ErrorBoundary — a tela pode ficar em branco ou mostrar erro nativo do React, pois Login está FORA do ErrorBoundary. Isso é o comportamento esperado (Login é rota raiz, não protegida).  
> **Se falhar**: Se o ErrorBoundary capturar erro no Login, ele está posicionado no nível errado em App.tsx

> **Passo E5** — **Limpar**: Remover o `throw` do Login.tsx

---

## 4. HU-04: Transações Firestore no saveChecklist

**Arquivo alterado**: `src/services/db.ts`  
**Arquivo dependente**: `src/pages/Acompanhamento.tsx`

### Critério de Aceite 1: `saveChecklist` usa `runTransaction`

> **Passo 1** — Inspecionar `src/services/db.ts` no código fonte  
> **Verificar**: A função `saveChecklist` (linha ~162) usa `runTransaction(db, async (transaction) => { ... })`  
> **Resultado esperado**: `runTransaction` importado de `firebase/firestore` e utilizado como wrapper da lógica  
> **Código de referência**:
> ```ts
> await runTransaction(db, async (transaction) => {
>   const casalSnap = await transaction.get(casalRef);
>   ...
>   transaction.update(casalRef, { semanas, pontuacaoTotal });
> });
> ```

> **Passo 2** — Verificar import de `runTransaction`  
> **Verificar**: Linha 1 de `db.ts` inclui `runTransaction` nos imports de `firebase/firestore`  
> **Resultado esperado**: `import { ..., runTransaction } from 'firebase/firestore';`

### Critério de Aceite 2: Transação lê, calcula pontuação e atualiza atomicamente

> **Passo 3** — Fazer login, navegar até uma turma → selecionar uma semana  
> **Verificar**: Página de Acompanhamento renderiza com checkboxes para cada casal  
> **Resultado esperado**: Página "Semana X" com lista de casais e 4 checkboxes por casal

> **Passo 4** — Marcar "Presença" para um casal e clicar "Salvar"  
> **Verificar**: (a) Console não exibe erros; (b) Alert "Sincronizado!" aparece; (c) Navegação de volta à página da turma  
> **Resultado esperado**: Salvamento com sucesso, pontuação atualizada

> **Passo 5** — Voltar à mesma semana e verificar que "Presença" continua marcada  
> **Verificar**: O estado persistiu no Firestore  
> **Resultado esperado**: Checkboxes refletem o estado salvo anteriormente (idempotência)

> **Passo 6** — Marcar TODOS os checkboxes (Presença + Vitaminas + Tarefas + Tarefa Extra) para um casal e salvar  
> **Verificar**: Navegar até Desempenho e checar a pontuação do casal  
> **Resultado esperado**: Casal que tinha 0 pontos agora tem 4 pontos (1 por checkbox marcado por semana)  
> **Se falhar**: Se a pontuação estiver errada, o cálculo dentro da transação está incorreto

### Critério de Aceite 3: Retry automático em caso de conflito

> **Como testar race condition manualmente**: Este é o cenário mais importante da HU-04.  
> A ideia é simular dois líderes salvando ao mesmo tempo para verificar que `runTransaction` resolve o conflito automaticamente.

> **Passo 7** — Preparar o ambiente de teste  
> **Ação**:  
> 1. Abrir **duas abas** do browser logadas com o mesmo usuário  
> 2. Em ambas, navegar até a mesma turma → mesma semana  
> 3. Aguardar que ambas carreguem os dados do casal  
> **Resultado esperado**: Duas abas exibindo os mesmos checkboxes (todos desmarcados ou no estado anterior)

> **Passo 8** — Simular edição concorrente  
> **Ação**:  
> 1. Na **Aba A**: Marcar "Presença" e "Vitaminas" para o primeiro casal  
> 2. Na **Aba B**: Marcar "Presença" e "Tarefas" para o MESMO casal  
> 3. **Rapidamente** (em sequência quase simultânea):  
>    - Clicar "Salvar" na Aba A  
>    - Imediatamente clicar "Salvar" na Aba B  
> **Resultado esperado**:  
> - A primeira transação (Aba A) salva com sucesso  
> - A segunda transação (Aba B) detecta que o documento mudou, faz **retry automático** (re-lê o documento atualizado), recalcula a pontuação incluindo os dados da Aba A, e salva com sucesso  
> - Nenhum dado é perdido — a pontuação final reflete AMBAS as edições  
> **Se falhar**: Se a segunda transação sobrescrever a primeira (dados da Aba A perdidos), é porque `runTransaction` não está sendo usado corretamente ou o retry não está funcionando

> **Passo 9** — Verificar resultado da race condition  
> **Ação**: Recarregar a página e navegar até a mesma semana  
> **Verificar**:  
> - Os checkboxes de "Presença" e "Vitaminas" (Aba A) estão marcados  
> - Os checkboxes de "Presença" e "Tarefas" (Aba B) estão marcados  
> - A pontuação total do casal reflete a soma de todos os itens marcados  
> **Resultado esperado**: Nenhum dado foi perdido pela edição concorrente. A pontuação é a soma correta de todas as marcações.  
> **Se falhar**: Se dados da Aba A sumiram, a transação não funcionou — **BUG CRÍTICO** que justifica a HU-04

> **Passo 10 (avançado)** — Testar com 3+ abas simultâneas  
> **Ação**: Repetir o Passo 8 com 3 abas, cada uma marcando checkboxes diferentes  
> **Resultado esperado**: Todas as edições são mescladas corretamente após os retries automáticos

### Critério de Aceite 4: Falha definitiva notifica o usuário

> **Passo 11** — Verificar o tratamento de erro no código  
> **Verificar**: `Acompanhamento.tsx` — função `salvar()` tem `try/catch` que exibe `alert('Houve um erro ao tentar salvar localmente.')`  
> **Resultado esperado**: Se `saveChecklist` lançar erro (ex: regras de segurança do Firestore), o `catch` em Acompanhamento captura e mostra alert ao usuário

> **Passo 12** — Simular falha de permissão  
> **Como forçar o erro**: Temporariamente alterar as regras de segurança do Firestore no Console do Firebase para bloquear escritas:  
> ```
> rules_version = '2';
> service cloud.firestore {
>   match /databases/{database}/documents {
>     match /{document=**} {
>       allow read: if true;
>       allow write: if false;  // Bloqueia escrita
>     }
>   }
> }
> ```  
> **Ação**: Marcar checkboxes e clicar "Salvar"  
> **Verificar**: (a) Console exibe erro do Firestore; (b) Alert "Houve um erro ao tentar salvar localmente." aparece  
> **Resultado esperado**: Usuário é notificado da falha, dados NÃO são perdidos no front (state local preservado)  
> **Se falhar**: Se o app crashar sem notificação, o tratamento de erro é insuficiente

> **Passo 13** — **Restaurar**: Reverter as regras de segurança do Firestore para permitir escritas

### Critério de Aceite 5: `pontuacaoTotal` recalculada dentro da transação

> **Passo 14** — No código de `db.ts`, verificar que `pontuacaoRecalculada` é computada DENTRO do callback do `runTransaction`  
> **Verificar**: A lógica de cálculo está entre `transaction.get()` e `transaction.update()`  
> **Resultado esperado**: O cálculo itera sobre `Object.values(semanas)` somando 1 ponto por checkbox marcado

> **Passo 15** — Teste de cálculo manual  
> **Ação**:  
> 1. Garantir que um casal tem `pontuacaoTotal: 0` e nenhuma semana gravada  
> 2. Marcar Presença + Vitaminas (2 pontos) na Semana 1 → Salvar  
> 3. Verificar que `pontuacaoTotal` é 2  
> 4. Ir para Semana 2, marcar Presença + Tarefas + Tarefas Extras (3 pontos) → Salvar  
> 5. Verificar que `pontuacaoTotal` é 5 (2 da semana 1 + 3 da semana 2)  
> **Resultado esperado**: `pontuacaoTotal` = soma de todos os pontos de todas as semanas, recalculada a cada salvamento

---

## 5. HU-07: Remover código morto e inconsistente

**Arquivos alterados**: `src/services/firebase.ts`, `src/pages/Acompanhamento.tsx`  
**Arquivo removido**: `src/services/mockDb.ts`

### Critério de Aceite 1: `mockDb.ts` removido

> **Passo 1** — Verificar que o arquivo não existe mais  
> **Ação**: No explorador de arquivos ou via terminal, verificar se `src/services/mockDb.ts` existe  
> **Resultado esperado**: Arquivo NÃO existe  
> **Se falhar**: Se o arquivo ainda existe, a remoção não foi concluída

> **Passo 2** — Verificar que não há imports para `mockDb` em nenhum arquivo  
> **Ação**: Buscar por `mockDb` em todo o código fonte  
> **Resultado esperado**: Zero resultados — nenhum arquivo importa ou referencia `mockDb`  
> **Se falhar**: Se houver imports órfãos, a aplicação pode crashar ao tentar importar um módulo inexistente

### Critério de Aceite 2: `isFirebaseConfigured` dinâmico

> **Passo 3** — Inspecionar `src/services/firebase.ts`  
> **Verificar**: `isFirebaseConfigured` é calculado dinamicamente com base nas env vars  
> **Resultado esperado**:  
> ```ts
> export const isFirebaseConfigured = !!(
>   import.meta.env.VITE_FIREBASE_API_KEY &&
>   import.meta.env.VITE_FIREBASE_PROJECT_ID
> );
> ```  
> **Não esperado**: `isFirebaseConfigured = true` hardcoded

> **Passo 4** — Testar com env vars válidas  
> **Ação**: Com `.env` preenchido, iniciar a aplicação  
> **Verificar**: `isFirebaseConfigured` é `true` → login funciona normalmente  
> **Resultado esperado**: App carrega com Firebase conectado

> **Passo 5** — Testar sem env vars  
> **Ação**: Temporariamente renomear `.env` para `.env.bak` e reiniciar o dev server  
> **Verificar**: App exibe tela "Ação Necessária" (do ProtectedRoute) indicando que Firebase não está configurado  
> **Resultado esperado**: Tela informativa com ícone AlertCircle e instrução para configurar o Firebase  
> **Se falhar**: Se a aplicação crashar ao invés de mostrar a tela informativa, `isFirebaseConfigured` não está tratando o caso de env vars ausentes

> **Passo 6** — **Restaurar**: Renomear `.env.bak` de volta para `.env` e reiniciar o dev server

### Critério de Aceite 3: `dist/` no `.gitignore`

> **Passo 7** — Inspecionar `.gitignore`  
> **Verificar**: Arquivo contém a linha `dist` (sem barra)  
> **Resultado esperado**: `dist` está listado no `.gitignore`  
> **Se falhar**: Se `dist` não está no `.gitignore`, arquivos de build podem ser commitados

> **Passo 8** — Verificar que `dist/` não está trackeado no git  
> **Ação**: `git status` → não deve conter arquivos de `dist/`  
> **Resultado esperado**: `dist/` é ignorado pelo git

### Critério de Aceite 4: Sem imports órfãos

> **Passo 9** — Buscar por imports de módulos que não existem  
> **Ação**: Verificar no código que não há referências a `mockDb`, `mockDbService`, ou qualquer módulo removido  
> **Resultado esperado**: Zero referências

> **Passo 10** — Compilar o projeto sem erros  
> **Ação**: `npm run build`  
> **Verificar**: Build completa sem erros de TypeScript  
> **Resultado esperado**: `tsc -b && vite build` completa com sucesso, sem erros  
> **Se falhar**: Imports órfãos ou referências quebradas causam erro de compilação — **BUG CRÍTICO**

### Critério de Aceite 5: ESLint com menos warnings

> **Passo 11** — Rodar ESLint e contar warnings  
> **Ação**: `npm run lint`  
> **Verificar**: Saída do ESLint  
> **Resultado esperado**: Zero errors e zero warnings relacionados a:  
> - Variáveis não utilizadas (ex: `e` em `catch(e)` onde `e` não é usado)  
> - Imports não utilizados  
> - Código morto detectável  
> **Se falhar**: Se houver warnings de variáveis não utilizadas, a limpeza não foi completa

> **Passo 12** — Verificar especificamente o `Acompanhamento.tsx`  
> **Verificar**: O `catch` do `salvar()` NÃO declara variável `e` se não usa:  
> ```ts
> // Correto (sem variável não utilizada):
> } catch {
>   alert('Houve um erro ao tentar salvar localmente.');
> }
> ```  
> **Resultado esperado**: `catch` sem parâmetro (ou com `_e` se necessário)  
> **Se falhar**: Se ainda há `catch (e)` sem usar `e`, o ESLint vai gerar warning

---

## 6. Teste de Regressão Cruzada

Estes testes verificam que as 4 histórias funcionam corretamente juntas, sem interferências.

### Regressão 1: Logout + ErrorBoundary

> **Passo R1** — Fazer login → navegar até Ajustes → clicar "Sair da Conta"  
> **Verificar**: Redirecionamento para `/login` sem tela de fallback do ErrorBoundary  
> **Resultado esperado**: Logout funciona normalmente; ErrorBoundary NÃO é acionado durante logout  
> **Se falhar**: Se tela de fallback aparecer durante logout, o processo de logout está causando erro no React

### Regressão 2: ErrorBoundary + saveChecklist

> **Passo R2** — Navegar até Acompanhamento → marcar checkboxes → salvar  
> **Verificar**: Salvamento com sucesso, sem ErrorBoundary  
> **Resultado esperado**: Alert "Sincronizado!" aparece, navegação de volta à turma

> **Passo R3** — Navegar até Acompanhamento → simular erro no `saveChecklist` (bloquear escritas no Firestore) → clicar "Salvar"  
> **Verificar**: Alert de erro aparece, SEM tela de fallback do ErrorBoundary  
> **Resultado esperado**: O erro é tratado pelo `try/catch` do Acompanhamento, NÃO pelo ErrorBoundary  
> **Se falhar**: Se o ErrorBoundary capturar o erro, significa que o `catch` não está capturando a exceção antes dela chegar ao ErrorBoundary

### Regressão 3: Logout + isFirebaseConfigured

> **Passo R4** — Com Firebase configurado, fazer login e depois logout  
> **Verificar**: Fluxo completo funciona  
> **Resultado esperado**: Login → uso → logout → login funciona em ciclo

> **Passo R5** — Sem Firebase configurado (renomear `.env`), tentar acessar a aplicação  
> **Verificar**: Tela "Ação Necessária" aparece (ProtectedRoute)  
> **Resultado esperado**: Usuário NÃO consegue fazer login, NÃO vê tela branca  
> **Se falhar**: Se a aplicação crashar ao invés de mostrar a tela informativa

### Regressão 4: Fluxo completo end-to-end

> **Passo R6** — Executar o fluxo completo do usuário:  
> 1. Acessar `/login` → fazer login  
> 2. Verificar Home carrega com turmas  
> 3. Clicar em uma turma → verificar página de detalhe  
> 4. Clicar em uma semana → verificar Acompanhamento  
> 5. Marcar checkboxes → clicar "Salvar" → verificar sucesso  
> 6. Navegar até Desempenho → verificar pontuação atualizada  
> 7. Navegar até Ajustes → clicar "Sair da Conta"  
> 8. Verificar redirecionamento para `/login`  
> 9. Tentar acessar `/` via URL → verificar redirecionamento para `/login`  
> 10. Fazer login novamente → verificar que dados persistem  
>  
> **Resultado esperado**: Todo o fluxo funciona sem erros no console, sem crash, sem dados perdidos

---

## 7. Setup Futuro — Vitest + RTL

> **NOTA**: Esta seção é um guia de implementação. **NÃO instalar ainda** — apenas documentar o planejamento.

### 7.1 Instalação

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 7.2 Configuração do Vitest

Adicionar em `vite.config.ts`:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

### 7.3 Setup file

Criar `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom';
```

### 7.4 Script no `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 7.5 Testes planejados (prioridade)

| Prioridade | Teste | Tipo | Arquivo alvo |
|---|---|---|---|
| P0 | `logout()` é chamado ao clicar "Sair da Conta" | Unitário | `Ajustes.tsx` |
| P0 | `navigate('/login', { replace: true })` após logout | Unitário | `Ajustes.tsx` |
| P0 | `ProtectedRoute` redireciona para `/login` se não autenticado | Unitário | `ProtectedRoute.tsx` |
| P0 | `ErrorBoundary` renderiza fallback em caso de erro | Unitário | `ErrorBoundary.tsx` |
| P0 | `ErrorBoundary` loga erro no console | Unitário | `ErrorBoundary.tsx` |
| P0 | `ErrorBoundary` botão "Tentar Novamente" recarrega | Unitário | `ErrorBoundary.tsx` |
| P1 | `saveChecklist` usa `runTransaction` | Unitário (mock) | `db.ts` |
| P1 | `saveChecklist` recalcula `pontuacaoTotal` dentro da transação | Unitário (mock) | `db.ts` |
| P1 | `saveChecklist` lança erro em falha definitiva | Unitário (mock) | `db.ts` |
| P1 | `isFirebaseConfigured` é `false` sem env vars | Unitário | `firebase.ts` |
| P1 | `isFirebaseConfigured` é `true` com env vars | Unitário | `firebase.ts` |
| P2 | Fluxo logout completo (login → logout → redirect) | Integração | `App.tsx` |
| P2 | Fluxo saveChecklist completo (editar → salvar → verificar) | Integração | `Acompanhamento.tsx` |
| P2 | ErrorBoundary captura erro em rota protegida | Integração | `App.tsx` |

### 7.6 Mocks necessários

```ts
// src/test/mocks/firebase.ts
// Mock do Firebase Auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock do Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  deleteDoc: vi.fn(),
  runTransaction: vi.fn(),
  doc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getFirestore: vi.fn(),
}));

// Mock do Firebase App
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));
```

### 7.7 Exemplo de teste P0 — ErrorBoundary

```tsx
// src/components/ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';

// Componente que lança erro para teste
function ThrowError(): never {
  throw new Error('Erro de teste');
}

describe('ErrorBoundary', () => {
  it('renderiza fallback quando filho lança erro', () => {
    // Suprimir erro do React no console durante o teste
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Erro de teste')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();

    spy.mockRestore();
  });

  it('loga erro no console via componentDidCatch', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('recarrega a página ao clicar "Tentar Novamente"', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadSpy = vi.fn();
    Object.defineProperty(window.location, 'reload', { value: reloadSpy });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));
    expect(reloadSpy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
```

---

## 8. Resumo Final

### Checklist de Aprovação por História

| HU | CA1 | CA2 | CA3 | CA4 | CA5 | Status |
|---|---|---|---|---|---|---|
| HU-01 Logout | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| HU-02 ErrorBoundary | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| HU-04 Transações | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| HU-07 Código Morto | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

### Métricas a Reportar ao Agile Master

| Métrica | Valor |
|---|---|
| Total de passos de teste manuais | 39 |
| Total de cenários de erro | 7 |
| Total de testes de regressão cruzada | 6 |
| Testes automatizados planejados (P0) | 6 |
| Testes automatizados planejados (P1) | 5 |
| Testes automatizados planejados (P2) | 3 |
| Cobertura estimada (manual) | ~95% dos critérios de aceite |
| Bugs encontrados | _Preencher após execução_ |
| Taxa de aprovação | _Preencher após execução_ |

### Bugs Conhecidos / Riscos

1. **Race condition no saveChecklist**: Testada manualmente com 2 abas; em produção com mais usuários pode ter comportamento diferente
2. **Login fora do ErrorBoundary**: Por design, erros na tela de login causam tela branca — decidir se precisa de ErrorBoundary no nível raiz
3. **`window.location.reload()` no ErrorBoundary**: Não preserva estado — o usuário perde o contexto do erro após recarregar
4. **Firebase Offline**: Logout com rede offline pode não limpar sessão no servidor — comportamento aceitável mas documentar

---

> **Assinatura do QA**: _Preencher após execução dos testes_  
> **Data de execução**: _Preencher_  
> **Ambiente**: _Preencher (browser, versão, OS)_