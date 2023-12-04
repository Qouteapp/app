import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjyjfetkptfvmohjkkew.supabase.co';
// eslint-disable-next-line max-len
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeWpmZXRrcHRmdm1vaGpra2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE0MzE4ODQsImV4cCI6MjAxNzAwNzg4NH0.T4sx1Ya740kcWl9nFvB1oSgjCVaXubL9oFUZ0F12XVE';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const auth = supabase.auth;
