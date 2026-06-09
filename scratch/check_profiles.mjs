import dotenv from 'dotenv';
dotenv.config();

async function checkProfiles() {
  const { supabaseAdmin } = await import("../lib/supabase/admin.js");
  
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .limit(10);

  if (error) {
    console.error("Error fetching profiles:", error.message);
  } else {
    console.log("Profiles:", profiles);
  }
}

checkProfiles().catch(console.error);
