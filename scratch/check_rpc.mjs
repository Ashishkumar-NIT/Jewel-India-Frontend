import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRpc() {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1;' });
  console.log("exec_sql RPC exists:", !error, error ? error.message : data);
}

checkRpc();
