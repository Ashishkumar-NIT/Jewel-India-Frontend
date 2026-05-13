import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkID() {
  const targetID = 'fd8209d1-a05d-4eed-856c-1468f75d7538';
  
  console.log(`Searching for ID: ${targetID}\n`);

  const { data: wholesaler } = await supabase
    .from('wholesalers')
    .select('id, user_id, business_name')
    .eq('id', targetID)
    .single();

  if (wholesaler) {
    console.log('✅ Found in wholesalers(id):', wholesaler);
  } else {
    console.log('❌ Not found in wholesalers(id).');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('id', targetID)
    .single();

  if (profile) {
    console.log('✅ Found in profiles(id):', profile);
  } else {
    console.log('❌ Not found in profiles(id).');
  }
}

checkID();
