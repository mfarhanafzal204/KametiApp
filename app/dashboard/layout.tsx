import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

// Protect all /dashboard routes at the layout level
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // No wrapper div — each dashboard page controls its own layout
  return <>{children}</>;
}
