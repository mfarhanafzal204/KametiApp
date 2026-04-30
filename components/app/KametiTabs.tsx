"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import type { Kameti, Member, Payment } from "@/types/database";
import { useLanguage } from "@/lib/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Trophy, Phone, FileDown, Loader2 } from "lucide-react";
import { formatCurrency, percentage } from "@/lib/utils";
import CelebrationModal from "@/components/app/CelebrationModal";
import { generateReportPDF } from "@/lib/generate-report-pdf";

interface Props {
  kameti: Kameti;
  members: Member[];
  initialPayments: Payment[];
  currentMonth: number;
}

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS: Record<string, string> = {
  A:"bg-red-100 text-red-700",B:"bg-orange-100 text-orange-700",
  C:"bg-amber-100 text-amber-700",D:"bg-yellow-100 text-yellow-700",
  E:"bg-lime-100 text-lime-700",F:"bg-green-100 text-green-700",
  G:"bg-emerald-100 text-emerald-700",H:"bg-teal-100 text-teal-700",
  I:"bg-cyan-100 text-cyan-700",J:"bg-sky-100 text-sky-700",
  K:"bg-blue-100 text-blue-700",L:"bg-indigo-100 text-indigo-700",
  M:"bg-violet-100 text-violet-700",N:"bg-purple-100 text-purple-700",
  O:"bg-fuchsia-100 text-fuchsia-700",P:"bg-pink-100 text-pink-700",
  Q:"bg-rose-100 text-rose-700",R:"bg-red-100 text-red-700",
  S:"bg-orange-100 text-orange-700",T:"bg-amber-100 text-amber-700",
  U:"bg-green-100 text-green-700",V:"bg-teal-100 text-teal-700",
  W:"bg-blue-100 text-blue-700",X:"bg-indigo-100 text-indigo-700",
  Y:"bg-purple-100 text-purple-700",Z:"bg-pink-100 text-pink-700",
};
function avatarColor(name: string) {
  return AVATAR_COLORS[name.trim().toUpperCase()[0] ?? "A"] ?? "bg-gray-100 text-gray-700";
}
function getInitials(name: string) {
  return name.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ── Month name ────────────────────────────────────────────────────────────────
function getMonthName(startDate: string, monthNumber: number) {
  const start = new Date(startDate);
  const d = new Date(start.getFullYear(), start.getMonth() + monthNumber - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

// ── WhatsApp URL ──────────────────────────────────────────────────────────────
function buildWhatsAppUrl(phone: string, name: string, monthName: string, amount: number) {
  const cleaned = phone.replace(/\D/g, "").replace(/^0/, "");
  const number = cleaned.startsWith("92") ? cleaned : `92${cleaned}`;
  const msg = `Asslam o Alaikum ${name} ji, aap ki ${monthName} ki kameti installment PKR ${amount.toLocaleString()} abhi pending hai. Baraye meherbani jaldi clear kar dein. Shukriya! 🙏`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

// ── WhatsApp SVG ──────────────────────────────────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function KametiTabs({ kameti, members, initialPayments, currentMonth }: Props) {
  const supabase = createClient();
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [payoutMarked, setPayoutMarked] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const currentMonthName = getMonthName(kameti.start_date, currentMonth);

  const getPayment = useCallback(
    (memberId: string, month: number) =>
      payments.find((p) => p.member_id === memberId && p.month_number === month),
    [payments]
  );

  async function togglePayment(memberId: string, month: number, newPaid: boolean) {
    const payment = getPayment(memberId, month);
    if (!payment) return;
    // Optimistic update
    setPayments((prev) =>
      prev.map((p) =>
        p.id === payment.id
          ? { ...p, status: newPaid ? "paid" : "pending", paid_at: newPaid ? new Date().toISOString() : null }
          : p
      )
    );
    try {
      const { error } = await supabase
        .from("payments")
        .update({ status: newPaid ? "paid" : "pending", paid_at: newPaid ? new Date().toISOString() : null })
        .eq("id", payment.id);
      if (error) throw new Error(error.message);
      const member = members.find((m) => m.id === memberId);
      toast.success(newPaid ? `${member?.name ?? "Member"} marked as paid ✓` : `${member?.name ?? "Member"} marked as pending`);
    } catch (err: unknown) {
      // Revert optimistic update
      setPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id
            ? { ...p, status: newPaid ? "pending" : "paid", paid_at: newPaid ? null : payment.paid_at }
            : p
        )
      );
      toast.error(err instanceof Error ? err.message : "Failed to update payment. Please try again.");
    }
  }

  async function handleMarkPayout() {
    setPayoutMarked(true);
    setCelebrationOpen(true);

    // Update the payout member's payment record for the current month to "paid"
    if (payoutThisMonth) {
      const payoutPayment = getPayment(payoutThisMonth.id, currentMonth);
      if (payoutPayment && payoutPayment.status !== "paid") {
        const now = new Date().toISOString();
        // Optimistic update
        setPayments((prev) =>
          prev.map((p) =>
            p.id === payoutPayment.id
              ? { ...p, status: "paid", paid_at: now }
              : p
          )
        );
        const { error } = await supabase
          .from("payments")
          .update({ status: "paid", paid_at: now })
          .eq("id", payoutPayment.id);
        if (error) {
          // Revert on failure
          setPayments((prev) =>
            prev.map((p) =>
              p.id === payoutPayment.id
                ? { ...p, status: payoutPayment.status, paid_at: payoutPayment.paid_at }
                : p
            )
          );
          toast.error("Failed to update payout record. Please try again.");
        }
      }
    }
  }

  async function handleGenerateReport() {
    setGenerating(true);
    try {
      await generateReportPDF({
        kameti,
        members,
        payments,
        currentMonth,
        monthName: currentMonthName,
      });
      toast.success("Report downloaded!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  // Derived
  const thisMonthPayments = payments.filter((p) => p.month_number === currentMonth);  const paidThisMonth = thisMonthPayments.filter((p) => p.status === "paid").length;
  const totalThisMonth = thisMonthPayments.length;
  const payoutThisMonth = members.find((m) => m.payout_month_number === currentMonth);
  const allPaidThisMonth = paidThisMonth === totalThisMonth && totalThisMonth > 0;
  const paidAll = payments.filter((p) => p.status === "paid").length;
  const totalAll = payments.length;
  const collectionPct = totalAll > 0 ? percentage(paidAll, totalAll) : 0;
  const totalCollected = paidAll * kameti.monthly_amount;

  return (
    <>
      <Tabs defaultValue="this-month" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="this-month">{t("thisMonth")}</TabsTrigger>
          <TabsTrigger value="timeline">{t("timeline")}</TabsTrigger>
          <TabsTrigger value="all-members">{t("allMembers")}</TabsTrigger>
        </TabsList>

        {/* ══ TAB 1 — THIS MONTH ══ */}
        <TabsContent value="this-month" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentMonthName}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{t("monthOf", { current: currentMonth, total: kameti.total_months })}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Share Report button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateReport}
                disabled={generating}
                className="min-h-[44px] border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 font-medium text-xs sm:text-sm"
              >
                {generating ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Generating…</>
                ) : (
                  <><FileDown className="w-3.5 h-3.5 mr-1.5" />Share Report</>
                )}
              </Button>
              <div className={`text-right ${allPaidThisMonth ? "text-green-600" : "text-gray-700"}`}>
                <p className="text-2xl font-bold">
                  {paidThisMonth}<span className="text-base font-normal text-gray-400">/{totalThisMonth}</span>
                </p>
                <p className="text-xs font-medium text-green-600">{t("paid")}</p>
              </div>
            </div>
          </div>

          <Card className="border border-gray-100 card-shadow overflow-hidden">
            {members.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">{t("noKametis")}</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {members.map((member) => {
                  const payment = getPayment(member.id, currentMonth);
                  const isPaid = payment?.status === "paid";
                  const whatsappUrl = buildWhatsAppUrl(member.phone, member.name, currentMonthName, kameti.monthly_amount);
                  return (
                    <div key={member.id} className={`px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 transition-colors ${isPaid ? "bg-green-50/30" : "hover:bg-gray-50/50"}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor(member.name)}`}>
                        {getInitials(member.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{member.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <p className="text-xs text-gray-500 truncate">{member.phone}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(kameti.monthly_amount)}</p>
                      </div>
                      {!isPaid && (
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
                          title="Send WhatsApp reminder" aria-label="Send WhatsApp reminder">
                          <WhatsAppIcon />
                        </a>
                      )}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-semibold hidden sm:block ${isPaid ? "text-green-600" : "text-red-500"}`}>
                          {isPaid ? t("paid") : t("pending")}
                        </span>
                        <Switch
                          checked={isPaid}
                          onCheckedChange={(checked) => togglePayment(member.id, currentMonth, checked)}
                          className="data-[state=checked]:bg-green-600"
                          aria-label={`Mark ${member.name} as ${isPaid ? "pending" : "paid"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {payoutThisMonth && (
            <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-0.5">{t("thisMonthsPayout")}</p>
                      <p className="font-bold text-gray-900 text-lg leading-tight">{payoutThisMonth.name}</p>
                      <p className="text-sm text-amber-700 font-semibold mt-0.5">{formatCurrency(kameti.total_pool)}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleMarkPayout}
                    disabled={payoutMarked}
                    className={`flex-shrink-0 min-h-[44px] font-semibold transition-all ${payoutMarked ? "bg-green-600 hover:bg-green-600 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"}`}
                  >
                    {payoutMarked ? <><CheckCircle2 className="w-4 h-4 mr-2" />{t("paidOut")}</> : <>🎉 {t("markPaidOut")}</>}
                  </Button>
                </div>
                {totalThisMonth > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-amber-700">
                      <span>{t("collectionProgress")}</span>
                      <span className="font-semibold">{t("membersPaid", { paid: paidThisMonth, total: totalThisMonth })}</span>
                    </div>
                    <Progress value={percentage(paidThisMonth, totalThisMonth)} className="h-2 bg-amber-200 [&>div]:bg-amber-500" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ══ TAB 2 — TIMELINE ══ */}
        <TabsContent value="timeline" className="space-y-5 mt-0">

          {/* Summary strip */}
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between card-shadow">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                {t("kametiRunning")}{" "}
                <span className="text-green-700 font-bold">{currentMonth}</span>
                {" / "}
                <span className="font-bold">{kameti.total_months}</span>
                {" "}{t("totalMonths").toLowerCase()}
              </span>
            </div>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
              {kameti.total_months - currentMonth} {t("monthsLeft")}
            </Badge>
          </div>

          {/* Vertical timeline */}
          <div className="relative pl-2">
            {Array.from({ length: kameti.total_months }, (_, i) => i + 1).map((month) => {
              const isPast = month < currentMonth;
              const isCurrent = month === currentMonth;
              const isFuture = month > currentMonth;
              const isLast = month === kameti.total_months;
              const payoutMember = members.find((m) => m.payout_month_number === month);
              const monthPayments = payments.filter((p) => p.month_number === month);
              const allPaid = monthPayments.length > 0 && monthPayments.every((p) => p.status === "paid");
              const start = new Date(kameti.start_date);
              const monthDate = new Date(start.getFullYear(), start.getMonth() + month - 1, 1);
              const monthLabel = monthDate.toLocaleString("en-US", { month: "long", year: "numeric" });
              const shortDate = monthDate.toLocaleString("en-US", { month: "short", year: "numeric" });

              return (
                <div key={month} className="flex gap-4">
                  {/* Left: dot + line */}
                  <div className="flex flex-col items-center w-6 flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 z-10 mt-5 ${
                      isPast ? "bg-green-500 border-green-500"
                      : isCurrent ? "bg-amber-400 border-amber-400 ring-4 ring-amber-100"
                      : "bg-white border-gray-300"
                    }`} />
                    {!isLast && (
                      <div className={`w-0.5 flex-1 mt-1 min-h-[32px] ${
                        isPast ? "bg-green-400"
                        : isCurrent ? "bg-gradient-to-b from-amber-400 to-gray-200"
                        : "bg-gray-200"
                      }`} />
                    )}
                  </div>

                  {/* Right: card */}
                  <div className={`flex-1 ${isCurrent ? "mb-6" : "mb-3"}`}>
                    <div className={`rounded-xl transition-all ${
                      isPast
                        ? "bg-white border border-gray-100 border-l-4 border-l-green-400 card-shadow"
                        : isCurrent
                        ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 border-l-4 border-l-amber-400 card-shadow-lg"
                        : "bg-gray-50 border border-gray-100 border-l-4 border-l-gray-200"
                    }`}>
                      <div className={isCurrent ? "p-5" : "p-4"}>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-semibold uppercase tracking-wide ${
                                isPast ? "text-green-600" : isCurrent ? "text-amber-600" : "text-gray-400"
                              }`}>
                                Month {month} · {shortDate}
                              </span>
                              {isCurrent && (
                                <Badge className="bg-amber-400 text-white border-0 text-xs font-bold">
                                  {t("thisMonthBadge")}
                                </Badge>
                              )}
                              {isPast && allPaid && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />{t("paidOutBadge")}
                                </Badge>
                              )}
                              {isPast && !allPaid && (
                                <Badge className="bg-red-100 text-red-600 border-red-200 text-xs">Incomplete</Badge>
                              )}
                            </div>
                            <p className={`font-bold mt-0.5 ${isCurrent ? "text-gray-900 text-lg" : "text-gray-800 text-base"}`}>
                              {monthLabel}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`font-bold ${isPast ? "text-green-700" : isCurrent ? "text-amber-700 text-lg" : "text-gray-400"}`}>
                              {formatCurrency(kameti.total_pool)}
                            </p>
                            <p className="text-xs text-gray-400">payout</p>
                          </div>
                        </div>

                        {/* Member */}
                        {payoutMember ? (
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isPast ? "bg-green-100 text-green-700"
                              : isCurrent ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                            }`}>
                              {payoutMember.name.trim()[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${isCurrent ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                                {payoutMember.name}
                              </p>
                              <p className="text-xs text-gray-400">{payoutMember.phone}</p>
                            </div>
                            {isCurrent && <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1 italic">{t("noMemberAssigned")}</p>
                        )}

                        {/* Current month progress */}
                        {isCurrent && monthPayments.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-xs text-amber-700">
                              <span>{t("collectionProgressLabel")}</span>
                              <span className="font-semibold">
                                {monthPayments.filter((p) => p.status === "paid").length}/{monthPayments.length} {t("paid").toLowerCase()}
                              </span>
                            </div>
                            <Progress
                              value={percentage(monthPayments.filter((p) => p.status === "paid").length, monthPayments.length)}
                              className="h-1.5 bg-amber-100 [&>div]:bg-amber-500"
                            />
                          </div>
                        )}

                        {isFuture && (
                          <p className="text-xs text-gray-400 mt-1">{t("expected")} {monthLabel}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ══ TAB 3 — ALL MEMBERS ══ */}
        <TabsContent value="all-members" className="space-y-4 mt-0">
          <div className="grid grid-cols-3 gap-4">
            <Card className="border border-gray-100 card-shadow">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{paidAll}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("paid")}</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 card-shadow">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{totalAll - paidAll}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("pending")}</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 card-shadow">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-gray-900">{collectionPct}%</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("collected")}</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-green-700 font-medium">{t("totalCollected")}</span>
            <span className="font-bold text-green-700 text-lg">{formatCurrency(totalCollected)}</span>
          </div>

          <Card className="border border-gray-100 card-shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{t("memberPaymentHistory")}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {members.map((member) => {
                const memberPayments = payments.filter((p) => p.member_id === member.id);
                const memberPaid = memberPayments.filter((p) => p.status === "paid").length;
                const memberPct = percentage(memberPaid, kameti.total_months);
                const isPayoutMonth = member.payout_month_number === currentMonth;
                const hasReceivedPayout = member.payout_month_number < currentMonth;
                return (
                  <div key={member.id} className="px-5 py-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor(member.name)}`}>
                        {getInitials(member.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                          {isPayoutMonth && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">{t("payoutMonth")}</Badge>}
                          {hasReceivedPayout && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />{t("paidOutBadge")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">{member.phone}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{memberPaid}/{kameti.total_months}</p>
                        <p className="text-xs text-gray-500">paid</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap ml-14">
                      {Array.from({ length: kameti.total_months }, (_, i) => i + 1).map((month) => {
                        const p = payments.find((pay) => pay.member_id === member.id && pay.month_number === month);
                        const paid = p?.status === "paid";
                        const isCurr = month === currentMonth;
                        return (
                          <div key={month} title={`Month ${month}: ${paid ? "Paid" : "Pending"}`}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold ${
                              paid ? "bg-green-500 text-white"
                              : isCurr ? "bg-amber-400 text-white ring-1 ring-amber-300"
                              : month < currentMonth ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-400"
                            }`}>
                            {month}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 ml-14">
                      <Progress value={memberPct} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Separator />

          <Card className="border border-gray-100 card-shadow">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{t("monthOverview")}</h3>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                {Array.from({ length: kameti.total_months }, (_, i) => i + 1).map((month) => {
                  const monthPmts = payments.filter((p) => p.month_number === month);
                  const allPaid = monthPmts.length > 0 && monthPmts.every((p) => p.status === "paid");
                  const somePaid = monthPmts.some((p) => p.status === "paid");
                  const isCurrent = month === currentMonth;
                  const isPast = month < currentMonth;
                  const payoutMember = members.find((m) => m.payout_month_number === month);
                  return (
                    <div key={month} title={`Month ${month}${payoutMember ? ` — ${payoutMember.name}` : ""}`}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold cursor-default ${
                        allPaid ? "bg-green-500 text-white"
                        : somePaid ? "bg-green-200 text-green-800"
                        : isCurrent ? "bg-amber-400 text-white ring-2 ring-amber-300"
                        : isPast ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-400"
                      }`}>
                      <span>{month}</span>
                      {payoutMember && <span className="text-[8px] opacity-70 leading-none mt-0.5">{payoutMember.name.split(" ")[0]}</span>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                {[
                  { color: "bg-green-500", label: "All paid" },
                  { color: "bg-green-200", label: "Partial" },
                  { color: "bg-amber-400", label: "Current" },
                  { color: "bg-red-100 border border-red-200", label: "Overdue" },
                  { color: "bg-gray-100 border border-gray-200", label: "Upcoming" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                    <span className="text-xs text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 card-shadow">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{t("collectionSummary")}</h3>
            </div>
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" />{t("paidInstallments")}</span>
                <span className="font-semibold text-green-700">{paidAll}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" />{t("pendingInstallments")}</span>
                <span className="font-semibold text-amber-600">{totalAll - paidAll}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-700">{t("totalCollected")}</span>
                <span className="text-green-700">{formatCurrency(totalCollected)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-700">{t("totalPool")}</span>
                <span className="text-gray-900">{formatCurrency(kameti.total_pool)}</span>
              </div>
              <Progress value={collectionPct} className="h-2 mt-1" />
              <p className="text-xs text-gray-500 text-right">{collectionPct}% of total pool collected</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {payoutThisMonth && (
        <CelebrationModal
          open={celebrationOpen}
          onClose={() => {
            setCelebrationOpen(false);
            toast.success(`🎉 Payout marked for ${payoutThisMonth.name}!`);
          }}
          memberName={payoutThisMonth.name}
          monthName={currentMonthName}
          amount={kameti.total_pool}
          phone={payoutThisMonth.phone}
        />
      )}
    </>
  );
}
