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
  const { data, error } = await supabase.rpc('get_foreign_keys');
  if(error) {
     const { data: d2 } = await supabase.from('conversations').select('*').limit(1);
     console.log('Conversations sample:', d2);
  } else {
     console.log(data);
  }
}
run();
