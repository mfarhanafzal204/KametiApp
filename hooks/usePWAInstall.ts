"use client";

import { useState, useEffect, useCallback } from "react";

// The BeforeInstallPromptEvent is not in standard TS lib yet
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const DISMISSED_KEY = "kametipro_install_dismissed";

export interface PWAInstallState {
  /** True when we should show the install banner */
  canInstall: boolean;
  /** True when running on iOS (needs manual "Add to Home Screen") */
  isIOS: boolean;
  /** Call this to trigger the native install prompt (Android only) */
  promptInstall: () => Promise<void>;
  /** Call this to permanently dismiss the banner */
  dismiss: () => void;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed
    try {
      if (localStorage.getItem(DISMISSED_KEY) === "1") return;
    } catch {
      return;
    }

    // Don't show if already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Also check iOS standalone mode
    if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return;

    // ── iOS detection ──────────────────────────────────────────────────────
    const ua = window.navigator.userAgent;
    const iosDevice = /iphone|ipad|ipod/i.test(ua);
    const safariOnly = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);

    if (iosDevice && safariOnly) {
      setIsIOS(true);
      setCanInstall(true);
      return;
    }

    // ── Android / Desktop Chrome ───────────────────────────────────────────
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setCanInstall(false);
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      try { localStorage.setItem(DISMISSED_KEY, "1"); } catch { /* ignore */ }
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setCanInstall(false);
    setDeferredPrompt(null);
    try { localStorage.setItem(DISMISSED_KEY, "1"); } catch { /* ignore */ }
  }, []);

  return { canInstall, isIOS, promptInstall, dismiss };
}
