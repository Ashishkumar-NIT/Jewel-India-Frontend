import dotenv from 'dotenv';
dotenv.config();

async function fixExistingProcessedUrls() {
  const { supabaseAdmin } = await import("../lib/supabase/admin.js");
  
  // 1. Fetch all products
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('id, image_url, processed_image_url');

  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  console.log(`Found ${products.length} products total.`);
  let fixCount = 0;

  for (const product of products) {
    // If image_url contains "processed" and processed_image_url is null
    if (
      product.image_url && 
      product.image_url.includes('/processed/') && 
      !product.processed_image_url
    ) {
      console.log(`Fixing product ${product.id} — setting processed_image_url to ${product.image_url}`);
      
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ processed_image_url: product.image_url })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError.message);
      } else {
        fixCount++;
      }
    }
  }

  console.log(`\nSuccessfully fixed ${fixCount} products.`);
}

fixExistingProcessedUrls().catch(console.error);
