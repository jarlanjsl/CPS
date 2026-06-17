# Plano de Testes — Sprint 2 (Gestão de Casais)

> **Projeto:** CPS — Casados Para Sempre
> **Data:** 17/06/2026
> **QA:** Engenheiro QA
> **Ambiente de teste:** Browser (Chrome/Edge) — `npm run dev`
> **Branch base:** `sprint/2-gestao-casais`

---

## Sumário

1. [Instruções Gerais](#1-instruções-gerais)
2. [HU-03: Remover credenciais Firebase](#2-hu-03-remover-credenciais-firebase-do-histórico-git)
3. [HU-08: Editar dados de um casal](#3-hu-08-editar-dados-de-um-casal)
4. [HU-09: Remover casal de uma turma](#4-hu-09-remover-casal-de-uma-turma)
5. [HU-10: Marcar turma como concluída](#5-hu-10-marcar-turma-como-concluída)
6. [Teste de Regressão (Sprint 1)](#6-teste-de-regressão-sprint-1)
7. [Resumo Final](#7-resumo-final)

---

## 1. Instruções Gerais

### Pré-requisitos

- [ ] Node.js instalado (v18+)
- [ ] Dependências atualizadas: `npm install`
- [ ] Arquivo `.env` com credenciais Firebase válidas configuradas
- [ ] App rodando em `http://localhost:5173` (comando: `npm run dev`)
- [ ] Logado com conta válida (usuário: `lider` / senha: `123`)
- [ ] Navegador com console aberto (F12) para inspecionar erros
- [ ] Pelo menos 1 turma com casais cadastrados — use o botão **"Preencher Dados (Seed)"** na Home se necessário

### Convenções

- Marque ✅ quando o passo passar, ❌ quando falhar
- Se um passo falhar, anote o erro e continue — o relatório final dirá se a história foi aprovada ou não
- Use o console do navegador (F12) para verificar erros se algo inesperado acontecer

---

## 2. HU-03: Remover credenciais Firebase do histórico Git

> **Tipo:** Verificação de código (sem UI)
> **Critérios de Aceite:** 5

### Passos

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 1 | Abra o arquivo `.env` na raiz do projeto | O arquivo contém as credenciais reais do Firebase (API key, project ID, etc.) | |
| 2 | Abra o arquivo `.env.example` na raiz do projeto | O arquivo existe e contém as mesmas variáveis do `.env`, porém com valores **placeholder** (ex: `your_api_key_here`) | |
| 3 | Abra o arquivo `.gitignore` na raiz do projeto | As linhas `.env` e `.env.*` estão presentes; a linha `!.env.example` também está presente (garantindo que `.env.example` **não** seja ignorado) | |
| 4 | Abra `src/services/firebase.ts` | As credenciais são lidas via `import.meta.env.VITE_FIREBASE_*` — **nenhuma** chave real hardcoded | |
| 5 | Verifique em `src/services/firebase.ts` a função `isFirebaseConfigured` | Ela verifica dinamicamente as env vars (não é valor hardcoded) | |
| 6 | Abra o `README.md` e procure por "Configuração" ou "Variáveis de Ambiente" | Existe uma seção documentando como configurar (copiar `.env.example` para `.env` e preencher) | |
| 7 | No terminal: `git log --oneline \| grep "HU-03"` | O commit `9576cc1 feat(HU-03)` está presente | |

**Resultado HU-03:** ✅ Aprovada / ❌ Reprovada

---

## 3. HU-08: Editar dados de um casal

> **Tipo:** Teste funcional (UI)
> **Critérios de Aceite:** 6

### Setup: Preparar dados de teste

> ⚠️ A turma seed cria 1 LÍDER + 2 ALUNOS. Para testar limites, você precisa cadastrar mais 1 CO-LÍDER e mais 3 ALUNOS.

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| P1 | Na Home, clique na turma existente | Tela de detalhe da turma é exibida | |
| P2 | Clique em **"Cadastrar"** | Modal "Novo Casal" abre | |
| P3 | Preencha: Nome dEle = "CoLíder Teste", Nome dEla = "CoLíder Teste", Tipo = "Casal Co-Líder". Clique **"Adicionar Casal"** | Casal adicionado com sucesso | |
| P4 | Repita mais 3 vezes criando ALUNOS: "Aluno 1", "Aluno 2", "Aluno 3" | 3 novos alunos adicionados | |

Agora você deve ter: **1 LÍDER, 1 CO-LÍDER, 5 ALUNOS** = 7 casais.

---

### Cenário 1: Editar nome do casal (caminho feliz)

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 1 | Localize o **primeiro casal ALUNO** da lista | O casal é exibido com nome e badge "Aluno" | |
| 2 | Clique no **ícone de lápis (✏️)** ao lado do nome | Modal "Editar Casal" abre com campos preenchidos com os dados atuais | |
| 3 | No campo "Nome dEle", altere para **"José"** | Campo reflete a alteração | |
| 4 | No campo "Nome dEla", altere para **"Maria"** | Campo reflete a alteração | |
| 5 | Clique em **"Salvar"** | Modal fecha. Lista atualizada **sem recarregar**. Casal agora exibe "José & Maria" | |

### Cenário 2: Mudar tipo para LÍDER (limite excedido — erro)

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 6 | Clique no **✏️** de um casal **ALUNO** | Modal abre com tipo "Aluno" selecionado | |
| 7 | Altere Tipo para **"Casal Líder (Não pontua)"** | Select muda para "LIDER" | |
| 8 | Clique em **"Salvar"** | Modal **não fecha**. Mensagem de erro: **"Limite de 1 Casal Líder excedido para esta turma."** | |
| 9 | Clique no **X** para fechar | Modal fecha sem alterações | |

### Cenário 3: Mudar tipo para CO-LÍDER (limite excedido — erro)

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 10 | Clique no **✏️** de outro casal **ALUNO** | Modal abre com tipo "Aluno" | |
| 11 | Altere Tipo para **"Casal Co-Líder (Não pontua)"** | Select muda para "CO-LIDER" | |
| 12 | Clique em **"Salvar"** | Modal **não fecha**. Mensagem: **"Limite de 1 Casal Co-Líder excedido para esta turma."** | |
| 13 | Feche com **X** | Modal fecha sem alterações | |

### Cenário 4: Editar apenas o nome (tipo não muda)

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 14 | Clique no **✏️** de um casal ALUNO | Modal abre | |
| 15 | Altere só o nome dEle e mantenha tipo "Aluno" | Nome alterado, tipo permanece | |
| 16 | Clique em **"Salvar"** | Modal fecha. Lista atualizada com novo nome | |

### Cenário 5: Cancelar edição sem salvar

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 17 | Clique no **✏️** de um casal | Modal abre preenchido | |
| 18 | Altere o nome dEle para **"Nome Temporário"** | Campo alterado | |
| 19 | Clique no **X** para fechar | Modal fecha. Lista **não** é alterada — nome continua o original | |

### Cenário 6: Campos obrigatórios vazios

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 20 | Clique no **✏️** de um casal | Modal abre | |
| 21 | Apague todo o **"Nome dEle"** | Campo vazio | |
| 22 | Botão **"Salvar"** deve estar **desabilitado** (acinzentado) | Botão não clicável | |
| 23 | Preencha "Nome dEle" e apague "Nome dEla" | Botão "Salvar" desabilitado novamente | |
| 24 | Preencha ambos e clique **"Salvar"** | Alterações salvas com sucesso | |

**Resultado HU-08:** ✅ Aprovada / ❌ Reprovada

---

## 4. HU-09: Remover casal de uma turma

> **Tipo:** Teste funcional (UI)
> **Critérios de Aceite:** 6

### Cenário 1: Remover casal ALUNO (caminho feliz)

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 1 | Localize um casal do tipo **ALUNO** | Casal com badge "Aluno" | |
| 2 | Clique no **ícone de lixeira (🗑️)** ao lado do nome | Modal **"Excluir Casal"** abre com nome do casal e campo para digitar "Excluir" | |
| 3 | Verifique se **não** aparece alerta amarelo | Nenhum aviso adicional | |
| 4 | Clique em **"Confirmar Exclusão"** **sem** digitar "Excluir" | Botão **desabilitado** — exclusão não acontece | |
| 5 | Digite **"Excluir"** no campo | Botão "Confirmar Exclusão" fica **habilitado** (clicável, vermelho) | |
| 6 | Clique em **"Confirmar Exclusão"** | Modal fecha. Casal removido. Lista atualizada **sem recarregar** | |

### Cenário 2: Verificar ranking atualizado

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 7 | Navegue para **"Desempenho"** (menu inferior) | Página de ranking exibida | |
| 8 | Selecione a turma no dropdown (se houver mais de uma) | Ranking carregado | |
| 9 | Verifique se o casal removido **não** aparece mais | Ranking atualizado | |
| 10 | Volte para o detalhe da turma (seta ← Voltar) | Tela de detalhe | |

### Cenário 3: Remover casal LÍDER (com alerta)

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 11 | Localize o casal **LÍDER** e clique na **🗑️** | Modal "Excluir Casal" abre com nome do líder | |
| 12 | Verifique alerta amarelo: **"Atenção: esta turma ficará sem Líder!"** | Alerta visível | |
| 13 | Digite "Excluir" e clique **"Confirmar Exclusão"** | Casal líder removido. Lista atualizada | |

### Cenário 4: Cancelar exclusão

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 14 | Clique na **🗑️** de um casal | Modal abre | |
| 15 | Digite "Excluir" no campo | Campo preenchido | |
| 16 | Clique no **X** para fechar | Modal fecha. Ao reabrir exclusão do mesmo casal, campo está **limpo** (vazio) | |

**Resultado HU-09:** ✅ Aprovada / ❌ Reprovada

---

## 5. HU-10: Marcar turma como concluída

> **Tipo:** Teste funcional (UI)
> **Critérios de Aceite:** 6

### Pré-condições
- [ ] Pelo menos **2 turmas** existentes (uma para concluir e outra para manter ativa)

### Cenário 1: Concluir turma

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 1 | Na tela de detalhe da turma, clique no botão **"Concluir Turma"** (verde, ao lado do nome) | Modal com título "Concluir Turma", mensagem de confirmação e botões **"Cancelar"** e **"Sim, Concluir"** | |
| 2 | Verifique a mensagem: *"Deseja concluir a turma '[NOME]'? Ela será movida para a seção de turmas concluídas."* | Nome correto da turma | |
| 3 | Clique em **"Cancelar"** | Modal fecha. Nada muda | |
| 4 | Clique novamente em **"Concluir Turma"** e depois em **"Sim, Concluir"** | Modal fecha. Botão agora muda para **"Reabrir Turma"** | |

### Cenário 2: Seção "Turmas Concluídas" na Home

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 5 | Clique em **"← Voltar"** ou vá para Home | Home exibida | |
| 6 | Role para baixo | Existe seção **"Turmas Concluídas"** separada de "Turmas Ativas" | |
| 7 | Turma concluída está na seção "Concluídas" e **não** em "Ativas" | Separação correta | |
| 8 | Card da turma concluída está com **opacidade reduzida** (~0.7) e/ou **filtro grayscale** | Visual diferenciado | |
| 9 | Clique no card da turma concluída | Tela de detalhe abre normalmente | |

### Cenário 3: Reabrir turma

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| 10 | Na tela de detalhe, clique em **"Reabrir Turma"** (laranja/amarelo) | Modal "Reabrir Turma" com mensagem: *"Deseja reabrir a turma '[NOME]'? Ela voltará a aparecer na seção de turmas ativas."* | |
| 11 | Clique em **"Cancelar"** | Modal fecha. Turma continua concluída | |
| 12 | Clique novamente **"Reabrir Turma"** e depois em **"Sim, Reabrir"** | Modal fecha. Botão volta a ser "Concluir Turma" | |
| 13 | Volte para Home | Turma agora está em "Turmas Ativas" | |
| 14 | Card com opacidade normal (sem grayscale) | Visual normal restaurado | |

**Resultado HU-10:** ✅ Aprovada / ❌ Reprovada

---

## 6. Teste de Regressão (Sprint 1)

> Verificar se funcionalidades do Sprint 1 continuam funcionando

| # | Ação | Resultado Esperado | ✅ / ❌ |
|---|------|-------------------|---------|
| R1 | Faça logout e acesse `http://localhost:5173/login` | Tela de login exibida | |
| R2 | Faça login com **lider / 123** | Redirecionado para Home | |
| R3 | Clique em **"Nova Turma"**, preencha nome e data, clique **"Cadastrar"** | Turma criada, aparece na lista | |
| R4 | Entre na turma, clique em **"Cadastrar"** para adicionar casal | Modal "Novo Casal" abre, casal adicionado | |
| R5 | Clique em uma lição (ex: "Lição 1") | Tela de acompanhamento semanal abre | |
| R6 | Marque checkboxes, clique **"Salvar"** | Mensagem "Sincronizado!" exibida, redirecionado | |
| R7 | Vá para **"Desempenho"** (menu inferior) | Ranking com pontuações exibido | |
| R8 | Teste abas de filtro (Geral, Presença, Vitamina, Tarefas) | Ranking reordenado conforme categoria | |
| R9 | Vá para **"Ajustes"** (menu inferior) | Ajustes com toggle do avião, frequência e "Sair da Conta" | |
| R10 | Clique em **"Sair da Conta"** | Redirecionado para login | |
| R11 | Tente acessar `http://localhost:5173/` sem login | Redirecionado para `/login` | |

**Resultado Regressão:** ✅ Aprovada / ❌ Reprovada

---

## 7. Resumo Final

### Resultados por História

| História | Critérios | Steps Executados | Status |
|----------|-----------|-----------------|--------|
| HU-03 | 5 | 7 verificações | ✅ / ❌ |
| HU-08 | 6 | 6 cenários (24 passos) | ✅ / ❌ |
| HU-09 | 6 | 4 cenários (16 passos) | ✅ / ❌ |
| HU-10 | 6 | 3 cenários (14 passos) | ✅ / ❌ |
| Regressão | — | 11 passos | ✅ / ❌ |

### Checklist de Aprovação Geral

- [ ] **HU-03:** Todas as verificações passaram
- [ ] **HU-08:** Cenários de sucesso E erro passaram
- [ ] **HU-09:** Exclusões funcionam, alertas exibidos, ranking atualizado
- [ ] **HU-10:** Concluir e reabrir funcionam, seções separadas, visual diferenciado
- [ ] **Regressão:** Funcionalidades do Sprint 1 intactas
- [ ] **Nenhum erro no console do navegador** (F12 → Console)
- [ ] **Nenhum erro de rede** (F12 → Network — sem requisições 4xx/5xx)

### Decisão Final

| Item | Valor |
|------|-------|
| **Histórias aprovadas** | **/ 4** |
| **Histórias reprovadas** | **/ 4** |
| **Bugs encontrados** | ** bugs** |
| **Testador** | |
| **Data** | 17/06/2026 |

### Bugs Encontrados (preencher se aplicável)

| ID | História | Descrição | Severidade |
|----|----------|-----------|------------|
| | | | |
| | | | |
