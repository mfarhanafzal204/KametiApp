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
  /** True when the browser has fired beforeinstallprompt and we haven't dismissed */
  canInstall: boolean;
  /** Call this to trigger the native install prompt */
  promptInstall: () => Promise<void>;
  /** Call this to permanently dismiss the banner */
  dismiss: () => void;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed
    try {
      if (localStorage.getItem(DISMISSED_KEY) === "1") return;
    } catch {
      // localStorage unavailable
      return;
    }

    // Don't show if already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // Whether accepted or dismissed, hide the banner
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

  return { canInstall, promptInstall, dismiss };
}
