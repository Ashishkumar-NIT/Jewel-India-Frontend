import dotenv from 'dotenv';
dotenv.config();

async function checkPolicies() {
  const { supabaseAdmin } = await import("../lib/supabase/admin.js");
  console.log("--- Querying records from database ---");
  
  const { data: conversations, error: convErr } = await supabaseAdmin
    .from('conversations')
    .select('*, product:product_id(*), employee:employee_id(*), retailer:retailer_id(*)')
    .limit(5);
    
  if (convErr) {
    console.error("Error fetching conversations:", convErr.message);
  } else {
    console.log("Conversations sample:", JSON.stringify(conversations, null, 2));
  }

  const { data: messages, error: msgErr } = await supabaseAdmin
    .from('messages')
    .select('*')
    .limit(5);
    
  if (msgErr) {
    console.error("Error fetching messages:", msgErr.message);
  } else {
    console.log("Messages sample:", JSON.stringify(messages, null, 2));
  }
}

checkPolicies().catch(console.error);
