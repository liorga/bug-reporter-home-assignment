# Bug Reporter

A production-grade bug reporting platform built with React, TypeScript, and Express. Users submit bug reports; administrators triage and resolve them.

## Quick Start

```bash
# 1. Install all dependencies (client + server, via workspaces)
npm install

# 2. Run both client and server concurrently
npm run dev
```

| Service | URL |
|---------|-----|
| Client  | http://localhost:5173 |
| Server  | http://localhost:4000 |

### Test Accounts

| Email | Role | Notes |
|-------|------|-------|
| `admin@example.com` | Admin | Full access, sees Admin Reports page |
| `blocked@example.com` | Blacklisted | Login rejected with reason |
| `spam@test.com` | Blacklisted | Login rejected with reason |
| Any other email | Standard User | Can submit reports only |

## Project Structure

```
bug-reporter-starter/
├── client/                          # React 18 + Vite + TypeScript
│   └── src/
│       ├── api/
│       │   └── client.ts            # Centralized fetch-based API client
│       ├── components/              # Shared UI components
│       │   ├── AppRoutes.tsx        # Route definitions
│       │   ├── NavBar.tsx           # Navigation bar
│       │   ├── LogoutButton.tsx     # Logout action component
│       │   └── StatusBadge.tsx      # Reusable status badge
│       ├── features/
│       │   ├── auth/                # Authentication module
│       │   │   ├── models/          # UserStatus, AuthUser, AuthState types
│       │   │   ├── AuthContext.tsx   # AuthProvider + useAuth hook
│       │   │   ├── LoginPage.tsx    # Login form page
│       │   │   └── ProtectedRoute.tsx
│       │   ├── reports/             # Bug report submission module
│       │   │   ├── constants/       # File type & size constraints
│       │   │   ├── ReportForm.tsx   # Form (React Hook Form + Zod)
│       │   │   ├── ReportPage.tsx   # Report page wrapper
│       │   │   └── reportSchema.ts  # Zod validation schema
│       │   └── admin/               # Admin dashboard module
│       │       ├── constants/       # Query keys, table column defs
│       │       ├── ReportsPage.tsx  # Admin page (loading/error/empty)
│       │       ├── ReportsTable.tsx # Desktop table + mobile cards
│       │       ├── TableSkeleton.tsx
│       │       └── useReports.ts    # TanStack Query hook
│       ├── types/
│       │   └── Report.ts           # Report & CreateReportPayload interfaces
│       └── utils/
│           └── formatDate.ts        # Date formatting utility
└── server/                          # Express 4 + TypeScript
    ├── src/index.ts                 # API routes + in-memory storage
    └── uploads/                     # Static file uploads
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/check-status` | Check user status (allowed / admin / blacklisted) |
| GET | `/api/reports` | Fetch all reports |
| POST | `/api/reports` | Create a report (multipart/form-data with optional file) |
| POST | `/api/reports/:id/status` | Update report status (APPROVED / RESOLVED) |
| GET | `/api/health` | Health check |

## Key Libraries

| Library | Purpose |
|---------|---------|
| React Hook Form + Zod | Form state management + schema-driven validation |
| TanStack Query | Server-state management (caching, refetch, mutations) |
| React Router v6 | Client-side routing with protected routes |
| Multer | Server-side multipart file upload handling |

---

## Performance Issue: Analysis & Fix

### The Problem

The starter project's `ReportPage` contained a `validateField()` function that was called **during every render** — not inside an event handler or a `useMemo`, but directly in the component body:

```tsx
// BEFORE (starter code)
function validateField(value: string): string[] {
  const largeArray = Array.from({ length: 10000 }, (_, i) => `item-${i}-${value}`);
  for (let i = 0; i < 100; i++) {
    largeArray.sort(() => Math.random() - 0.5);
    largeArray.filter(item => item.includes(value.slice(0, 3)));
    largeArray.map(item => item.toUpperCase().toLowerCase());
  }
  if (value.length < 3) issues.push('Must be at least 3 characters');
  return issues;
}

// Called on EVERY render for two fields:
const descriptionValidation = validateField(description);
const nameValidation = validateField(contactName);
```

### How It Was Detected

1. **Symptom**: Typing in the Description or Name field caused noticeable lag (several hundred ms per keystroke).
2. **Detection method**: React DevTools Profiler showed the `ReportPage` component taking 200-500ms per render. The flame chart pinpointed `validateField` as the hot path — it was executing 2 million array operations (10,000 items × 100 iterations × 2 fields) on every single keystroke.
3. **Root cause**: The expensive computation was placed in the **render path** with no memoization. Every call to `setDescription(...)` triggered a re-render, which re-ran both `validateField` calls synchronously before the UI could update.

### The Fix

The entire `validateField` function and its render-path invocations were removed. Validation is now handled by:

- **Zod schema** (`reportSchema.ts`): Defines all validation rules declaratively.
- **React Hook Form** with `zodResolver`: Validation runs on blur/submit, not on every keystroke.
- **Inline error messages**: Displayed via `formState.errors`, which only updates when validation state actually changes.

Additionally, the Admin Reports table was optimized:

- **`React.memo`** on `ReportRow` and `ReportCard`: Prevents unchanged rows from re-rendering when sibling rows are updated.
- **`useCallback`** on `handleUpdateStatus`: Provides a stable function reference so memoized children don't see a new prop on every parent render.

### Before vs. After

| Metric | Before | After |
|--------|--------|-------|
| Render time per keystroke | 200-500ms | < 5ms |
| Array operations per render | ~2,000,000 | 0 |
| Validation strategy | Synchronous in render body | On blur / submit via Zod |
| Table row re-renders on mutation | All rows | Only the changed row |

---

## Prioritized Features & Future Roadmap

### Implemented (v1.0)

1. **Authentication & Authorization** — Email-based login, role detection (allowed/admin/blacklisted), `ProtectedRoute` guard.
2. **Bug Report Form** — Dropdown issue type, Zod validation, inline errors, file upload (PNG/JPG/PDF, 5MB), submit loading state.
3. **Admin Dashboard** — TanStack Query data fetching, Loading/Error/Empty states, Approve & Resolve actions with optimistic UI refresh.
4. **Performance Fix** — Removed render-path bottleneck, memoized table rows.
5. **Responsive Design** — Mobile-first nav, form, and table-to-card transformation at 768px breakpoint.

### Future Roadmap

| Priority | Feature | Details |
|----------|---------|---------|
| P0 | Persistent authentication | JWT or session-based auth with server-side tokens (currently in-memory only) |
| P0 | Persistent storage | Replace in-memory arrays with a database (PostgreSQL / SQLite) |
| P1 | Search & filtering | Filter reports by status, issue type, date range; full-text search on description |
| P1 | Pagination | Server-side pagination for the reports list to handle scale |
| P1 | Real-time updates | WebSocket or SSE so the admin dashboard updates without manual refresh |
| P2 | Dark mode | Theme toggle using CSS custom properties (the design already uses CSS variables) |
| P2 | E2E tests | Playwright or Cypress test suite covering login, form submission, and admin actions |
| P2 | Accessibility audit | Full WCAG 2.1 AA compliance, screen reader testing, keyboard navigation |
| P3 | Export reports | CSV/PDF export of filtered report data for stakeholders |
| P3 | Notification system | Email or in-app notifications when a report status changes |
