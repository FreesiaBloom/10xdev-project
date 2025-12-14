# Unit Testing Plan - Flashcards Application

## 🎯 Testing Strategy Overview

This document outlines comprehensive unit testing priorities for the flashcards application, focusing on **business logic**, **pure functions**, and **complex state management** rather than UI components.

## 📊 Priority Matrix

| Priority | Focus | Rationale |
|----------|--------|-----------|
| 🔥 **CRITICAL** | Services, Custom Hooks, Schemas | Core business logic, high complexity, high impact |
| 🟡 **HIGH** | Utilities, Error Handling | Shared functionality, edge cases |
| 🔵 **MEDIUM** | Component Logic | Conditional rendering, form validation |
| ⚪ **LOW** | UI Components | Better covered by integration tests |

---

## 🔥 **CRITICAL PRIORITY** - Must Test First

### 1. **Services** (`src/lib/services/`)

#### **FlashcardService** - `flashcards-service.ts`
```typescript
// Test coverage priorities:
✅ listFlashcards() - pagination logic, filtering, sorting
✅ createFlashcards() - data transformation, user_id injection
✅ updateFlashcard() - error handling, record not found
✅ deleteFlashcard() - error handling, count validation
✅ Error mapping (DatabaseError, RecordNotFoundError)
```

**Why Critical:**
- Complex business logic with pagination, filtering, sorting
- Database operations with error handling
- Data transformations affecting user data
- Used across multiple components

#### **GenerationService** - `generations-service.ts`
```typescript
// Test coverage priorities:
✅ generateHash() - crypto operations, consistency
✅ generateFlashcards() - AI integration flow, error logging
✅ saveGenerationMetadata() - data persistence
✅ Error handling and logging
✅ Response schema validation
```

**Why Critical:**
- Expensive AI operations
- Complex error handling and logging
- Hash generation for deduplication
- Integration with external services

### 2. **Custom Hooks** (`src/components/hooks/`)

#### **useFlashcards** - `useFlashcards.ts`
```typescript
// Test coverage priorities:
✅ fetchFlashcards() - API integration, error states
✅ updateFlashcard() - optimistic updates, rollback on error
✅ deleteFlashcard() - optimistic updates, rollback on error
✅ Pagination state management
✅ Error state management
✅ Loading state transitions
```

**Why Critical:**
- Complex state management with optimistic updates
- Error handling and rollback logic
- Pagination logic affecting UX
- Used in multiple components

#### **useFlashcardProposals** - `useFlashcardProposals.ts` ✅ *Already exists*
```typescript
// Current test coverage - validate completeness:
✅ setProposals() transformation and UUID generation
✅ updateProposal() state mutations
✅ deleteProposal() filtering logic
✅ Loading state management
```

### 3. **Schemas & Validation** (`src/lib/schemas.ts`)

#### **Zod Schemas**
```typescript
// Test coverage priorities:
✅ LoginSchema - email validation, password requirements
✅ RegisterSchema - password confirmation logic, cross-field validation
✅ Error message translations (Polish)
✅ Edge cases (empty strings, whitespace, special characters)
```

**Why Critical:**
- Input validation security
- User experience (error messages)
- Form behavior depends on validation

---

## 🟡 **HIGH PRIORITY** - Test Soon

### 4. **Utilities** (`src/lib/`)

#### **utils.ts**
```typescript
// Test coverage priorities:
✅ cn() function - clsx and tailwind-merge integration
✅ Edge cases with undefined/null classes
✅ Complex className combinations
```

#### **errors.ts**
```typescript
// Test coverage priorities:
✅ DatabaseError construction and properties
✅ RecordNotFoundError construction and properties
✅ Error inheritance and instanceof checks
```

### 5. **Component Logic** (Selected Components)

#### **GenerationForm** - Validation Logic Only
```typescript
// Test coverage priorities:
✅ isValid calculation (MIN_LENGTH, MAX_LENGTH)
✅ Form submission prevention when invalid
✅ Character count validation
```

#### **FlashcardProposalItem** - Edit Mode Logic
```typescript
// Test coverage priorities:
✅ Edit mode state transitions
✅ Form validation (MAX_FRONT_LENGTH, MAX_BACK_LENGTH)
✅ Save/Cancel behavior
✅ Callback invocation with correct data
```

---

## 🔵 **MEDIUM PRIORITY** - Test When Time Allows

### 6. **Auth Components Logic** (`src/components/auth/`)

Focus on form validation and state management, not UI:

#### **LoginForm**, **RegisterForm**
```typescript
// Test coverage priorities:
✅ Schema validation integration
✅ Form state management
✅ Error state handling
✅ Submission flow (without API calls)
```

### 7. **My Flashcards Components** (`src/components/my-flashcards/`)

#### **FlashcardList**, **FlashcardListItem**
```typescript
// Test coverage priorities:
✅ Conditional rendering logic
✅ Event handling (edit, delete)
✅ State propagation to parent components
```

---

## ⚪ **LOW PRIORITY** - Integration Test Instead

### 8. **UI Components** (`src/components/ui/`)
- **Rationale**: These are mostly styling wrappers
- **Better approach**: Integration tests with real usage scenarios
- **Exception**: Complex variants in `Button` component could use basic tests

### 9. **API Endpoints** (`src/pages/api/`)
- **Rationale**: Better covered by integration tests
- **Better approach**: E2E tests with real database operations

### 10. **Main Application Components**
- `ReviewForm`, `GenerationForm` (main logic)
- **Rationale**: Heavy API dependencies and side effects
- **Better approach**: Component integration tests

---

## 📁 **Recommended File Structure**

```
src/test/__tests__/
├── services/
│   ├── flashcards-service.test.ts          🔥 Critical
│   ├── generations-service.test.ts         🔥 Critical
│   └── openrouter-service.test.ts          🔥 Critical
├── hooks/
│   ├── useFlashcardProposals.test.ts      ✅ Done
│   └── useFlashcards.test.ts              🔥 Critical
├── schemas/
│   └── schemas.test.ts                    🔥 Critical
├── lib/
│   ├── utils.test.ts                      🟡 High
│   └── errors.test.ts                     🟡 High
├── components/
│   ├── GenerationForm.validation.test.tsx 🟡 High (validation only)
│   ├── FlashcardProposalItem.test.tsx     🟡 High (edit logic only)
│   └── auth/
│       ├── LoginForm.test.tsx             🔵 Medium
│       └── RegisterForm.test.tsx          🔵 Medium
└── integration/
    ├── ReviewForm.integration.test.tsx    🔵 Medium
    ├── GenerationForm.integration.test.tsx 🔵 Medium
    └── api/
        ├── flashcards.api.test.ts         🔵 Medium
        └── generations.api.test.ts        🔵 Medium
```

---

## 🛠 **Testing Guidelines**

### **Services Testing**
- **Mock Supabase client** with specific response scenarios
- **Test error conditions** (network failures, database errors)
- **Verify data transformations** and business logic
- **Test edge cases** (empty results, large datasets)

### **Hooks Testing**
- **Use @testing-library/react-hooks** for testing
- **Mock API calls** with MSW or jest mocks
- **Test state transitions** and side effects
- **Verify cleanup** and memory leaks

### **Schema Testing**
- **Test valid inputs** with various data types
- **Test invalid inputs** and error messages
- **Test edge cases** (boundary values, special characters)
- **Verify Polish error messages** are user-friendly

### **Mock Strategy**
```typescript
// Services - Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
};

// Hooks - Mock fetch with MSW
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Components - Mock child components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>
}));
```

---

## 📈 **Success Metrics**

### **Target Coverage**
- **Services**: 90%+ coverage (critical business logic)
- **Hooks**: 85%+ coverage (complex state management)
- **Schemas**: 95%+ coverage (validation is critical)
- **Utils**: 80%+ coverage (pure functions)

### **Quality Gates**
- ✅ All critical path scenarios covered
- ✅ Error conditions tested
- ✅ Edge cases identified and tested
- ✅ No flaky tests (consistent results)

---

## 🚀 **Implementation Order**

1. **Week 1**: FlashcardService + useFlashcards hook
2. **Week 2**: GenerationService + schemas validation
3. **Week 3**: useFlashcardProposals validation + utils
4. **Week 4**: Component logic tests
5. **Week 5**: Integration tests and cleanup

---

## 📝 **Notes**

- **Focus on business logic** over UI interactions
- **Mock external dependencies** (Supabase, OpenRouter)
- **Test error scenarios** as thoroughly as happy paths
- **Maintain tests** - update when business logic changes
- **Integration tests** are better for full user flows
