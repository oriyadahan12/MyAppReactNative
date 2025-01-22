import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zwlbbpgtlzaeybzxrjbk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bGJicGd0bHphZXlienhyamJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NzA1NTQsImV4cCI6MjA1MjI0NjU1NH0.psW8bYpoVRAujipxRHN7svPiazEKwXsSxvnTYaafZAw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);