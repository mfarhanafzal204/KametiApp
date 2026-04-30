import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Settings | KametiPro",
};

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch existing profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <SettingsClient
      userId={user.id}
      initialName={profile?.full_name ?? user.user_metadata?.full_name ?? ""}
      initialPhone={profile?.phone ?? ""}
      initialCity={profile?.city ?? ""}
      email={user.email ?? ""}
      avatarUrl={profile?.avatar_url ?? user.user_metadata?.avatar_url ?? ""}
    />
  );
}
