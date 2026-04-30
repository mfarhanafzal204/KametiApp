// ─── Translation keys ─────────────────────────────────────────────────────────
export type Lang = "en" | "ur";

export type TranslationKeys = {
  // Nav / general
  dashboard: string;
  settings: string;
  logout: string;
  profile: string;
  // Stats
  activeKametis: string;
  totalPool: string;
  pendingThisMonth: string;
  // Dashboard
  yourKametis: string;
  createKameti: string;
  noKametis: string;
  noKametisDesc: string;
  createFirstKameti: string;
  newKameti: string;
  viewDetails: string;
  total: string;
  monthOf: string;
  // Tabs
  thisMonth: string;
  timeline: string;
  allMembers: string;
  // Payment status
  paid: string;
  pending: string;
  // Actions
  sendReminder: string;
  markPaidOut: string;
  paidOut: string;
  // Members
  members: string;
  monthlyAmount: string;
  totalMonths: string;
  // Kameti detail
  thisMonthsPayout: string;
  collectionProgress: string;
  membersPaid: string;
  // Timeline
  kametiRunning: string;
  monthsLeft: string;
  thisMonthBadge: string;
  noMemberAssigned: string;
  expected: string;
  collectionProgressLabel: string;
  // All members tab
  collected: string;
  totalCollected: string;
  memberPaymentHistory: string;
  payoutMonth: string;
  paidOutBadge: string;
  monthOverview: string;
  collectionSummary: string;
  paidInstallments: string;
  pendingInstallments: string;
  // Status badges
  active: string;
  completed: string;
  paused: string;
  // Greeting
  greeting: string;
  // Signing out
  signingOut: string;
  signOut: string;
};

// ─── Translations ─────────────────────────────────────────────────────────────
export const translations: Record<Lang, TranslationKeys> = {
  en: {
    dashboard: "Dashboard",
    settings: "Settings",
    logout: "Logout",
    profile: "Profile",
    activeKametis: "Active Kametis",
    totalPool: "Total Pool",
    pendingThisMonth: "Pending This Month",
    yourKametis: "Your Kametis",
    createKameti: "Create Kameti",
    noKametis: "No kametis yet",
    noKametisDesc: "Create your first one to start tracking contributions and payouts.",
    createFirstKameti: "Create First Kameti",
    newKameti: "New Kameti",
    viewDetails: "View details",
    total: "total",
    monthOf: "Month {current} of {total}",
    thisMonth: "This Month",
    timeline: "Timeline",
    allMembers: "All Members",
    paid: "Paid",
    pending: "Pending",
    sendReminder: "Send Reminder",
    markPaidOut: "Mark as Paid Out",
    paidOut: "Paid Out!",
    members: "Members",
    monthlyAmount: "Monthly Amount",
    totalMonths: "Total Months",
    thisMonthsPayout: "This month's payout goes to",
    collectionProgress: "Collection progress for payout",
    membersPaid: "{paid}/{total} members paid",
    kametiRunning: "Kameti running",
    monthsLeft: "months left",
    thisMonthBadge: "THIS MONTH",
    noMemberAssigned: "No member assigned",
    expected: "Expected:",
    collectionProgressLabel: "Collection progress",
    collected: "Collected",
    totalCollected: "Total Collected",
    memberPaymentHistory: "Member Payment History",
    payoutMonth: "Payout month",
    paidOutBadge: "Paid out",
    monthOverview: "Month Overview",
    collectionSummary: "Collection Summary",
    paidInstallments: "Paid installments",
    pendingInstallments: "Pending installments",
    active: "Active",
    completed: "Completed",
    paused: "Paused",
    greeting: "Assalam o Alaikum",
    signingOut: "Signing out…",
    signOut: "Logout",
  },
  ur: {
    dashboard: "Dashboard",
    settings: "Settings",
    logout: "Bahar Jao",
    profile: "Profile",
    activeKametis: "Chalti Kameti",
    totalPool: "Kul Rakam",
    pendingThisMonth: "Is Maheenay Baqi",
    yourKametis: "Aap Ki Kametiyaan",
    createKameti: "Nai Kameti Banao",
    noKametis: "Abhi koi kameti nahi",
    noKametisDesc: "Pehli kameti banao aur hisaab kitaab shuru karo.",
    createFirstKameti: "Pehli Kameti Banao",
    newKameti: "Nai Kameti",
    viewDetails: "Tafseel Dekho",
    total: "kul",
    monthOf: "Maheena {current} / {total}",
    thisMonth: "Is Maheeney",
    timeline: "Tarteeb",
    allMembers: "Tamam Arkaan",
    paid: "Ada Ho Gayi",
    pending: "Baqi Hai",
    sendReminder: "Yaad Dilao",
    markPaidOut: "Raqam De Di",
    paidOut: "De Di Gayi!",
    members: "Arkaan",
    monthlyAmount: "Maheena Qist",
    totalMonths: "Kul Maheene",
    thisMonthsPayout: "Is maheenay ki kameti milegi",
    collectionProgress: "Wusool ki taraqqi",
    membersPaid: "{paid}/{total} arkaan ne ada ki",
    kametiRunning: "Kameti chal rahi hai",
    monthsLeft: "maheene baqi",
    thisMonthBadge: "YEH MAHEENA",
    noMemberAssigned: "Koi arkaan nahi",
    expected: "Mutawaqqa:",
    collectionProgressLabel: "Wusool ki taraqqi",
    collected: "Wusool",
    totalCollected: "Kul Wusool",
    memberPaymentHistory: "Arkaan ki Adaigi Tarikh",
    payoutMonth: "Kameti ka maheena",
    paidOutBadge: "Mil gayi",
    monthOverview: "Maheenay Ka Jaiza",
    collectionSummary: "Wusool Ka Khulasa",
    paidInstallments: "Ada shuda qistain",
    pendingInstallments: "Baqi qistain",
    active: "Chal Rahi",
    completed: "Mukammal",
    paused: "Ruki Hui",
    greeting: "Assalam o Alaikum",
    signingOut: "Bahar ja rahe hain…",
    signOut: "Bahar Jao",
  },
};

// ─── Helper to interpolate {placeholders} ────────────────────────────────────
export function interpolate(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}
