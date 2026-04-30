"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Users,
  Coins,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MemberRow {
  id: string; // local key only
  name: string;
  phone: string;
  payoutMonth: string; // string for select value
}

interface Step1Data {
  name: string;
  monthlyAmount: string;
  totalMonths: string;
  startDate: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center rounded-full text-xs font-bold transition-all ${
              step < current
                ? "w-7 h-7 bg-green-600 text-white"
                : step === current
                ? "w-8 h-8 bg-green-600 text-white ring-4 ring-green-100"
                : "w-7 h-7 bg-gray-200 text-gray-400"
            }`}
          >
            {step < current ? <CheckCircle2 className="w-4 h-4" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`h-0.5 w-8 rounded transition-all ${
                step < current ? "bg-green-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CreateKametiDialog({ open, onOpenChange, onCreated }: Props) {
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 state
  const [step1, setStep1] = useState<Step1Data>({
    name: "",
    monthlyAmount: "",
    totalMonths: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  // Step 2 state
  const [members, setMembers] = useState<MemberRow[]>([
    { id: crypto.randomUUID(), name: "", phone: "", payoutMonth: "1" },
  ]);

  // ── Reset everything ──────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setStep(1);
    setStep1({
      name: "",
      monthlyAmount: "",
      totalMonths: "",
      startDate: new Date().toISOString().split("T")[0],
    });
    setMembers([{ id: crypto.randomUUID(), name: "", phone: "", payoutMonth: "1" }]);
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const monthlyAmt = parseFloat(step1.monthlyAmount) || 0;
  const totalMonthsNum = parseInt(step1.totalMonths) || 0;
  const totalPool = monthlyAmt * totalMonthsNum;

  const assignedMonths = members.map((m) => parseInt(m.payoutMonth)).filter(Boolean);
  const duplicateMonths = assignedMonths.filter(
    (m, i) => assignedMonths.indexOf(m) !== i
  );

  // ── Step 1 validation ─────────────────────────────────────────────────────
  function validateStep1(): boolean {
    if (!step1.name.trim()) {
      toast.error("Kameti name is required", {
        description: "Give your kameti a unique name so you can identify it easily.",
        icon: "📝",
      });
      return false;
    }
    if (!monthlyAmt || monthlyAmt <= 0) {
      toast.error("Enter a valid monthly amount", {
        description: "Monthly installment must be greater than PKR 0.",
        icon: "💰",
      });
      return false;
    }
    if (!totalMonthsNum || totalMonthsNum < 1 || totalMonthsNum > 36) {
      toast.error("Total months must be between 1 and 36", {
        description: "A kameti can run for 1 to 36 months.",
        icon: "📅",
      });
      return false;
    }
    if (!step1.startDate) {
      toast.error("Start date is required", {
        description: "Pick the date when this kameti begins.",
        icon: "📅",
      });
      return false;
    }
    return true;
  }

  // ── Step 2 validation ─────────────────────────────────────────────────────
  function validateStep2(): boolean {
    for (const m of members) {
      if (!m.name.trim()) {
        toast.error("Member name is required", {
          description: "Every member must have a full name.",
          icon: "👤",
        });
        return false;
      }
      if (!m.phone.trim()) {
        toast.error(`Phone number missing for "${m.name}"`, {
          description: "A phone number is needed to send WhatsApp reminders.",
          icon: "📱",
        });
        return false;
      }
      if (m.phone.trim().length < 10) {
        toast.error(`Phone number for "${m.name}" looks too short`, {
          description: "Enter a valid Pakistani number e.g. 03xx-xxxxxxx",
          icon: "📱",
        });
        return false;
      }
    }
    if (duplicateMonths.length > 0) {
      toast.error(`Month ${duplicateMonths[0]} is assigned to two members`, {
        description: "Each payout month can only be assigned to one member.",
        icon: "⚠️",
      });
      return false;
    }
    return true;
  }

  // ── Member helpers ────────────────────────────────────────────────────────
  function addMember() {
    if (members.length >= totalMonthsNum) {
      toast.error(`Maximum ${totalMonthsNum} members allowed`, {
        description: "Number of members cannot exceed total months.",
        icon: "👥",
      });
      return;
    }
    // Auto-pick the first unassigned month
    const used = new Set(members.map((m) => parseInt(m.payoutMonth)));
    let nextMonth = 1;
    for (let i = 1; i <= totalMonthsNum; i++) {
      if (!used.has(i)) { nextMonth = i; break; }
    }
    setMembers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", phone: "", payoutMonth: String(nextMonth) },
    ]);
  }

  function removeMember(id: string) {
    if (members.length === 1) {
      toast.error("At least one member is required", {
        description: "A kameti needs at least one member.",
        icon: "👤",
      });
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMember(id: string, field: keyof Omit<MemberRow, "id">, value: string) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }

  // ── Final submit ──────────────────────────────────────────────────────────
  async function handleCreate() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Ensure profile exists
      await supabase
        .from("profiles")
        .upsert(
          { id: user.id, full_name: user.user_metadata?.full_name ?? null, avatar_url: user.user_metadata?.avatar_url ?? null },
          { onConflict: "id", ignoreDuplicates: true }
        );

      // 1. Insert kameti
      const { data: kametiData, error: kametiError } = await supabase
        .from("kametis")
        .insert({
          admin_id: user.id,
          name: step1.name.trim(),
          monthly_amount: monthlyAmt,
          total_months: totalMonthsNum,
          start_date: step1.startDate,
          status: "active",
        })
        .select("id")
        .single();

      if (kametiError) throw new Error(kametiError.message);
      const kametiId = kametiData.id;

      // 2. Insert members
      const memberInserts = members.map((m) => ({
        kameti_id: kametiId,
        name: m.name.trim(),
        phone: m.phone.trim(),
        payout_month_number: parseInt(m.payoutMonth),
      }));

      const { data: insertedMembers, error: membersError } = await supabase
        .from("members")
        .insert(memberInserts)
        .select("id");

      if (membersError) throw new Error(membersError.message);

      // 3. Auto-generate payment records (all members × all months = pending)
      const paymentInserts: {
        member_id: string;
        kameti_id: string;
        month_number: number;
        status: "pending";
      }[] = [];

      insertedMembers.forEach((member) => {
        for (let month = 1; month <= totalMonthsNum; month++) {
          paymentInserts.push({
            member_id: member.id,
            kameti_id: kametiId,
            month_number: month,
            status: "pending",
          });
        }
      });

      const { error: paymentsError } = await supabase
        .from("payments")
        .insert(paymentInserts);

      if (paymentsError) throw new Error(paymentsError.message);

      toast.success(`"${step1.name.trim()}" created with ${members.length} members!`);
      reset();
      onOpenChange(false);
      onCreated();
    } catch (err: unknown) {
      console.error("Create kameti error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create kameti");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          onOpenChange(v);
          if (!v) reset();
        }
      }}
    >
      <DialogContent className="max-w-lg w-full mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">
            {step === 1 && "Kameti Details"}
            {step === 2 && "Add Members"}
            {step === 3 && "Confirm & Create"}
          </DialogTitle>
        </DialogHeader>

        {/* Step dots */}
        <StepDots current={step} />

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Kameti Name */}
            <div className="space-y-1.5">
              <Label htmlFor="kname" className="text-sm font-medium">
                Kameti Name
              </Label>
              <Input
                id="kname"
                placeholder="e.g. Family Kameti 2025"
                value={step1.name}
                onChange={(e) => setStep1((p) => ({ ...p, name: e.target.value }))}
                className="min-h-[44px]"
                maxLength={60}
              />
            </div>

            {/* Monthly amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-sm font-medium">
                Monthly Installment (PKR)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g. 5000"
                value={step1.monthlyAmount}
                onChange={(e) => setStep1((p) => ({ ...p, monthlyAmount: e.target.value }))}
                className="min-h-[44px] text-lg font-semibold"
                min={1}
              />
            </div>

            {/* Total months */}
            <div className="space-y-1.5">
              <Label htmlFor="months" className="text-sm font-medium">
                Total Months <span className="text-gray-400 font-normal">(1–36)</span>
              </Label>
              <Input
                id="months"
                type="number"
                placeholder="e.g. 12"
                value={step1.totalMonths}
                onChange={(e) => setStep1((p) => ({ ...p, totalMonths: e.target.value }))}
                className="min-h-[44px]"
                min={1}
                max={36}
              />
            </div>

            {/* Start date */}
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={step1.startDate}
                onChange={(e) => setStep1((p) => ({ ...p, startDate: e.target.value }))}
                className="min-h-[44px]"
              />
            </div>

            {/* Live pool preview */}
            {totalPool > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-green-700">Total Pool</span>
                <span className="font-bold text-green-700 text-lg">
                  {formatCurrency(totalPool)}
                </span>
              </div>
            )}

            {/* Next button */}
            <Button
              className="w-full min-h-[48px] bg-green-600 hover:bg-green-700 text-white font-semibold mt-2"
              onClick={() => { if (validateStep1()) setStep(2); }}
            >
              Next: Add Members
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Member count indicator */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-green-700">{members.length}</span>
                {" "}of{" "}
                <span className="font-semibold">{totalMonthsNum}</span>
                {" "}months assigned
              </p>
              {duplicateMonths.length > 0 && (
                <Badge className="bg-red-100 text-red-600 border-red-200 text-xs">
                  Duplicate month {duplicateMonths[0]}
                </Badge>
              )}
            </div>

            {/* Member rows */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {members.map((member, idx) => (
                <div
                  key={member.id}
                  className="border border-gray-200 rounded-xl p-3 space-y-2 bg-white"
                >
                  {/* Row header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Member {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors min-h-0 p-1"
                      aria-label="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Name */}
                  <Input
                    placeholder="Full name"
                    value={member.name}
                    onChange={(e) => updateMember(member.id, "name", e.target.value)}
                    className="min-h-[40px] text-sm"
                  />

                  {/* Phone + Payout month */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Phone (03xx...)"
                      value={member.phone}
                      onChange={(e) => updateMember(member.id, "phone", e.target.value)}
                      className="min-h-[40px] text-sm"
                      type="tel"
                      maxLength={13}
                    />
                    <select
                      value={member.payoutMonth}
                      onChange={(e) => updateMember(member.id, "payoutMonth", e.target.value)}
                      className={`min-h-[40px] text-sm border rounded-md px-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                        duplicateMonths.includes(parseInt(member.payoutMonth))
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                      aria-label="Payout month"
                    >
                      {Array.from({ length: totalMonthsNum }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          Month {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Add member button */}
            {members.length < totalMonthsNum && (
              <button
                type="button"
                onClick={addMember}
                className="w-full min-h-[44px] border-2 border-dashed border-green-300 rounded-xl text-green-600 text-sm font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add another member
              </button>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 min-h-[44px]"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                className="flex-1 min-h-[44px] bg-green-600 hover:bg-green-700 text-white font-semibold"
                onClick={() => { if (validateStep2()) setStep(3); }}
              >
                Review
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Summary card */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Kameti details */}
              <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
                <p className="font-bold text-gray-900 text-base">{step1.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Started {formatDate(step1.startDate)}
                </p>
              </div>

              <div className="p-4 space-y-3">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-1">
                      <Coins className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500">Monthly</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(monthlyAmt)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-500">Months</p>
                    <p className="font-semibold text-gray-900 text-sm">{totalMonthsNum}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mx-auto mb-1">
                      <Users className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xs text-gray-500">Members</p>
                    <p className="font-semibold text-gray-900 text-sm">{members.length}</p>
                  </div>
                </div>

                {/* Total pool highlight */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex justify-between items-center">
                  <span className="text-sm text-amber-700 font-medium">Total Pool</span>
                  <span className="font-bold text-amber-700">{formatCurrency(totalPool)}</span>
                </div>

                <Separator />

                {/* Members list */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Members
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                    {members
                      .slice()
                      .sort((a, b) => parseInt(a.payoutMonth) - parseInt(b.payoutMonth))
                      .map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between text-sm py-1"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">
                              {m.payoutMonth}
                            </div>
                            <span className="font-medium text-gray-900">{m.name}</span>
                          </div>
                          <span className="text-gray-400 text-xs">{m.phone}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Payment records note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">
                      {members.length * totalMonthsNum} payment records
                    </span>{" "}
                    will be auto-generated (all pending)
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 min-h-[44px]"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                className="flex-1 min-h-[48px] bg-green-600 hover:bg-green-700 text-white font-bold"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" />Create Kameti</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
