"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import type { Kameti } from "@/types/database";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Coins,
  Plus,
  LogOut,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  Settings,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/utils";
import CreateKametiDialog from "@/components/app/CreateKametiDialog";
import ThemeToggle from "@/components/app/ThemeToggle";

interface Stats {
  activeCount: number;
  totalPool: number;
  pendingThisMonth: number;
}

export default function DashboardClient() {
  const router = useRouter();
  const supabase = createClient();
  const { lang, toggleLang, t } = useLanguage();

  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [kametis, setKametis] = useState<Kameti[]>([]);
  const [stats, setStats] = useState<Stats>({
    activeCount: 0,
    totalPool: 0,
    pendingThisMonth: 0,
  });
  const [currentMonths, setCurrentMonths] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // ── Load dashboard data ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      setUserName(
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "there"
      );
      setAvatarUrl(user.user_metadata?.avatar_url || "");

      const { data: kametiData, error } = await supabase
        .from("kametis")
        .select("*")
        .eq("admin_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const list = kametiData ?? [];
      setKametis(list);

      const active = list.filter((k) => k.status === "active");
      const pool = active.reduce((sum, k) => sum + k.total_pool, 0);

      const monthMap: Record<string, number> = {};
      const now = new Date();
      list.forEach((k) => {
        const start = new Date(k.start_date);
        const diff =
          (now.getFullYear() - start.getFullYear()) * 12 +
          (now.getMonth() - start.getMonth()) +
          1;
        monthMap[k.id] = Math.min(Math.max(diff, 1), k.total_months);
      });
      setCurrentMonths(monthMap);

      let pendingCount = 0;
      if (active.length > 0) {
        const activeIds = active.map((k) => k.id);
        const { data: payments } = await supabase
          .from("payments")
          .select("id, kameti_id, month_number, status")
          .in("kameti_id", activeIds)
          .eq("status", "pending");

        pendingCount = (payments ?? []).filter((p) => {
          const currentMonth = monthMap[p.kameti_id] ?? 1;
          return p.month_number === currentMonth;
        }).length;
      }

      setStats({ activeCount: active.length, totalPool: pool, pendingThisMonth: pendingCount });
    } catch {
      setFetchError(true);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      toast.success("Signed out");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to sign out");
      setSigningOut(false);
    }
  }

  const firstName = userName.split(" ")[0];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-green-700">KametiPro</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* ── Language toggle pill ── */}
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              className="relative flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-0.5 h-9 shadow-inner select-none overflow-hidden"
              style={{ minWidth: 88 }}
            >
              {/* Sliding pill indicator */}
              <span
                className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-white dark:bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-500 transition-all duration-300 ease-in-out"
                style={{ left: lang === "en" ? "2px" : "calc(50%)" }}
                aria-hidden="true"
              />
              <span
                className={`relative z-10 flex-1 text-center text-xs font-bold transition-colors duration-200 py-1 ${
                  lang === "en" ? "text-green-700 dark:text-green-400" : "text-gray-400"
                }`}
              >
                EN
              </span>
              <span
                className={`relative z-10 flex-1 text-center text-xs font-bold transition-colors duration-200 py-1 ${
                  lang === "ur" ? "text-green-700 dark:text-green-400" : "text-gray-400"
                }`}
                style={{ fontFamily: "sans-serif" }}
              >
                اردو
              </span>
            </button>

            {/* ── Theme toggle ── */}
            <ThemeToggle />

            {/* Create button — visible on desktop */}
            <Button
              onClick={() => setCreateOpen(true)}
              className="hidden sm:flex min-h-[40px] bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("newKameti")}
            </Button>

            {/* Avatar + dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-h-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl} alt={userName} />
                    <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-medium text-gray-900 truncate">{userName}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    {t("settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {signingOut ? t("signingOut") : t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 space-y-6 sm:space-y-8">

        {/* ── Greeting ── */}
        <div className="flex items-center justify-between">
          {loading ? (
            <Skeleton className="h-7 w-72" />
          ) : (
            <h1 className="text-[18px] sm:text-2xl font-semibold text-gray-900">
              {t("greeting")},{" "}
              <span className="text-green-700">{firstName}</span> 👋
            </h1>
          )}
        </div>

        {/* ── Error state ── */}
        {fetchError && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">Something went wrong</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              We couldn&apos;t load your dashboard. Check your connection and try again.
            </p>
            <Button
              onClick={loadData}
              className="min-h-[44px] bg-green-600 hover:bg-green-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* ── Stats row — 3 cards ── */}
        {!fetchError && (<>
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-6">
          {loading ? (
            <>
              <Skeleton className="h-28 sm:h-32 rounded-xl" />
              <Skeleton className="h-28 sm:h-32 rounded-xl" />
              <Skeleton className="h-28 sm:h-32 rounded-xl" />
            </>
          ) : (
            <>
              {/* Active Kametis */}
              <Card className="border border-gray-100 card-shadow hover:card-shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900 leading-none">
                    {stats.activeCount}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 leading-tight">
                    {t("activeKametis")}
                  </p>
                </CardContent>
              </Card>

              {/* Total Pool */}
              <Card className="border border-gray-100 card-shadow hover:card-shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                  </div>
                  <p className="text-sm sm:text-xl font-bold text-gray-900 leading-none">
                    {formatCurrency(stats.totalPool)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 leading-tight">
                    {t("totalPool")}
                  </p>
                </CardContent>
              </Card>

              {/* Pending This Month */}
              <Card className="border border-gray-100 card-shadow hover:card-shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  </div>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900 leading-none">
                    {stats.pendingThisMonth}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 leading-tight">
                    {t("pendingThisMonth")}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* ── Your Kametis heading ── */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {t("yourKametis")}
          </h2>
          {!loading && kametis.length > 0 && (
            <span className="text-sm text-gray-400">{kametis.length} {t("total")}</span>
          )}
        </div>

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        )}
        {!loading && kametis.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg
              width="100"
              height="100"
              viewBox="0 0 80 80"
              fill="none"
              className="mb-6 opacity-60"
            >
              <circle cx="40" cy="40" r="38" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="2" />
              <circle cx="32" cy="38" r="12" fill="#86efac" />
              <circle cx="32" cy="38" r="8" fill="#22c55e" />
              <text x="28" y="43" fontSize="10" fill="white" fontWeight="bold">₨</text>
              <circle cx="50" cy="44" r="10" fill="#4ade80" />
              <circle cx="50" cy="44" r="7" fill="#16a34a" />
              <text x="46.5" y="48" fontSize="9" fill="white" fontWeight="bold">₨</text>
              <circle cx="42" cy="30" r="8" fill="#bbf7d0" />
              <circle cx="42" cy="30" r="5" fill="#86efac" />
              <text x="39" y="34" fontSize="8" fill="#15803d" fontWeight="bold">₨</text>
            </svg>
            <h3 className="font-semibold text-gray-900 text-xl mb-2">
              {t("noKametis")}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mb-8 max-w-sm">
              {t("noKametisDesc")}
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="min-h-[48px] bg-green-600 hover:bg-green-700 text-white px-8 text-base"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("createFirstKameti")}
            </Button>
          </div>
        )}

        {/* ── Kameti cards grid ── */}
        {!loading && kametis.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {kametis.map((kameti) => {
              const current = currentMonths[kameti.id] ?? 1;
              const progress = Math.round((current / kameti.total_months) * 100);
              const isActive = kameti.status === "active";

              return (
                <Link
                  key={kameti.id}
                  href={`/dashboard/kameti/${kameti.id}`}
                  className="block group"
                >
                  <Card className="border border-gray-100 card-shadow group-hover:card-shadow-lg group-hover:-translate-y-0.5 active:scale-[0.99] transition-all cursor-pointer h-full">
                    <CardContent className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-base sm:text-lg truncate">
                            {kameti.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatCurrency(kameti.monthly_amount)} × {kameti.total_months} {t("totalMonths").toLowerCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            className={
                              isActive
                                ? "bg-green-100 text-green-700 border-green-200"
                                : kameti.status === "completed"
                                ? "bg-gray-100 text-gray-500 border-gray-200"
                                : "bg-amber-100 text-amber-700 border-amber-200"
                            }
                          >
                            {isActive
                              ? t("active")
                              : kameti.status === "completed"
                              ? t("completed")
                              : t("paused")}
                          </Badge>
                        </div>
                      </div>

                      {/* Total pool */}
                      <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4">
                        <p className="text-xs text-gray-500">{t("totalPool")}</p>
                        <p className="font-semibold text-amber-600 text-sm">
                          {formatCurrency(kameti.total_pool)}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{t("monthOf", { current, total: kameti.total_months })}</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* View details link */}
                      <div className="flex items-center justify-end mt-4 text-green-600 text-sm font-medium">
                        {t("viewDetails")}
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
        </>)}
      </main>

      {/* ── FAB — mobile only ── */}
      <button
        onClick={() => setCreateOpen(true)}
        className="sm:hidden fixed bottom-6 right-5 w-14 h-14 rounded-2xl gradient-primary text-white shadow-xl shadow-green-300/50 hover:shadow-2xl hover:shadow-green-300/60 active:scale-95 transition-all flex items-center justify-center z-50 border border-green-500/30"
        aria-label={t("createKameti")}
        style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}
      >
        <Plus className="w-7 h-7 drop-shadow-sm" />
      </button>

      {/* ── Create Kameti Dialog ── */}
      <CreateKametiDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={loadData}
      />
    </div>
  );
}
