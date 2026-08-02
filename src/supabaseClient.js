import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://coyzupsomcqsvavdvjaw.supabase.co';
// Warning: A proper Supabase Anon key usually starts with "eyJ...". 
// The user provided this publishable key, so we will attempt to use it.
const supabaseKey = 'sb_publishable_nHucCh-3RObjSVzODBrqaA_2B-Et8Of';

export const supabase = createClient(supabaseUrl, supabaseKey);
