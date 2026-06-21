// Shared frame + helpers for the Mindful Unlock UI kit.
// Exposes window.MU = { Feather, PhoneFrame, StatusBar, APPS, fmt }

(function () {
  const NS = window.MindfulUnlockDesignSystem_bf3027;

  function Feather({ name, size = 20, color = "currentColor", style }) {
    const icon = window.feather.icons[name];
    return (
      <span
        style={{ display: "inline-flex", lineHeight: 0, ...style }}
        dangerouslySetInnerHTML={{ __html: icon ? icon.toSvg({ width: size, height: size, color }) : "" }}
      />
    );
  }

  // iOS status bar — part of the polished hybrid-native chrome.
  function StatusBar() {
    return (
      <div style={{
        height: 54, flexShrink: 0, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 28px 0 32px",
        fontFamily: "var(--font-sans)", color: "var(--text-primary)",
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: 0.2 }}>9:41</span>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Feather name="bell" size={14} color="var(--text-primary)" />
          <Feather name="wifi" size={15} color="var(--text-primary)" />
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="var(--text-primary)" opacity="0.4" />
            <rect x="2" y="2" width="16" height="8" rx="1.5" fill="var(--text-primary)" />
            <rect x="21.5" y="4" width="1.5" height="4" rx="0.75" fill="var(--text-primary)" opacity="0.4" />
          </svg>
        </div>
      </div>
    );
  }

  // The device bezel. Children fill the screen; the canvas itself scrolls.
  function PhoneFrame({ children, frosted }) {
    return (
      <div style={{
        width: 390, height: 844, borderRadius: 54, padding: 5,
        background: "linear-gradient(155deg, #2a2a32, #0c0c10)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        flexShrink: 0,
      }}>
        <div style={{
          position: "relative", width: "100%", height: "100%",
          borderRadius: 49, overflow: "hidden", background: "var(--surface-app)",
          display: "flex", flexDirection: "column",
        }}>
          {/* Dynamic island */}
          <div style={{
            position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)",
            width: 112, height: 33, borderRadius: 20, background: "#000", zIndex: 50,
          }} />
          {children}
        </div>
      </div>
    );
  }

  // Predefined apps (brand colors + Feather glyphs), mirroring constants/availableApps.ts
  const APPS = {
    instagram: { id: "instagram", name: "Instagram", icon: "instagram", color: "#E1306C" },
    twitter:   { id: "twitter",   name: "X / Twitter", icon: "twitter", color: "#1DA1F2" },
    youtube:   { id: "youtube",   name: "YouTube",   icon: "youtube",   color: "#FF0000" },
    tiktok:    { id: "tiktok",    name: "TikTok",     icon: "music",     color: "#FF004F" },
    reddit:    { id: "reddit",    name: "Reddit",     icon: "message-circle", color: "#FF4500" },
    netflix:   { id: "netflix",   name: "Netflix",    icon: "film",      color: "#E50914" },
    spotify:   { id: "spotify",   name: "Spotify",    icon: "headphones", color: "#1DB954" },
    facebook:  { id: "facebook",  name: "Facebook",   icon: "facebook",  color: "#1877F2" },
    linkedin:  { id: "linkedin",  name: "LinkedIn",   icon: "linkedin",  color: "#0A66C2" },
    discord:   { id: "discord",   name: "Discord",    icon: "hash",      color: "#5865F2" },
  };

  const LEVEL_COLORS = ["var(--mu-level-1)", "var(--mu-level-2)", "var(--mu-level-3)", "var(--mu-level-4)"];

  function relTime(mins) {
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    const h = Math.floor(mins / 60);
    if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }

  window.MU = { ...NS, Feather, StatusBar, PhoneFrame, APPS, LEVEL_COLORS, relTime };
})();
