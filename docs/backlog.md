# Product Backlog — CPS (Casados Para Sempre)

> Última atualização: 17/06/2026
> Versão: 1.1
> Responsável: Agile Master

---

## Histórico de Mudanças

| Data | Versão | Mudança |
|---|---|---|
| 17/06/2026 | 1.0 | Criação inicial do backlog com 19 histórias |
| 17/06/2026 | 1.1 | Sprint 1 concluído: HU-01, HU-02, HU-04, HU-07 aprovadas |

---

## 🔴 EIXO 1 — ESTABILIZAÇÃO

---

### HU-01: Corrigir fluxo de logout

**Como** líder de turma, **eu quero** sair da minha conta corretamente, **para** garantir que meus dados fiquem protegidos ao compartilhar o dispositivo.

**Critérios de Aceite**:
1. Ao clicar "Sair da Conta" em Ajustes, a função `auth.logout()` deve ser chamada antes da navegação
2. Após logout, o estado de autenticação deve ser limpo (`currentUser = null`)
3. Após logout, o usuário deve ser redirecionado para a tela de Login
4. Após logout, acessar qualquer rota protegida deve redirecionar para Login
5. Após logout, o botão "Voltar" do navegador não deve permitir acesso às páginas protegidas

**Prioridade**: Alta | **Estimativa**: S | **Status**: Concluída ✅

> **Sprint 1**: Todos os 5 critérios de aceite validados. Logout chama `auth.logout()` antes de navegar com `replace: true`.

**Como** líder de turma, **eu quero** ver uma mensagem de erro amigável quando algo falhar, **para** não ficar preso em uma tela branca sem saber o que aconteceu.

**Critérios de Aceite**:
1. Implementar React Error Boundary no nível do App
2. Quando um erro não tratado ocorrer, exibir tela de fallback com mensagem clara (não tela branca)
3. A tela de fallback deve ter um botão "Tentar Novamente" que recarrega a página
4. O erro deve ser logado no console para debugging
5. Error Boundary deve envolver as rotas protegidas e o Layout

**Prioridade**: Alta | **Estimativa**: S | **Status**: Concluída ✅

> **Sprint 1**: Todos os 5 critérios de aceite validados. Fallback com dark theme + glassmorphism funciona. Ícone AlertTriangle em vermelho (correto no dark theme).

**Como** administrador do sistema, **eu quero** que as credenciais Firebase não estejam no histórico do Git, **para** evitar acesso não autorizado ao banco de dados.

**Critérios de Aceite**:
1. As chaves Firebase (API key, project ID, etc.) devem ser removidas do histórico Git
2. O arquivo `.env` deve permanecer no `.gitignore`
3. Criar `.env.example` com as variáveis necessárias preenchidas com valores placeholder
4. As regras de segurança do Firestore devem estar em modo production (não test)
5. Documentar no README como configurar as variáveis de ambiente

**Prioridade**: Alta | **Estimativa**: M | **Status**: Backlog

---

### HU-04: Adicionar transações Firestore no saveChecklist

**Como** líder de turma, **eu quero** que meus dados de acompanhamento sejam salvos de forma segura, **para** não perder registros quando dois líderes salvarem ao mesmo tempo.

**Critérios de Aceite**:
1. A operação `saveChecklist` deve usar `runTransaction` do Firestore
2. A transação deve ler o documento atual, calcular pontuação e atualizar atomicamente
3. Se houver conflito, a transação deve repetir automaticamente (retry nativo do Firestore)
4. Se a transação falhar definitivamente, o usuário deve ser notificado com mensagem de erro
5. A pontuação total (`pontuacaoTotal`) deve ser recalculada dentro da transação

**Prioridade**: Alta | **Estimativa**: S | **Status**: Concluída ✅

> **Sprint 1**: Todos os 5 critérios de aceite validados. Transação atômica com `runTransaction` protege o documento. **Contexto**: edições concorrentes na mesma semana/mesmo casal seguem last-write-wins — o modelo de dados salva a semana inteira, não checkboxes individuais.

**Como** desenvolvedor, **eu quero** ter uma suíte de testes automatizados, **para** poder refatorar e evoluir o código com confiança.

**Critérios de Aceite**:
1. Instalar e configurar Vitest + React Testing Library
2. Criar script `test` no `package.json`
3. Escrever testes unitários para o `dbService` (CRUD de turmas e casais)
4. Escrever testes unitários para o `AuthContext` (login, logout, estado)
5. Escrever testes unitários para o `SoundContext` (alarme, modos de frequência)
6. Escrever testes de integração para o fluxo de Checklist (salvar e recalcular pontuação)
7. Coverage mínimo de 60% nos arquivos de services e contexts
8. Todos os testes devem passar no CI

**Prioridade**: Alta | **Estimativa**: L | **Status**: Backlog

---

### HU-06: Extrair inline styles para arquivos CSS

**Como** desenvolvedor, **eu quero** ter todo o estilo em arquivos CSS dedicados, **para** facilitar manutenção e garantir consistência visual.

**Critérios de Aceite**:
1. Mover todos os inline styles de `TurmaDetail.tsx` para `turma-detail.css`
2. Mover todos os inline styles de `Acompanhamento.tsx` para `acompanhamento.css`
3. Mover todos os inline styles de `Desempenho.tsx` para `desempenho.css`
4. Mover todos os inline styles de `Ajustes.tsx` para `ajustes.css`
5. Mover todos os inline styles de `Login.tsx` e `Home.tsx` para seus respectivos CSS
6. Nenhum `style={{}}` deve permanecer nos componentes (exceto estilos dinâmicos calculados)
7. A UI deve permanecer visualmente idêntica após a refatoração
8. Todos os testes existentes devem continuar passando

**Prioridade**: Média | **Estimativa**: M | **Status**: Backlog

---

### HU-07: Remover código morto e inconsistente

**Como** desenvolvedor, **eu quero** que o codebase não tenha código não utilizado, **para** reduzir confusão e facilitar onboarding.

**Critérios de Aceite**:
1. Remover `mockDb.ts` do diretório services
2. Remover ou corrigir `isFirebaseConfigured` hardcoded em `ProtectedRoute.tsx`
3. Remover o `dist/` do repositório e adicioná-lo ao `.gitignore`
4. Verificar se não há imports órfãos ou variáveis não utilizadas
5. O ESLint deve rodar sem warnings após a limpeza

**Prioridade**: Média | **Estimativa**: S | **Status**: Concluída ✅

> **Sprint 1**: Todos os 5 critérios de aceite validados. mockDb.ts removido, `isFirebaseConfigured` dinâmico, build sem erros, zero imports órfãos.

---

### HU-08: Editar dados de um casal

**Como** líder de turma, **eu quero** editar o nome e o papel de um casal, **para** corrigir erros de cadastro ou atualizar funções.

**Critérios de Aceite**:
1. Na tela de detalhe da turma, cada casal deve ter um botão/ícone de edição
2. Ao clicar, abrir modal com campos preenchidos: nome dele, nome dela, tipo (LIDER/CO-LIDER/ALUNO)
3. Ao salvar, validar regras de limite (máx 1 líder, 1 co-líder, 5 alunos)
4. Se mudar o tipo e o limite for excedido, exibir mensagem de erro clara
5. Após salvar, a lista de casais deve ser atualizada sem recarregar a página
6. O cancelamento deve fechar o modal sem alterações

**Prioridade**: Alta | **Estimativa**: M | **Status**: Backlog

---

### HU-09: Remover casal de uma turma

**Como** líder de turma, **eu quero** remover um casal da turma, **para** corrigir cadastros indevidos ou lidar com desistências.

**Critérios de Aceite**:
1. Na tela de detalhe da turma, cada casal deve ter um botão/ícone de exclusão
2. Ao clicar, exibir modal de confirmação com o nome do casal
3. A exclusão deve requerer digitar "Excluir" (mesmo padrão da exclusão de turma)
4. Após confirmar, o casal deve ser removido do Firestore
5. O ranking (Desempenho) deve ser atualizado automaticamente
6. Se o casal for líder ou co-líder, alertar que a turma ficará sem essa função

**Prioridade**: Alta | **Estimativa**: M | **Status**: Backlog

---

### HU-10: Marcar turma como concluída

**Como** líder de turma, **eu quero** marcar uma turma como concluída, **para** separar turmas ativas das finalizadas no dashboard.

**Critérios de Aceite**:
1. Na tela de detalhe da turma, adicionar botão "Concluir Turma"
2. Ao clicar, exibir confirmação ("Deseja concluir esta turma?")
3. Após confirmar, o campo `concluida` deve ser atualizado para `true`
4. Na Home, turmas concluídas devem aparecer em seção separada ("Concluídas")
5. Turmas concluídas devem ter visual diferenciado (cor/opacidade)
6. Deve ser possível reabrir uma turma concluída (botão "Reabrir")

**Prioridade**: Média | **Estimativa**: S | **Status**: Backlog

---

### HU-11: Implementar sistema de notificações real

**Como** líder de turma, **eu quero** receber notificações reais sobre atividades das turmas, **para** não precisar verificar manualmente o app.

**Critérios de Aceite**:
1. Criar collection `notificacoes` no Firestore
2. Gerar notificação quando: checklist semanal não for preenchido até um prazo
3. Gerar notificação quando: turma completar 14 semanas
4. O ícone de sino no header deve exibir badge com contagem de não lidas
5. Ao clicar no sino, exibir lista de notificações com data e descrição
6. Notificações lidas devem ser marcadas como lidas
7. Notificações devem ser específicas por usuário (não globais)

**Prioridade**: Média | **Estimativa**: L | **Status**: Backlog

---

### HU-12: Completar implementação PWA

**Como** líder de turma, **eu quero** instalar o app na tela inicial do celular, **para** acessar rapidamente como um app nativo.

**Critérios de Aceite**:
1. Gerar ícones PWA reais (192x192 e 512x512) com a identidade visual do CPS
2. Atualizar `manifest.json` com ícones corretos, nome, descrição e theme_color
3. Implementar Service Worker com cache de assets estáticos (Workbox ou manual)
4. Implementar estratégia de cache para fonts e assets
5. Exibir prompt de instalação customizado (antes do browser default)
6. O app deve passar no Lighthouse PWA audit com score mínimo de 90

**Prioridade**: Média | **Estimativa**: L | **Status**: Backlog

---

### HU-13: Implementar notificações push

**Como** líder de turma, **eu quero** receber notificações push no celular, **para** ser lembrado de preencher o acompanhamento semanal.

**Critérios de Aceite**:
1. Integrar Firebase Cloud Messaging (FCM) no app
2. Solicitar permissão de notificação ao usuário (com contexto claro)
3. Registrar service worker para receber push messages
4. Armazenar token FCM por usuário no Firestore
5. O toggle "Alertas Push" em Ajustes deve funcionar de verdade (ativar/desativar)
6. Enviar push de lembrete quando houver checklist semanal pendente (via Cloud Function)
7. Notificações devem abrir o app na tela correta ao clicar

**Prioridade**: Baixa | **Estimativa**: XL | **Status**: Backlog

---

## 🟢 EIXO 3 — CRESCIMENTO

---

### HU-14: Implementar controle de acesso por papel (RBAC)

**Como** administrador do sistema, **eu quero** que cada usuário tenha acesso apenas às funcionalidades do seu papel, **para** garantir segurança e organização dos dados.

**Critérios de Aceite**:
1. Definir papéis: ADMIN, LIDER, CO-LIDER, ALUNO
2. ADMIN pode criar/editar/excluir turmas, casais e gerenciar usuários
3. LIDER pode gerenciar sua turma (CRUD casais, checklist) mas não outras turmas
4. CO-LIDER tem as mesmas permissões do LIDER na sua turma
5. ALUNO pode apenas visualizar seu acompanhamento e ranking
6. Criar tela de listagem de usuários (apenas ADMIN)
7. Implementar guarda de rota baseada em papel
8. Esconder/mostrar botões de ação conforme o papel do usuário

**Prioridade**: Média | **Estimativa**: XL | **Status**: Backlog

---

### HU-15: Validação server-side via Cloud Functions

**Como** administrador, **eu quero** que as regras de negócio sejam validadas no servidor, **para** evitar manipulação de dados via client-side.

**Critérios de Aceite**:
1. Criar Cloud Function para validar criação de casal (limites de 1/1/5)
2. Criar Cloud Function para recalcular pontuação ao salvar checklist
3. Criar Cloud Function para validar exclusão de turma
4. Implementar Firestore Security Rules que restrinjam acesso por autenticação
5. Remover lógica de validação duplicada do client-side (manter apenas UX)
6. Deploy das Functions no Firebase Cloud Functions (v2)

**Prioridade**: Média | **Estimativa**: L | **Status**: Backlog

---

### HU-16: Abstrair camada de dados (Repository Pattern)

**Como** desenvolvedor, **eu quero** ter uma camada de abstração sobre o Firebase, **para** poder trocar de backend no futuro sem reescrever a aplicação.

**Critérios de Aceite**:
1. Criar interfaces `ITurmaRepository`, `ICasalRepository`, `IChecklistRepository`
2. Implementar `FirebaseTurmaRepository`, `FirebaseCasalRepository`, `FirebaseChecklistRepository`
3. Substituir chamadas diretas ao `dbService` pelas interfaces
4. Injetar dependências via Context ou composition root
5. Todos os testes existentes devem continuar passando
6. A aplicação deve funcionar identicamente após a refatoração

**Prioridade**: Baixa | **Estimativa**: L | **Status**: Backlog

---

### HU-17: Tela de relatórios e estatísticas

**Como** líder de turma, **eu quero** ver relatórios de desempenho da turma, **para** acompanhar evolução e identificar casais que precisam de atenção.

**Critérios de Aceite**:
1. Criar página de Relatórios acessível pelo menu
2. Exibir gráfico de evolução semanal da turma (frequência média por semana)
3. Exibir taxa de conclusão de tarefas por semana
4. Destacar casais com frequência abaixo de 70%
5. Permitir exportar dados em formato CSV
6. Filtro por turma (para ADMIN que gerencia múltiplas turmas)

**Prioridade**: Baixa | **Estimativa**: L | **Status**: Backlog

---

### HU-18: Suporte offline com sincronização

**Como** líder de turma, **eu quero** usar o app mesmo sem internet, **para** preencher o acompanhamento em locais com conexão instável.

**Critérios de Aceite**:
1. Implementar cache offline do Firestore (persistence habilitada)
2. Exibir indicador visual de status de conexão (online/offline)
3. Permitir salvar checklist offline (queue local)
4. Sincronizar automaticamente quando a conexão for restaurada
5. Resolver conflitos de sincronização com estratégia "last write wins"
6. Notificar o usuário quando dados forem sincronizados com sucesso

**Prioridade**: Baixa | **Estimativa**: XL | **Status**: Backlog

---

### HU-19: Melhorar autenticação (reset de senha e registro)

**Como** usuário, **eu quero** recuperar minha senha e me cadastrar sozinho, **para** não depender de um administrador para acessar o sistema.

**Critérios de Aceite**:
1. Implementar tela de registro com email real (não sintético)
2. Implementar fluxo "Esqueci minha senha" com email de recuperação do Firebase
3. Manter compatibilidade com login dos usuários existentes (email sintético)
4. Criar tela de convite (ADMIN envia link de registro)
5. Novos usuários devem ser associados a um papel (ADMIN/LIDER/ALUNO)
6. Validação de senha: mínimo 6 caracteres

**Prioridade**: Baixa | **Estimativa**: M | **Status**: Backlog

---

## 📊 Resumo

| Eixo | Total | S | M | L | XL |
|---|---|---|---|---|---|
| 🔴 Estabilização | 7 | 3 | 2 | 1 | 0 |
| 🟡 Evolução | 6 | 1 | 2 | 2 | 1 |
| 🟢 Crescimento | 6 | 0 | 1 | 3 | 2 |
| **Total** | **19** | **4** | **5** | **6** | **3** |