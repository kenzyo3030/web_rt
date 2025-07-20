import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btgqrxppzzitolhjhhcl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Z3FyeHBwenppdG9saGpoaGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDE4ODUsImV4cCI6MjA2ODUxNzg4NX0.E6H4gIuuCzC2EthKebY2MFHoQXBKIz4tDrjb3x1EstQ';

export const supabase = createClient(supabaseUrl, supabaseKey);