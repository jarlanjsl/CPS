# Product Backlog — CPS (Casados Para Sempre)

> Última atualização: 17/06/2026
> Versão: 5.0
> Responsável: Agile Master

---

## Histórico de Mudanças

| Data | Versão | Mudança |
|---|---|---|
| 17/06/2026 | 1.0 | Criação inicial do backlog com 19 histórias |
| 17/06/2026 | 1.1 | Sprint 1 concluído: HU-01, HU-02, HU-04, HU-07 aprovadas |
| 17/06/2026 | 1.2 | Sprint 2 iniciado: HU-03, HU-08, HU-09, HU-10 em progresso |
| 17/06/2026 | 1.3 | Sprint 2: HU-08 e HU-10 implementadas e validadas |
| 17/06/2026 | 1.4 | Sprint 2 concluído: HU-03, HU-08, HU-09, HU-10 entregues |
| 17/06/2026 | 2.0 | Sprint 2 validado pelo QA: 4/4 aprovadas |
| 17/06/2026 | 3.0 | Adicionadas HU-20 a HU-30 (identidade visual, fotos, ranking animado, vitaminas) |
| 17/06/2026 | 4.0 | Sprint 3 concluído: HU-20, HU-21, HU-22, HU-23 aprovadas pelo QA |
| 17/06/2026 | 4.1 | Correção doc HU-20: paleta 2=1 Brasil revertida para original (indigo) por decisão do usuário; apenas Logo.tsx permaneceu |
| 17/06/2026 | 5.0 | Sprint 4 iniciado: HU-25, HU-26, HU-27, HU-28 em progresso (Vitaminas da Semana) |

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

### HU-02: Adicionar Error Boundary

**Como** líder de turma, **eu quero** ver uma mensagem de erro amigável quando algo falhar, **para** não ficar preso em uma tela branca sem saber o que aconteceu.

**Critérios de Aceite**:
1. Implementar React Error Boundary no nível do App
2. Quando um erro não tratado ocorrer, exibir tela de fallback com mensagem clara (não tela branca)
3. A tela de fallback deve ter um botão "Tentar Novamente" que recarrega a página
4. O erro deve ser logado no console para debugging
5. Error Boundary deve envolver as rotas protegidas e o Layout

**Prioridade**: Alta | **Estimativa**: S | **Status**: Concluída ✅

> **Sprint 1**: Todos os 5 critérios de aceite validados. Fallback com dark theme + glassmorphism funciona. Ícone AlertTriangle em vermelho (correto no dark theme).

### HU-03: Remover credenciais Firebase do histórico Git

**Como** administrador do sistema, **eu quero** que as credenciais Firebase não estejam no histórico do Git, **para** evitar acesso não autorizado ao banco de dados.

**Critérios de Aceite**:
1. As chaves Firebase (API key, project ID, etc.) devem ser removidas do histórico Git
2. O arquivo `.env` deve permanecer no `.gitignore`
3. Criar `.env.example` com as variáveis necessárias preenchidas com valores placeholder
4. As regras de segurança do Firestore devem estar em modo production (não test)
5. Documentar no README como configurar as variáveis de ambiente

**Prioridade**: Alta | **Estimativa**: M | **Status**: Concluída ✅

> **Sprint 2**: `.env.example` criado, `.gitignore` verificado, README atualizado. ✅ Aprovado pelo QA.

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

### HU-05: Implementar testes automatizados

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

**Prioridade**: Alta | **Estimativa**: M | **Status**: Concluída ✅

> **Sprint 2**: Modal de edição com campos preenchidos + validação rígida de limites (Opção B).

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

**Prioridade**: Alta | **Estimativa**: M | **Status**: Concluída ✅

> **Sprint 2**: Modal com digitação "Excluir" + alerta se Líder/Co-Líder. Ranking atualiza automaticamente. ✅ Aprovado pelo QA.

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

**Prioridade**: Média | **Estimativa**: S | **Status**: Concluída ✅

> **Sprint 2**: Botões Cancelar/Sim no modal (Opção B). Turmas concluídas em seção separada na Home com estilo diferenciado.

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

## 🔵 EIXO 4 — IDENTIDADE VISUAL

---

### HU-20: Nova identidade visual do app

**Como** líder de turma, **eu quero** uma nova identidade visual para o app, **para** transmitir profissionalismo e alinhamento com a marca do ministério.

**Critérios de Aceite**:
1. Aplicar paleta de cores oficial do 2=1 Brasil no design system:
   - 🔵 **Primária:** `#214991` (azul escuro) — headers, botões, títulos
   - 🟢 **Secundária:** `#44C1D7` (ciano/teal) — hover, ícones, badges
   - 🟡 **Destaque:** `#FFC801` (dourado) — acentos, detalhes, logo
   - 🔵 **Fundo claro:** `#ECF9FB` (azul claro) — cards e seções
   - ⚪ **Texto/background:** `#FFFFFF` (branco)
2. Inserir logotipo no header e na tela de login com duas alianças douradas (`#FFC801`) e texto "Casados Para Sempre" em azul escuro (`#214991`)
3. Atualizar ícone PWA e manifest com a nova identidade
4. Garantir contraste e acessibilidade (WCAG AA) com as novas cores no dark theme
5. Atualizar variáveis CSS mantendo a consistência do design system glassmorphism

**Prioridade**: Média | **Estimativa**: M | **Status**: Concluída ✅ (parcial)

> **Sprint 3**: Componente `Logo.tsx` entregue (duas alianças douradas `#F59E0B` + texto "Casados Para Sempre" em indigo `#6366f1`), exibido no header (Layout) e na tela de Login. **A paleta 2=1 Brasil foi aplicada e depois revertida para a paleta original (indigo/roxo `#6366f1`) por decisão do usuário** (commits `89b55f9` → `a541d64` → `2ae79a1`). Critérios 1, 3, 4 e 5 (paleta 2=1 Brasil, manifest, theme-color, variáveis `--accent`/`--bg-light`) foram superseditos pela decisão de manter a paleta original. Apenas o critério 2 (logotipo no header e login) permanece em vigor.

---

## 🟡 EIXO 2 — EVOLUÇÃO

---

### HU-21: Ordenar turmas por data de criação

**Como** líder de turma, **eu quero** que as turmas sejam ordenadas pela data de criação (mais recentes primeiro), **para** encontrar rapidamente a turma que estou acompanhando.

**Critérios de Aceite**:
1. A listagem de turmas na Home deve ser ordenada por `createdAt` decrescente
2. Turmas concluídas também devem seguir a mesma ordenação dentro da seção delas
3. A ordenação deve ser feita via Firestore query (`orderBy('createdAt', 'desc')`)
4. Manter compatibilidade com a paginação/separação entre ativas e concluídas

**Prioridade**: Alta | **Estimativa**: S | **Status**: Concluída ✅

> **Sprint 3**: `getTurmas()` agora usa `orderBy('createdAt', 'desc')`. Migration criada para turmas existentes.

---

### HU-22: Adicionar foto para cada casal

**Como** líder de turma, **eu quero** adicionar uma foto para cada casal no momento do cadastro, **para** identificá-los visualmente.

**Critérios de Aceite**:
1. No formulário de cadastro/edição do casal, adicionar campo de upload de foto
2. A foto deve ser armazenada no Firebase Storage
3. Exibir preview da foto antes do upload
4. Suporte para captura via câmera (mobile) e galeria
5. Tamanho máximo de 5MB por foto
6. A foto deve ser redimensionada para 400x400px no upload
7. Exibir placeholder com iniciais do casal quando não houver foto
8. Opção de remover/alterar a foto existente

**Prioridade**: Alta | **Estimativa**: M | **Status**: Concluída ✅

> **Sprint 3**: Upload de foto para Firebase Storage (`casais/{casalId}/foto.jpg`) com redimensionamento 400×400 via Canvas. Componente `AvatarCasado` com foto ou placeholder gradiente. Preview antes do upload. Validação de 5MB. Storage em modo production.

---

### HU-23: Exibir fotos no ranking

**Como** líder de turma, **eu quero** ver as fotos dos casais no ranking, **para** identificar rapidamente cada participante.

**Critérios de Aceite**:
1. Cada linha do ranking deve exibir a foto do casal (ou placeholder com iniciais)
2. A foto deve ter tamanho consistente (40x40px na lista)
3. Ao clicar na foto, exibir versão ampliada em modal
4. Ranking deve manter o desempenho mesmo com fotos carregando (lazy loading)

**Prioridade**: Média | **Estimativa**: S | **Status**: Concluída ✅

> **Sprint 3**: Fotos dos casais exibidas no ranking com lazy loading. Clique na foto abre modal ampliado. Placeholder com iniciais quando não há foto.

---

### HU-24: Animação de evolução no ranking

**Como** líder de turma, **eu quero** ver uma animação de sobe/desce no ranking a cada nova semana preenchida, **para** visualizar a evolução das posições dos casais ao longo do tempo.

**Critérios de Aceite**:
1. Ao navegar entre as semanas, o ranking deve animar as transições de posição
2. Casais que subiram devem ter indicativo visual (seta verde + nº posições)
3. Casais que desceram devem ter indicativo visual (seta vermelha + nº posições)
4. Casais que mantiveram posição devem ter indicativo visual (traço cinza)
5. A animação deve ser suave (CSS transitions ou Framer Motion)
6. A seta/número deve aparecer ao lado da posição atual
7. Deve funcionar tanto no ranking geral quanto nos rankings por categoria

**Prioridade**: Média | **Estimativa**: L | **Status**: Backlog

---

## 🎲 EIXO 5 — VITAMINAS

---

### HU-25: Roleta animada para sortear vitaminas

**Como** líder de turma, **eu quero** uma roleta animada para sortear uma vitamina para cada pessoa do casal (vitamina dele + vitamina dela) a cada aula/semana, **para** engajar os alunos com o sorteio.

**Critérios de Aceite**:
1. Na tela da turma, adicionar botão "Girar Roleta" para cada aula/semana
2. Ao clicar, exibir roleta animada com as vitaminas configuradas da semana
3. A roleta deve sortear **uma vitamina para ele** e **uma vitamina para ela** separadamente
4. A animação deve durar entre 2-3 segundos com desaceleração natural
5. Exibir o resultado com destaque visual (confete/toast) após a roleta parar
6. O resultado do sorteio deve ser salvo automaticamente no Firestore
7. O líder pode sortear novamente se necessário (com confirmação)
8. A roleta deve ter as vitaminas da seção editável (HU-26) como opções

**Prioridade**: Alta | **Estimativa**: L | **Status**: Em Progresso 🔄

> **Sprint 4**: Roleta animada com CSS puro (cubic-bezier) + canvas-confetti. Sorteia uma vitamina para ele e uma para ela. Salva via transação Firestore em `casais.semanas[semanaId].sorteioVitaminas`.

---

### HU-26: Seção editável de vitaminas da semana

**Como** líder de turma, **eu quero** uma seção editável para gerenciar quais vitaminas estão disponíveis na roleta a cada semana, **para** adaptar os desafios conforme o andamento da turma.

**Critérios de Aceite**:
1. Na tela de detalhe da turma, adicionar seção "Vitaminas da Semana"
2. Permitir cadastrar novas vitaminas com nome e descrição
3. Permitir editar e excluir vitaminas existentes
4. A lista de vitaminas cadastradas alimenta a roleta (HU-25)
5. As vitaminas podem ser reaproveitadas entre semanas ou ser únicas por semana
6. Persistir a configuração no Firestore

**Prioridade**: Alta | **Estimativa**: M | **Status**: Em Progresso 🔄

> **Sprint 4**: Catálogo de vitaminas embutido em `turmas.vitaminas: Record<string, Vitamina>`. CRUD via `dbService` com `updateDoc` dot notation. Componente `VitaminasSection.tsx` com chips toggle de semanas ativas.

---

### HU-27: Check individual de execução das vitaminas

**Como** líder de turma, **eu quero** que cada vitamina sorteada tenha check separado para ele e para ela, **para** registrar a execução individual de cada um.

**Critérios de Aceite**:
1. Na tela de acompanhamento semanal, exibir as vitaminas sorteadas com dois checkboxes: "Ele ✅" e "Ela ✅"
2. O líder pode marcar/desmarcar cada check individualmente
3. A pontuação da vitamina deve ser contabilizada por check (0, 1 ou 2 pontos)
4. O progresso deve ser salvo em tempo real no Firestore

**Prioridade**: Alta | **Estimativa**: S | **Status**: Em Progresso 🔄

> **Sprint 4**: Checks individuais `sorteioVitaminas.ele.check` e `.ela.check` (0/1/2 pontos). Save real-time via transação. Pontuação máxima por semana muda de 4 para 5.

---

### HU-28: Aluno acessa histórico de vitaminas

**Como** aluno, **eu quero** acessar o histórico de vitaminas sorteadas para mim e ver quais já foram cumpridas, **para** acompanhar meu próprio desempenho.

**Critérios de Aceite**:
1. Criar tela/perfil do aluno com seção "Minhas Vitaminas"
2. Exibir lista das vitaminas sorteadas por semana
3. Cada item deve mostrar: semana, vitamina, status (cumprida/pendente)
4. Ordenar da mais recente para a mais antiga

**Prioridade**: Média | **Estimativa**: S | **Status**: Em Progresso 🔄

> **Sprint 4**: Histórico é projeção do documento do casal — percorre `semanas` em ordem desc. Tela `MinhasVitaminas.tsx` na rota `/aluno/:casalId/vitaminas`. Sem nova collection.

---

## ⏳ EIXO 6 — FUTURO (A ESPECIFICAR)

---

### HU-29: Login com papéis (aluno/co-líder com visões diferentes)

**Como** aluno ou co-líder, **eu quero** acessar o app com uma visão adaptada ao meu papel, **para** ver apenas as funcionalidades que me interessam.

**Critérios de Aceite**:
> *A serem especificados*

**Prioridade**: Média | **Estimativa**: XL | **Status**: Backlog ⏳

---

### HU-30: Alertas e lembretes de atividades e vitaminas

**Como** líder de turma, **eu quero** receber alertas e lembretes sobre atividades e vitaminas pendentes, **para** não esquecer de acompanhar a turma.

**Critérios de Aceite**:
> *A serem especificados*

**Prioridade**: Média | **Estimativa**: L | **Status**: Backlog ⏳

---

## 🗺️ Roadmap — Planejamento de Sprints

### Sprint 3 — Identidade Visual + Ordenação + Fotos 🎨

| HU | Descrição | Estimativa |
|----|-----------|:----------:|
| HU-21 | Ordenar turmas por data (mais recentes primeiro) | 🟢 S |
| HU-20 | Nova identidade visual (cores + logo) | 🟡 M |
| HU-22 | Foto para cada casal (upload Firebase Storage) | 🟡 M |
| HU-23 | Fotos no ranking | 🟢 S |
| **Total** | | **≈ 5 pontos** |

> **Justificativa:** HU-22 é pré-requisito da HU-23. HU-20 e HU-21 são independentes e podem rodar em paralelo.

---

### Sprint 4 — Vitamina da Semana 🎰 (EM ANDAMENTO)

| HU | Descrição | Estimativa | Status |
|----|-----------|:----------:|:------:|
| HU-26 | Seção editável de vitaminas da semana | 🟡 M | Em Progresso |
| HU-25 | Roleta animada para sortear vitaminas | 🔴 L | Em Progresso |
| HU-27 | Check individual (dele + dela) por vitamina | 🟢 S | Em Progresso |
| HU-28 | Aluno acessa histórico de vitaminas | 🟢 S | Em Progresso |
| **Total** | | **≈ 7 pontos** | |

> **Justificativa:** HU-26 é pré-requisito do catálogo da HU-25. HU-27 e HU-28 dependem do sorteio da HU-25. Execução em 2 rodadas: Rodada 1 (HU-26 + HU-25), Rodada 2 (HU-27 + HU-28). Tech Lead commita interfaces (T0) antes de despachar especialistas.

---

### Sprint 5 — Animação do Ranking 📈

| HU | Descrição | Estimativa |
|----|-----------|:----------:|
| HU-24 | Animação sobe/desce do ranking semana a semana | 🔴 L |
| **Total** | | **≈ 5 pontos** |

> **Justificativa:** História independente. Pode ser combinada com ajustes finos que surgirem dos sprints anteriores.

---

### Sprint 6+ — Futuro

| HU | Descrição | Status |
|----|-----------|:------:|
| HU-29 | Login com papéis (aluno/co-líder) | ⏳ A especificar |
| HU-30 | Alertas e lembretes de atividades/vitaminas | ⏳ A especificar |
| HU-05 | Testes automatizados | Backlog |
| HU-06 | Extrair inline styles | Backlog |
| HU-11 | Sistema de notificações real | Backlog |
| HU-12 | Completar PWA | Backlog |
| HU-13 | Notificações push | Backlog |
| HU-14 | RBAC | Backlog |
| HU-15 | Cloud Functions | Backlog |
| HU-16 | Repository Pattern | Backlog |
| HU-17 | Relatórios | Backlog |
| HU-18 | Suporte offline | Backlog |
| HU-19 | Reset de senha e registro | Backlog |

---

## 📊 Resumo

| Eixo | Total | S | M | L | XL | ⏳ | Concluídas |
|---|---|---|---|---|---|---|---|---|
| 🔴 Estabilização | 7 | 3 | 2 | 1 | 0 | 0 | **7/7 ✅** |
| 🟡 Evolução | 4 | 1 | 1 | 1 | 0 | 0 | **4/4 ✅** |
| 🔵 Identidade Visual | 1 | 0 | 1 | 0 | 0 | 0 | **1/1 ✅** |
| 🎲 Vitaminas | 4 | 2 | 1 | 1 | 0 | 0 | 0/4 |
| 🟢 Crescimento | 6 | 0 | 1 | 3 | 2 | 0 | 0/6 |
| ⏳ Futuro | 2 | 0 | 0 | 1 | 1 | 2 | 0/2 |
| **Total** | **24** | **6** | **6** | **7** | **3** | **2** | **14/24 (58%)** |

> **Sprint atual:** `sprint/4-vitaminas` (em andamento)  
> **Próximo sprint:** Sprint 5 — Animação do Ranking 📈  
> **Status dos eixos concluídos:** 🔴 Estabilização 100% | 🟡 Evolução 100% | 🔵 Identidade Visual 100%  
> **Sprint 4 em progresso:** 🎲 Vitaminas — HU-25, HU-26, HU-27, HU-28
