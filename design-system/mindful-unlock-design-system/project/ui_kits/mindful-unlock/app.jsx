// App shell — tab navigation, ritual overlay, and sheets wired together.
(function () {
  const { Feather, TabBar, StatusBar, PhoneFrame, HomeScreen, JournalScreen, InsightsScreen, UnlockPicker, BlockSheet, Ritual, APPS } = window.MU;

  const SEED_SESSIONS = [
    { id: "s1", appId: "instagram", appName: "Instagram", time: "8:12 AM", duration: "4m", level: 1, intention: "Reply to one DM, then close it.", mins: 38, delayed: false },
    { id: "s2", appId: "youtube", appName: "YouTube", time: "Yesterday, 9:40 PM", duration: "12m", level: 3, intention: "Watch the recipe I saved.", oath: "I swear I'll close it after the one video.", mins: 740, delayed: true },
    { id: "s3", appId: "twitter", appName: "X / Twitter", time: "Yesterday, 6:05 PM", duration: "2m", level: 4, intention: "Check the reply to my post.", oath: "This genuinely cannot wait until tomorrow.", emergency: true, mins: 880 },
    { id: "s4", appId: "reddit", appName: "Reddit", time: "Mon, 11:20 AM", duration: "6m", level: 2, intention: "Look up the camping gear thread.", necessity: "Need it before the trip this weekend.", mins: 2900 },
  ];

  function App() {
    const [tab, setTab] = React.useState("apps");
    const [picker, setPicker] = React.useState(false);
    const [blockSheet, setBlockSheet] = React.useState(false);
    const [ritual, setRitual] = React.useState(null); // { appId, visit }
    const [sessions, setSessions] = React.useState(SEED_SESSIONS);
    const [opensToday, setOpensToday] = React.useState({ instagram: 1, youtube: 2 });

    const tracked = [
      { ...APPS.instagram, streak: 3 },
      { ...APPS.twitter, streak: 0 },
      { ...APPS.youtube, streak: 0 },
      { ...APPS.reddit, streak: 5 },
    ];

    function startRitual(appId) {
      setPicker(false);
      const visit = (opensToday[appId] || 0) + 1;
      setRitual({ appId, visit });
    }

    function completeRitual(rec) {
      setSessions((prev) => [{
        id: "s" + Date.now(), appId: rec.appId, appName: rec.appName, time: "Just now",
        duration: Math.max(1, Math.round(rec.elapsed / 60)) + "m", level: rec.level,
        intention: rec.intention, oath: rec.oath, mins: 0,
      }, ...prev]);
      setOpensToday((p) => ({ ...p, [rec.appId]: (p[rec.appId] || 0) + 1 }));
      setRitual(null);
      setTab("journal");
    }

    const journalGroups = [
      { date: "Today", sessions: sessions.filter((s) => s.time === "Just now" || s.time.includes("AM") || s.time.includes("PM") && !s.time.includes("Yesterday") && !s.time.includes("Mon")) },
      { date: "Yesterday", sessions: sessions.filter((s) => s.time.includes("Yesterday")) },
      { date: "Mon, Jun 16", sessions: sessions.filter((s) => s.time.includes("Mon")) },
    ].filter((g) => g.sessions.length);

    const stats = {
      total: sessions.length, delayed: sessions.filter((s) => s.delayed).length, time: "37m",
      apps: [
        { id: "instagram", count: 8 }, { id: "youtube", count: 5 },
        { id: "twitter", count: 3 }, { id: "reddit", count: 2 },
      ],
      difficulty: [5, 6, 4, 3], hours: buildHours(), maxHour: 4,
    };

    return (
      <PhoneFrame>
        <StatusBar />
        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "apps" && <HomeScreen tracked={tracked} opensToday={opensToday} sessions={sessions} onUnlock={startRitual} onPick={() => setPicker(true)} />}
          {tab === "journal" && <JournalScreen groups={journalGroups} />}
          {tab === "insights" && <InsightsScreen stats={stats} />}
        </div>
        <TabBar activeId={tab} onSelect={setTab} items={[
          { id: "apps", label: "Apps", icon: <Feather name="shield" size={22} /> },
          { id: "journal", label: "Journal", icon: <Feather name="book-open" size={22} /> },
          { id: "insights", label: "Insights", icon: <Feather name="bar-chart-2" size={22} /> },
        ]} />

        {picker && <UnlockPicker tracked={tracked} opensToday={opensToday} onClose={() => setPicker(false)} onSelect={startRitual} />}
        {blockSheet && <BlockSheet onClose={() => setBlockSheet(false)} onSave={() => setBlockSheet(false)} />}
        {ritual && <Ritual appId={ritual.appId} visit={ritual.visit} onClose={() => setRitual(null)} onComplete={completeRitual} />}

        {/* Floating affordance to open the redesigned Screen Time picker */}
        {tab === "apps" && !picker && !ritual && !blockSheet && (
          <button onClick={() => setBlockSheet(true)} title="Edit blocked apps" style={{
            position: "absolute", right: 18, bottom: 96, width: 52, height: 52, borderRadius: 26,
            border: "none", background: "var(--mu-amber)", color: "var(--text-on-accent)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            boxShadow: "0 8px 24px rgba(245,158,11,0.35)", zIndex: 40,
          }}>
            <Feather name="sliders" size={22} />
          </button>
        )}
      </PhoneFrame>
    );
  }

  function buildHours() {
    const h = new Array(24).fill(0);
    [8, 9, 12, 13, 18, 19, 20, 21, 21, 22].forEach((x) => h[x]++);
    return h;
  }

  window.MU.App = App;
})();
