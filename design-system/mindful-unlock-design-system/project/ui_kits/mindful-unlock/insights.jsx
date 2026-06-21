// Insights screen — summary stats, most-opened bars, difficulty + time-of-day.
(function () {
  const { Feather, Card, StatTile, MeterBar, IconTile, APPS, LEVEL_COLORS } = window.MU;

  function InsightsScreen({ stats }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px 20px 24px" }}>
        <div style={{ padding: "12px 4px 4px" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>Insights</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Your mindfulness patterns</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <StatTile icon={<Feather name="unlock" size={18} />} value={stats.total} label="Total Unlocks" />
          <StatTile icon={<Feather name="clock" size={18} />} value={stats.delayed} label="With Delay" />
          <StatTile icon={<Feather name="watch" size={18} />} value={stats.time} label="Time Tracked" />
        </div>

        <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Most Opened Apps</div>
          {stats.apps.map((a) => {
            const app = APPS[a.id];
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IconTile color={app.color} size={32} radius={8}><Feather name={app.icon} size={14} /></IconTile>
                <MeterBar style={{ flex: 1 }} label={app.name} count={a.count + "x"} value={a.count} max={stats.apps[0].count} color={app.color} />
              </div>
            );
          })}
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Difficulty Distribution</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>How hard was it to unlock each time?</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: 84 }}>
            {stats.difficulty.map((d, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{d}</span>
                <div style={{ width: 36, height: Math.max(4, (d / stats.total) * 60), borderRadius: 4, background: LEVEL_COLORS[i] }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: LEVEL_COLORS[i] }}>L{i + 1}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Intention", "Reflection", "Deep Oath", "Solemn Vow"].map((l, i) => (
              <span key={l} style={{ fontSize: 11, color: "var(--text-muted)" }}><span style={{ color: LEVEL_COLORS[i] }}>L{i + 1}</span> {l}</span>
            ))}
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Time of Day</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>When do you reach for these apps?</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {stats.hours.map((c, h) => (
              <div key={h} style={{
                width: 26, height: 26, borderRadius: 5,
                background: c === 0 ? "var(--mu-secondary)" : "var(--mu-amber)",
                opacity: c === 0 ? 0.4 : 0.3 + (c / stats.maxHour) * 0.7,
              }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {["12a", "6a", "12p", "6p", "12a"].map((l, i) => <span key={i} style={{ fontSize: 11, color: "var(--text-muted)" }}>{l}</span>)}
          </div>
        </Card>
      </div>
    );
  }

  window.MU.InsightsScreen = InsightsScreen;
})();
