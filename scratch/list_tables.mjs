import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTables() {
  const { data, error } = await supabase
    .from('retailers')
    .select('id')
    .limit(1);
    
  console.log("retailers accessible:", !error);
  
  // Let's query pg_class or similar via RPC if possible, or try fetching different tables
  const tables = [
    'retailers',
    'employees',
    'wholesalers',
    'products',
    'retailer_designs',
    'orders',
    'profiles',
    'referral_links'
  ];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    console.log(`Table '${table}' exists & accessible:`, !error, error ? error.message : '');
  }
}

listTables();
