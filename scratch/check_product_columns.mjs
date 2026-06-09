import dotenv from 'dotenv';
dotenv.config();

async function checkProductOwners() {
  const { supabaseAdmin } = await import("../lib/supabase/admin.js");
  
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('id, title, wholesaler_id, wholesaler_email, raw_image_url, processed_image_url, image_url, generated_image_urls')
    .limit(10);

  if (error) {
    console.error("Error fetching products:", error.message);
  } else {
    products.forEach((p, idx) => {
      console.log(`\nProduct #${idx + 1}:`);
      console.log("ID:", p.id);
      console.log("Title:", p.title);
      console.log("Wholesaler ID:", p.wholesaler_id);
      console.log("Wholesaler Email:", p.wholesaler_email);
      console.log("image_url:", p.image_url);
      console.log("processed_image_url:", p.processed_image_url);
      console.log("generated_image_urls:", p.generated_image_urls);
    });
  }
}

checkProductOwners().catch(console.error);
