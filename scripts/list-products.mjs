import { createClient } from '@supabase/supabase-js';
const sb = createClient(
  'https://yoffczlzqpzuejxiskum.supabase.co',
  'sb_publishable_hQB36cTxFHLwDkurMyisdA_eDYOoOLt'
);
const { data, error } = await sb
  .from('products')
  .select('id, name_lv, category, brand, price, image_url')
  .order('created_at');
if (error) console.error('error:', error);
else console.log(JSON.stringify(data, null, 2));
