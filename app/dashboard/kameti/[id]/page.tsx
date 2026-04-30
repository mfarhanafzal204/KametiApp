import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, percentage } from "@/lib/utils";
import {
  ArrowLeft,
  Users,
  Coins,
  TrendingUp,
  Clock,
} from "lucide-react";
import KametiTabs from "@/components/app/KametiTabs";
import DeleteKametiButton from "@/components/app/DeleteKametiButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function KametiDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: kameti, error } = await supabase
    .from("kametis")
    .select("*")
    .eq("id", id)
    .eq("admin_id", user.id)
    .single();

  if (error || !kameti) notFound();

  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("*")
    .eq("kameti_id", id)
    .order("payout_month_number", { ascending: true });

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .eq("kameti_id", id)
    .order("month_number", { ascending: true });

  // Both are non-critical — silently fall back to empty arrays
  // (kameti itself already validated above)
  const memberList = membersError ? [] : (members ?? []);
  const paymentList = paymentsError ? [] : (payments ?? []);

  // Current month of this kameti
  const now = new Date();
  const start = new Date(kameti.start_date);
  const currentMonth = Math.min(
    Math.max(
      (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth()) +
        1,
      1
    ),
    kameti.total_months
  );

  const progressPct = percentage(currentMonth, kameti.total_months);
  const paidPayments = paymentList.filter((p) => p.status === "paid");
  const totalCollected = paidPayments.length * kameti.monthly_amount;
  const pendingThisMonth = paymentList.filter(
    (p) => p.month_number === currentMonth && p.status === "pending"
  ).length;
  const isActive = kameti.status === "active";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors min-h-0 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:block">Dashboard</span>
          </Link>
          <Separator orientation="vertical" className="h-6 hidden sm:block flex-shrink-0" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-sm sm:text-lg truncate">
              {kameti.name}
            </h1>
            <Badge
              className={
                isActive
                  ? "bg-green-100 text-green-700 border-green-200 flex-shrink-0 text-xs"
                  : kameti.status === "completed"
                  ? "bg-gray-100 text-gray-600 border-gray-200 flex-shrink-0 text-xs"
                  : "bg-amber-100 text-amber-700 border-amber-200 flex-shrink-0 text-xs"
              }
            >
              {kameti.status}
            </Badge>
          </div>
          {/* Delete button — client component */}
          <DeleteKametiButton kametiId={kameti.id} kametiName={kameti.name} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">

        {/* ── Hero card ── */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 sm:p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-green-200 text-sm font-medium mb-1">
                  Started {formatDate(kameti.start_date)}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold">{kameti.name}</h2>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-green-200 text-sm">Total Pool</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(kameti.total_pool)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-200">
                  Month {currentMonth} of {kameti.total_months}
                </span>
                <span className="text-white font-semibold">{progressPct}% complete</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="border border-gray-100 card-shadow">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Monthly</p>
                  <p className="font-bold text-gray-900 text-xs sm:text-base truncate">
                    {formatCurrency(kameti.monthly_amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 card-shadow">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Members</p>
                  <p className="font-bold text-gray-900 text-xs sm:text-base">
                    {memberList.length}
                    <span className="text-gray-400 font-normal text-xs ml-1">
                      / {kameti.total_months}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 card-shadow">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Collected</p>
                  <p className="font-bold text-gray-900 text-xs sm:text-base truncate">
                    {formatCurrency(totalCollected)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 card-shadow">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Pending</p>
                  <p className="font-bold text-gray-900 text-xs sm:text-base">
                    {pendingThisMonth}
                    <span className="text-gray-400 font-normal text-xs ml-1 hidden sm:inline">
                      this month
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Tabs (client component) ── */}
        <KametiTabs
          kameti={kameti}
          members={memberList}
          initialPayments={paymentList}
          currentMonth={currentMonth}
        />
      </main>
    </div>
  );
}
