# Crowdelic Components

## Core Components

### Layout
The main layout component that provides the application structure.

```tsx
import { Layout } from '@components/Layout';

// Features:
- Fixed navbar with blur effect
- Responsive sidebar
- Main content area with proper spacing
- Smooth page transitions
```

### Card
Reusable card component for content containers.

```tsx
import { Card } from '@components/Card';

// Usage:
<Card
  title="Optional Title"
  variant="elevated"
  isLoading={false}
>
  {children}
</Card>

// Props:
- title?: string
- variant?: 'elevated' | 'outline' | 'filled'
- isLoading?: boolean
- children: React.ReactNode
```

### TestStatusBadge
Badge component for displaying test status with animations.

```tsx
import { TestStatusBadge } from '@components/TestStatusBadge';

// Usage:
<TestStatusBadge
  status="running"
  showTooltip={true}
/>

// Props:
- status: 'running' | 'completed' | 'failed' | 'pending'
- showTooltip?: boolean

// Features:
- Status-specific animations
- Semantic colors
- Informative tooltips
```

### LoadingScreen
Full-screen loading component with animations.

```tsx
import { LoadingScreen } from '@components/LoadingScreen';

// Usage:
<LoadingScreen />

// Features:
- Centered spinner
- Pulse animation
- Color mode support
```

## Form Components

### PersonaForm
Form component for creating and editing personas.

```tsx
import { PersonaForm } from '@components/PersonaForm';

// Usage:
<PersonaForm
  initialData={persona}
  onSubmit={handleSubmit}
/>

// Props:
- initialData?: Persona
- onSubmit: (data: PersonaFormData) => Promise<void>

// Features:
- Form validation
- Loading states
- Error handling
- Success feedback
```

### TestForm
Form component for creating and editing tests.

```tsx
import { TestForm } from '@components/TestForm';

// Usage:
<TestForm
  initialData={test}
  onSubmit={handleSubmit}
/>

// Props:
- initialData?: Test
- onSubmit: (data: TestFormData) => Promise<void>

// Features:
- Multi-step form
- Progress tracking
- Validation
- Loading states
```

## Context Providers

### FeedbackContext
Global context for managing feedback and loading states.

```tsx
import { useFeedback } from '@context/FeedbackContext';

// Usage:
const { showToast, showLoading, hideLoading } = useFeedback();

// Methods:
- showToast(options: ToastOptions)
- showLoading(message?: string)
- hideLoading()
- showSuccess(title: string, description?: string)
- showError(title: string, description?: string)
```

## Utility Components

### SuspenseLoader
Wrapper component for lazy-loaded components.

```tsx
import { SuspenseLoader } from '@config/lazyRoutes';

// Usage:
<SuspenseLoader>
  <LazyComponent />
</SuspenseLoader>

// Features:
- Fallback loading screen
- Error boundary
- Smooth transitions
```

## Best Practices

1. **Component Usage**
   - Always use TypeScript for type safety
   - Follow the component API documentation
   - Handle loading and error states
   - Use proper prop types

2. **State Management**
   - Use React Query for server state
   - Use context for global state
   - Keep component state minimal

3. **Performance**
   - Lazy load when appropriate
   - Memoize expensive computations
   - Use proper key props in lists

4. **Testing**
   - Write unit tests for components
   - Test edge cases
   - Mock external dependencies
