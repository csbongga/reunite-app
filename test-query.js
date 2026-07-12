const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].trim();
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('posts').select('id, status, user_id').limit(5);
  console.log("Posts:", data);
  if (data && data.length > 0) {
    const post = data[0];
    const { data: updateData, error: updateError } = await supabase.from('posts').update({ status: 'closed' }).eq('id', post.id).select();
    console.log("Update result:", updateData, updateError);
  }
}
test();
