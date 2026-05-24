import dotenv from 'dotenv';
dotenv.config();

async function checkRetailers() {
  const { supabaseAdmin } = await import("../lib/supabase/admin.js");
  
  const { data: retailers, error } = await supabaseAdmin
    .from('retailers')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error fetching retailer:", error.message);
  } else {
    console.log("Retailer keys and sample:", retailers[0] ? Object.keys(retailers[0]) : "no retailer");
    console.log("Retailer full sample:", retailers[0]);
  }
}

checkRetailers().catch(console.error);
