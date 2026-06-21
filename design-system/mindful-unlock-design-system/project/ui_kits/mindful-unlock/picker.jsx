// Bottom sheets — the polished "hybrid native" surfaces.
//  • BottomSheet  : reusable frosted sheet shell (grabber + header)
//  • UnlockPicker : choose which app to unlock (starts the ritual)
//  • BlockSheet   : a redesigned, on-brand replacement for iOS's stock
//                   Screen Time / Family Activity picker — the jarring
//                   native window, made to feel like part of the app.
(function () {
  const { Feather, Pill, IconTile, Checkbox, Button, APPS, LEVEL_COLORS } = window.MU;

  function BottomSheet({ title, subtitle, onClose, children, footer, tall }) {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(5,5,8,0.55)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }} />
        <div style={{
          position: "relative", maxHeight: tall ? "88%" : "74%", display: "flex", flexDirection: "column",
          background: "color-mix(in srgb, var(--surface-card) 88%, transparent)",
          backdropFilter: "saturate(160%) blur(28px)", WebkitBackdropFilter: "saturate(160%) blur(28px)",
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          borderTop: "1px solid rgba(255,255,255,0.07)", boxShadow: "var(--shadow-sheet)",
          animation: "muSheetUp 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
            <span style={{ width: 38, height: 5, borderRadius: 3, background: "var(--mu-border)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 22px 16px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{title}</div>
              {subtitle && <div style={{ fontSize: 13, lineHeight: 1.45, color: "var(--text-muted)", marginTop: 4 }}>{subtitle}</div>}
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, border: "none", background: "var(--mu-secondary)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Feather name="x" size={18} />
            </button>
          </div>
          <div style={{ overflowY: "auto", padding: "0 22px", flex: 1 }}>{children}</div>
          {footer && <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border-hairline)" }}>{footer}</div>}
        </div>
      </div>
    );
  }

  function UnlockPicker({ tracked, opensToday, onClose, onSelect }) {
    return (
      <BottomSheet title="Which app?" subtitle="Select the app you want to unlock to begin your ritual." onClose={onClose}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 20 }}>
          {tracked.map((app) => {
            const opens = opensToday[app.id] || 0;
            const lvl = Math.min(opens, 3);
            return (
              <div key={app.id} onClick={() => onSelect(app.id)} style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: 16, padding: 16, cursor: "pointer" }}>
                <IconTile color={app.color}><Feather name={app.icon} size={22} /></IconTile>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{app.name}</div>
                  {(opens > 0 || app.streak > 0) && (
                    <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                      {opens > 0 && <Pill tone={LEVEL_COLORS[lvl]} dot>{opens} open{opens === 1 ? "" : "s"} today</Pill>}
                      {app.streak > 0 && <Pill tone="var(--mu-amber)" icon={<Feather name="trending-up" size={10} />}>{app.streak}d streak</Pill>}
                    </div>
                  )}
                </div>
                <Feather name="chevron-right" size={18} color="var(--text-muted)" />
              </div>
            );
          })}
        </div>
      </BottomSheet>
    );
  }

  // The redesigned Screen Time picker.
  function BlockSheet({ onClose, onSave }) {
    const ids = Object.keys(APPS);
    const [sel, setSel] = React.useState(new Set(["instagram", "twitter", "youtube", "tiktok", "reddit"]));
    const [q, setQ] = React.useState("");
    const toggle = (id) => setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const shown = ids.filter((id) => APPS[id].name.toLowerCase().includes(q.toLowerCase()));

    return (
      <BottomSheet
        tall
        title="Choose apps to block"
        subtitle="Pick the apps that should sit behind your shield. You'll run the unlock ritual whenever you reach for one."
        onClose={onClose}
        footer={<Button icon={<Feather name="shield" size={16} />} iconPosition="left" onClick={() => onSave(sel)}>Block {sel.size} app{sel.size === 1 ? "" : "s"}</Button>}
      >
        <div style={{ position: "sticky", top: 0, paddingBottom: 12, background: "linear-gradient(var(--surface-card), color-mix(in srgb, var(--surface-card) 0%, transparent))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-input)", border: "1px solid var(--border-hairline)", borderRadius: 12, padding: "11px 14px" }}>
            <Feather name="search" size={16} color="var(--text-muted)" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps & categories" style={{ flex: 1, border: "none", background: "none", outline: "none", color: "var(--text-primary)", fontFamily: "var(--font-sans)", fontSize: 14 }} />
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-muted)", margin: "4px 0 10px" }}>Social & Entertainment</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16 }}>
          {shown.map((id) => {
            const app = APPS[id];
            const checked = sel.has(id);
            return (
              <div key={id} onClick={() => toggle(id)} style={{ display: "flex", alignItems: "center", gap: 14, background: checked ? "color-mix(in srgb, var(--mu-amber) 7%, var(--surface-card))" : "var(--surface-card)", border: `1px solid ${checked ? "color-mix(in srgb, var(--mu-amber) 33%, transparent)" : "var(--border-hairline)"}`, borderRadius: 14, padding: 13, cursor: "pointer", transition: "background 0.12s, border-color 0.12s" }}>
                <IconTile color={app.color} size={40}><Feather name={app.icon} size={18} /></IconTile>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>{app.name}</span>
                <Checkbox checked={checked} onChange={(e) => { e.stopPropagation(); toggle(id); }} />
              </div>
            );
          })}
        </div>
      </BottomSheet>
    );
  }

  Object.assign(window.MU, { BottomSheet, UnlockPicker, BlockSheet });
})();
