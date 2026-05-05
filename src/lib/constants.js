export const NAV_ITEMS = [
  { to: "/", label: "Feed", icon: "auto_stories" },
  { to: "/trending", label: "Trending", icon: "trending_up" },
  { to: "/compose", label: "Compose", icon: "edit_square" },
  { to: "/spotlight", label: "Spotlight", icon: "stars" },
];

export const TIERS = {
  NAYA_SHAYAR: {
    label: "Naya Shayar",
    className: "from-slate-500 to-slate-300 text-slate-950",
  },
  USTAD: {
    label: "Ustaad",
    className: "from-gold to-gold-soft text-slate-950",
  },
  MAHFIL_E_KHAS: {
    label: "Mahfil-e-Khas",
    className: "from-primary to-primary-deep text-white",
  },
};

export const FEED_SCOPES = [
  { value: "latest", label: "Sabse Naya" },
  { value: "following", label: "Mere Log" },
];
