# 🚀 NEXT PHASE — Employee Dashboard Overhaul

> **Source**: `end.txt`  
> **Created**: 2026-05-09  
> **Execution Order**: `P1 → P2 → P3 → P6 → P4 → P5 → P7`

---

## 📋 Current State Audit

| Component | Current State | Action |
|---|---|---|
| `EmployeeSidebar.jsx` | 60px fixed vertical sidebar, 6 nav icons | ❌ Remove entirely |
| `EmployeeLayout.jsx` | Wraps sidebar + content with `marginLeft: 60` | 🔄 Replace with top nav layout |
| Employee Homepage (`page.jsx`) | Stats cards + quick actions + recent designs | 🔄 Full redesign |
| Employee Orders | Static "Coming Soon" placeholder | 🆕 Build dynamic page |
| Wholesaler `OrdersClient.jsx` | Fully hardcoded/static data | 🔄 Make dynamic with real DB |
| `orders` DB table | **Does not exist** | 🆕 Create table + APIs |
| Questionnaire flow | **Does not exist** | 🆕 Build from scratch |

---

## Phase 1 — Remove Sidebar & Add Horizontal Top Nav

**Goal**: Replace the 60px vertical sidebar with a horizontal navigation bar: `Home | Catalogue | Queries | Orders`

### Modify
- `components/employee/EmployeeLayout.jsx` → Rewrite (remove sidebar, add `<EmployeeTopNav />`)
- `components/employee/EmployeeSidebar.jsx` → Delete
- `components/employee/employeeSidebar.module.css` → Delete

### Create
- `components/employee/EmployeeTopNav.jsx` — Horizontal nav (4 links + JI logo + logout)
- `components/employee/employeeTopNav.module.css` — Styling

### Specs
- Full-width sticky top bar (~56px height)
- Left: JI logo
- Center: `Home` → `/dashboard/employee` | `Catalogue` → `/dashboard/employee/wholesaler-gallery` | `Queries` → `/dashboard/employee/queries` | `Orders` → `/dashboard/employee/orders`
- Right: Employee initials avatar + logout
- Active state: underline on current route

### New layout structure:
```jsx
<div style={{ minHeight: "100vh", background: "#FAFAFA" }}>
  <EmployeeTopNav />
  <main style={{ flex: 1, width: "100%" }}>
    {children}
  </main>
</div>
```

### ✅ Test
- [ ] Sidebar is completely gone from all employee pages
- [ ] Top nav renders on every `/dashboard/employee/*` route
- [ ] Active state highlights correctly per route
- [ ] All 4 nav links work
- [ ] Logout works → redirects to login
- [ ] Full-width layout (no `marginLeft` offset)
- [ ] Mobile responsive

---

## Phase 2 — Redesign Employee Homepage

**Goal**: Random hero template image + two CTAs ("Start with Questions" / "Skip") + scrollable "Designer Collection" of randomized retailer designs.

### Modify
- `app/dashboard/employee/page.jsx` → Full rewrite

### Create
- `components/employee/EmployeeHomeClient.jsx` — Interactive homepage
- `components/employee/DesignerCollectionSection.jsx` — Randomized retailer designs grid + "View All"

### Specs

**Random Template Assignment:**
- 4 static vertical hero images (Cloudinary URLs)
- Selection per employee: `templateIndex = employee.id.charCodeAt(0) % 4`
- Same employee → same template; different employees → different templates

**Page Layout (top → bottom):**
1. **Hero Section** — Full-width template image + overlay + 2 buttons:
   - "Start with Questions" → `/dashboard/employee/questionnaire`
   - "Skip to Playground" → `/dashboard/employee/playground`
2. **Designer Collection** — Scrollable section:
   - Fetches from `retailer_designs` where `is_archived = false`
   - Randomized order per employee (seeded shuffle by `employee.id`)
   - No category grouping — everything mixed
   - "View All →" at bottom → Catalogue page with `?tab=retailer`

**Data flow:** `employee → retailer_id → retailer_designs (shuffled) → client`

### ✅ Test
- [ ] Hero section shows with template image
- [ ] Different employees see different templates
- [ ] "Start with Questions" → `/dashboard/employee/questionnaire`
- [ ] "Skip to Playground" → `/dashboard/employee/playground`
- [ ] Designer Collection shows retailer designs in random order
- [ ] Different employees see different order
- [ ] "View All" → catalogue with retailer collection filter
- [ ] Premium look and feel

---

## Phase 3 — 5-Step Questionnaire Flow

**Goal**: Multi-step radio-button questionnaire with back navigation. Answers filter the Playground results.

### Create
- `app/dashboard/employee/questionnaire/page.jsx` — Server wrapper
- `components/employee/QuestionnaireFlow.jsx` — Client multi-step form

### Questions

| # | Question | Options (single-select radio and hybrid) |
|---|---|---|
| Q1 | What's the occasion? | Wedding, Festival, Daily Wear, Gifting, Party | (single radio)
| Q2 | Select material | Gold, Silver, Diamond, Platinum, Artificial |(multiple choice)
| Q3 | What are you drawn to? | Traditional, Modern, Minimalist, Statement, Fusion | (single radio)
| Q4 | Jewel type | Necklaces, Rings, Bangles, Earrings, Pendants, **View All** (= all selected) |(multiple choice)
| Q5 | What weight? | Light (0–5g), Medium (5–15g), Heavy (15–30g), Statement (30g+) |(multiple choice)

### Specs
- `useState` for `currentStep` (0–4) and `answers` object
- Radio buttons only — one selection per question
- **Back button** on every step (except step 0) → go to previous step, answer preserved
- **Next button** → go to next step
- On final submit → navigate to:
  ```
  /dashboard/employee/playground?occasion=wedding&material=gold&style=traditional&type=necklaces&weight=light
  ```
- Progress indicator (step dots or bar)
- Cannot proceed without selecting an option

### ✅ Test
- [ ] Loads at `/dashboard/employee/questionnaire`
- [ ] Correct number of radio options per question
- [ ] Single-select only (radio behavior)
- [ ] Back button preserves previous answers
- [ ] "View All" in Q4 selects all types
- [ ] Submit navigates to playground with correct query params
- [ ] Cannot proceed without selection
- [ ] Smooth step transitions

---

## Phase 6 — Database Schema: Orders Table + APIs

> ⚠️ **Do this BEFORE Phase 4, 5, and 7.** Run SQL in Supabase Dashboard → SQL Editor.

### Create
- `ORDERS_TABLE.sql` — Full schema + RLS
- `app/api/orders/create/route.js` — POST: Employee sends request
- `app/api/orders/[id]/route.js` — PATCH: Update order status
- `app/api/orders/list/route.js` — GET: List orders by role

### Schema

```sql
CREATE TABLE public.orders (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id          UUID NOT NULL REFERENCES public.products(id),
  employee_id         UUID NOT NULL REFERENCES public.employees(id),
  retailer_id         UUID NOT NULL REFERENCES public.retailers(id),
  wholesaler_id       UUID NOT NULL REFERENCES public.wholesalers(id),
  customization_note  TEXT,
  rejection_reason    TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN (
                        'pending',
                        'accepted',
                        'rejected',
                        'in_production',
                        'packed',
                        'dispatched',
                        'received',
                        'completed'
                      )),
  created_at          TIMESTAMPTZ DEFAULT now(),
  accepted_at         TIMESTAMPTZ,
  rejected_at         TIMESTAMPTZ,
  production_at       TIMESTAMPTZ,
  packed_at           TIMESTAMPTZ,
  dispatched_at       TIMESTAMPTZ,
  received_at         TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_employee   ON public.orders(employee_id);
CREATE INDEX idx_orders_wholesaler ON public.orders(wholesaler_id);
CREATE INDEX idx_orders_retailer   ON public.orders(retailer_id);
CREATE INDEX idx_orders_status     ON public.orders(status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employees_own_orders" ON public.orders
  FOR SELECT USING (
    employee_id IN (SELECT id FROM public.employees WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "wholesalers_own_orders" ON public.orders
  FOR SELECT USING (
    wholesaler_id IN (SELECT id FROM public.wholesalers WHERE user_id = auth.uid())
  );
```

### Order Status Lifecycle

```
pending → accepted → in_production → packed → dispatched → received → completed
pending → rejected (with reason)
```

| Status | Who Changes It | Action |
|---|---|---|
| `pending` | Employee | Sends the request |
| `accepted` | Wholesaler | Accepts the order |
| `rejected` | Wholesaler | Rejects with reason |
| `in_production` | Wholesaler | Marks in production |
| `packed` | Wholesaler | Marks as packed |
| `dispatched` | Wholesaler | Marks as dispatched |
| `received` | Employee | Marks as received |
| `completed` | System | Auto-set after received |

### ✅ Test
- [ ] SQL runs without errors in Supabase
- [ ] `POST /api/orders/create` → status "pending"
- [ ] `PATCH /api/orders/[id]` → updates status through lifecycle
- [ ] `GET /api/orders/list` → filtered by logged-in user's role
- [ ] RLS: employees see only their orders
- [ ] RLS: wholesalers see only their orders
- [ ] Rejection requires `rejection_reason`
- [ ] Timestamps recorded at each transition

---

## Phase 4 — Playground Page (Filtered Products)

**Goal**: Show retailer-approved wholesaler products, filtered by questionnaire answers or unfiltered (skip).

### Create
- `app/dashboard/employee/playground/page.jsx` — Server (fetches + filters)
- `components/employee/PlaygroundClient.jsx` — Client (grid + selection)

### Specs

**Data source:** `employee → retailer_id → retailer_selections → products (is_published = true)`

**Filtering (server-side):**
- With query params (from questionnaire):
  - `occasion` → match `style` / `category`
  - `material` → match `metal_purity`
  - `type` → match `jewellery_type` / `category`
  - `weight` → filter `net_weight` by range
- Without query params (skip): show **all** retailer-approved products

**Client features:**
- Product grid (like `WholesalerGalleryClient`)
- Cards with image, title, weight
- Click → `ProductInfoModal` (already exists)
- Select items → checkmark overlay
- Floating "View Selected (N)" button → navigates to Selection Review (Phase 5)

### ✅ Test
- [ ] Loads at `/dashboard/employee/playground`
- [ ] No params (skip) → all retailer-approved products
- [ ] With params → filtered products
- [ ] Products selectable/deselectable with visual feedback
- [ ] ProductInfoModal works
- [ ] "View Selected" button appears with count
- [ ] Empty state when no matches

---

## Phase 5 — Selection Review + Send Request

**Goal**: Employee reviews selected items with full details and sends customization requests to wholesalers.

### Create
- `app/dashboard/employee/selection-review/page.jsx` — Server wrapper
- `components/employee/SelectionReviewClient.jsx` — Review cards
- `components/employee/SendRequestModal.jsx` — Customization modal

### Specs

**Review Page:**
- Selected product IDs from sessionStorage or query params
- Per-product card: image, title, category, weight, purity, availability, wholesaler
- Two buttons per card:
  - "Send Request" → opens `SendRequestModal`
  - "Chat with Us" → placeholder

**SendRequestModal:**
- Textarea for customization (e.g., "Need in 22K gold, size 7")
- Submit → `POST /api/orders/create` with `{ product_id, customization_note }`

### ✅ Test
- [ ] Shows all selected product cards with full info
- [ ] "Send Request" opens modal with textarea
- [ ] Submit creates order in DB
- [ ] Success feedback after sending
- [ ] "Chat with Us" button exists
- [ ] Multiple requests sendable for different products

---

## Phase 7 — Dynamic Orders Pages (Employee + Wholesaler)

**Goal**: Replace all static/hardcoded orders with real DB data on both sides.

### Modify
- `app/dashboard/employee/orders/page.jsx` → Full rewrite
- `components/wholesaler/orders/OrdersClient.jsx` → Full rewrite

### Create
- `components/employee/EmployeeOrdersClient.jsx` — Dynamic orders UI
- `components/employee/OrderDetailModal.jsx` — Order detail view

### Employee Orders — Tabs

| Tab | Statuses | Employee Can Do |
|---|---|---|
| **Active** | pending, accepted, in_production, packed, dispatched | Mark "Received" (when dispatched) |
| **Completed** | received, completed | View details |
| **Rejected** | rejected | View rejection reason |

**Card shows:** product image/title, status timeline, customization note, rejection reason (if rejected), "Mark as Received" button (if dispatched), timestamps

### Wholesaler Orders — Tabs

| Tab | Statuses | Wholesaler Can Do |
|---|---|---|
| **New Orders** | pending | Accept / Reject (with reason) |
| **Active Orders** | accepted, in_production, packed | Progress: In Production → Packed → Dispatched |
| **Completed** | dispatched, received, completed | View details |

**Card shows:** product image/title/SKU, employee name + store name, customization note, action buttons per status, timeline with timestamps

**Rejection Modal:** required textarea for reason → `PATCH /api/orders/[id]` with `{ status: "rejected", rejection_reason: "..." }`

### ✅ Test
- [ ] Employee orders show real DB data
- [ ] Employee tabs: Active / Completed / Rejected
- [ ] Employee can mark dispatched → "Received"
- [ ] Rejection reason shown clearly
- [ ] Wholesaler orders: real data (no more hardcoded)
- [ ] Wholesaler can accept → status = "accepted"
- [ ] Wholesaler can reject → must provide reason
- [ ] Wholesaler progresses: accepted → in_production → packed → dispatched
- [ ] Status updates visible on refresh
- [ ] After "Received" → wholesaler sees "Completed"
- [ ] Both sides: Completed/History section
- [ ] Order detail view with full timeline

---

## 📁 All New Routes

| Route | Type |
|---|---|
| `/dashboard/employee` | Redesigned homepage |
| `/dashboard/employee/questionnaire` | 5-step question flow |
| `/dashboard/employee/playground` | Product browsing + selection |
| `/dashboard/employee/selection-review` | Review before ordering |
| `/dashboard/employee/orders` | Dynamic orders |
| `/dashboard/employee/queries` | Queries (placeholder) |
| `/api/orders/create` | Create order request |
| `/api/orders/[id]` | Update order status |
| `/api/orders/list` | List orders by role |

## 📁 All New Components

| Component | Purpose |
|---|---|
| `EmployeeTopNav.jsx` | Horizontal nav bar |
| `EmployeeHomeClient.jsx` | Interactive homepage |
| `DesignerCollectionSection.jsx` | Randomized retailer designs |
| `QuestionnaireFlow.jsx` | 5-step form |
| `PlaygroundClient.jsx` | Product browsing + selection |
| `SelectionReviewClient.jsx` | Selected products review |
| `SendRequestModal.jsx` | Customization request modal |
| `EmployeeOrdersClient.jsx` | Employee orders page |
| `OrderDetailModal.jsx` | Order detail view |
