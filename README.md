# Crowdelic - Sistema de Avaliação com IA

## Visão Geral
Crowdelic is an AI-powered platform that enables teams to test products, campaigns, and ideas with diverse AI personas from TinyTroupe Microsoft open source AI personas framework. The platform simulates human interactions and feedback, providing quick, scalable, and cost-effective testing solutions.

O TinyTroupe é uma biblioteca Python experimental da Microsoft que permite:
- Criar personas AI (TinyPerson) com personalidades, interesses e objetivos específicos
- Simular interações entre essas personas em ambientes virtuais (TinyWorld)
- Usar gpt-4o-mini para gerar comportamentos realistas e gerar avaliações em formato JSON padronizado.

**Nota**: O TinyTroupe está incluído como parte do código fonte do projeto em `/backend/src/python/tinytroupe/`. Não é necessário instalá-lo separadamente.

## To get started with Crowdelic:
Read instructions.md to understand the project and basic setup
Get familiar with TinyTroupe (read TinyTroupe_README.md) - we'll use it extensively!
Read /docs/components/components.md to understand the components and how to use them.
Read /docs/styleguide/styleguide.md to understand the style guide and how to use it.
We use Purity-UI foi UI, reference files can be consulted in /frontend/src/purity-ui

### Important:
Understand that you are not beginning the project, you are a dev that just joined the team.
Use TypeScript for all new code
Always, ALWAYS, ask my authorization before doing anything in the code.

## Requisitos do Sistema

### Requisitos Globais
- Node.js >= 18.x
- Python >= 3.10
- Docker e Docker Compose
- PostgreSQL 15 (via Docker)
- Redis 7 (via Docker)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Webinhood/crowdelic.git
cd crowdelic
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite .env com suas configurações
```

3. Inicie os serviços Docker:
```bash
docker-compose up -d postgres redis
```

4. Instale as dependências do backend:
```bash
cd backend
npm install
pip install -r requirements.txt
```

5. Instale as dependências do frontend:
```bash
cd ../frontend
npm install
```

6. Execute as migrações do banco de dados:
```bash
cd backend
npm run migrate
```

7. Inicie o projeto em modo desenvolvimento:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Principais Dependências

#### Backend
- Express.js - Framework web
- TypeScript - Linguagem de programação
- PostgreSQL - Banco de dados principal
- Redis - Cache e gerenciamento de sessão
- Socket.IO - Comunicação em tempo real
- OpenAI SDK - Integração com GPT-4
- Winston - Logging
- Jest - Testes

#### Frontend
- React 18
- TypeScript
- Chakra UI / Purity UI - Framework de UI
- React Query - Gerenciamento de estado e cache
- Socket.IO Client - Comunicação em tempo real
- i18next - Internacionalização
- Jest e Testing Library - Testes

#### Python (TinyTroupe Integration)
- TinyTroupe - Framework de personas AI
- OpenAI - SDK para GPT-4
- python-dotenv - Gerenciamento de variáveis de ambiente
- requests - Cliente HTTP

## Estrutura do Projeto

Este é um monorepo gerenciado com npm workspaces, contendo três pacotes principais:

### Frontend (`/frontend`)
- **Framework**: React 18 com TypeScript
- **UI**: 
  - Chakra UI v2.8.2 com tema personalizado Purity UI
  - @emotion/react e @emotion/styled para estilização
  - react-icons para ícones
- **Estado e Cache**: 
  - @tanstack/react-query v5.12.2
  - Formik com Yup para formulários
- **Internacionalização**: 
  - i18next v24.0.5
  - react-i18next v15.1.4
  - Suporte para pt-BR e en
- **Roteamento**: react-router-dom v6.20.1
- **Comunicação**: 
  - axios para requisições HTTP
  - socket.io-client v4.8.1 para tempo real

### Backend (`/backend`)
- **Runtime**: Node.js com TypeScript
- **API**: 
  - Express.js v4.18.2
  - cors para CORS
  - express-pino-logger para logging de requisições
- **Banco de Dados**: 
  - PostgreSQL via pg v8.11.3
  - Redis via ioredis v5.3.2
- **Autenticação**: 
  - jsonwebtoken v9.0.2
  - bcryptjs v2.4.3
- **IA**: 
  - OpenAI SDK v4.28.0
  - TinyTroupe para simulação de personas
- **Logging**: 
  - Winston v3.17.0
  - winston-daily-rotate-file v5.0.0

### Shared (`/shared`)
- Tipos e interfaces compartilhadas
- Utilitários comuns
- Configurações compartilhadas

### DevOps e Ferramentas
- **Containerização**: Docker e Docker Compose
- **Linting e Formatação**: 
  - ESLint v8.55.0
  - Prettier v3.1.0
- **Testes**: 
  - Jest v29.7.0
  - Testing Library para React
- **Build e Dev**: 
  - Vite v5.0.4 (frontend)
  - ts-node-dev (backend)
  - concurrently para executar múltiplos scripts

## Arquitetura

### Backend (Node.js + TypeScript)
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL (docker)
- **Cache**: Redis (docker)
- **Principais Serviços**:
  - `TinyTroupeService`: Gerencia interações com a OpenAI
  - `TestService`: Gerencia testes e avaliações
  - `PersonaService`: Gerencia personas para avaliação

### Frontend (React + TypeScript + Chakra UI com Purity-UI)
- Componentes principais em `/frontend/src/components`
- Páginas em `/frontend/src/pages`
- Usa WebSocket para atualizações em tempo real


## 1. System Architecture

```
crowdelic/
├── backend/
│   ├── src/
│   │   ├── config/                 # Configuration files and database setup
│   │   ├── controllers/            # Request handlers and business logic
│   │   ├── middleware/             # Express middleware (auth, logging, performance)
│   │   ├── models/                 # Database models and schemas
│   │   ├── python/                 # Python integration and TinyTroupe bridge
│   │   ├── routes/                 # API route definitions
│   │   ├── scripts/                # Utility scripts and database initialization
│   │   ├── services/               # Business logic and external service integration
│   │   ├── socket/                 # WebSocket handling
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── utils/                  # Utility functions and logging
│   │   ├── websocket/             # WebSocket server configuration
│   │   └── index.ts               # Main application entry point
│   └── .env                       # Environment variables
├── frontend/
│   ├── src/
│   │   ├── assets/                # Static assets and images
│   │   ├── components/            # Reusable React components
│   │   ├── config/                # Application configuration
│   │   ├── context/               # React context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── i18n/                  # Internationalization
│   │   ├── mocks/                 # Test mocks and fixtures
│   │   ├── pages/                 # Page components
│   │   ├── purity-ui/            # UI component library
│   │   ├── routes/               # Route definitions
│   │   ├── services/             # API service integrations
│   │   ├── styles/               # Global styles and themes
│   │   ├── theme/                # Theme configuration
│   │   ├── types/                # TypeScript type definitions
│   │   ├── utils/                # Utility functions
│   │   ├── App.tsx              # Root React component
│   │   └── main.tsx             # Application entry point
│   ├── index.html               # HTML template
│   └── tsconfig.json            # TypeScript configuration
├── logs/                        # Application logs
├── start_dev.sh                # Development startup script
└── TinyTroupe_README.md        # TinyTroupe documentation

## Autenticação e Autorização

### Configuração Inicial
1. Crie um usuário administrador:
```bash
cd backend
npm run create-admin -- --email=seu@email.com --password=suasenha
```

2. Configure as variáveis de ambiente de autenticação:
```env
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRATION=24h
```

### Níveis de Acesso
- **Admin**: Acesso total ao sistema
- **User**: Acesso às próprias personas e testes
- **Guest**: Acesso apenas a personas públicas

### Endpoints de Autenticação
- `POST /api/auth/login`: Login com email e senha
- `POST /api/auth/register`: Registro de novo usuário
- `POST /api/auth/logout`: Logout
- `GET /api/auth/me`: Informações do usuário atual

## Troubleshooting

### Problemas Comuns

1. **Erro "too many clients already"**
   ```bash
   # Limpe as conexões do PostgreSQL
   docker-compose down
   docker-compose up -d postgres redis
   ```

2. **Problemas de Autenticação**
   - Verifique se o JWT_SECRET está configurado no .env
   - Limpe os cookies do navegador
   - Verifique se o token está sendo enviado nos headers

3. **Erro de Porta em Uso**
   - O sistema tentará automaticamente usar uma porta alternativa
   - Você pode especificar uma porta manualmente no .env:
     ```env
     PORT=3001
     ```

4. **Problemas com o Redis**
   - Verifique se o Redis está rodando:
     ```bash
     docker-compose ps
     ```
   - Reinicie o Redis se necessário:
     ```bash
     docker-compose restart redis
     ```

### Logs e Debugging

1. **Backend Logs**
   ```bash
   # Ver logs em tempo real
   cd backend
   npm run logs
   ```

2. **Database Logs**
   ```bash
   # Ver logs do PostgreSQL
   docker-compose logs postgres
   ```

3. **Frontend Dev Tools**
   - Use React Developer Tools para debugging
   - Verifique o console do navegador para erros
   - Use o Network tab para verificar chamadas de API

### Manutenção

1. **Limpeza do Banco**
   ```bash
   cd backend
   npm run db:reset # Reseta o banco (cuidado: apaga todos os dados)
   ```

2. **Atualização de Dependências**
   ```bash
   npm run update-deps # Atualiza todas as dependências
   ```

## Pontos de Atenção

### 1. Integração OpenAI
- Usando modelo `gpt-4o-mini`
- Formato de resposta JSON obrigatório
- Schema da resposta:
```json
{
  "evaluation": {
    "score": number,
    "feedback": string,
    "criteria": [
      {
        "name": string,
        "score": number,
        "feedback": string
      }
    ]
  }
}
```

### 2. Banco de Dados
- Tabela `tests` tem constraint not-null em `persona_ids`
- Necessário garantir que `persona_ids` seja sempre preenchido na criação de testes

### 3. Variáveis de Ambiente
```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=crowdelic
POSTGRES_PASSWORD=crowdelic
POSTGRES_DB=crowdelic

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4o-mini
```

## Setup do Ambiente

1. **Docker**
```bash
docker-compose up -d
```

2. **Backend**
```bash
cd backend
npm install
npm run dev
```

3. **Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Próximos Passos Sugeridos

1. Implementar validação mais robusta no payload de criação de testes
2. Melhorar tratamento de erros na integração com OpenAI
3. Adicionar testes automatizados para o TinyTroupeService
4. Implementar retry mechanism para falhas na API da OpenAI

## Diretrizes de Tradução

### Estrutura de Traduções

As traduções estão localizadas em `/frontend/src/i18n/translations.ts` e seguem estas diretrizes:

1. **Organização por Namespaces**
   - Cada feature principal tem seu próprio namespace (ex: `persona`, `test`, `common`)
   - Subseções são organizadas hierarquicamente (ex: `persona.fields.name`)

2. **Convenções de Nomenclatura**
   ```typescript
   {
     "namespace": {
       "section": {
         "key": "valor"
       }
     }
   }
   ```

3. **Tipos de Chaves**
   - `.fields.*`: Para labels de campos
   - `.actions.*`: Para botões e ações
   - `.messages.*`: Para mensagens de feedback
   - `.empty.*`: Para estados vazios
   - `.units.*`: Para unidades de medida
   - `.validation.*`: Para mensagens de validação

4. **Boas Práticas**
   - Usar substantivos para campos (ex: "Nome" em vez de "Digite o nome")
   - Usar verbos no infinitivo para ações (ex: "Criar" em vez de "Criando")
   - Manter consistência nos termos técnicos
   - Evitar gírias ou regionalismos
   - Incluir contexto em comentários quando necessário

5. **Placeholders**
   - Usar chaves duplas para variáveis: `"Olá, {{name}}!"`
   - Documentar todas as variáveis usadas em comentários

### Exemplo de Estrutura

```typescript
{
  "persona": {
    "fields": {
      "name": "Nome",
      "age": "Idade",
      "occupation": "Ocupação"
    },
    "actions": {
      "create": "Criar Persona",
      "edit": "Editar",
      "delete": "Excluir"
    },
    "messages": {
      "created": "Persona criada com sucesso!",
      "deleted": "Persona excluída com sucesso!"
    },
    "validation": {
      "nameRequired": "O nome é obrigatório",
      "ageRange": "A idade deve estar entre {{min}} e {{max}} anos"
    }
  }
}
```

### Processo de Atualização

1. Adicionar novas chaves no arquivo de traduções
2. Manter as chaves em ordem alfabética dentro de cada seção
3. Documentar mudanças significativas no changelog
4. Testar todas as traduções em contexto antes do commit

### Recomendações de Uso no Código

```typescript
// Usar hook useTranslation
const { t } = useTranslation();

// Campos de formulário
t('persona.fields.name')

// Mensagens de feedback
t('persona.messages.created')

// Com variáveis
t('persona.validation.ageRange', { min: 18, max: 99 })
