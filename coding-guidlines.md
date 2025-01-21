# Cursor Rules Configuration

## Project Overview
This is a help desk system built with React, TypeScript, and Supabase. The application follows a multi-tenant architecture with real-time updates and email integration capabilities.

## File Structure

### Directory Organization
```
src/
├── components/     # Reusable UI components
├── context/       # React Context providers
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── services/      # API and external service integrations
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

### Naming Conventions
- Files: kebab-case for file names (e.g., `ticket-list.tsx`)
- Components: PascalCase for component names (e.g., `TicketList.tsx`)
- Types: PascalCase with descriptive suffixes (e.g., `TicketResponse`)
- Hooks: camelCase with 'use' prefix (e.g., `useTickets.ts`)
- Context: PascalCase with 'Context' suffix (e.g., `OrganizationContext.tsx`)
- Services: camelCase with 'service' suffix (e.g., `ticketService.ts`)

## TypeScript Configuration

### Type Definitions
```typescript
// Use explicit types for function parameters and return values
function getTicket(ticketId: string): Promise<Ticket> {
  // Implementation
}

// Define interfaces for component props
interface TicketCardProps {
  ticket: Ticket;
  onStatusChange: (status: TicketStatus) => void;
}

// Use type aliases for common patterns
type TicketStatus = 'open' | 'closed' | 'pending';
```

### Type Enforcement
- Strict mode enabled
- No implicit any
- Strict null checks
- Explicit function return types
- Generic type parameters when needed

## Component Structure

### Functional Components
```typescript
// Standard component structure
import { FC } from 'react';
import { useTickets } from '@/hooks/useTickets';
import { TicketCard } from '@/components/tickets/TicketCard';

interface TicketListProps {
  organizationId: string;
}

export const TicketList: FC<TicketListProps> = ({ organizationId }) => {
  // Implementation
};
```

### Props and State
- Use destructuring for props
- Define prop interfaces
- Use type-safe useState
- Leverage custom hooks for complex state

## Code Style

### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Supabase Integration

### Database Types
```typescript
// Generated types from Supabase
import { Database } from '@/types/supabase';
type Ticket = Database['public']['Tables']['tickets']['Row'];
```

### API Calls
```typescript
// Service pattern for Supabase calls
const ticketService = {
  async getTicket(id: string): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .select()
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

## State Management

### Context Usage
```typescript
// Context creation
export const OrganizationContext = createContext<OrganizationContextType | null>(null);

// Context provider
export const OrganizationProvider: FC<PropsWithChildren> = ({ children }) => {
  // Implementation
};

// Custom hook for context
export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};
```

## Testing

### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import { TicketList } from './TicketList';

describe('TicketList', () => {
  it('renders tickets correctly', () => {
    // Test implementation
  });
});
```

### Mock Data
```typescript
// Use factories for test data
const createMockTicket = (override?: Partial<Ticket>): Ticket => ({
  id: 'mock-id',
  title: 'Mock Ticket',
  status: 'open',
  ...override,
});
```

## Comments and Documentation

### Component Documentation
```typescript
/**
 * Displays a list of tickets for an organization
 * @param organizationId - The ID of the organization
 * @returns A list of ticket cards with sorting and filtering capabilities
 */
export const TicketList: FC<TicketListProps> = ...
```

### Function Documentation
```typescript
/**
 * Updates the status of a ticket
 * @param ticketId - The ID of the ticket to update
 * @param status - The new status
 * @throws {Error} If the ticket doesn't exist or user lacks permission
 */
async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
  // Implementation
}
```

## Performance Considerations

### React Optimizations
- Use memo for expensive computations
- Implement useMemo for complex objects
- Apply useCallback for function props
- Utilize React.lazy for code splitting

### Data Fetching
- Implement proper error boundaries
- Use loading states
- Handle race conditions
- Cache responses when appropriate