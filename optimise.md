# Dashboard Performance Optimization Plan (Wholesaler + Retailer)

This plan is designed to improve route navigation speed **without breaking existing API contracts or business logic**.

## 1) Current architecture (what is slowing navigation)

### Wholesaler side
- `app/dashboard/wholesaler/layout.jsx` renders a client `Sidebar` for all wholesaler routes.
- Key routes:
  - `add-product/page.jsx` -> heavy client form (`components/product/AddProductForm.jsx`)
  - `catalogue/page.jsx` -> server fetch + client `CatalogueClient` (filters/pagination)
  - `queries/page.jsx` -> server fetch conversations + client chat UI
  - `add-retailer/page.jsx` -> server fetch wholesaler + referral links
  - `page.jsx` (dashboard home) -> auth + profile read + write (`has_visited_dashboard`) before render

### Retailer side
- `app/dashboard/retailer/layout.jsx` fetches retailer info server-side and always mounts `AddEmployeeModal`.
- Key routes:
  - `page.jsx` -> many sequential DB calls (counts + recent employees)
  - `employees/page.jsx` -> client fetch `/api/employees/list`
  - `catalogue/page.jsx` -> client fetch `/api/designs/list`
  - `catalogue/upload/page.jsx` -> large client form and image preview logic

### Shared chat path
- `app/dashboard/*/messages|queries` + `components/chat/*` + `lib/hooks/useRealtimeMessages.js`
- Current flow does initial HTTP fetch + realtime subscription; this is fine functionally but can be optimized for render cost.

---

## 2) React hook audit and performance hotspots

| File | Hooks used | Hotspot | Safe improvement |
|---|---|---|---|
| `components/wholesaler/catalogue/CatalogueClient.jsx` | `useState`, `useEffect`, `useCallback`, `useRef`, `useTransition`, `useMemo` | `fetchProducts()` then `router.replace()` on every filter/page can trigger extra route work | Keep API fetch, but update URL with `window.history.replaceState` (or debounce router updates) so UI changes do not force extra server round-trips |
| `components/wholesaler/catalogue/CatalogueGrid.jsx` | `useState` | many card re-renders on state changes | Split card into memoized component (`React.memo`) + stable callbacks |
| `app/dashboard/retailer/employees/page.jsx` | `useState`, `useEffect`, `useRef` | no cancellation/race protection in fetch | Add `AbortController`; ignore stale responses |
| `components/retailer/EmployeeTable.jsx` | `useState` | filtering runs every render | Use `useMemo` for filtered list + `useDeferredValue` for search input |
| `app/dashboard/retailer/catalogue/page.jsx` | `useState`, `useEffect`, `useCallback`, `useRef`, `useMemo` | full data refetch patterns; no request cancellation | Add `AbortController`; keep optimistic updates but prevent stale overwrite |
| `components/retailer/AddEmployeeModal.jsx` | `useState`, `useEffect` | always bundled because mounted in layout | Lazy load modal only when `?modal=add-employee` is present |
| `lib/hooks/useRealtimeMessages.js` | `useEffect`, `useState`, `useRef` | fetch + subscribe per conversation is okay, but no request abort | Abort in-flight GET when conversation changes quickly |
| `components/product/ImageUpload.jsx` | `useRef`, `useState` | object URLs not revoked | Revoke old URL on replace/remove/unmount |
| `app/dashboard/retailer/catalogue/upload/page.jsx` | many `useState` | multiple object URLs not revoked | Revoke preview URLs on remove and unmount |

---

## 3) Step-by-step implementation plan (safe, non-breaking)

## Step 1 — Add loading states for perceived speed (quick win)
1. Add `loading.jsx` files for:
   - `app/dashboard/wholesaler/loading.jsx`
   - `app/dashboard/wholesaler/catalogue/loading.jsx`
   - `app/dashboard/retailer/loading.jsx`
   - `app/dashboard/retailer/employees/loading.jsx`
   - `app/dashboard/retailer/catalogue/loading.jsx`
2. Keep skeletons lightweight and static.

**Why:** navigation feels instant even while data loads.

## Step 2 — Stop unnecessary route re-fetch loops in wholesaler catalogue
1. In `CatalogueClient.jsx`, keep API fetch as source of truth.
2. Replace aggressive `router.replace()` calls after every filter/page update with URL updates that do not trigger expensive server route refresh for every click.
3. Optionally debounce URL sync (150–250ms) while user is actively filtering.

**Why:** removes duplicate work and reduces route transition delay.

## Step 3 — Parallelize server queries (same output, faster response)
1. `app/dashboard/retailer/page.jsx`: keep current query logic but run independent count queries in `Promise.all`.
2. `app/dashboard/wholesaler/catalogue/page.jsx`: fetch product page + wholesaler name in parallel.
3. `app/dashboard/wholesaler/page.jsx`: do not block first paint on `has_visited_dashboard` update.

**Why:** fewer sequential DB round-trips.

## Step 4 — Reduce repeated auth fetches across nested layouts/pages
1. Reuse `getAuthUser()` from `lib/supabase/queries.js` in dashboard pages/layouts where possible.
2. Avoid repeated `supabase.auth.getUser()` in both layout and page when same render path already has user.

**Why:** cuts duplicate auth network overhead in route transitions.

## Step 5 — Lazy-load heavy modal UI
1. In `app/dashboard/retailer/layout.jsx`, dynamically import `AddEmployeeModal` (`next/dynamic`).
2. Only render the modal component when query param indicates it is needed.

**Why:** smaller initial JS for every retailer route.

## Step 6 — Hook-level render optimizations
1. `EmployeeTable.jsx`: `useMemo` for `filteredEmployees`; `useDeferredValue(search)`.
2. `CatalogueGrid.jsx` and retailer cards: memoize card components.
3. Pass stable callbacks (`useCallback`) to large lists when handlers are passed deep.

**Why:** fewer avoidable rerenders under interaction.

## Step 7 — Add fetch cancellation to client pages
1. Add `AbortController` in:
   - `app/dashboard/retailer/employees/page.jsx`
   - `app/dashboard/retailer/catalogue/page.jsx`
   - `lib/hooks/useRealtimeMessages.js` (initial fetch)
2. Ignore aborted errors cleanly.

**Why:** prevents stale/late responses from degrading UX during fast navigation.

## Step 8 — Fix object URL memory leaks
1. Revoke URLs in `components/product/ImageUpload.jsx`.
2. Revoke all preview URLs in `app/dashboard/retailer/catalogue/upload/page.jsx` on remove/unmount.

**Why:** prevents memory growth and gradual slowdown.

## Step 9 — Trim API payloads (keep same response shape)
1. `app/api/employees/list/route.js`: replace `select("*")` with only required columns.
2. `app/api/designs/list/route.js`: push category filter into DB query instead of in-memory filtering.
3. Preserve current response keys so frontend does not break.

**Why:** lower response size and faster processing.

## Step 10 — Improve DB query efficiency used by dashboards
1. Add/verify indexes used by current filters:
   - `products(wholesaler_id, created_at desc)`
   - `products(wholesaler_id, jewellery_type)`
   - `retailer_designs(retailer_id, created_at desc, is_archived)`
   - `employees(retailer_id, created_at desc, status)`
2. Keep query semantics unchanged.

**Why:** faster backend response under real data volume.

## Step 11 — Reduce unnecessary client boundaries
1. Remove `"use client"` where not needed (example: `components/retailer/DashboardStats.jsx`).
2. Keep interactive components client-only, keep display components server.

**Why:** smaller JS bundle and faster hydration.

## Step 12 — Optional high-impact upgrade path (still API-safe)
1. Introduce SWR/React Query for `employees` and `retailer catalogue` pages.
2. Use shared cache keys for route revisits so data appears instantly.
3. Keep existing API endpoints exactly the same.

**Why:** major improvement in revisit speed and perceived responsiveness.

---

## 4) Suggested rollout order (do this exactly in order)

1. Steps 1, 3, 4 (fastest wins, low risk)  
2. Steps 2, 5, 6, 7 (route + hook optimizations)  
3. Steps 8, 9, 10, 11 (stability + backend efficiency)  
4. Step 12 (optional caching enhancement)

---

## 5) Non-breaking guardrails (important)

- Do **not** rename API endpoints or response keys.
- Keep request payload formats unchanged for:
  - `/api/catalogue/products`
  - `/api/designs/list`
  - `/api/employees/list`
  - `/api/chat/*`
- Maintain existing auth/role checks.
- Make performance changes in small commits so regressions are easy to isolate.