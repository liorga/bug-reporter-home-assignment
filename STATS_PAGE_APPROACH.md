# Stats Page — Approach & Design

## Overview

The Stats page provides administrators with a high-level view of reporting activity, helping them identify trends, spot bottlenecks in the triage pipeline, and make data-driven decisions about resource allocation.

---

## 1. Metrics to Present

### Primary KPIs (top of page — card/summary row)

| Metric | Description | Why It Matters |
|--------|-------------|----------------|
| **Total Reports** | Count of all submitted reports | Volume indicator |
| **Open Reports** | Count where `status = NEW` | Shows current backlog |
| **Avg. Resolution Time** | Mean time from `createdAt` → status `RESOLVED` | Measures team efficiency |
| **Approval Rate** | % of reports that reach `APPROVED` or `RESOLVED` | Indicates quality of incoming reports |

### Charts

| Chart | Type | X-Axis | Y-Axis | Purpose |
|-------|------|--------|--------|---------|
| **Reports Over Time** | Line / Area | Date (day/week) | Report count | Spot spikes and trends |
| **Reports by Issue Type** | Pie / Donut | — | Count per type | Understand what categories dominate |
| **Status Breakdown** | Stacked Bar | Date (week) | Count per status | Visualize pipeline flow (NEW → APPROVED → RESOLVED) |
| **Resolution Time Distribution** | Histogram | Time buckets (hours/days) | Count | Identify outliers and average turnaround |
| **Top Reporters** | Horizontal Bar | Reporter name | Report count | Identify high-volume reporters (potential spam or power users) |

### Filters

- **Date range picker** — filter all charts to a specific time window (last 7 days, 30 days, custom)
- **Issue type dropdown** — scope charts to a single category
- **Status filter** — show only reports with a given status

---

## 2. Charting Library

**Recommendation: [Recharts](https://recharts.org/)**

| Criteria | Recharts | Chart.js (via react-chartjs-2) | D3.js |
|----------|----------|-------------------------------|-------|
| React-native composable API | Yes (built on React components) | Wrapper over imperative lib | Manual DOM manipulation |
| Bundle size | ~45 KB gzipped | ~60 KB gzipped | ~75 KB gzipped |
| Built-in responsiveness | Yes | Requires config | Manual |
| Learning curve | Low | Medium | High |
| Customization | Good for standard charts | Good | Unlimited |
| TypeScript support | Full | Full | Community types |
| Active maintenance | Yes | Yes | Yes |

**Why Recharts over alternatives:**

- It's built specifically for React — every chart element is a declarative component (`<LineChart>`, `<BarChart>`, `<PieChart>`), which fits naturally into our existing component architecture.
- Out-of-the-box responsive containers (`<ResponsiveContainer>`) that adapt to parent width — consistent with our existing mobile-first responsive approach.
- Minimal configuration needed for tooltips, legends, and axes — fast to ship without sacrificing quality.
- For this use case (5–6 standard chart types), Recharts provides the right balance of simplicity and flexibility. D3 would be over-engineering, and Chart.js's imperative API fights React's declarative model.

---

## 3. Implementation Plan

### 3.1 Architecture

```
src/features/stats/
├── constants/
│   └── index.ts              # Chart colors, date range options, query keys
├── models/
│   └── index.ts              # StatsData, TimeSeriesPoint, CategoryCount types
├── hooks/
│   └── useStats.ts           # TanStack Query hook for fetching aggregated data
├── components/
│   ├── KpiCards.tsx           # Summary cards row (Total, Open, Avg Time, Rate)
│   ├── ReportsOverTimeChart.tsx
│   ├── IssueTypeChart.tsx
│   ├── StatusBreakdownChart.tsx
│   ├── ResolutionTimeChart.tsx
│   └── TopReportersChart.tsx
├── StatsPage.tsx              # Page layout composing all chart components
└── index.ts                   # Barrel export
```

### 3.2 Data Strategy

**Option A — Client-side aggregation (current backend):**
Since the backend uses in-memory storage and returns all reports via `GET /api/reports`, the stats page can reuse the existing endpoint and aggregate data client-side using `useMemo`. This works for the current scale.

**Option B — Server-side aggregation (production scale):**
Add a dedicated `GET /api/stats` endpoint that returns pre-aggregated data. This avoids transferring the full report list to the client and keeps computation on the server where it can be cached. Parameters would include `dateFrom`, `dateTo`, and optional `issueType` filter.

**Recommended approach:** Start with Option A to ship fast, then migrate to Option B when report volume exceeds a few thousand records. TanStack Query's caching makes either approach seamless to swap — only the `queryFn` changes.

### 3.3 Data Flow

```
StatsPage
  └─ useStats() hook (TanStack Query)
       ├─ queryFn: fetch reports (or /api/stats)
       ├─ select: transform raw data → chart-ready structures (useMemo)
       └─ returns: { kpis, timeSeries, byType, byStatus, resolutionTimes, topReporters }

  └─ Layout
       ├─ <KpiCards data={kpis} />
       ├─ <ReportsOverTimeChart data={timeSeries} />
       ├─ <IssueTypeChart data={byType} />
       ├─ <StatusBreakdownChart data={byStatus} />
       ├─ <ResolutionTimeChart data={resolutionTimes} />
       └─ <TopReportersChart data={topReporters} />
```

### 3.4 Responsive Behavior

- **Desktop (> 1024px):** 2-column grid for charts, KPI cards in a single row
- **Tablet (768px–1024px):** 2-column grid, KPI cards wrap to 2×2
- **Mobile (< 768px):** Single-column stack, charts take full width

### 3.5 State Management

- All chart data fetched through a single `useStats` TanStack Query hook with `staleTime: 60_000` (1 minute)
- Filter state (date range, issue type) managed via `useState` at the `StatsPage` level, passed as query parameters
- When filters change, TanStack Query automatically refetches with the new parameters

### 3.6 Routing & Access Control

```tsx
<Route
  path="/stats"
  element={
    <ProtectedRoute requiredStatus="admin">
      <StatsPage />
    </ProtectedRoute>
  }
/>
```

The Stats page would be admin-only, using the same `ProtectedRoute` component already in place.

### 3.7 Estimated Effort

| Task | Estimate |
|------|----------|
| Types, constants, query hook | 1 hour |
| KPI cards component | 1 hour |
| 5 chart components | 3–4 hours |
| Filters (date range, issue type) | 1–2 hours |
| Responsive layout & styling | 1–2 hours |
| **Total** | **7–10 hours** |
