import dotenv from 'dotenv';
dotenv.config();
import { createClient } from "@supabase/supabase-js";

async function testRls() {
  const { supabaseAdmin } = await import("../lib/supabase/admin.js");
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, anonKey);
  
  console.log("Generating session for wholesaler d17c2113-4066-471c-8b5b-4a859b79f17a...");
  const { data: sessionData, error: sessionErr } = await supabaseAdmin.auth.admin.createSessionForUser({
    userId: 'd17c2113-4066-471c-8b5b-4a859b79f17a'
  });
  
  if (sessionErr) {
    console.error("Failed to generate session:", sessionErr.message);
    return;
  }
  
  console.log("Session generated successfully.");
  
  // Set session on standard client
  const { error: setSessionErr } = await supabase.auth.setSession({
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token
  });
  
  if (setSessionErr) {
    console.error("Failed to set session on standard client:", setSessionErr.message);
    return;
  }
  
  console.log("Standard client logged in as Wholesaler. Querying conversations...");
  const { data: convs, error: convErr } = await supabase
    .from('conversations')
    .select('*');
    
  console.log("Conversations:", convs, convErr ? convErr.message : "no error");

  console.log("Querying messages...");
  const { data: msgs, error: msgErr } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', '431f8507-1ebb-4744-862c-b30b22652dc7');
    
  console.log("Messages count:", msgs ? msgs.length : 0, msgErr ? msgErr.message : "no error");
  if (msgs && msgs.length > 0) {
    console.log("Messages sample:", msgs.slice(0, 2));
  }
}

testRls().catch(console.error);
