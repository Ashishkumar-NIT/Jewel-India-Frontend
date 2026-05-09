import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const targetId = "4ce7480c-675a-408a-8401-f56ffac057cc";

  console.log("Checking targetId:", targetId);

  const { data: wUser } = await supabase.from("wholesalers").select("*").eq("user_id", targetId);
  console.log("Wholesaler by user_id:", wUser);

  const { data: wId } = await supabase.from("wholesalers").select("*").eq("id", targetId);
  console.log("Wholesaler by id:", wId);

  const { data: p } = await supabase.from("products").select("*").eq("wholesaler_id", targetId).limit(1);
  console.log("Product with wholesaler_id =", targetId, ":", p);
}

check();
