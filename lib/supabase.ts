
import { createClient } from '@supabase/supabase-js';

// Netlify allows setting environment variables in the site dashboard.
// These variables are injected during the build process.
const supabaseUrl = (process.env.SUPABASE_URL as string) || 'https://rqisaynufldxuopwqpkp.supabase.co';
const supabaseKey = (process.env.SUPABASE_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaXNheW51ZmxkeHVvcHdxcGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjk1OTUsImV4cCI6MjA4NTYwNTU5NX0.n-G5m4DgVma-R891DJ1l38BESGGwDq9jXWOTWzQcdEo';

export const supabase = createClient(supabaseUrl, supabaseKey);
