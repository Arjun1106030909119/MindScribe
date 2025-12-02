import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xjmewvlgbnvhhqskbvly.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbWV3dmxnYm52aGhxc2tidmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzA5MjEsImV4cCI6MjA4MDI0NjkyMX0.EiE67VIhzsjf6dlCqZsDI2-2jjMxC-V567LQ9cwy6HI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);