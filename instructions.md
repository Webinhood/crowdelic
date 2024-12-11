# Crowdelic - Technical Specification
Version: MVP
Last Updated: 6 December 2024

## To get started with Crowdelic:
Read instructions.md to understand the project and basic setup
Get familiar with TinyTroupe (read TinyTroupe_README.md) - we'll use it extensively!
Read /docs/components/components.md to understand the components and how to use them.
Read /docs/styleguide/styleguide.md to understand the style guide and how to use it.
We use Purity-UI foi UI, reference files can be consulted in /frontend/src/purity-ui

1. Para iniciar: ./start_dev.sh
2. Para parar: ./stop_dev.sh

### Important:
Understand that you are not beginning the project, you are a dev that just joined the team.
Use TypeScript for all new code
Always, ALWAYS, ask my authorization before doing anything in the code.

## Project Vision
Crowdelic is an AI-powered platform that enables teams to test products, campaigns, and ideas with diverse AI personas from TinyTroupe Microsoft open source AI personas framework. The platform simulates human interactions and feedback, providing quick, scalable, and cost-effective testing solutions.

O TinyTroupe é uma biblioteca Python experimental da Microsoft que permite:
- Criar personas AI (TinyPerson) com personalidades, interesses e objetivos específicos
- Simular interações entre essas personas em ambientes virtuais (TinyWorld)
- Usar GPT-4 para gerar comportamentos realistas

O Crowdelic essencialmente constrói uma plataforma comercial em cima do TinyTroupe, focando em casos de uso específicos como:
- Avaliação de anúncios digitais
- Testes de software
- Geração de dados sintéticos
- Gestão de produtos e projetos
- Brainstorming e grupos focais

A integração é feita através de uma camada de serviço que se comunica com o TinyTroupe via uma ponte Python, permitindo que o frontend React e o backend Node.js possam aproveitar todas as capacidades de simulação do TinyTroupe de forma organizada e escalável.

## Core Value Proposition
Replace expensive and time-consuming user testing with AI personas
Get instant feedback on products and campaigns
Scale testing capabilities without increasing costs
Access diverse perspectives through customizable personas

## Core Features

### Persona Management
Create and customize AI personas
Access pre-built persona templates
Manage persona libraries
Track persona usage and history

### Test Creation
Design test scenarios
Configure test parameters
Select relevant personas
Set success criteria

### Test Execution
Run simulated interactions
Collect structured feedback
Monitor test progress
Save and resume tests

### Results Analysis
View detailed test results
Generate insights reports
Export test data
Track performance metrics

## Business Model
Freemium SaaS with tiered pricing
Plans based on persona count and project limits
Additional personas available for purchase
Enterprise customization options

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

### Recent Updates (Phase 5)

#### Logging System (`/backend/src/utils/logger.ts`)
- Structured logging using Winston
- Rotating file logs for different severity levels
- Child loggers for component-specific logging
- Performance metrics and error tracking

#### Performance Monitoring (`/backend/src/middleware/performance.ts`)
- Request timing and performance metrics
- Request tracking with unique IDs
- Memory usage monitoring
- Error tracking middleware

#### Key Features
- JSON-formatted logs for better parsing
- Automatic log rotation and compression
- Performance metrics for all requests
- Request tracing with unique IDs
- Comprehensive error tracking

## 2. Core Services

### 2.1 Authentication Service
Standard JWT-based authentication with role management

```typescript
interface User {
  id: string;
  email: string;
  company: string;
  role: 'user' | 'admin';
  workspace_id: string;
  api_quota: number;
  created_at: Date;
}

// Endpoints
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### 2.2 Persona Management Service

```typescript
interface Persona {
  id: string;
  name: string;
  type: 'template' | 'custom';
  demographics: {
    age: number;
    gender: string;
    location: string;
    occupation: string;
    income_level: string;
  };
  personality: {
    traits: string[];
    interests: string[];
    values: string[];
  };
  tiny_troupe_config: {
    person_id: string;
    cached_state: object;
    last_updated: Date;
  };
  workspace_id: string;
  created_at: Date;
}

// Endpoints
GET /api/personas
POST /api/personas
GET /api/personas/:id
PUT /api/personas/:id
GET /api/personas/templates
```

### 2.3 Test Service

```typescript
interface Test {
  id: string;
  name: string;
  type: 'product' | 'message' | 'journey';
  status: 'draft' | 'running' | 'completed';
  config: {
    personas: string[];
    scenarios: TestScenario[];
    environment: string;
    timeout: number;
  };
  tiny_troupe_session: {
    world_id: string;
    cache_file: string;
    step_count: number;
  };
  results: TestResult[];
  workspace_id: string;
}

// Endpoints
POST /api/tests
GET /api/tests
GET /api/tests/:id/results
POST /api/tests/:id/run
```

## 3. TinyTroupe Integration

### 3.1 Core Integration Setup

```python
# config/tinytroupe.ts
import { TinyTroupe, TinyPerson, TinyWorld } from 'tinytroupe';

export const tinyTroupeConfig = {
  api_key: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
  cache_enabled: true,
  cache_dir: './cache/tinytroupe',
  logging_level: 'info'
};

export const initTinyTroupe = () => {
  return new TinyTroupe(tinyTroupeConfig);
};
```

### 3.2 Persona Factory Integration

```python
# services/personaFactory.ts
import { TinyPersonFactory } from 'tinytroupe';

export class CrowdelicPersonaFactory {
  private factory: TinyPersonFactory;
  
  constructor() {
    this.factory = new TinyPersonFactory();
  }

  async createFromTemplate(template: PersonaTemplate) {
    const prompt = this.buildPersonaPrompt(template);
    const tinyPerson = await this.factory.generate_person(prompt);
    
    return {
      ...template,
      tiny_troupe_config: {
        person_id: tinyPerson.id,
        state: tinyPerson.getState()
      }
    };
  }

  async createCustom(specs: PersonaSpecs) {
    // Similar implementation for custom personas
  }
}
```

### 3.3 Test Environment Integration

```python
# services/testEnvironment.ts
import { TinyWorld } from 'tinytroupe';

export class CrowdelicTestEnvironment {
  private world: TinyWorld;
  
  constructor(test: Test) {
    this.world = new TinyWorld(
      test.id,
      this.loadPersonas(test.config.personas)
    );
  }

  async runTest() {
    const control = require('tinytroupe/control');
    
    control.begin(`${this.test.id}.cache.json`);
    
    for (const scenario of this.test.config.scenarios) {
      await this.executeScenario(scenario);
      control.checkpoint();
    }
    
    control.end();
    return this.collectResults();
  }
}
```

## 4. API Implementation

### 4.1 Persona Creation

```typescript
// controllers/persona.controller.ts
export class PersonaController {
  private personaFactory: CrowdelicPersonaFactory;
  
  async createPersona(req: Request, res: Response) {
    try {
      const persona = await this.personaFactory.createFromTemplate(req.body);
      
      await this.personaRepository.save({
        ...persona,
        workspace_id: req.user.workspace_id
      });
      
      res.json(persona);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

### 4.2 Test Execution

```typescript
// controllers/test.controller.ts
export class TestController {
  private testEnvironment: CrowdelicTestEnvironment;
  
  async runTest(req: Request, res: Response) {
    const test = await this.testRepository.findById(req.params.id);
    
    const environment = new CrowdelicTestEnvironment(test);
    const results = await environment.runTest();
    
    await this.testRepository.updateResults(test.id, results);
    
    res.json(results);
  }
}
```

## 5. Infrastructure Requirements

### 5.1 Environment Variables
```bash
# OpenAI
OPENAI_API_KEY=

# Database
POSTGRES_URL=
REDIS_URL=

# App Config
NODE_ENV=
PORT=
JWT_SECRET=
```

### 5.2 Dependencies
```json
{
  "dependencies": {
    "tinytroupe": "^1.0.0",
    "express": "^4.17.1",
    "pg": "^8.7.1",
    "redis": "^4.0.0",
    "jsonwebtoken": "^8.5.1",
    "react-query": "^5.0.0"
  }
}
```

## 6. Development Guidelines

### 6.1 TinyTroupe Best Practices
1. Use caching for both API calls and simulation states
2. Implement proper error handling for API failures
3. Use checkpoints for long-running tests
4. Validate persona behavior before tests
5. Extract structured results after tests
6. Follow React Query v5 patterns for data fetching
7. Implement consistent loading states and error handling

### 6.2 Performance Optimization
1. Cache frequently used personas
2. Batch API calls when possible
3. Implement request queuing
4. Use Redis for session management
5. Monitor API usage and costs
6. Utilize React Query caching strategies
7. Implement proper loading states with skeleton animations

### 6.3 Error Handling
1. API rate limiting
2. Timeout management
3. Cache failures
4. Invalid persona states
5. Test execution errors
6. User-friendly error messages with clear actions
7. Navigation assistance during error states
8. Consistent error handling patterns across components

## 7. Deployment Considerations

### 7.1 Infrastructure Setup
1. Node.js environment (v16+)
2. PostgreSQL database
3. Redis cache
4. OpenAI API access
5. Monitoring tools

### 7.2 Scaling Strategy
1. Horizontal scaling for API servers
2. Cache distribution
3. Database replication
4. Queue management
5. Load balancing

## 8. Monitoring & Analytics

### 8.1 Key Metrics
1. API usage and costs
2. Test execution times
3. Cache hit rates
4. Error rates
5. User engagement

### 8.2 Logging
1. Test execution logs
2. Persona behavior logs
3. API interaction logs
4. Error tracking
5. Performance metrics

# Pricing & Plans Specification

## 1. Plan Structure

```typescript
interface Plan {
  id: PlanType;
  name: string;
  price: number;
  features: {
    max_personas: number;
    max_projects: number;
    extra_persona_cost: number;
    api_access: boolean;
    advanced_analytics: boolean;
    priority_support: boolean;
    custom_personas: boolean;
    team_members: number;
  };
}

type PlanType = 'free' | 'individual' | 'business' | 'agency' | 'enterprise';

const PRICING_PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: {
      max_personas: 20,
      max_projects: 1,
      extra_persona_cost: null, // não disponível
      api_access: false,
      advanced_analytics: false,
      priority_support: false,
      custom_personas: false,
      team_members: 1
    }
  },
  
  individual: {
    id: 'individual',
    name: 'Individual',
    price: 9.90,
    features: {
      max_personas: 100,
      max_projects: 1,
      extra_persona_cost: 0.10, // por persona
      api_access: false,
      advanced_analytics: false,
      priority_support: false,
      custom_personas: true,
      team_members: 1
    }
  },
  
  business: {
    id: 'business',
    name: 'Business',
    price: 24.90,
    features: {
      max_personas: 300,
      max_projects: 3,
      extra_persona_cost: 0.08, // por persona
      api_access: true,
      advanced_analytics: true,
      priority_support: false,
      custom_personas: true,
      team_members: 3
    }
  },
  
  agency: {
    id: 'agency',
    name: 'Agency',
    price: 49.90,
    features: {
      max_personas: 1000,
      max_projects: 10,
      extra_persona_cost: 0.05, // por persona
      api_access: true,
      advanced_analytics: true,
      priority_support: true,
      custom_personas: true,
      team_members: 10
    }
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null, // custom pricing
    features: {
      max_personas: null, // customizable
      max_projects: null, // customizable
      extra_persona_cost: 0.03, // por persona
      api_access: true,
      advanced_analytics: true,
      priority_support: true,
      custom_personas: true,
      team_members: null // customizable
    }
  }
};
```

## 2. Extra Personas Billing

```typescript
interface ExtraPersonaBilling {
  calculateExtraPersonaCost(plan: Plan, extraPersonasCount: number): number {
    if (!plan.features.extra_persona_cost) {
      throw new Error('Extra personas not available for this plan');
    }
    
    return extraPersonasCount * plan.features.extra_persona_cost;
  }
  
  async addExtraPersonas(
    workspaceId: string,
    quantity: number
  ): Promise<BillingResult> {
    const workspace = await this.getWorkspace(workspaceId);
    const plan = PRICING_PLANS[workspace.planType];
    
    const cost = this.calculateExtraPersonaCost(plan, quantity);
    
    return await this.billingService.chargeExtraPersonas({
      workspaceId,
      quantity,
      cost,
      planType: plan.id
    });
  }
}
```

## 3. Usage Monitoring

```typescript
interface UsageMonitor {
  async checkPersonaUsage(workspaceId: string): Promise<UsageMetrics> {
    const workspace = await this.getWorkspace(workspaceId);
    const plan = PRICING_PLANS[workspace.planType];
    const usage = await this.getPersonaCount(workspaceId);
    
    return {
      total_allowed: plan.features.max_personas,
      current_usage: usage,
      extra_personas: Math.max(0, usage - plan.features.max_personas),
      approaching_limit: usage >= plan.features.max_personas * 0.8
    };
  }

  async checkProjectUsage(workspaceId: string): Promise<UsageMetrics> {
    const workspace = await this.getWorkspace(workspaceId);
    const plan = PRICING_PLANS[workspace.planType];
    const usage = await this.getProjectCount(workspaceId);
    
    return {
      total_allowed: plan.features.max_projects,
      current_usage: usage,
      approaching_limit: usage >= plan.features.max_projects * 0.8
    };
  }
}
```

## 4. Plan Management

```typescript
interface PlanManager {
  async upgradePlan(
    workspaceId: string,
    newPlanType: PlanType
  ): Promise<UpgradeResult> {
    const workspace = await this.getWorkspace(workspaceId);
    const currentPlan = PRICING_PLANS[workspace.planType];
    const newPlan = PRICING_PLANS[newPlanType];
    
    // Prorated billing calculation
    const proratedAmount = this.calculateProration(
      currentPlan.price,
      newPlan.price,
      workspace.currentPeriodEnd
    );
    
    return await this.billingService.upgradePlan({
      workspaceId,
      fromPlan: currentPlan.id,
      toPlan: newPlan.id,
      amount: proratedAmount
    });
  }

  async downgradePlan(
    workspaceId: string,
    newPlanType: PlanType
  ): Promise<DowngradeResult> {
    // Verificar se o downgrade é possível baseado no uso atual
    const usage = await this.usageMonitor.getCurrentUsage(workspaceId);
    const newPlan = PRICING_PLANS[newPlanType];
    
    if (
      usage.personas > newPlan.features.max_personas ||
      usage.projects > newPlan.features.max_projects
    ) {
      throw new IncompatibleDowngradeError();
    }
    
    return await this.billingService.schedulePlanChange({
      workspaceId,
      toPlan: newPlan.id,
      effectiveDate: 'period_end'
    });
  }
}
```

## 5. Billing Alerts

```typescript
interface BillingAlerts {
  // Alertas de limite de uso
  async checkUsageLimits(workspaceId: string): Promise<void> {
    const usage = await this.usageMonitor.checkPersonaUsage(workspaceId);
    
    if (usage.approaching_limit) {
      await this.notificationService.sendApproachingLimitAlert({
        workspaceId,
        type: 'personas',
        usage: usage.current_usage,
        limit: usage.total_allowed
      });
    }
  }

  // Alertas de cobrança extra
  async notifyExtraCharges(workspaceId: string): Promise<void> {
    const extraCharges = await this.billingService.getExtraCharges(workspaceId);
    
    if (extraCharges.amount > 0) {
      await this.notificationService.sendExtraChargesAlert({
        workspaceId,
        amount: extraCharges.amount,
        details: extraCharges.breakdown
      });
    }
  }
}