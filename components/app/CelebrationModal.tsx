"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  memberName: string;
  monthName: string;
  amount: number;
  phone: string;
}

// ─── Avatar color by first letter ────────────────────────────────────────────
const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "#fef2f2", text: "#b91c1c" },
  B: { bg: "#fff7ed", text: "#c2410c" },
  C: { bg: "#fffbeb", text: "#b45309" },
  D: { bg: "#fefce8", text: "#a16207" },
  E: { bg: "#f7fee7", text: "#4d7c0f" },
  F: { bg: "#f0fdf4", text: "#15803d" },
  G: { bg: "#ecfdf5", text: "#047857" },
  H: { bg: "#f0fdfa", text: "#0f766e" },
  I: { bg: "#ecfeff", text: "#0e7490" },
  J: { bg: "#f0f9ff", text: "#0369a1" },
  K: { bg: "#eff6ff", text: "#1d4ed8" },
  L: { bg: "#eef2ff", text: "#4338ca" },
  M: { bg: "#f5f3ff", text: "#6d28d9" },
  N: { bg: "#faf5ff", text: "#7e22ce" },
  O: { bg: "#fdf4ff", text: "#a21caf" },
  P: { bg: "#fdf2f8", text: "#be185d" },
  Q: { bg: "#fff1f2", text: "#be123c" },
  R: { bg: "#fef2f2", text: "#b91c1c" },
  S: { bg: "#fff7ed", text: "#c2410c" },
  T: { bg: "#fffbeb", text: "#b45309" },
  U: { bg: "#f0fdf4", text: "#15803d" },
  V: { bg: "#f0fdfa", text: "#0f766e" },
  W: { bg: "#eff6ff", text: "#1d4ed8" },
  X: { bg: "#eef2ff", text: "#4338ca" },
  Y: { bg: "#faf5ff", text: "#7e22ce" },
  Z: { bg: "#fdf4ff", text: "#a21caf" },
};

function getAvatarStyle(name: string) {
  const letter = name.trim().toUpperCase()[0] ?? "A";
  return AVATAR_COLORS[letter] ?? { bg: "#f0fdf4", text: "#15803d" };
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AUTO_CLOSE_SECONDS = 8;
const CIRCUMFERENCE = 2 * Math.PI * 44; // r=44

export default function CelebrationModal({
  open,
  onClose,
  memberName,
  monthName,
  amount,
  phone,
}: Props) {
  const [countdown, setCountdown] = useState(AUTO_CLOSE_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fire confetti on open ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    setCountdown(AUTO_CLOSE_SECONDS);

    // Fire confetti
    (async () => {
      try {
        const confetti = (await import("canvas-confetti")).default;
        // First burst
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.4 },
          colors: ["#16a34a", "#ca8a04", "#ffffff", "#86efac", "#fde68a"],
        });
        // Second burst after 400ms
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 100,
            origin: { y: 0.5, x: 0.3 },
            colors: ["#16a34a", "#ca8a04", "#fbbf24"],
          });
          confetti({
            particleCount: 80,
            spread: 100,
            origin: { y: 0.5, x: 0.7 },
            colors: ["#16a34a", "#ca8a04", "#fbbf24"],
          });
        }, 400);
      } catch {
        // confetti optional
      }
    })();

    // Countdown timer
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, onClose]);

  // ── WhatsApp share ────────────────────────────────────────────────────────
  function handleShare() {
    const cleaned = phone.replace(/\D/g, "").replace(/^0/, "");
    const number = cleaned.startsWith("92") ? cleaned : `92${cleaned}`;
    const appUrl = typeof window !== "undefined" ? window.location.origin : "https://kametipro.vercel.app";
    const message = `Alhamdulillah! ${memberName} ki ${monthName} kameti PKR ${amount.toLocaleString()} mil gayi! 🎉 KametiPro se manage karo apni kameti: ${appUrl}`;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // ── Countdown ring progress ───────────────────────────────────────────────
  const ringProgress = (countdown / AUTO_CLOSE_SECONDS) * CIRCUMFERENCE;
  const avatarStyle = getAvatarStyle(memberName);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="max-w-sm w-full mx-4 rounded-3xl border-0 shadow-2xl overflow-hidden p-0"
        // Hide default close button — we have our own
        style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fefce8 50%, #f0fdf4 100%)" }}
      >
        {/* ── Top decoration ── */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-amber-400 to-green-400" />

        <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center space-y-4">

          {/* ── Avatar with countdown ring ── */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG countdown ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background ring */}
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              {/* Progress ring */}
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="#ca8a04"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${ringProgress} ${CIRCUMFERENCE}`}
                style={{ transition: "stroke-dasharray 1s linear" }}
              />
            </svg>

            {/* Avatar circle */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg border-4 border-white"
              style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}
            >
              {getInitials(memberName)}
            </div>

            {/* Countdown number */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
              {countdown}
            </div>
          </div>

          {/* ── Text content ── */}
          <div className="space-y-1">
            {/* Mubarak Ho */}
            <p
              className="font-bold text-green-700 leading-tight"
              style={{ fontSize: "28px" }}
            >
              Mubarak Ho! 🎉
            </p>

            {/* Member name */}
            <p
              className="font-bold text-gray-900 leading-tight"
              style={{ fontSize: "22px" }}
            >
              {memberName}
            </p>

            {/* Amount */}
            <p
              className="font-bold text-amber-600 leading-tight"
              style={{ fontSize: "18px" }}
            >
              {formatCurrency(amount)} mil gayi!
            </p>

            {/* Month */}
            <p className="text-sm text-gray-500 mt-1">{monthName}</p>
          </div>

          {/* ── Decorative divider ── */}
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-200" />
            <span className="text-amber-400 text-lg">✦</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-200" />
          </div>

          {/* ── Buttons ── */}
          <div className="w-full space-y-3">
            {/* Share on WhatsApp */}
            <Button
              onClick={handleShare}
              className="w-full min-h-[48px] bg-green-600 hover:bg-green-700 text-white font-semibold text-base rounded-xl"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-white flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </Button>

            {/* Done */}
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full min-h-[44px] rounded-xl border-gray-300 text-gray-600 font-medium"
            >
              Done
            </Button>
          </div>

          {/* Auto-close hint */}
          <p className="text-xs text-gray-400">
            Auto-closing in {countdown}s
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
