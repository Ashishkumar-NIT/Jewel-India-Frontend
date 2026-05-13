import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function runFix() {
  console.log("Starting database normalization...");

  // 1. Identify all unique wholesaler_ids currently in the products table
  const { data: products } = await supabaseAdmin.from('products').select('wholesaler_id, wholesaler_email');
  
  if (!products) {
    console.error("Failed to fetch products");
    return;
  }

  const uniqueWholesalers = {};
  products.forEach(p => {
    if (p.wholesaler_id) {
      uniqueWholesalers[p.wholesaler_id] = p.wholesaler_email;
    }
  });

  console.log(`Found ${Object.keys(uniqueWholesalers).length} unique wholesaler IDs in products table.`);

  // 2. For each unique wholesaler_id, check if it exists in the 'wholesalers' table.
  // If not, but it's a valid user ID, create a dummy wholesaler record.
  for (const [id, email] of Object.entries(uniqueWholesalers)) {
    const { data: existing } = await supabaseAdmin
      .from('wholesalers')
      .select('id, user_id')
      .or(`id.eq.${id},user_id.eq.${id}`);

    if (!existing || existing.length === 0) {
      console.log(`Wholesaler ID ${id} not found in wholesalers table. Attempting to create dummy record...`);
      
      // Check if it's a valid user by checking profiles
      const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('id', id).single();
      
      if (profile) {
        const { error: insertErr } = await supabaseAdmin.from('wholesalers').insert({
          user_id: id,
          business_name: 'Pending Setup (System)',
          email: email || 'unknown@example.com'
        });
        if (insertErr) {
          console.error(`Failed to create dummy wholesaler for user ${id}:`, insertErr.message);
        } else {
          console.log(`Created dummy wholesaler for user ${id}.`);
        }
      } else {
        console.warn(`ID ${id} is NOT a valid user ID either. This product is a true orphan.`);
      }
    }
  }

  // 3. Now that all users have a wholesaler record, we can safely update the products table.
  // We need to map user_id to wholesaler id.
  const { data: allWholesalers } = await supabaseAdmin.from('wholesalers').select('id, user_id');
  
  const userToWholesalerMap = {};
  allWholesalers.forEach(w => {
    userToWholesalerMap[w.user_id] = w.id;
  });

  console.log("Updating products to use wholesaler.id instead of user_id...");
  let updateCount = 0;
  for (const p of products) {
    if (userToWholesalerMap[p.wholesaler_id]) {
      // It's currently a user_id, convert to wholesaler id
      const newId = userToWholesalerMap[p.wholesaler_id];
      await supabaseAdmin.from('products').update({ wholesaler_id: newId }).eq('wholesaler_id', p.wholesaler_id);
      updateCount++;
    }
  }
  console.log(`Updated ${updateCount} product records to use Wholesaler ID.`);

  // 4. Update the Orders table RLS policy using raw SQL via a trick (or just tell the user the SQL)
  // Since we can't easily run raw SQL from the JS client without an RPC, we will fix the queries in the Next.js app instead!
  
  console.log("Database normalization complete!");
}

runFix();
