import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// ─── Browser Client (use in Client Components) ───────────────────────────────
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local or Vercel project settings."
    );
  }

  return createBrowserClient<Database>(url, key);
}
