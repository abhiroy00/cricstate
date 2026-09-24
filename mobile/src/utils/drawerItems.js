// Drawer ka single source of truth — har item kaha link hoga
// type: drawer | tab | info | action | modal | external
export const DRAWER_ITEMS = [
  { key: "pro", label: "PRO at ₹199 (No autopay)", icon: "🏅", type: "drawer", target: "ProBenefits" },
  { key: "add-tournament", label: "Add a Tournament/Series", icon: "🏆", badge: "Free", type: "tab", tab: "My Cricket", target: "CreateTournament" },
  { key: "start-match", label: "Start A Match", icon: "⏱", badge: "Free", type: "tab", tab: "My Cricket", target: "StartMatch" },
  { key: "go-live", label: "Go Live", icon: "🎥", type: "tab", tab: "Looking", target: "LiveStreamers" },
  { key: "my-cricket", label: "My Cricket", icon: "🏏", type: "tab", tab: "My Cricket", target: "MyCricketHome" },
  { key: "my-performance", label: "My Performance", icon: "📊", type: "tab", tab: "My Cricket", target: "MyCricketHome", params: { section: "STATS" } },
  { key: "store", label: "CricHeroes Store", icon: "🛒", type: "tab", tab: "Store", target: "StoreHome" },
  { key: "leaderboards", label: "Leaderboards", icon: "🏵", type: "tab", tab: "Community", target: "RoleBoard", params: { role: "scorers" } },
  { key: "awards", label: "CricHeroes Awards", icon: "🏆", type: "info", title: "CricHeroes Awards" },
  { key: "associations", label: "Associations", icon: "🤝", type: "info", title: "Associations" },
  { key: "clubs", label: "Clubs", icon: "👥", type: "info", title: "Clubs" },
  { key: "contact", label: "Contact", icon: "📞", type: "info", title: "Contact" },
  { key: "share", label: "Share the app", icon: "↗", type: "action", action: "share" },
  { key: "rate", label: "Rate us", icon: "⭐", type: "action", action: "rate" },
  { key: "app-code", label: "App code", icon: "🔢", type: "action", action: "appCode" },
];

export const DRAWER_MORE_ITEMS = [
  { key: "whats-new", label: "What's New", icon: "ⓘ", type: "info", title: "What's New" },
  { key: "language", label: "Change Language", icon: "🌐", type: "modal", action: "language" },
  { key: "instagram", label: "Instagram", icon: "📷", type: "external", url: "https://www.instagram.com/" },
  { key: "youtube", label: "YouTube", icon: "▶️", type: "external", url: "https://www.youtube.com/" },
  { key: "facebook", label: "Facebook", icon: "📘", type: "external", url: "https://www.facebook.com/" },
  { key: "x", label: "X", icon: "✖️", type: "external", url: "https://x.com/" },
  { key: "about", label: "About Us", icon: "🛡", type: "info", title: "About Us" },
  { key: "blog", label: "Blog", icon: "📰", type: "info", title: "Blog" },
  { key: "faq", label: "Help / FAQs", icon: "❓", type: "info", title: "Help / FAQs" },
  { key: "privacy", label: "Privacy Policy", icon: "📄", type: "info", title: "Privacy Policy" },
  { key: "terms", label: "Terms of Service", icon: "📃", type: "info", title: "Terms of Service" },
  { key: "paid-terms", label: "Paid Service Terms", icon: "🧾", type: "info", title: "Paid Service Terms" },
];
