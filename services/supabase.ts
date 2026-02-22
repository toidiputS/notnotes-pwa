import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqkbaoqzhvhxtwhdqviz.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lvAhn9uMl_zwo3j8XYd5qw_wGFNUyzv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
