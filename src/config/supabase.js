import { createClient } from '@supabase/supabase-js';

const supabaseUrl = ''
const supabaseKey = '' // From Supabase > Project Settings > API
export const supabase = createClient(supabaseUrl, supabaseKey);
