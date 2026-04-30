import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, LayoutList, WifiOff, Coins, CheckCircle2 } from "lucide-react";

// ─── Page-level metadata (WhatsApp / OG preview) ──────────────────────────────
export const metadata: Metadata = {
  title: "KametiPro — Pakistan Ka Sabse Asaan Kameti App",
  description:
    "Manage your savings committee digitally. Track payments, send WhatsApp reminders, and handle payouts — free forever.",
  keywords: [
    "kameti app", "committee app pakistan", "kameti tracker",
    "rotating savings pakistan", "chit fund app", "kameti management",
  ],
  openGraph: {
    type: "website",
    siteName: "KametiPro",
    title: "KametiPro — Pakistan Ka Sabse Asaan Kameti App",
    description:
      "Manage your savings committee digitally. Track payments, send WhatsApp reminders, and handle payouts — free forever.",
    url: "https://kametipro.vercel.app",
    images: [
      {
        url: "https://kametipro.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "KametiPro — Pakistan Ka Sabse Asaan Kameti App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KametiPro — Pakistan Ka Sabse Asaan Kameti App",
    description:
      "Manage your savings committee digitally. Track payments, send WhatsApp reminders — free forever.",
    images: ["https://kametipro.vercel.app/og-image.png"],
  },
};

// ─── Feature cards data ───────────────────────────────────────────────────────
const features = [
  {
    icon: MessageCircle,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "WhatsApp Reminders",
    desc: "Send payment reminders in one tap — no manual calling, no awkward follow-ups.",
  },
  {
    icon: LayoutList,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Beautiful Timeline",
    desc: "See the entire kameti journey at a glance — who paid, who's next, what's collected.",
  },
  {
    icon: WifiOff,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Works Offline",
    desc: "Install on your phone and use it without internet — your data is always available.",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = [
  { value: "10,000+", label: "Kametis Managed" },
  { value: "50,000+", label: "Payments Tracked" },
  { value: "100%", label: "Free Forever" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ══ NAV ══════════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shadow-sm">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">KametiPro</span>
          </div>
          {/* Nav actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors min-h-[40px] flex items-center"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors min-h-[40px] flex items-center shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #fefce8 55%, #f0fdf4 100%)" }}
      >
        {/* Decorative SVG blobs — pure CSS, no images */}
        <svg
          aria-hidden="true"
          className="absolute top-0 right-0 w-72 h-72 opacity-20 pointer-events-none"
          viewBox="0 0 200 200"
        >
          <circle cx="150" cy="50" r="80" fill="#16a34a" />
        </svg>
        <svg
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-56 h-56 opacity-10 pointer-events-none"
          viewBox="0 0 200 200"
        >
          <circle cx="50" cy="150" r="70" fill="#ca8a04" />
        </svg>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
          {/* Flag badge */}
          <div className="inline-flex items-center gap-1.5 bg-white border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 shadow-sm">
            <span>🇵🇰</span>
            <span>Built for Pakistan</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
            Pakistan Ka{" "}
            <span className="text-green-600">Sabse Asaan</span>
            <br />
            Kameti App
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Manage your savings committee digitally.{" "}
            <span className="font-medium text-gray-800">Track payments.</span>{" "}
            <span className="font-medium text-gray-800">Send WhatsApp reminders.</span>{" "}
            <span className="text-green-700 font-semibold">Free forever.</span>
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-green-200 transition-all min-h-[52px]"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 text-gray-700 font-semibold text-base px-8 py-3.5 rounded-2xl transition-all min-h-[52px]"
            >
              See How It Works
            </a>
          </div>

          <p className="mt-5 text-xs text-gray-400 font-medium tracking-wide">
            No credit card · No signup fee · Works on any phone
          </p>

          {/* Hero visual — CSS-only phone mockup */}
          <div className="mt-14 flex justify-center">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Sab Kuch Ek Jagah
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              No more paper registers, WhatsApp confusion, or missed payments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {/* Top accent on hover */}
                <div className="absolute top-0 left-6 right-6 h-0.5 bg-green-400 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.iconBg}`}>
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              3 Steps Mein Shuru Karen
            </h2>
          </div>
          <div className="space-y-6">
            {[
              {
                n: "1",
                title: "Account Banao",
                desc: "Google se ek click mein sign in — koi form nahi, koi wait nahi.",
              },
              {
                n: "2",
                title: "Kameti Setup Karo",
                desc: "Naam, maheena qist, total maheene, aur arkaan add karo — 2 minute mein.",
              },
              {
                n: "3",
                title: "Track Karo, Remind Karo",
                desc: "Har maheene payments mark karo, WhatsApp reminders bhejo, aur payout celebrate karo.",
              },
            ].map((step) => (
              <div key={step.n} className="flex gap-5 items-start bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md shadow-green-200">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUST / STATS ════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-3">
            Trusted Across Pakistan
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Hazaron Pakistanion Ka Bharosa
          </h2>
          <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
            Join thousands of Pakistanis managing their kametis digitally — from Karachi to Peshawar.
          </p>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-2xl sm:text-3xl font-extrabold text-green-600 leading-none mb-1">
                  {s.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {[
              "Free Forever",
              "No Credit Card",
              "Works Offline",
              "WhatsApp Ready",
              "Secure & Private",
            ].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════════ */}
      <section
        className="py-20 px-4 sm:px-6"
        style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          {/* Decorative coins SVG */}
          <div className="flex justify-center mb-6" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="28" fill="rgba(255,255,255,0.15)" />
              <circle cx="28" cy="28" r="20" fill="rgba(255,255,255,0.2)" />
              <text x="28" y="35" textAnchor="middle" fontSize="20" fill="white" fontWeight="bold">₨</text>
            </svg>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
            Shuru Karen —{" "}
            <span className="text-green-200">Bilkul Free</span>
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-md mx-auto">
            Aaj hi apni kameti digital banao. Koi fee nahi, koi subscription nahi.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white hover:bg-green-50 active:scale-[0.98] text-green-700 font-bold text-lg px-10 py-4 rounded-2xl shadow-xl transition-all min-h-[56px]"
          >
            Shuru Karen — Bilkul Free
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="mt-5 text-green-200 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-semibold underline underline-offset-2 hover:text-green-100">
              Sign in here
            </Link>
          </p>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-900 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center">
            <Coins className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base">KametiPro</span>
        </div>
        <p className="text-gray-400 text-sm mb-1">
          Pakistan ka sabse asaan kameti management app.
        </p>
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} KametiPro · Free Forever · Made with ❤️ for Pakistan
        </p>
      </footer>

    </div>
  );
}

// ─── CSS-only phone mockup ────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div
      className="relative w-[200px] sm:w-[220px]"
      aria-hidden="true"
      role="presentation"
    >
      {/* Phone shell */}
      <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl shadow-gray-400/40">
        {/* Screen */}
        <div className="bg-white rounded-[2rem] overflow-hidden" style={{ minHeight: 380 }}>
          {/* Status bar */}
          <div className="bg-green-600 px-4 pt-3 pb-2">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">₨</span>
              </div>
              <span className="text-white text-[10px] font-bold">KametiPro</span>
            </div>
            <p className="text-green-100 text-[8px]">Family Kameti 2025</p>
          </div>

          {/* Mock content */}
          <div className="p-3 space-y-2">
            {/* Month header */}
            <div className="flex justify-between items-center">
              <div>
                <div className="h-2.5 w-16 bg-gray-800 rounded-full" />
                <div className="h-1.5 w-10 bg-gray-200 rounded-full mt-1" />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-gray-800">8<span className="text-gray-400 font-normal">/10</span></div>
                <div className="text-[8px] text-green-600 font-medium">paid</div>
              </div>
            </div>

            {/* Member rows */}
            {[
              { name: "Ahmed Ali", paid: true },
              { name: "Sara Khan", paid: true },
              { name: "Bilal Raza", paid: false },
              { name: "Fatima Noor", paid: true },
            ].map((m) => (
              <div key={m.name} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${m.paid ? "bg-green-50" : "bg-gray-50"}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0 ${m.paid ? "bg-green-200 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-1.5 bg-gray-300 rounded-full w-14" />
                </div>
                <div className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${m.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {m.paid ? "PAID" : "DUE"}
                </div>
              </div>
            ))}

            {/* Progress bar */}
            <div className="mt-1">
              <div className="flex justify-between text-[7px] text-gray-400 mb-1">
                <span>Collection</span>
                <span className="font-semibold text-green-600">80%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "80%" }} />
              </div>
            </div>

            {/* Payout card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 mt-1">
              <div className="text-[7px] text-amber-600 font-semibold uppercase tracking-wide">This month&apos;s payout</div>
              <div className="text-[9px] font-bold text-gray-800 mt-0.5">Ahmed Ali</div>
              <div className="text-[8px] text-amber-700 font-semibold">PKR 50,000</div>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center mt-1.5 mb-0.5">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-4 bg-green-400/10 rounded-full blur-2xl -z-10" />
    </div>
  );
}
