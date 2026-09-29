import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    console.warn("[supabase/admin] Missing Supabase URL or Secret Key in environment.");
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Export dynamic proxy so existing code using `supabaseAdmin.from(...)` works seamlessly at runtime
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    if (!client) return undefined;
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});

export const getAdminClient = getSupabaseAdmin;
