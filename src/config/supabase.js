import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fewcagzdiqgjwyoplkyg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZld2NhZ3pkaXFnand5b3Bsa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDE0NzcsImV4cCI6MjA2MTgxNzQ3N30.x_Hyfpe-1P5EqDW8Jh4R-F5H1iuIDt_sS69G_RC31vU'; // From Supabase > Project Settings > API
export const supabase = createClient(supabaseUrl, supabaseKey);
