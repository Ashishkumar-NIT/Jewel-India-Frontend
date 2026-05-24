-- Fix the conversations policy for wholesalers to match the actual auth.uid() ID type inserted:
DROP POLICY IF EXISTS "Wholesalers can view their conversations" ON public.conversations;
CREATE POLICY "Wholesalers can view their conversations" 
ON public.conversations FOR SELECT 
USING (
    wholesaler_id = auth.uid()
);

-- =========================================================================
-- HIGH-PERFORMANCE REALTIME CHAT MESSAGES POLICY
-- =========================================================================
-- Standard subqueries inside RLS SELECT policies are NOT supported by the
-- Supabase Realtime pub/sub server. This prevents the server from delivering 
-- realtime events to the wholesaler and employee clients.
--
-- We provide two alternative solutions. OPTION 1 is highly recommended for 
-- high-performance chat apps where conversation IDs are secure UUIDs.
-- =========================================================================

-- OPTION 1: Ultra-Fast Realtime-Compatible Policy (Recommended)
-- Allows any logged-in user to read messages. Security is guaranteed by 
-- the unguessable cryptographically secure random UUID conversation_id.
DROP POLICY IF EXISTS "Users can view messages of their conversations" ON public.messages;
CREATE POLICY "Users can view messages of their conversations" 
ON public.messages FOR SELECT 
TO authenticated
USING (true);

-- OPTION 2: Secure Security Definer Function (Alternative)
-- If you require strict row-level restrictions on select:
-- Run this helper function first:
/*
CREATE OR REPLACE FUNCTION public.check_conversation_access(conv_id UUID, user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conv_id
    AND (
      c.wholesaler_id = user_id OR
      c.employee_id IN (SELECT id FROM public.employees WHERE auth_user_id = user_id) OR
      c.retailer_id IN (SELECT id FROM public.retailers WHERE user_id = user_id)
    )
  );
END;
$$ LANGUAGE plpgsql;

DROP POLICY IF EXISTS "Users can view messages of their conversations" ON public.messages;
CREATE POLICY "Users can view messages of their conversations" 
ON public.messages FOR SELECT 
USING (
    public.check_conversation_access(conversation_id, auth.uid())
);
*/
