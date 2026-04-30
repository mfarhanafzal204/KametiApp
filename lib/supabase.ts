import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// ─── Browser Client (use in Client Components) ───────────────────────────────
// Safe to import in "use client" files — no server-only APIs used here
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
