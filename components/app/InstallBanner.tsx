"use client";

import { useEffect, useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { X, Download, Share, Plus } from "lucide-react";

// Progress bar that drains over 8 seconds
function CountdownBar({ duration }: { duration: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
      <div
        className="h-full bg-white/40 rounded-full"
        style={{
          animation: `drain ${duration}ms linear forwards`,
        }}
      />
      <style>{`
        @keyframes drain {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export default function InstallBanner() {
  const { canInstall, isIOS, promptInstall, dismiss } = usePWAInstall();

  const [phase, setPhase] = useState<"hidden" | "entering" | "visible" | "leaving">("hidden");

  const SHOW_DELAY  = 3000;   // wait 3s before appearing
  const VISIBLE_FOR = 9000;   // stay visible 9s
  const ANIM_MS     = 500;    // slide animation duration

  function leave() {
    setPhase("leaving");
    setTimeout(() => {
      setPhase("hidden");
      dismiss();
    }, ANIM_MS);
  }

  useEffect(() => {
    if (!canInstall) { setPhase("hidden"); return; }

    const showTimer = setTimeout(() => {
      setPhase("entering");
      // After entering animation, mark as visible
      setTimeout(() => setPhase("visible"), ANIM_MS);
    }, SHOW_DELAY);

    // Auto-dismiss after show delay + animation + visible time
    const hideTimer = setTimeout(() => {
      leave();
    }, SHOW_DELAY + ANIM_MS + VISIBLE_FOR);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canInstall]);

  if (phase === "hidden") return null;

  const isSliding = phase === "entering" || phase === "leaving";

  return (
    <>
      {/* ── Slide-up animation styles ── */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(110%); opacity: 0; }
        }
      `}</style>

      <div
        role="banner"
        aria-label="Install KametiPro app"
        className="fixed bottom-0 left-0 right-0 z-[100] px-3 sm:px-4"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}
      >
        <div
          className="mx-auto max-w-md"
          style={{
            animation: isSliding
              ? phase === "entering"
                ? `slideUp ${ANIM_MS}ms cubic-bezier(0.34,1.56,0.64,1) forwards`
                : `slideDown ${ANIM_MS}ms ease-in forwards`
              : undefined,
          }}
        >
          {/* ── Card ── */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/25">

            {/* Gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, #15803d 0%, #16a34a 50%, #059669 100%)",
              }}
            />

            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />

            {/* Content */}
            <div className="relative px-4 py-4 flex items-center gap-3">

              {/* App icon */}
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-black text-xl leading-none">₨</span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm leading-tight">
                  Install KametiPro
                </p>
                {isIOS ? (
                  <p className="text-green-100 text-xs mt-0.5 leading-tight">
                    Tap <Share className="w-3 h-3 inline mx-0.5 -mt-0.5" /> then{" "}
                    <span className="font-semibold">&quot;Add to Home Screen&quot;</span>
                  </p>
                ) : (
                  <p className="text-green-100 text-xs mt-0.5 leading-tight">
                    Works offline · Faster · No app store needed
                  </p>
                )}
              </div>

              {/* CTA button — Android only (iOS needs manual steps) */}
              {!isIOS && (
                <button
                  onClick={async () => {
                    await promptInstall();
                    setPhase("hidden");
                  }}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-white hover:bg-green-50 active:scale-95 text-green-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-md min-h-[40px]"
                  aria-label="Install app"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install
                </button>
              )}

              {/* iOS: show a visual hint icon */}
              {isIOS && (
                <div className="flex-shrink-0 flex items-center gap-1 bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl min-h-[40px]">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </div>
              )}

              {/* Dismiss */}
              <button
                onClick={leave}
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Countdown drain bar */}
            {phase === "visible" && <CountdownBar duration={VISIBLE_FOR} />}
          </div>
        </div>
      </div>
    </>
  );
}
