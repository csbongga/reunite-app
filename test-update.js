import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('posts').select('*').limit(1);
  console.log("Post:", data);
  if (data && data.length > 0) {
    const post = data[0];
    console.log("Trying to update post:", post.id);
    const { data: updateData, error: updateError } = await supabase.from('posts').update({ status: 'closed' }).eq('id', post.id).select();
    console.log("Update result:", updateData, updateError);
  }
}
test();
