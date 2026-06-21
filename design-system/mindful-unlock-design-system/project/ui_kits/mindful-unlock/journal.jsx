// Journal screen — grouped unlock sessions with intention / oath blocks.
(function () {
  const { Feather, Pill, IconTile, APPS, LEVEL_COLORS } = window.MU;
  const VISIT = ["Visit 1", "Visit 2", "Visit 3", "Visit 4+"];

  function SessionCard({ s }) {
    const app = APPS[s.appId] || { color: "#6B7280", icon: "smartphone" };
    const lvl = Math.min(s.level - 1, 3);
    return (
      <div style={{
        background: "var(--surface-card)",
        border: `1px solid ${s.emergency ? "color-mix(in srgb, var(--mu-danger) 44%, transparent)" : "var(--border-hairline)"}`,
        borderRadius: 14, padding: 16, marginBottom: 10, display: "flex", flexDirection: "column", gap: 10,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconTile color={app.color} size={34} radius={9}><Feather name={app.icon} size={16} /></IconTile>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{s.appName}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.time}{s.duration ? "  ·  " + s.duration : ""}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {s.streak > 0 && <Pill tone="var(--mu-amber)" icon={<Feather name="trending-up" size={10} />}>{s.streak}d</Pill>}
            {s.emergency
              ? <Pill tone="var(--mu-danger)" icon={<Feather name="alert-triangle" size={10} />}>Emergency</Pill>
              : <Pill tone={LEVEL_COLORS[lvl]}>{VISIT[lvl]}</Pill>}
          </div>
        </div>

        <Block label="Intention" color="var(--mu-amber)">{s.intention}</Block>
        {s.necessity && <Block label="Necessity" color="var(--mu-amber)">{s.necessity}</Block>}
        {s.oath && <Block label="Oath" color="var(--mu-purple)" border="var(--mu-purple)">{s.oath}</Block>}

        {(s.delayed || s.emergency) && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {s.delayed && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--mu-amber)" }}><Feather name="clock" size={11} color="var(--mu-amber)" />Returned after wait</span>}
            {s.emergency && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--mu-danger)" }}><Feather name="zap" size={11} color="var(--mu-danger)" />Emergency unlock</span>}
          </div>
        )}
      </div>
    );
  }

  function Block({ label, color, border, children }) {
    return (
      <div style={{ borderLeft: `2px solid ${border || "var(--mu-amber)"}`, paddingLeft: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color }}>{label}</div>
        <div style={{ fontSize: 14, lineHeight: 1.45, color: "var(--text-primary)", marginTop: 2 }}>{children}</div>
      </div>
    );
  }

  function JournalScreen({ groups }) {
    const total = groups.reduce((n, g) => n + g.sessions.length, 0);
    return (
      <div style={{ padding: "4px 20px 24px" }}>
        <div style={{ padding: "16px 4px 20px" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>Journal</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{total} sessions recorded</div>
        </div>
        {groups.map((g) => (
          <div key={g.date}>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-muted)", margin: "14px 0 10px" }}>{g.date}</div>
            {g.sessions.map((s) => <SessionCard key={s.id} s={s} />)}
          </div>
        ))}
      </div>
    );
  }

  window.MU.JournalScreen = JournalScreen;
})();
