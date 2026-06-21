// Home screen — shield status, ritual prompt, tracked apps, recent sessions.
(function () {
  const { Feather, Card, Pill, IconTile, ListRow, SectionLabel, Button, APPS, LEVEL_COLORS, relTime } = window.MU;

  function ShieldCard() {
    return (
      <Card accent="var(--mu-success)" padding={0} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16 }}>
          <IconTile color="var(--mu-success)" size={48}><Feather name="shield" size={24} /></IconTile>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Shield Active</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>2 categories + 3 apps blocked</div>
          </div>
          <Pill tone="var(--mu-success)" dot>On</Pill>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderTop: "1px solid var(--border-hairline)", cursor: "pointer" }}>
          <Feather name="grid" size={15} color="var(--mu-amber)" />
          <span style={{ flex: 1, fontSize: 14, color: "var(--mu-amber)", fontWeight: 500 }}>Change selected apps</span>
          <Feather name="chevron-right" size={15} color="var(--text-muted)" />
        </div>
      </Card>
    );
  }

  function HomeScreen({ tracked, opensToday, sessions, onUnlock, onPick }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 20px 24px" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>Mindful Unlock</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Shield active — apps are blocked</div>
        </div>

        <ShieldCard />

        <Card accent="var(--mu-amber)" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Feather name="lock" size={20} color="var(--mu-amber)" />
            <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Need to open a blocked app?</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-body)" }}>
            Choose the app, complete your unlock ritual, and you'll get a timed session.
          </p>
          <Button icon={<Feather name="arrow-right" size={16} />} onClick={onPick}>Start Unlock Ritual</Button>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionLabel>Tracked Apps</SectionLabel>
          {tracked.map((app) => {
            const opens = opensToday[app.id] || 0;
            const lvl = Math.min(opens, 3);
            return (
              <ListRow key={app.id}
                onClick={() => onUnlock(app.id)}
                icon={<IconTile color={app.color}><Feather name={app.icon} size={20} /></IconTile>}
                title={app.name}
                meta={
                  (opens > 0 || app.streak > 0) ? (
                    <React.Fragment>
                      {opens > 0 && <Pill tone={LEVEL_COLORS[lvl]} dot>{opens} today</Pill>}
                      {app.streak > 0 && <Pill tone="var(--mu-amber)" icon={<Feather name="trending-up" size={10} />}>{app.streak}d</Pill>}
                    </React.Fragment>
                  ) : null
                }
                trailing={<Feather name="chevron-right" size={18} color="var(--text-muted)" />}
              />
            );
          })}
        </div>

        {sessions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionLabel>Recent Sessions</SectionLabel>
            {sessions.slice(0, 3).map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: 12, padding: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: LEVEL_COLORS[Math.min(s.level - 1, 3)], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{s.appName}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>"{s.intention}"</div>
                </div>
                {s.emergency && <Pill tone="var(--mu-danger)">Emergency</Pill>}
                <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{relTime(s.mins)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  window.MU.HomeScreen = HomeScreen;
})();
