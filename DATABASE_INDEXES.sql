-- ============================================================
-- DATABASE INDEXES FOR DASHBOARD PERFORMANCE
-- Run in Supabase SQL Editor to improve query performance
-- ============================================================

-- These indexes support the filter and sort patterns used in:
-- - Wholesaler catalogue (filter by category, sort by created_at)
-- - Retailer catalogue (filter by retailer_id, is_archived, sort by created_at)
-- - Employees list (filter by retailer_id, status, sort by created_at)

-- ============================================================
-- 1. PRODUCTS TABLE INDEXES
-- ============================================================

-- Index for wholesaler's product listing: filter by wholesaler_id, sort by created_at DESC
-- Used in: /api/catalogue/products
CREATE INDEX IF NOT EXISTS idx_products_wholesaler_created_at
  ON public.products(wholesaler_id, created_at DESC);

-- Index for filtering products by wholesaler and jewellery_type (category)
-- Used in: Wholesaler catalogue category filtering
CREATE INDEX IF NOT EXISTS idx_products_wholesaler_jewellery_type
  ON public.products(wholesaler_id, jewellery_type);

-- Index for filtering products by wholesaler and category
-- Used in: /api/catalogue/products?category=
CREATE INDEX IF NOT EXISTS idx_products_wholesaler_category
  ON public.products(wholesaler_id, category);

-- ============================================================
-- 2. RETAILER_DESIGNS TABLE INDEXES
-- ============================================================

-- Index for retailer's design listing: filter by retailer_id, is_archived, sort by created_at DESC
-- Used in: /api/designs/list
CREATE INDEX IF NOT EXISTS idx_retailer_designs_retailer_created_at
  ON public.retailer_designs(retailer_id, created_at DESC);

-- Composite index for archived filtering with sort order
-- Used in: /api/designs/list?archived=true/false
CREATE INDEX IF NOT EXISTS idx_retailer_designs_retailer_archived_created
  ON public.retailer_designs(retailer_id, is_archived, created_at DESC);

-- ============================================================
-- 3. EMPLOYEES TABLE INDEXES
-- ============================================================

-- Index for retailer's employee listing: filter by retailer_id, sort by created_at DESC
-- Used in: /api/employees/list
CREATE INDEX IF NOT EXISTS idx_employees_retailer_created_at
  ON public.employees(retailer_id, created_at DESC);

-- Composite index for status filtering with sort order
-- Used in: Employee list with status filter
CREATE INDEX IF NOT EXISTS idx_employees_retailer_status_created
  ON public.employees(retailer_id, status, created_at DESC);

-- ============================================================
-- 4. VERIFICATION QUERIES (Optional - run to confirm indexes exist)
-- ============================================================

-- Verify indexes were created:
-- SELECT indexname, tablename FROM pg_indexes
-- WHERE schemaname = 'public'
-- AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;

-- ============================================================
-- NOTES:
-- - These indexes are safe to run multiple times (IF NOT EXISTS)
-- - Index creation is non-blocking for reads
-- - Consider running ANALYZE after creating indexes on large tables:
--   ANALYZE public.products;
--   ANALYZE public.retailer_designs;
--   ANALYZE public.employees;
-- ============================================================
