-- ============================================================
-- ORDERS TABLE — Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  employee_id         UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  retailer_id         UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  wholesaler_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_orders_employee   ON public.orders(employee_id);
CREATE INDEX IF NOT EXISTS idx_orders_wholesaler ON public.orders(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_orders_retailer   ON public.orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON public.orders(status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if running multiple times
DROP POLICY IF EXISTS "employees_own_orders" ON public.orders;
DROP POLICY IF EXISTS "wholesalers_own_orders" ON public.orders;

-- Employees can read their own orders
CREATE POLICY "employees_own_orders" ON public.orders
  FOR SELECT USING (
    employee_id IN (SELECT id FROM public.employees WHERE auth_user_id = auth.uid())
  );

-- Wholesalers can read their own orders
CREATE POLICY "wholesalers_own_orders" ON public.orders
  FOR SELECT USING (
    wholesaler_id = auth.uid()
  );
