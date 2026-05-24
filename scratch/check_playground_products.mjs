import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking DB connection...");
  console.log("Supabase URL:", supabaseUrl);
  
  // 1. Total products
  const { count: totalCount, error: err1 } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
    
  if (err1) {
    console.error("Error fetching total count:", err1.message);
    return;
  }
  console.log("Total products in database:", totalCount);

  // 2. Published products
  const { count: pubCount, error: err2 } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  if (err2) {
    console.error("Error fetching published count:", err2.message);
    return;
  }
  console.log("Published products:", pubCount);

  // 3. Published products with generated_image_urls
  const { data: pubProducts, error: err3 } = await supabase
    .from("products")
    .select("id, title, is_published, raw_image_url, generated_image_urls")
    .eq("is_published", true);

  if (err3) {
    console.error("Error fetching published products:", err3.message);
    return;
  }

  console.log("\nAll published products with their generated_image_urls:");
  console.log(JSON.stringify(pubProducts, null, 2));
}

check();
