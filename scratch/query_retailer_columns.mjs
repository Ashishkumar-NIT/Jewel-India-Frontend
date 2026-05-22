import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRetailerColumns() {
  const { data, error } = await supabaseAdmin
    .from('retailers')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching from retailers:', error.message);
  } else {
    console.log('Retailers table exists. Sample row columns:', data && data.length > 0 ? Object.keys(data[0]) : 'No data in retailers table');
  }
}

checkRetailerColumns();
