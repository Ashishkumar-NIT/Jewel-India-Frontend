# 🚀 Jewel India — Retailer & Employee Expansion Plan

> **Status**: Planning Phase  
> **Baseline**: Wholesaler flow complete (auth → onboard → verification → dashboard → product upload with AI pipeline)  
> **Goal**: Add Retailer onboarding (via wholesaler referral), Retailer admin dashboard (employees + raw design upload), Employee dashboard (view designs + chat with wholesalers)

---

## 📐 Current Architecture Snapshot

Before building, here's what already exists and what we'll extend:

### Existing Database Tables
| Table | Purpose |
|---|---|
| `profiles` | Stores `id`, `email`, `role` (`wholesaler` \| `retailer`) for every auth user |
| `products` | Wholesaler products with AI-processed images (pipeline-generated) |
| `wholesalers` | Wholesaler onboarding data + `verification_status` |

### Existing Auth Flow
```
Entry Page (/entry_page/signup)
  → check-user API → OTP/password → sign in/up
  → role selection (/select-role) — only for Google OAuth users without role
  → onboarding (/onboard — 3 steps)
  → verification pending (/onboard/submitted)
  → wholesaler dashboard (/dashboard/wholesaler)
```

### Existing Supabase Clients
| Client | File | Usage |
|---|---|---|
| Browser client | `lib/supabase/client.js` | Client components, OAuth |
| Server client | `lib/supabase/server.js` | Server components, server actions (React.cache wrapped) |
| Admin client | `lib/supabase/admin.js` | API routes needing service-role access (bypasses RLS) |

### Existing Middleware (`lib/supabase/middleware.js`)
- Protects `/dashboard` — requires auth + role + verification
- Routes wholesalers away from homepage
- Handles auth page redirects for logged-in users

### Existing API Routes
| Route | Purpose |
|---|---|
| `POST /api/onboard/submit` | Uploads wholesaler docs to storage, upserts into `wholesalers` table |
| `PATCH /api/admin/update-status` | Admin updates `verification_status` on `wholesalers` table |
| `GET /api/admin/wholesalers` | Lists all wholesalers for admin panel |
| `POST /api/auth/check-user` | Checks if email/phone exists in Supabase auth |
| `POST /api/auth/send-otp` | Sends OTP for new user signup |
| `POST /api/auth/verify-otp` | Verifies OTP code |
| `POST /api/auth/set-password` | Sets password after OTP verification |

---

## 🏗️ Execution Plan — 9 Phases

We proceed phase-by-phase, validating each before moving to the next. No phase depends on a later phase.

---

## Phase 1: Database Schema & Supabase Infrastructure

> **Goal**: Create all new tables, storage buckets, and RLS policies before writing any frontend code.

### 1.1 — Create `retailers` Table

Mirrors the `wholesalers` table structure with retailer-specific fields.

```sql
CREATE TABLE IF NOT EXISTS public.retailers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT,
  full_name             TEXT,
  aadhar_number         TEXT,
  business_name         TEXT,
  state                 TEXT,
  city                  TEXT,
  aadhaar_front_url     TEXT,
  aadhaar_back_url      TEXT,
  pan_card_url          TEXT,
  gst_certificate_url   TEXT,
  business_logo_url     TEXT,
  referred_by           UUID REFERENCES public.wholesalers(id),
  referral_code         TEXT,
  verification_status   TEXT DEFAULT 'pending' CHECK (
    verification_status IN ('pending','verified','rejected','on_hold','resubmission_required','banned')
  ),
  rejection_reason      TEXT,
  rejected_documents    TEXT[] DEFAULT '{}',
  admin_notes           TEXT,
  notification_message  TEXT,
  notified              BOOLEAN DEFAULT false,
  has_visited_dashboard BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own retailer record"
  ON retailers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own retailer record"
  ON retailers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own retailer record"
  ON retailers FOR UPDATE USING (auth.uid() = user_id);
```

### 1.2 — Create `referral_links` Table

```sql
CREATE TABLE IF NOT EXISTS public.referral_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_id   UUID NOT NULL REFERENCES public.wholesalers(id) ON DELETE CASCADE,
  code            TEXT NOT NULL UNIQUE,
  uses_count      INT DEFAULT 0,
  max_uses        INT DEFAULT NULL,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wholesalers can view own referral links"
  ON referral_links FOR SELECT USING (
    wholesaler_id IN (SELECT id FROM wholesalers WHERE user_id = auth.uid())
  );
CREATE POLICY "Wholesalers can create own referral links"
  ON referral_links FOR INSERT WITH CHECK (
    wholesaler_id IN (SELECT id FROM wholesalers WHERE user_id = auth.uid())
  );
CREATE POLICY "Anyone can validate referral links"
  ON referral_links FOR SELECT USING (true);
```

### 1.3 — Create `employees` Table

```sql
CREATE TABLE IF NOT EXISTS public.employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  retailer_id     UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  password_plain  TEXT NOT NULL,
  designation     TEXT DEFAULT 'Sales Associate',
  phone           TEXT,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  last_active_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Retailers can manage employees in their own store
CREATE POLICY "Retailers can view own employees"
  ON employees FOR SELECT USING (
    retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid())
  );
CREATE POLICY "Retailers can insert own employees"
  ON employees FOR INSERT WITH CHECK (
    retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid())
  );
CREATE POLICY "Retailers can update own employees"
  ON employees FOR UPDATE USING (
    retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid())
  );
CREATE POLICY "Retailers can delete own employees"
  ON employees FOR DELETE USING (
    retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid())
  );
-- Employees can view their own record
CREATE POLICY "Employees can view self"
  ON employees FOR SELECT USING (auth_user_id = auth.uid());
```

> **Note on `password_plain`**: We store the plaintext password so the retailer admin can display it to employees who forget their credentials. The actual auth password is separately managed by Supabase Auth. This is a deliberate design choice for this B2B internal tool — employees are created *by* the admin, not self-registered.

### 1.4 — Create `retailer_designs` Table

```sql
CREATE TABLE IF NOT EXISTS public.retailer_designs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id     UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  image_url       TEXT NOT NULL,
  title           TEXT,
  category        TEXT,
  tags            TEXT[] DEFAULT '{}',
  is_archived     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.retailer_designs ENABLE ROW LEVEL SECURITY;

-- Retailers see only their own designs
CREATE POLICY "Retailers can view own designs"
  ON retailer_designs FOR SELECT USING (
    retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid())
  );
CREATE POLICY "Retailers can insert own designs"
  ON retailer_designs FOR INSERT WITH CHECK (
    retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid())
  );
CREATE POLICY "Retailers can update own designs"
  ON retailer_designs FOR UPDATE USING (
    retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid())
  );
CREATE POLICY "Retailers can delete own designs"
  ON retailer_designs FOR DELETE USING (
    retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid())
  );

-- Employees can view designs from their parent retailer
CREATE POLICY "Employees can view parent retailer designs"
  ON retailer_designs FOR SELECT USING (
    retailer_id IN (
      SELECT retailer_id FROM employees WHERE auth_user_id = auth.uid()
    )
  );
```

### 1.5 — Create `conversations` & `messages` Tables

```sql
CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  wholesaler_id   UUID NOT NULL REFERENCES public.wholesalers(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, wholesaler_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own conversations"
  ON conversations FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "Wholesalers can view own conversations"
  ON conversations FOR SELECT USING (
    wholesaler_id IN (SELECT id FROM wholesalers WHERE user_id = auth.uid())
  );
CREATE POLICY "Employees can create conversations"
  ON conversations FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type     TEXT NOT NULL CHECK (sender_type IN ('employee','wholesaler')),
  sender_id       UUID NOT NULL,
  content         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Participants can view messages in their conversations
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
        OR wholesaler_id IN (SELECT id FROM wholesalers WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
        OR wholesaler_id IN (SELECT id FROM wholesalers WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "Participants can mark messages read"
  ON messages FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
        OR wholesaler_id IN (SELECT id FROM wholesalers WHERE user_id = auth.uid())
    )
  );

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_conversations_employee ON public.conversations(employee_id);
CREATE INDEX idx_conversations_wholesaler ON public.conversations(wholesaler_id);
```

### 1.6 — Create Storage Bucket

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('retailer-designs', 'retailer-designs', true)
ON CONFLICT DO NOTHING;
```

### 1.7 — Update `profiles` Role Constraint

```sql
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('wholesaler', 'retailer', 'employee'));
```

### ✅ Phase 1 Checklist
- [ ] All 6 tables created
- [ ] RLS enabled on all tables
- [ ] All policies created
- [ ] Storage bucket `retailer-designs` created
- [ ] `profiles` constraint updated
- [ ] Enable Realtime on `messages` table in Supabase dashboard

---

## Phase 2: Referral Link System

> **Goal**: Wholesaler generates a shareable link. New user visits it → enters retailer signup flow.

### 2.1 — Files to Create

| File | Purpose |
|---|---|
| `app/api/referral/generate/route.js` | POST — generate referral code + insert into `referral_links` |
| `app/api/referral/validate/route.js` | GET — validate code, return wholesaler info |
| `app/join/[code]/page.jsx` | Referral landing page (server component) |
| `app/dashboard/wholesaler/add-retailer/page.jsx` | Wholesaler UI to manage referral links |
| `components/wholesaler/referral/ReferralManager.jsx` | Client component for generating + listing links |

### 2.2 — Referral Code Format

```
{BusinessInitials}-{random6chars}
Example: "PJ-a8k3x2" (Pine Jewels)
```

### 2.3 — Referral Landing Page Flow

```
/join/PJ-a8k3x2
  → Server validates code → shows wholesaler name as referrer
  → "Get Started" button → /entry_page/signup?ref=PJ-a8k3x2&role=retailer
  → sessionStorage stores ref code for later
```

### ✅ Phase 2 Checklist
- [ ] Wholesaler can generate referral link
- [ ] Link copies to clipboard
- [ ] Landing page validates code and shows referrer name
- [ ] "Get Started" routes to signup with `?ref=` and `?role=retailer`

---

## Phase 3: Retailer Onboarding Flow

> **Goal**: 3-step onboarding (mirrors wholesaler), submits to `retailers` table, enters verification queue.

### 3.1 — Files to Create

| File | Purpose |
|---|---|
| `context/RetailerOnboardContext.jsx` | State management for 3-step form (mirrors `OnboardContext.jsx`) |
| `app/onboard-retailer/layout.jsx` | Wraps children in `RetailerOnboardProvider` |
| `app/onboard-retailer/page.jsx` | Step 1 — Identity (name, Aadhaar, Aadhaar images) |
| `app/onboard-retailer/step2/page.jsx` | Step 2 — Business (store name, state, city, logo) |
| `app/onboard-retailer/step3/page.jsx` | Step 3 — Documents (PAN, GST) |
| `app/onboard-retailer/submitted/page.jsx` | Verification pending page |
| `app/api/onboard-retailer/submit/route.js` | POST — uploads docs, upserts into `retailers` table |

### 3.2 — Reuse Existing Components

These components are role-agnostic and can be reused directly:
- `components/onboard/OnboardLayout.jsx` — Page layout with heading + left panel
- `components/onboard/StepIndicator.jsx` — Step progress indicator
- `components/onboard/ImageUploadBox.jsx` — File upload UI
- `components/onboard/OnboardNavbar.jsx` — Top navigation
- `components/onboard/submitted/VerificationTimeline.jsx` — Status timeline (status-driven)
- `components/onboard/submitted/SubmittedFooter.jsx` — Action button

### 3.3 — Create Retailer-Specific Step Components

Under `components/onboard-retailer/`:
- `step1/RetailerStep1Container.jsx` — Uses `RetailerOnboardContext`
- `step1/RetailerIdentityForm.jsx`
- `step1/RetailerStep1Footer.jsx`
- `step2/RetailerStep2Container.jsx`
- `step2/RetailerBusinessForm.jsx`
- `step2/RetailerStep2Footer.jsx`
- `step3/RetailerStep3Container.jsx`
- `step3/RetailerDocUpload.jsx`
- `step3/RetailerStep3Footer.jsx` — Submits to `/api/onboard-retailer/submit`

### 3.4 — Modify Auth Flow for Retailer

**Files to modify:**
| File | Change |
|---|---|
| `components/auth/EntryForm.jsx` | Read `?ref=` and `?role=retailer` from URL, pass through sessionStorage |
| `app/api/auth/set-password/route.js` | Accept + store `role` param, set `role: 'retailer'` in metadata |
| `app/auth/callback/route.js` | Handle `role === 'retailer'` in OAuth callback (if applicable) |
| `components/auth/OtpForm.jsx` | Pass role param through to set-password step |
| `components/auth/SetPasswordForm.jsx` | Include role in signup call |

### 3.5 — Extend Admin API

**File to modify**: `app/api/admin/update-status/route.ts`

Add `type` field to request body:
```typescript
const { id, type = 'wholesaler', verification_status, ... } = body;
const table = type === 'retailer' ? 'retailers' : 'wholesalers';
// Update the correct table
```

**File to create**: `app/api/admin/retailers/route.ts`
```typescript
// GET /api/admin/retailers — list all retailers for admin panel
```

### ✅ Phase 3 Checklist
- [ ] Retailer can complete 3-step onboarding
- [ ] Documents upload to existing storage buckets
- [ ] `retailers` row created with `verification_status: 'pending'` and `referred_by` set
- [ ] Verification pending page works (reused timeline component)
- [ ] Admin can verify/reject retailer
- [ ] Verified retailer proceeds to dashboard

---

## Phase 4: Middleware & Routing Updates

> **Goal**: Route retailer and employee roles correctly. Prevent cross-role access.

### 4.1 — Middleware Changes (`lib/supabase/middleware.js`)

Add these routing blocks:

```javascript
// ── Retailer dashboard protection ──
if (pathname.startsWith('/dashboard/retailer')) {
  if (!user) return redirect('/entry_page/signup');
  const role = user.user_metadata?.role;
  if (role !== 'retailer') return redirect(roleDestination(role));

  const { data: retailer } = await supabase
    .from('retailers')
    .select('verification_status')
    .eq('user_id', user.id)
    .single();

  if (!retailer) return redirect('/onboard-retailer');
  if (retailer.verification_status === 'banned') {
    await supabase.auth.signOut();
    return redirect('/entry_page/signup?error=banned');
  }
  if (retailer.verification_status !== 'verified') {
    return redirect('/onboard-retailer/submitted');
  }
}

// ── Employee dashboard protection ──
if (pathname.startsWith('/dashboard/employee')) {
  if (!user) return redirect('/entry_page/signin');
  const role = user.user_metadata?.role;
  if (role !== 'employee') return redirect(roleDestination(role));
}

// ── Cross-role blocking ──
if (pathname.startsWith('/dashboard/wholesaler') && role === 'retailer') {
  return redirect('/dashboard/retailer');
}
if (pathname.startsWith('/dashboard/wholesaler') && role === 'employee') {
  return redirect('/dashboard/employee');
}
```

### 4.2 — Auth Action Updates (`lib/actions/auth.js`)

Add `getRetailerDestination(userId)`:
```javascript
export async function getRetailerDestination(userId) {
  const supabase = await createClient();
  const { data: retailer } = await supabase
    .from('retailers')
    .select('verification_status, has_visited_dashboard')
    .eq('user_id', userId)
    .single();

  if (!retailer) return '/onboard-retailer';
  if (retailer.verification_status === 'banned') return '/entry_page/signup?error=banned';
  if (retailer.verification_status === 'verified') return '/dashboard/retailer';
  return '/onboard-retailer/submitted';
}
```

Update `signIn()` to handle retailer and employee roles:
```javascript
if (role === 'retailer') {
  const dest = await getRetailerDestination(data.user.id);
  redirect(dest);
}
if (role === 'employee') {
  redirect('/dashboard/employee');
}
```

Update `roleDestination()`:
```javascript
function roleDestination(role) {
  if (role === 'wholesaler') return '/dashboard/wholesaler';
  if (role === 'retailer') return '/dashboard/retailer';
  if (role === 'employee') return '/dashboard/employee';
  return '/select-role';
}
```

### ✅ Phase 4 Checklist
- [ ] Verified retailer reaches `/dashboard/retailer`
- [ ] Unverified retailer → `/onboard-retailer/submitted`
- [ ] Employee reaches `/dashboard/employee`
- [ ] Wholesaler cannot access retailer/employee dashboards
- [ ] Retailer cannot access wholesaler/employee dashboards
- [ ] All existing wholesaler flows unchanged

---

## Phase 5: Retailer Admin Dashboard

> **Goal**: Dashboard, employee CRUD with auto-generated credentials.

### 5.1 — Files to Create

| File | Purpose |
|---|---|
| `app/dashboard/retailer/layout.jsx` | Sidebar + main content layout |
| `app/dashboard/retailer/page.jsx` | Dashboard home (stats, quick actions, employee directory) |
| `app/dashboard/retailer/employees/page.jsx` | Employee management table |
| `components/retailer/RetailerSidebar.jsx` | Sidebar navigation |
| `components/retailer/DashboardStats.jsx` | Stat cards (Total Employees, Store Designs) |
| `components/retailer/EmployeeTable.jsx` | Searchable employee table |
| `components/retailer/CreateEmployeeModal.jsx` | Form to create employee |
| `components/retailer/EmployeeCredentialsModal.jsx` | Show email + password + designation |
| `app/api/employees/create/route.js` | POST — auto-generate creds, create auth user, insert DB |
| `app/api/employees/list/route.js` | GET — list employees for a retailer |
| `app/api/employees/[id]/route.js` | PATCH/DELETE — update/deactivate/delete employee |
| `lib/utils/credentials.js` | Password generation algorithm |

### 5.2 — Password Generation Algorithm

**File**: `lib/utils/credentials.js`

```javascript
/**
 * Generates email and password for a new employee.
 *
 * Email format: firstname.lastname@businessslug.com
 * Password format: Name3Chars + Biz3Chars + 4RandomDigits + SpecialChar
 *
 * Example: "Priya Sharma" at "Pine Jewels"
 *   → email: priya.sharma@pinejewels.com
 *   → password: Priels7284!
 */
export function generateEmployeeCredentials(fullName, businessName, existingEmails = []) {
  const nameParts = fullName.trim().toLowerCase().split(/\s+/);
  const bizSlug = businessName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  let email = `${nameParts.join('.')}@${bizSlug}.com`;

  // Handle duplicate emails by appending a number
  let counter = 1;
  while (existingEmails.includes(email)) {
    email = `${nameParts.join('.')}${counter}@${bizSlug}.com`;
    counter++;
  }

  // Password generation
  const namePrefix = fullName.replace(/\s/g, '').slice(0, 3);
  const namePrefixCapitalized = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1).toLowerCase();
  const bizSuffix = businessName.replace(/[^a-zA-Z]/g, '').slice(-3).toLowerCase();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const specials = ['!', '@', '#', '$', '&'];
  const special = specials[Math.floor(Math.random() * specials.length)];
  const password = `${namePrefixCapitalized}${bizSuffix}${randomDigits}${special}`;

  return { email, password };
}
```

### 5.3 — Employee Create API Flow

```
1. Retailer submits: { full_name, designation, phone }
2. Backend calls generateEmployeeCredentials()
3. Backend calls supabaseAdmin.auth.admin.createUser({
     email, password,
     email_confirm: true,
     user_metadata: { role: 'employee' }
   })
4. Backend inserts into employees table with auth_user_id + password_plain
5. Returns { email, password } to frontend for display
```

### 5.4 — Dashboard UI (from your screenshots)

**Dashboard Home:**
- 2 stat cards: "Total Employee" (active count, total), "Store Designs" (count, archived)
- 2 action cards: "Add New Employee", "Upload Design"
- Employee Directory: recent employees with avatar, name, role, status badge, last active

**Employees Page:**
- Search bar
- Table: Employee name, Contact (email + phone), Role, Status, Last Active, Actions
- Actions column: Activate/Deactivate button, 3-dot menu → opens credentials modal
- "New Employee" button in sidebar

### ✅ Phase 5 Checklist
- [ ] Dashboard loads with real data from DB
- [ ] Employee creation generates correct email/password
- [ ] Credentials displayed in modal after creation
- [ ] Employee table shows all employees with search
- [ ] Activate/Deactivate works
- [ ] Delete employee removes auth user + DB row

---

## Phase 6: Design Upload & Catalogue

> **Goal**: Retailer uploads raw images (no AI pipeline), views them in an isolated catalogue.

### 6.1 — Files to Create

| File | Purpose |
|---|---|
| `app/dashboard/retailer/catalogue/page.jsx` | Catalogue page with grid + upload button |
| `components/retailer/DesignUploadModal.jsx` | Upload form (file + title + category) |
| `components/retailer/RetailerCatalogueGrid.jsx` | Image grid with filters |
| `app/api/designs/upload/route.js` | POST — upload to storage + insert DB row |
| `app/api/designs/[id]/route.js` | PATCH/DELETE — archive/delete design |
| `lib/api/retailer-designs.js` | Query helpers for retailer designs |

### 6.2 — Upload Flow (No Pipeline)

```
1. Retailer selects image file
2. Optionally adds title, category, tags
3. POST /api/designs/upload with FormData
4. Backend uploads to Supabase Storage: retailer-designs/{retailer_id}/{timestamp}_{filename}
5. Backend inserts row into retailer_designs with public URL
6. Image appears in catalogue immediately (no processing wait)
```

### 6.3 — Data Isolation

**Critical rule**: Every retailer sees ONLY their own designs.

```javascript
// lib/api/retailer-designs.js
export async function getDesignsByRetailer(retailerId) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('retailer_designs')
    .select('*')
    .eq('retailer_id', retailerId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });
  return data ?? [];
}
```

The RLS policies from Phase 1 enforce this at the database level.

### 6.4 — Catalogue UI (from your screenshots)

- Header: "Catalogue (12/50*)" with count
- "Upload Design" button (top-right)
- 3-column grid of design cards
- Each card: image, title, category tags (colored badges), Archive toggle
- Category filter tabs at the top

### ✅ Phase 6 Checklist
- [ ] Upload works (instant, no processing)
- [ ] Images stored at `retailer-designs/{retailer_id}/`
- [ ] Catalogue shows only current retailer's designs
- [ ] Archive toggle works
- [ ] Different retailers see different catalogues
- [ ] Category filter works

---

## Phase 7: Employee Auth & Dashboard

> **Goal**: Employees sign in with admin-provided credentials, see retailer designs + all wholesaler products.

### 7.1 — Employee Sign-In

Uses the **existing** sign-in page. Generated `email@bizname.com` + password works with Supabase Auth. No changes to sign-in UI needed.

### 7.2 — Files to Create

| File | Purpose |
|---|---|
| `app/dashboard/employee/layout.jsx` | Employee layout (header + tabs) |
| `app/dashboard/employee/page.jsx` | Dashboard home (welcome, recent items, stats) |
| `app/dashboard/employee/designs/page.jsx` | Parent retailer's designs (read-only) |
| `app/dashboard/employee/wholesaler-gallery/page.jsx` | ALL wholesaler products |
| `app/dashboard/employee/messages/page.jsx` | Chat interface |
| `components/employee/EmployeeLayout.jsx` | Layout wrapper |
| `components/employee/EmployeeHeader.jsx` | Header with employee + retailer name |
| `components/employee/EmployeeTabs.jsx` | Tab navigation |

### 7.3 — Employee: View Retailer Designs

```javascript
// 1. Get employee's parent retailer
const { data: employee } = await supabase
  .from('employees')
  .select('retailer_id')
  .eq('auth_user_id', user.id)
  .single();

// 2. Get that retailer's designs (RLS also enforces this)
const { data: designs } = await supabase
  .from('retailer_designs')
  .select('*')
  .eq('retailer_id', employee.retailer_id)
  .eq('is_archived', false)
  .order('created_at', { ascending: false });
```

### 7.4 — Employee: View ALL Wholesaler Products

Reuse existing `getAllProducts()` from `lib/api/supabase-products.js`:
```javascript
// This already returns all products from all wholesalers
const products = await getAllProducts();
```

Display in a grid with:
- Product image (processed), title, category, wholesaler email/business name
- "Chat with Wholesaler" button on each card

### 7.5 — Employee Dashboard Home

- Welcome: "Hi {employee.full_name}, you work at {retailer.business_name}"
- Quick stats: retailer designs count, wholesaler products count, unread messages
- Recent items from both sources

### ✅ Phase 7 Checklist
- [ ] Employee can sign in with generated credentials
- [ ] Employee dashboard loads correctly
- [ ] "Our Designs" shows only parent retailer's uploads
- [ ] "Wholesaler Gallery" shows ALL wholesaler products
- [ ] Employee cannot access retailer admin or wholesaler dashboards

---

## Phase 8: Chat / Messaging System

> **Goal**: Employee ↔ Wholesaler real-time messaging via Supabase Realtime.

### 8.1 — Prerequisites
- Enable Realtime on `messages` table in Supabase Dashboard
  (Database → Replication → toggle `messages` table)

### 8.2 — Files to Create

| File | Purpose |
|---|---|
| `app/api/chat/conversations/route.js` | GET — list conversations, POST — create new |
| `app/api/chat/messages/route.js` | GET — fetch messages, POST — send message |
| `app/api/chat/messages/read/route.js` | PATCH — mark messages as read |
| `components/chat/ConversationList.jsx` | Left panel: list of active conversations |
| `components/chat/ChatWindow.jsx` | Right panel: message thread + input box |
| `components/chat/MessageBubble.jsx` | Individual message display |
| `lib/hooks/useRealtimeMessages.js` | Custom hook for real-time message subscription |

### 8.3 — Real-Time Hook

```javascript
// lib/hooks/useRealtimeMessages.js
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../supabase/client';

export function useRealtimeMessages(conversationId) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!conversationId) return;
    const supabase = createClient();

    // Initial fetch
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []));

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [conversationId]);

  return messages;
}
```

### 8.4 — Chat UI Layout

**Employee side** (`/dashboard/employee/messages`):
```
┌──────────────────┬──────────────────────────┐
│ Conversations    │ Active Chat              │
│                  │                          │
│ 🏢 Wholesaler A  │ [Message bubbles]        │
│ 🏢 Wholesaler B  │                          │
│                  │                          │
│                  │ [Type message...] [Send] │
└──────────────────┴──────────────────────────┘
```

**Wholesaler side** (`/dashboard/wholesaler/queries` — existing sidebar link):
- Replace/extend `QueriesClient.jsx` with real chat
- Same layout but conversations are from employees

### 8.5 — Starting a Conversation

Employee clicks "Chat" on a wholesaler product card → API creates conversation (or finds existing) → opens chat window.

### 8.6 — Unread Badges

Add unread count to sidebar navigation:
```javascript
const { count } = await supabase
  .from('messages')
  .select('*', { count: 'exact', head: true })
  .in('conversation_id', myConversationIds)
  .eq('is_read', false)
  .neq('sender_type', myType);
```

### ✅ Phase 8 Checklist
- [ ] Employee can start conversation with any wholesaler
- [ ] Messages appear in real-time on both sides
- [ ] Wholesaler sees all incoming conversations
- [ ] Unread badges update
- [ ] Message history persists across sessions

---

## Phase 9: Integration Testing & Polish

### 9.1 — End-to-End Test Scenarios

| # | Scenario |
|---|---|
| 1 | Wholesaler signs up → onboards → verified → dashboard |
| 2 | Wholesaler generates referral link |
| 3 | New user visits referral → signs up as retailer |
| 4 | Retailer completes 3-step onboarding |
| 5 | Admin verifies retailer → reaches dashboard |
| 6 | Retailer creates employee → creds generated |
| 7 | Retailer uploads 5 designs → catalogue displays |
| 8 | Employee signs in → dashboard loads |
| 9 | Employee views retailer's designs only |
| 10 | Employee views all wholesaler products |
| 11 | Employee messages wholesaler → real-time delivery |
| 12 | Wholesaler replies → employee receives |
| 13 | Retailer deactivates employee → can't sign in |
| 14 | Retailer A can't see Retailer B's designs |
| 15 | Employee A can't see Employee B's retailer designs |

### 9.2 — Edge Cases

- [ ] Duplicate employee email → auto-append suffix
- [ ] Banned retailer → employee locked out
- [ ] Expired/maxed referral link → error page
- [ ] Empty states: no employees, no designs, no messages
- [ ] Mobile responsive for all new pages

### 9.3 — UI Polish

- [ ] All pages match Celestique design language
- [ ] Skeleton loaders on async data
- [ ] Toast notifications for actions
- [ ] Smooth transitions and micro-animations
- [ ] Error states with retry options

---

## 📁 Complete New File Map

```
app/
├── join/[code]/page.jsx
├── onboard-retailer/
│   ├── layout.jsx
│   ├── page.jsx
│   ├── step2/page.jsx
│   ├── step3/page.jsx
│   └── submitted/page.jsx
├── dashboard/
│   ├── retailer/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   ├── employees/page.jsx
│   │   └── catalogue/page.jsx
│   └── employee/
│       ├── layout.jsx
│       ├── page.jsx
│       ├── designs/page.jsx
│       ├── wholesaler-gallery/page.jsx
│       └── messages/page.jsx
├── api/
│   ├── referral/
│   │   ├── generate/route.js
│   │   └── validate/route.js
│   ├── onboard-retailer/submit/route.js
│   ├── employees/
│   │   ├── create/route.js
│   │   ├── list/route.js
│   │   └── [id]/route.js
│   ├── designs/
│   │   ├── upload/route.js
│   │   ├── list/route.js
│   │   └── [id]/route.js
│   ├── chat/
│   │   ├── conversations/route.js
│   │   ├── messages/route.js
│   │   └── messages/read/route.js
│   └── admin/retailers/route.ts

components/
├── retailer/
│   ├── RetailerSidebar.jsx
│   ├── DashboardStats.jsx
│   ├── EmployeeTable.jsx
│   ├── EmployeeCredentialsModal.jsx
│   ├── CreateEmployeeModal.jsx
│   ├── DesignUploadModal.jsx
│   └── RetailerCatalogueGrid.jsx
├── employee/
│   ├── EmployeeLayout.jsx
│   ├── EmployeeHeader.jsx
│   └── EmployeeTabs.jsx
├── chat/
│   ├── ConversationList.jsx
│   ├── ChatWindow.jsx
│   └── MessageBubble.jsx
└── onboard-retailer/
    ├── step1/RetailerStep1Container.jsx
    ├── step1/RetailerIdentityForm.jsx
    ├── step1/RetailerStep1Footer.jsx
    ├── step2/RetailerStep2Container.jsx
    ├── step2/RetailerBusinessForm.jsx
    ├── step2/RetailerStep2Footer.jsx
    ├── step3/RetailerStep3Container.jsx
    ├── step3/RetailerDocUpload.jsx
    └── step3/RetailerStep3Footer.jsx

context/
└── RetailerOnboardContext.jsx

lib/
├── api/retailer-designs.js
├── api/employees.js
├── hooks/useRealtimeMessages.js
└── utils/credentials.js
```

---

## 🔑 Strict Execution Order

| Step | Phase | What | Depends On |
|------|-------|------|------------|
| **1** | Phase 1 | Run all SQL migrations in Supabase | Nothing |
| **2** | Phase 4 | Update middleware + auth routing | Phase 1 |
| **3** | Phase 2 | Build referral link system | Phase 1 |
| **4** | Phase 3 | Build retailer onboarding | Phase 1, 2, 4 |
| **5** | Phase 5 | Build retailer dashboard + employees | Phase 1, 4 |
| **6** | Phase 6 | Build design upload + catalogue | Phase 1, 5 |
| **7** | Phase 7 | Build employee auth + dashboard | Phase 1, 5, 6 |
| **8** | Phase 8 | Build chat system | Phase 1, 5, 7 |
| **9** | Phase 9 | Integration testing + polish | All above |

---

> **Ready to begin?** We start with **Phase 1** — running the SQL migrations. Once confirmed, we move to Phase 4 (middleware) since it unblocks everything. Tell me when to proceed.
