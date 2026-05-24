import dotenv from 'dotenv';
dotenv.config();

async function checkWholesalers() {
  const { supabaseAdmin } = await import("../lib/supabase/admin.js");
  
  // Fetch wholesaler where user_id or id is d17c2113-4066-471c-8b5b-4a859b79f17a
  const { data: wsById, error: err1 } = await supabaseAdmin
    .from('wholesalers')
    .select('*')
    .eq('id', 'd17c2113-4066-471c-8b5b-4a859b79f17a');

  console.log("Wholesalers by id:", wsById, err1 ? err1.message : 'no error');

  const { data: wsByUserId, error: err2 } = await supabaseAdmin
    .from('wholesalers')
    .select('*')
    .eq('user_id', 'd17c2113-4066-471c-8b5b-4a859b79f17a');

  console.log("Wholesalers by user_id:", wsByUserId, err2 ? err2.message : 'no error');
}

checkWholesalers().catch(console.error);
