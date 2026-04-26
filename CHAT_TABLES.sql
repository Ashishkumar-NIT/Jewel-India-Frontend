-- ====================================================================================
-- CHAT SYSTEM TABLES & POLICIES (Phase 8)
-- Please run this in the Supabase SQL Editor
-- ====================================================================================

-- Drop existing tables to ensure clean slate (this deletes old chat data if any)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- 1. Create conversations table
CREATE TABLE public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    wholesaler_id UUID REFERENCES public.wholesalers(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    retailer_id UUID REFERENCES public.retailers(id) ON DELETE CASCADE, -- to easily query conversations by retailer
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, employee_id) -- An employee has one conversation per product
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. Create messages table
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type TEXT CHECK (sender_type IN ('wholesaler', 'employee')),
    sender_id UUID NOT NULL, -- auth.users.id
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ====================================================================================
-- RLS POLICIES FOR CONVERSATIONS
-- ====================================================================================

-- Wholesalers can see their own conversations
CREATE POLICY "Wholesalers can view their conversations" 
ON public.conversations FOR SELECT 
USING (
    wholesaler_id IN (
        SELECT id FROM public.wholesalers WHERE user_id = auth.uid()
    )
);

-- Employees can see their own conversations
CREATE POLICY "Employees can view their conversations" 
ON public.conversations FOR SELECT 
USING (
    employee_id IN (
        SELECT id FROM public.employees WHERE auth_user_id = auth.uid()
    )
);

-- Retailers can see all conversations for their store
CREATE POLICY "Retailers can view their store's conversations" 
ON public.conversations FOR SELECT 
USING (
    retailer_id IN (
        SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
);

-- Allow inserting conversations (API will handle the logic using service role if needed, but we can allow authenticated users)
-- Actually, we'll let the API route handle insertion using the admin client to ensure data integrity.
-- So we won't add an INSERT policy for anon/authenticated directly.

-- ====================================================================================
-- RLS POLICIES FOR MESSAGES
-- ====================================================================================

-- Anyone who can see the conversation can see its messages
CREATE POLICY "Users can view messages of their conversations" 
ON public.messages FOR SELECT 
USING (
    conversation_id IN (
        -- Wholesaler check
        SELECT id FROM public.conversations WHERE wholesaler_id IN (SELECT id FROM public.wholesalers WHERE user_id = auth.uid())
        UNION
        -- Employee check
        SELECT id FROM public.conversations WHERE employee_id IN (SELECT id FROM public.employees WHERE auth_user_id = auth.uid())
        UNION
        -- Retailer check
        SELECT id FROM public.conversations WHERE retailer_id IN (SELECT id FROM public.retailers WHERE user_id = auth.uid())
    )
);

-- Enable Realtime for messages table
alter publication supabase_realtime add table public.messages;
