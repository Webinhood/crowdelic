# Crowdelic - Sistema de Avaliação com IA

## Visão Geral
Crowdelic is an AI-powered platform that enables teams to test products, campaigns, and ideas with diverse AI personas from TinyTroupe Microsoft open source AI personas framework. The platform simulates human interactions and feedback, providing quick, scalable, and cost-effective testing solutions.

O TinyTroupe é uma biblioteca Python experimental da Microsoft que permite:
- Criar personas AI (TinyPerson) com personalidades, interesses e objetivos específicos
- Simular interações entre essas personas em ambientes virtuais (TinyWorld)
- Usar gpt-4o-mini para gerar comportamentos realistas e gerar avaliações em formato JSON padronizado.

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

## Problemas Conhecidos e Soluções

1. **Erro 400 no formato JSON da OpenAI**
   - Garantir que o `response_format` esteja correto
   - Usar `{ type: "json_object" }` para o modelo mini

2. **Erro de persona_ids nulo**
   - Verificar se os IDs das personas estão sendo passados corretamente no frontend
   - Validar payload antes de salvar no banco

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
