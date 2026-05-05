import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.warn("Supabase server environment variables are missing.");
}

export const supabaseAdmin = createClient(url ?? "", serviceRoleKey ?? "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
