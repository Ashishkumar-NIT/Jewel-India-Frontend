import { supabaseAdmin } from "./lib/supabase/admin.js";

async function checkSchema() {
  const { data: conv, error: convErr } = await supabaseAdmin.from('conversations').select('*').limit(1);
  console.log('conversations:', convErr ? convErr.message : 'exists', conv ? Object.keys(conv[0] || {}) : 'no data');

  const { data: msg, error: msgErr } = await supabaseAdmin.from('messages').select('*').limit(1);
  console.log('messages:', msgErr ? msgErr.message : 'exists', msg ? Object.keys(msg[0] || {}) : 'no data');
}

checkSchema().catch(console.error);
