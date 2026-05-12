import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProduct() {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, wholesaler_id, wholesaler_email')
    .limit(5);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log('Sample Products from DB:');
  console.log(JSON.stringify(data, null, 2));

  if (data && data.length > 0) {
    const firstWholesalerId = data[0].wholesaler_id;
    console.log(`\nChecking if wholesaler_id ${firstWholesalerId} exists in auth.users...`);
    
    // We can't check auth.users directly with the client easily without admin permissions
    // but we can check the 'profiles' table which should match auth.users(id)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', firstWholesalerId)
      .single();

    if (profile) {
      console.log('Found matching profile:', profile);
    } else {
      console.log('No matching profile found in public.profiles for this ID.');
      
      console.log(`\nChecking if it exists in public.wholesalers(id)...`);
      const { data: wholesaler } = await supabase
        .from('wholesalers')
        .select('id, business_name')
        .eq('id', firstWholesalerId)
        .single();
        
      if (wholesaler) {
        console.log('Found matching record in public.wholesalers(id):', wholesaler);
      } else {
        console.log('ID not found in public.wholesalers(id) either.');
      }
    }
  }
}

checkProduct();
