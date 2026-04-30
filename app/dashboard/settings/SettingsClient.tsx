"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Loader2,
  LogOut,
  User,
  Phone,
  MapPin,
  Globe,
  CheckCircle2,
  Coins,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

// App version — bump this manually on releases
const APP_VERSION = "1.0.0";

interface Props {
  userId: string;
  initialName: string;
  initialPhone: string;
  initialCity: string;
  email: string;
  avatarUrl: string;
}

interface FieldErrors {
  name?: string;
  phone?: string;
  city?: string;
}

export default function SettingsClient({
  userId,
  initialName,
  initialPhone,
  initialCity,
  email,
  avatarUrl,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { lang, toggleLang } = useLanguage();

  // Form state
  const [name, setName]   = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [city, setCity]   = useState(initialCity);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving]   = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = "Name is required";
    else if (name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (phone && phone.replace(/\D/g, "").length < 10)
      e.phone = "Enter a valid phone number (min 10 digits)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Save profile ──────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: name.trim(),
            phone: phone.trim() || null,
            city: city.trim() || null,
          },
          { onConflict: "id" }
        );

      if (error) throw new Error(error.message);

      // Also update auth metadata so the name shows in the nav
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name.trim() },
      });
      if (authError) throw new Error(authError.message);

      setSaved(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Sign out ──────────────────────────────────────────────────────────────
  async function handleSignOut() {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to sign out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-green-600 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="font-bold text-gray-900 text-base">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-16">

        {/* ── Profile avatar + email ── */}
        <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <Avatar className="h-14 w-14 flex-shrink-0">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-green-100 text-green-700 font-bold text-lg">
              {getInitials(name || email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-base truncate">{name || "Your Name"}</p>
            <p className="text-sm text-gray-500 truncate">{email}</p>
          </div>
        </div>

        {/* ── Edit Profile ── */}
        <Card className="border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              Edit Profile
            </h2>
          </div>
          <CardContent className="p-5">
            <form onSubmit={handleSave} noValidate className="space-y-4">

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="s-name" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="s-name"
                    type="text"
                    placeholder="Muhammad Ali"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    className={`pl-10 min-h-[48px] ${errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="s-phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="s-phone"
                    type="tel"
                    placeholder="03xx-xxxxxxx"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                    }}
                    className={`pl-10 min-h-[48px] ${errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    autoComplete="tel"
                    maxLength={13}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <Label htmlFor="s-city" className="text-sm font-medium">
                  City
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="s-city"
                    type="text"
                    placeholder="Karachi, Lahore, Islamabad…"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10 min-h-[48px]"
                    autoComplete="address-level2"
                  />
                </div>
              </div>

              {/* Save button */}
              <Button
                type="submit"
                disabled={saving}
                className="w-full min-h-[48px] bg-green-600 hover:bg-green-700 text-white font-semibold text-base"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                ) : saved ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" />Saved!</>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Language ── */}
        <Card className="border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-600" />
              Language / Zubaan
            </h2>
          </div>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 mb-4">
              Choose the language for the app interface.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => lang !== "en" && toggleLang()}
                className={`min-h-[52px] rounded-xl border-2 font-semibold text-sm transition-all ${
                  lang === "en"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className="text-lg mr-2">🇬🇧</span>
                English
                {lang === "en" && <CheckCircle2 className="w-4 h-4 inline ml-2 text-green-600" />}
              </button>
              <button
                onClick={() => lang !== "ur" && toggleLang()}
                className={`min-h-[52px] rounded-xl border-2 font-semibold text-sm transition-all ${
                  lang === "ur"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className="text-lg mr-2">🇵🇰</span>
                Roman Urdu
                {lang === "ur" && <CheckCircle2 className="w-4 h-4 inline ml-2 text-green-600" />}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* ── Account ── */}
        <Card className="border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Account</h2>
          </div>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-xs text-gray-500 mt-0.5">{email}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                Read-only
              </span>
            </div>

            <Separator />

            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full min-h-[48px] border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold"
            >
              {signingOut ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing out…</>
              ) : (
                <><LogOut className="w-4 h-4 mr-2" />Sign Out</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── App info ── */}
        <div className="text-center py-4 space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-5 h-5 rounded bg-green-600 flex items-center justify-center">
              <Coins className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-700 text-sm">KametiPro</span>
          </div>
          <p className="text-xs text-gray-400">Version {APP_VERSION}</p>
          <p className="text-xs text-gray-400">Free forever · Made for Pakistan 🇵🇰</p>
        </div>

      </main>
    </div>
  );
}
