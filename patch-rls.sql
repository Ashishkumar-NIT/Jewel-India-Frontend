-- Fix the conversations policy for wholesalers to match the actual auth.uid() ID type inserted:
DROP POLICY IF EXISTS "Wholesalers can view their conversations" ON public.conversations;
CREATE POLICY "Wholesalers can view their conversations" 
ON public.conversations FOR SELECT 
USING (
    wholesaler_id = auth.uid()
);

-- Fix the messages policy so Realtime allows Wholesaler to listen to the messages channels
DROP POLICY IF EXISTS "Users can view messages of their conversations" ON public.messages;
CREATE POLICY "Users can view messages of their conversations" 
ON public.messages FOR SELECT 
USING (
    conversation_id IN (
        -- Wholesaler check
        SELECT id FROM public.conversations WHERE wholesaler_id = auth.uid()
        UNION
        -- Employee check
        SELECT id FROM public.conversations WHERE employee_id IN (SELECT id FROM public.employees WHERE auth_user_id = auth.uid())
        UNION
        -- Retailer check
        SELECT id FROM public.conversations WHERE retailer_id IN (SELECT id FROM public.retailers WHERE user_id = auth.uid())
    )
);
