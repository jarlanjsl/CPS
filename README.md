# CPS - Casados Para Sempre

Sistema de gestão e acompanhamento para grupos do programa "Casados Para Sempre".

## 🚀 Funcionalidades

- **Gestão de Turmas**: Crie e gerencie turmas com datas de início
- **Acompanhamento Semanal**: Registro de presença, vitaminas e tarefas por casal
- **Ranking e Desempenho**: Visualização de pontuação geral e por categorias (Presença, Vitaminas, Tarefas)
- **Autenticação**: Login seguro via Firebase
- **Design Moderno**: Interface com glassmorphism e tema escuro
- **Alarme do Avião**: Recurso sonoro configurável para notificações

## 🛠️ Tecnologias

- React 19
- TypeScript
- Vite
- Firebase (Auth + Firestore)
- React Router DOM
- Lucide React (ícones)

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Conta no Firebase (para produção)

## ⚙️ Configuração

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o Firebase:**

   O projeto já está configurado com as variáveis de ambiente no arquivo `.env`. Se precisar usar seu próprio projeto Firebase:

   - Acesse [console.firebase.google.com](https://console.firebase.google.com)
   - Crie um novo projeto ou selecione um existente
   - Em "Configurações do Projeto", obtenha as credenciais
   - Atualize o arquivo `.env` com suas chaves:

   ```env
   VITE_FIREBASE_API_KEY=sua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
   VITE_FIREBASE_APP_ID=seu_app_id
   ```

3. **Configure a autenticação no Firebase:**
   - No console do Firebase, ative a autenticação por "Email/Senha"
   - Crie usuários manualmente ou permita cadastro

## 🚀 Como Rodar

**Desenvolvimento:**
```bash
npm run dev
```

O servidor iniciará em `http://localhost:5173`

**Build de Produção:**
```bash
npm run build
```

**Preview da Build:**
```bash
npm run preview
```

## 📱 Uso

1. **Login**: Use as credenciais configuradas no Firebase (mock padrão: `lider` / `123456`)
2. **Home**: Crie uma nova turma ou selecione uma existente
3. **Turma**: Adicione casais e gerencie as semanas
4. **Acompanhamento**: Registre presença, vitaminas e tarefas de cada casal
5. **Desempenho**: Visualize o ranking por categoria
6. **Ajustes**: Configure notificações e o "Alarme do Avião"

## 📁 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis (Layout, ProtectedRoute)
├── contexts/         # Contextos React (Auth, Sound)
├── pages/            # Páginas da aplicação
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── TurmaDetail.tsx
│   ├── Acompanhamento.tsx
│   ├── Desempenho.tsx
│   └── Ajustes.tsx
├── services/         # Serviços (Firebase, DB, Mock)
├── styles/           # Arquivos CSS
└── App.tsx           # Configuração de rotas
```

## 🔥 Firebase

O sistema utiliza Firebase para:
- Autenticação de usuários
- Armazenamento de turmas, casais e checkpoints semanais

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run lint` | Executa ESLint |
| `npm run preview` | Preview da build de produção |

## 📄 Licença

Projeto privado - Uso interno