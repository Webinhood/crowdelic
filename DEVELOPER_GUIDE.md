# Crowdelic Developer Guide
Fale apenas em português do Brasil

## Quick Start
- Project uses Docker for PostgreSQL and RedisIO
- Node.js backend with TypeScript
- React frontend with TypeScript
- Python integration (bridge) for TinyTroupe AI personas

## Backend Architecture

### Key Directories
- `/backend/src/routes/`: API endpoints
   - `test.ts`: Test management endpoints
   - `test_messages.ts`: Test message management
   - `persona.ts`: Persona management
   - `auth.ts`: Authentication endpoints
   - `costs.ts`: Usage tracking
   - `simulation.ts`: Simulation endpoints
   - `users.ts`: User management endpoints

### WebSocket (`/backend/src/websocket/`)
- Real-time updates for test progress
- Client notifications
- Uses Socket.IO
- Handles test status updates and results streaming

### Services (`/backend/src/services/`)
   - `tinytroupe_service.ts`: Manages TinyTroupe AI personas
   - `prompt_template.ts`: Formats system and user prompt
   - `tinytroupe.ts`: Runs TinyTroupe simulation
   - `cache_service.ts`: Redis caching
   - `costs_service.ts`: Tracks API usage and costs


### TinyTroupe Integration (`/backend/src/python/tinytroupe/`)
- Microsoft's AI persona framework
- Creates and manages AI personas
- Generates structured JSON feedback
- Uses gpt-4o-mini API for realistic interactions
- Python bridge via child process execution `backend/src/python/tinytroupe/bridge.py`

### Authentication
- JWT-based authentication
- Prisma ORM for user management `/backend/prisma/schema.prisma`
- Middleware in `/backend/src/middleware/auth.ts`
- Redis for session management
- Protected routes require valid JWT

## Frontend Architecture

### Key Technologies
- React 18 + TypeScript
- Chakra UI + Purity UI for components
- React Query for state management
- i18next for internationalization

### Directory Structure
- `/frontend/src/components/`: Reusable UI components
- `/frontend/src/config/`: Lazy Routes
- `/frontend/src/pages/`: Main application views
- `/frontend/src/hooks/`: Custom React hooks
- `/frontend/src/contexts/`: React context providers
- `/frontend/src/theme/`: UI theme customization
- `/frontend/src/services/`: Service integrations
- `/frontend/src/i18n/`: Internationalization
- `/frontend/src/public/`: Static assets

### Important Components
- `/frontend/src/pages/TestCreate.tsx`: Test creation
- `/frontend/src/pages/PersonaCreate.tsx`: Persona creation
- `/frontend/src/pages/PersonaList.tsx`: Persona list
- `/frontend/src/pages/PersonaEdit.tsx`: Persona editing
- `/frontend/src/pages/TestList.tsx`: Test list
- `/frontend/src/pages/TestEdit.tsx`: Test editing
- `/frontend/src/pages/TestDetail.tsx`: Test detail
- `/frontend/src/pages/Dashboard.tsx`: Dashboard
- `/frontend/src/pages/UserManagement.tsx`: User management
- `/frontend/src/pages/Login.tsx`: Login
- `/frontend/src/pages/Register.tsx`: Registration
- `/frontend/src/pages/Costs.tsx`: Usage costs
- `/frontend/src/pages/Landing.tsx`: Landing page
- `/frontend/src/components/Layout.tsx`: Main application layout
- `/frontend/src/components/PersonaForm.tsx`: Persona form
- `/frontend/src/components/TestForm.tsx`: Test form
- `/frontend/src/components/TestResponses.tsx`: Test responses
- `/frontend/src/components/TestMessage.tsx`: Test message
- `/frontend/src/components/TestAnalytics.tsx`: Test analytics

### State Management
- React Query for API data
- Context for global state
- Local state for component-specific data
- WebSocket for real-time updates

## Database Architecture

### PostgreSQL (Docker)
- Main data store
- Tables:
  - `users`: User accounts
  - `tests`: Test configurations
  - `personas`: AI persona definitions
  - `test_results`: Test execution results
  - `usage_logs`: API usage tracking

### Redis (Docker)
- Session management
- Caching
- Real-time data
- WebSocket state

## Development Workflow
1. Start Docker services:
   ```bash
   docker-compose up -d postgres redis
   ```

2. Run backend and frontend:
 ./start_dev.sh


## Testing
- Jest for unit tests
- React Testing Library for frontend
- Integration tests for API endpoints
- Test files located next to implementation

## Common Tasks
1. Creating and editing new test:
   - Frontend: `/frontend/src/pages/TestCreate.tsx` `/frontend/src/pages/TestEdit.tsx`
   - API: `/backend/src/routes/test.ts`
   - Service: `/backend/src/services/test.ts`

2. Creating and editing new personas:
   - Frontend: `/frontend/src/pages/PersonaCreate.tsx` `/frontend/src/pages/PersonaEdit.tsx`
   - API: `/backend/src/routes/persona.ts`
   - Service: `/backend/src/services/persona.ts`

3. Running a test:
   - Frontend: `/frontend/src/pages/TestDetail.tsx` and their components
   - API: `/backend/src/routes/test.ts`
   - Service: `/backend/src/services/test.ts`

4. Authentication:
   - Frontend: `/frontend/src/hooks/useAuth.ts`
   - API: `/backend/src/routes/auth.ts`
   - Middleware: `/backend/src/middleware/auth.ts`
