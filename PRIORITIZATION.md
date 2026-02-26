# Prioritization & Future Improvements

## Approach

I prioritized features based on three criteria:

1. **User impact** — Does this unblock a core workflow?
2. **Assignment requirements** — Is this explicitly required in the checklist?
3. **Reviewer signal** — Does this demonstrate a specific skill they evaluate on?

The assignment states: *"It is understood that you may not be able to complete every item. In such cases, your approach to prioritization is a key component of the evaluation."*

With that in mind, I focused on delivering **all required items to a production-quality standard** before touching bonus features.

---

## What I Prioritized (and Why)

### P0 — Core Functional Requirements (Implemented First)

| Feature | Reasoning |
|---------|-----------|
| **Authentication & Authorization** | Foundation for everything else. Without role detection, neither the report form nor the admin page can function correctly. |
| **Bug Report Form with Validation** | The primary user-facing feature. React Hook Form + Zod was chosen over manual validation to demonstrate modern React patterns and ensure correctness. |
| **Admin Reports Page** | Completes the second user role's workflow. TanStack Query was chosen to demonstrate server-state management with proper caching, loading states, and mutation handling. |
| **Performance Fix** | Explicitly required with documentation. I identified the `validateField` bottleneck (2M array operations per render) using the React Profiler and replaced it with schema-driven validation that runs on blur/submit instead of every keystroke. |

### P1 — Quality & Polish (Implemented Second)

| Feature | Reasoning |
|---------|-----------|
| **Loading / Error / Empty states** | The evaluation criteria explicitly lists "Loading / empty / error states" under UX Quality. Every API interaction has all three states handled. |
| **Responsive design (bonus)** | Marked as bonus, but the evaluation mentions "Clear and usable UI" and "smooth, responsive experience." The table-to-cards transformation on mobile shows CSS architecture skill. |
| **Skeleton loader** | Design doc suggested this as a "+1" bonus. Small effort, high UX impact — it replaces a spinner with a layout-preserving skeleton that reduces perceived load time. |
| **Feature-based architecture** | The evaluation includes "Readability and maintainability" and "Reasonable abstractions." I organized code into `features/auth`, `features/reports`, `features/admin` with dedicated `models/`, `constants/` subdirectories to demonstrate scalable architecture. |

### P2 — Documentation (Implemented Third)

| Feature | Reasoning |
|---------|-----------|
| **README** | Setup instructions, performance analysis (before/after), project structure, API docs, and roadmap. |
| **Stats Page approach** | Required in checklist — documented in `STATS_PAGE_APPROACH.md`. |
| **This prioritization document** | Required: "Clearly explain your decisions regarding what was prioritized and what was deferred." |

---

## What I Deferred (and Why)

| Feature | Why Deferred | Effort | Would Implement Next? |
|---------|-------------|--------|----------------------|
| ~~Screenshot capture (bonus)~~ | **Implemented.** Users can capture a screenshot directly from the report form and attach it as a PNG. Uses `html2canvas`. | ~1 hour | Done |
| **"My Reports" list for standard users** | Listed in system overview as a user responsibility, but not in the explicit requirements checklist. Would require a new page + filtered API call or client-side filtering by email. | ~2–3 hours | Yes — P0 for production |
| **Persistent authentication (JWT/sessions)** | Current in-memory auth is sufficient for the assignment scope. Real auth would require server-side sessions, token refresh, and secure cookie handling. | ~6–8 hours | P0 for production |
| **Database storage** | In-memory arrays work for demo. A real deployment needs PostgreSQL/SQLite with migrations. | ~4–6 hours | P0 for production |
| **Search & filtering on admin page** | Useful at scale but not required. The current dataset is small enough to scan visually. | ~3–4 hours | P1 for production |
| **Pagination** | Same reasoning as search — needed at scale, not for the current demo dataset. | ~2–3 hours | P1 for production |
| **E2E tests** | Would add confidence but the assignment doesn't list testing as a requirement. Manual testing covers the required flows. | ~4–6 hours | P1 for production |
| **Stats page implementation** | Assignment explicitly states "No implementation required" — only the approach document is needed. | ~7–10 hours | P1 for production |

---

## Future Roadmap

### Phase 1 — Production Foundation (Week 1–2)

| Priority | Feature | Details |
|----------|---------|---------|
| P0 | Persistent authentication | JWT tokens with HTTP-only cookies, refresh token rotation, server-side session store |
| P0 | Database integration | PostgreSQL with an ORM (Prisma or Drizzle), migration scripts, proper indexing |
| P0 | "My Reports" page | Standard users can view their submitted reports with status tracking |
| P1 | Screenshot capture | `html2canvas` integration in the report form — capture current screen and attach as PNG |

### Phase 2 — Scale & Efficiency (Week 3–4)

| Priority | Feature | Details |
|----------|---------|---------|
| P1 | Stats page | Implement the design from `STATS_PAGE_APPROACH.md` using Recharts |
| P1 | Search & filtering | Filter admin reports by status, issue type, date range; full-text search on description |
| P1 | Server-side pagination | Cursor-based pagination for the reports API to handle thousands of records |
| P1 | E2E test suite | Playwright tests covering login flows, form submission, admin actions |

### Phase 3 — User Experience (Week 5–6)

| Priority | Feature | Details |
|----------|---------|---------|
| P2 | Real-time updates | WebSocket or SSE so the admin dashboard live-updates when new reports arrive |
| P2 | Dark mode | Theme toggle using existing CSS custom properties |
| P2 | Accessibility audit | WCAG 2.1 AA compliance, screen reader testing, keyboard navigation |
| P2 | Email notifications | Notify reporters when their report status changes |

### Phase 4 — Analytics & Export (Week 7+)

| Priority | Feature | Details |
|----------|---------|---------|
| P3 | CSV/PDF export | Export filtered report data for stakeholder reporting |
| P3 | Audit log | Track who changed what and when for compliance |
| P3 | Multi-language support | i18n framework for internationalization |

---

## Recommendations Identified During Development

1. **Zod v4 compatibility** — The starter project's dependencies included Zod v4, which has a different API than v3 (e.g., `message` instead of `errorMap` on `z.enum`). Teams should pin major versions in `package.json` to avoid breaking changes.

2. **Server-side validation gap** — The server accepts any string for `issueType` and `description`. In production, the server should validate against the same constraints as the client (enum values, min lengths) to prevent malformed data from bypassing the UI.

3. **File storage** — Uploaded files are stored on the local filesystem (`uploads/`). For production, these should be stored in object storage (S3, GCS) with signed URLs for access control.

4. **API error contracts** — The current API returns ad-hoc error shapes (`{ error: string }`). A standardized error response format (e.g., RFC 7807 Problem Details) would make client-side error handling more robust and consistent.
