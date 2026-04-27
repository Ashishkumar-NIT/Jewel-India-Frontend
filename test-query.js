const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const lines = envFile.split('\n');
let url = '', key = '';
for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/['"]/g,'');
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim().replace(/['"]/g,'');
}

const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.from('conversations').select('id, wholesaler_id').limit(3);
  console.log('Conversations:', data);
  const { data: w, error: e2 } = await supabase.from('wholesalers').select('id, user_id').limit(3);
  console.log('Wholesalers:', w);
}
run();
