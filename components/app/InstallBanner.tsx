"use client";

import { useEffect, useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { X, Download } from "lucide-react";

export default function InstallBanner() {
  const { canInstall, promptInstall, dismiss } = usePWAInstall();
  // Delay mount by 3s so it doesn't flash on first load
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!canInstall) { setVisible(false); return; }
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [canInstall]);

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Install KametiPro app"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Backdrop blur card */}
      <div className="mx-auto max-w-lg mb-3 rounded-2xl border border-green-200 bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Green top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />

        <div className="px-4 py-3.5 flex items-center gap-3">
          {/* App icon */}
          <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-bold text-lg leading-none">₨</span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight">
              Install KametiPro on your phone
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">
              Use it like a native app — works offline too!
            </p>
          </div>

          {/* Install button */}
          <button
            onClick={promptInstall}
            className="flex-shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all min-h-[36px]"
            aria-label="Install app"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
