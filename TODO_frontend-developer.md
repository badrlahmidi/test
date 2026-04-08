# Frontend Developer TODO

## Context

- **Target Framework**: React 18 with Next.js 14 (App Router) + TypeScript 5
- **Design Specifications Source**: Written requirements (this document); Figma/Sketch designs to be linked per feature
- **Performance Budget**: Initial load < 200 KB gzipped; FCP < 1.8 s; TTI < 3.9 s; CLS < 0.1
- **Accessibility Requirements**: WCAG 2.1 AA — 4.5:1 contrast for normal text, 3:1 for large text and UI components; full keyboard navigation; screen-reader tested with NVDA/VoiceOver

---

## Implementation Plan

- [ ] **FE-PLAN-1.1 Project Scaffolding & Architecture**
  - **Scope**: Bootstrap project with Next.js 14 App Router, TypeScript, ESLint, Prettier, Tailwind CSS, and Storybook; establish folder structure and design-token system
  - **Components**: `_app` layout shell, root error boundary, global providers
  - **State**: Zustand store for global UI state; React Query (TanStack Query v5) for server/async state
  - **Responsive**: Mobile-first breakpoints — 320 px (xs), 640 px (sm), 768 px (md), 1024 px (lg), 1280 px (xl), 1536 px (2xl), 2560 px (3xl)

- [ ] **FE-PLAN-1.2 Design-Token & Theme System**
  - **Scope**: Define CSS custom properties for colors, spacing, typography, radii, and shadows; implement dark-mode and high-contrast themes
  - **Components**: `ThemeProvider`, CSS layer definitions (`@layer base, components, utilities`)
  - **State**: `prefers-color-scheme` media query + user toggle stored in `localStorage`
  - **Responsive**: Fluid typography with `clamp()` across all breakpoints

- [ ] **FE-PLAN-1.3 Core Layout Components**
  - **Scope**: Build reusable layout primitives: `Container`, `Grid`, `Stack`, `Sidebar`, `Header`, `Footer`
  - **Components**: `AppShell`, `NavBar`, `SideDrawer`, `PageContainer`, `ContentGrid`
  - **State**: Sidebar open/close state (Zustand slice); active route from Next.js `usePathname`
  - **Responsive**: Collapsing nav at < 768 px, sticky header, skip-navigation link

- [ ] **FE-PLAN-1.4 Common UI Component Library**
  - **Scope**: Accessible, composable primitives: `Button`, `Input`, `Select`, `Checkbox`, `Radio`, `Switch`, `Modal`, `Toast`, `Tooltip`, `Badge`, `Avatar`, `Card`, `Tabs`, `Accordion`
  - **Components**: One component file per primitive; barrel export from `src/components/ui`
  - **State**: Controlled/uncontrolled variants where applicable
  - **Responsive**: Touch-target minimum 44 × 44 px; fluid padding via `clamp()`

- [ ] **FE-PLAN-1.5 Data Fetching & State Management**
  - **Scope**: Implement React Query providers, custom hooks for CRUD operations, optimistic updates, and cache invalidation patterns
  - **Components**: `QueryClientProvider` wrapper, `useEntity` / `useEntityList` hooks
  - **State**: React Query for server state; Zustand for global UI state; `useReducer` for complex local state
  - **Responsive**: Loading skeletons at all breakpoints; offline indicator banner

- [ ] **FE-PLAN-1.6 Forms & Validation**
  - **Scope**: Implement React Hook Form with Zod schema validation; reusable `FormField`, `FormError`, `FormLabel` components
  - **Components**: `Form`, `FormField`, `FormLabel`, `FormError`, `FormHelpText`
  - **State**: React Hook Form internal state; server-error mapping
  - **Responsive**: Single-column on mobile, multi-column on ≥ 768 px

- [ ] **FE-PLAN-1.7 Performance Optimization**
  - **Scope**: Route-level code splitting, image optimization, font preloading, virtualized lists, memoization audit
  - **Components**: `LazyImage`, `VirtualList`, dynamic imports for heavy routes
  - **State**: N/A (performance layer)
  - **Responsive**: Responsive `srcset` / `sizes` for all images; `loading="lazy"` below the fold

- [ ] **FE-PLAN-1.8 Accessibility (a11y) Audit & Hardening**
  - **Scope**: ARIA roles, live regions, focus traps in modals, skip links, heading hierarchy, color-contrast audit
  - **Components**: All existing components updated with ARIA attributes and keyboard handlers
  - **State**: Focus management hooks (`useFocusTrap`, `useFocusReturn`)
  - **Responsive**: Touch gestures documented; no hover-only interactions

- [ ] **FE-PLAN-1.9 Testing Infrastructure**
  - **Scope**: Unit tests (Vitest + Testing Library), integration tests, Storybook stories, Playwright E2E smoke tests, Lighthouse CI
  - **Components**: Test files colocated as `*.test.tsx`; Storybook stories as `*.stories.tsx`
  - **State**: Mock Service Worker (MSW) for API mocking in tests
  - **Responsive**: Playwright viewport matrix for breakpoint testing

---

## Implementation Items

- [ ] **FE-ITEM-1.1 `Button` Component**
  - **Props**:
    ```ts
    interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
      size?: 'sm' | 'md' | 'lg';
      isLoading?: boolean;
      leftIcon?: React.ReactNode;
      rightIcon?: React.ReactNode;
      asChild?: boolean; // Radix UI Slot pattern
    }
    ```
  - **State**: No internal state; controlled externally
  - **Accessibility**: `role="button"`, `aria-busy` when `isLoading`, `aria-disabled` when disabled; `Enter`/`Space` key activation; visible `:focus-visible` ring
  - **Performance**: `React.memo` wrapper; no unnecessary re-renders

- [ ] **FE-ITEM-1.2 `Input` Component**
  - **Props**:
    ```ts
    interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
      label: string;
      helpText?: string;
      error?: string;
      leftAddon?: React.ReactNode;
      rightAddon?: React.ReactNode;
    }
    ```
  - **State**: Controlled via React Hook Form or `useState`
  - **Accessibility**: `<label>` with `htmlFor`; `aria-describedby` pointing to help/error text; `aria-invalid` on error
  - **Performance**: Debounce search inputs (300 ms) with `useDebounce`

- [ ] **FE-ITEM-1.3 `Modal` / `Dialog` Component**
  - **Props**:
    ```ts
    interface ModalProps {
      open: boolean;
      onClose: () => void;
      title: string;
      description?: string;
      size?: 'sm' | 'md' | 'lg' | 'fullscreen';
      children: React.ReactNode;
    }
    ```
  - **State**: `open` controlled externally; internal focus-trap state
  - **Accessibility**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`; focus trap; `Escape` closes; focus returns to trigger on close; scroll lock on body
  - **Performance**: Lazy render content when `open === false`; animate with `transform`/`opacity`

- [ ] **FE-ITEM-1.4 `NavBar` Component**
  - **Props**:
    ```ts
    interface NavBarProps {
      logo: React.ReactNode;
      links: Array<{ label: string; href: string; icon?: React.ReactNode }>;
      actions?: React.ReactNode;
    }
    ```
  - **State**: Mobile menu open state (local `useState`); active link from `usePathname`
  - **Accessibility**: `<nav aria-label="Main navigation">`; mobile toggle `aria-expanded`/`aria-controls`; active link `aria-current="page"`
  - **Performance**: `React.memo`; active route comparison memoized with `useMemo`

- [ ] **FE-ITEM-1.5 `DataTable` Component**
  - **Props**:
    ```ts
    interface DataTableProps<T> {
      columns: ColumnDef<T>[];
      data: T[];
      isLoading?: boolean;
      onRowClick?: (row: T) => void;
      pagination?: PaginationState;
      onPaginationChange?: (state: PaginationState) => void;
    }
    ```
  - **State**: TanStack Table v8 internal state; pagination lifted to parent
  - **Accessibility**: `role="grid"`, column headers with `scope="col"`, sortable columns with `aria-sort`; keyboard row navigation
  - **Performance**: `useVirtualizer` (TanStack Virtual) for rows > 100; column memoization with `useMemo`

- [ ] **FE-ITEM-1.6 `Toast` / Notification System**
  - **Props**:
    ```ts
    type ToastVariant = 'info' | 'success' | 'warning' | 'error';
    interface ToastPayload {
      id?: string;
      variant: ToastVariant;
      title: string;
      description?: string;
      duration?: number; // ms, default 5000
      action?: { label: string; onClick: () => void };
    }
    ```
  - **State**: Zustand slice `useToastStore` with `add` / `remove` actions
  - **Accessibility**: `role="status"` / `role="alert"` based on variant; `aria-live="polite"` region; dismiss button labelled `aria-label="Dismiss notification"`
  - **Performance**: Max 5 toasts rendered simultaneously; exit animation on dismiss

- [ ] **FE-ITEM-1.7 `LazyImage` Component**
  - **Props**:
    ```ts
    interface LazyImageProps {
      src: string;
      alt: string;
      width: number;
      height: number;
      priority?: boolean;
      className?: string;
    }
    ```
  - **State**: No internal state; delegates to Next.js `<Image>`
  - **Accessibility**: Meaningful `alt` text required (enforced by TypeScript); decorative images use `alt=""`
  - **Performance**: Next.js `<Image>` with `sizes` prop; AVIF/WebP formats; `placeholder="blur"` for LCP images

- [ ] **FE-ITEM-1.8 `VirtualList` Component**
  - **Props**:
    ```ts
    interface VirtualListProps<T> {
      items: T[];
      estimateSize: (index: number) => number;
      renderItem: (item: T, index: number) => React.ReactNode;
      overscan?: number;
    }
    ```
  - **State**: `useVirtualizer` from TanStack Virtual
  - **Accessibility**: `role="list"` container; each row `role="listitem"` with a unique key
  - **Performance**: Only DOM nodes for visible rows + overscan; `will-change: transform` on scroll container

- [ ] **FE-ITEM-1.9 Global Error Boundary**
  - **Props**:
    ```ts
    interface ErrorBoundaryProps {
      fallback: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
      children: React.ReactNode;
    }
    ```
  - **State**: Class component state `{ hasError: boolean; error: Error | null }`
  - **Accessibility**: Fallback UI must be keyboard accessible and clearly communicate the error to screen readers
  - **Performance**: Minimal fallback UI; optional `retry` callback to reset boundary

- [ ] **FE-ITEM-1.10 `useDebounce` Hook**
  - **Signature**: `function useDebounce<T>(value: T, delay: number): T`
  - **State**: `useState` + `useEffect` cleanup
  - **Accessibility**: N/A
  - **Performance**: Prevents excessive API calls on rapid input; pair with `useCallback` for handler stability

- [ ] **FE-ITEM-1.11 `useFocusTrap` Hook**
  - **Signature**: `function useFocusTrap(ref: React.RefObject<HTMLElement>, active: boolean): void`
  - **State**: Tracks focusable elements within the container
  - **Accessibility**: Traps `Tab`/`Shift+Tab` within modals, drawers, and dropdowns; restores focus on deactivation
  - **Performance**: Event listeners attached only when `active === true`

- [ ] **FE-ITEM-1.12 Theme & Design Tokens**
  - **Scope**: CSS custom properties in `:root` and `[data-theme="dark"]`; Tailwind config aliasing tokens; exported as TypeScript constants
  - **State**: Theme preference in `localStorage`; `ThemeProvider` reads and applies on mount
  - **Accessibility**: High-contrast mode support via `@media (prefers-contrast: more)`
  - **Performance**: No runtime JS for static tokens; CSS variables resolved by browser

---

## Proposed Code Changes

### File: `src/components/ui/button.tsx`

```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = React.memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
      { className, variant, size, isLoading, leftIcon, rightIcon, asChild = false, children, ...props },
      ref,
    ) => {
      const Comp = asChild ? Slot : 'button';
      return (
        <Comp
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          aria-busy={isLoading}
          disabled={props.disabled || isLoading}
          {...props}
        >
          {isLoading ? <span className="sr-only">Loading…</span> : null}
          {!isLoading && leftIcon}
          {children}
          {!isLoading && rightIcon}
        </Comp>
      );
    },
  ),
);
Button.displayName = 'Button';
```

### File: `src/components/ui/input.tsx`

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helpText?: string;
  error?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helpText, error, leftAddon, rightAddon, className, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const helpId = helpText ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <div className="relative flex items-center">
          {leftAddon && <span className="absolute left-3">{leftAddon}</span>}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              leftAddon && 'pl-9',
              rightAddon && 'pr-9',
              error && 'border-destructive',
              className,
            )}
            {...props}
          />
          {rightAddon && <span className="absolute right-3">{rightAddon}</span>}
        </div>
        {helpText && (
          <p id={helpId} className="text-xs text-muted-foreground">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
```

### File: `src/hooks/use-debounce.ts`

```ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

### File: `src/hooks/use-focus-trap.ts`

```ts
import { useEffect } from 'react';
import type React from 'react';

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(ref: React.RefObject<HTMLElement>, active: boolean): void {
  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [active, ref]);
}
```

### File: `src/store/toast.store.ts`

```ts
import { create } from 'zustand';

type ToastVariant = 'info' | 'success' | 'warning' | 'error';

interface ToastPayload {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastStore {
  toasts: ToastPayload[];
  add: (toast: Omit<ToastPayload, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts.slice(-4), // keep last 4 to allow room for new toast (max 5 total)
        { ...toast, id: crypto.randomUUID(), duration: toast.duration ?? 5000 },
      ],
    })),
  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
```

### File: `src/styles/tokens.css`

```css
/* Design Tokens — CSS Custom Properties */
@layer base {
  :root {
    /* Colors */
    --color-primary: 221 83% 53%;
    --color-primary-foreground: 0 0% 100%;
    --color-secondary: 210 40% 96%;
    --color-secondary-foreground: 222 47% 11%;
    --color-destructive: 0 84% 60%;
    --color-destructive-foreground: 0 0% 100%;
    --color-background: 0 0% 100%;
    --color-foreground: 222 47% 11%;
    --color-muted: 210 40% 96%;
    --color-muted-foreground: 215 16% 47%;
    --color-border: 214 32% 91%;
    --color-ring: 221 83% 53%;

    /* Typography — fluid scale */
    --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
    --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
    --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
    --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
    --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
    --text-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);

    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;
    --space-16: 4rem;

    /* Radii */
    --radius-sm: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-full: 9999px;
  }

  [data-theme='dark'] {
    --color-background: 222 47% 11%;
    --color-foreground: 210 40% 98%;
    --color-muted: 217 33% 17%;
    --color-muted-foreground: 215 20% 65%;
    --color-border: 217 33% 17%;
  }

  @media (prefers-contrast: more) {
    :root {
      --color-foreground: 0 0% 0%;
      --color-background: 0 0% 100%;
      --color-border: 0 0% 0%;
    }
  }
}
```

---

## Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type-check without emitting
npx tsc --noEmit

# Lint
npm run lint

# Run unit tests
npm run test

# Run unit tests with coverage
npm run test -- --coverage

# Build for production
npm run build

# Analyze bundle size
ANALYZE=true npm run build

# Run Storybook
npm run storybook

# Run Playwright E2E tests
npm run test:e2e

# Run Lighthouse CI audit
npx lhci autorun
```

---

## Quality Assurance Task Checklist

- [ ] All components compile without TypeScript errors (`npx tsc --noEmit` exits 0)
- [ ] Responsive design tested at 320 px, 640 px, 768 px, 1024 px, 1280 px, 1440 px, 1536 px, and 2560 px
- [ ] Keyboard navigation reaches all interactive elements (manual + Playwright test)
- [ ] Color contrast meets WCAG AA minimums verified with axe-core or Lighthouse accessibility audit
- [ ] Core Web Vitals pass Lighthouse audit with scores above 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Bundle size impact measured and within 200 KB gzipped budget (`npm run build` output)
- [ ] Cross-browser testing completed on Chrome, Firefox, Safari, and Edge
- [ ] `prefers-reduced-motion` respected — all CSS animations wrapped in `@media (prefers-reduced-motion: no-preference)`
- [ ] All form controls have associated `<label>` elements, help text, and error messages
- [ ] Error boundaries wrap every major page section and async component
- [ ] Images use `next/image` with descriptive `alt` text; decorative images use `alt=""`
- [ ] Fonts preloaded with `<link rel="preload">` and use `font-display: swap`
- [ ] No `console.error` or `console.warn` output in production builds
- [ ] Storybook stories exist for every component in the `src/components/ui` directory
- [ ] MSW handlers cover all API routes used by components in tests
- [ ] `useFocusTrap` activates in all modal, drawer, and dropdown components
- [ ] Toast notifications use `aria-live` regions and are dismissed with keyboard
- [ ] `VirtualList` used for any list rendered with more than 100 items
- [ ] Dark mode renders correctly without flash of unstyled content (FOUC)
- [ ] High-contrast mode overrides applied and visually verified
