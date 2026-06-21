// Unlock ritual — the signature flow: intention → oath → countdown →
// active session → recorded. Full-screen overlay over the app.
(function () {
  const { Feather, Field, Button, Pill, IconTile, APPS, LEVEL_COLORS } = window.MU;

  function fmt(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return m + ":" + String(sec).padStart(2, "0");
  }

  function Ritual({ appId, visit, onClose, onComplete }) {
    const app = APPS[appId] || { name: "App", color: "#6B7280", icon: "smartphone" };
    const lvl = Math.min(visit - 1, 3);
    const oathNeeded = visit >= 3;
    const [step, setStep] = React.useState("intention");
    const [intention, setIntention] = React.useState("");
    const [oath, setOath] = React.useState("");
    const [count, setCount] = React.useState(visit >= 3 ? 10 : 5);
    const [elapsed, setElapsed] = React.useState(0);

    React.useEffect(() => {
      if (step !== "countdown") return;
      if (count <= 0) return;
      const t = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }, [step, count]);

    React.useEffect(() => {
      if (step !== "active") return;
      const t = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => clearInterval(t);
    }, [step]);

    function unlock() {
      onComplete({
        appId, appName: app.name, intention: intention.trim() || "Quick check",
        oath: oath.trim() || undefined, level: visit, elapsed,
      });
    }

    const Header = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 28 }}>
        <IconTile color={app.color} size={72} radius={20}><Feather name={app.icon} size={32} /></IconTile>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{app.name}</div>
        <Pill tone={LEVEL_COLORS[lvl]} dot>Visit {visit} today</Pill>
      </div>
    );

    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 70, background: "var(--surface-app)", display: "flex", flexDirection: "column", animation: "muFade 0.25s ease" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "66px 24px 32px", display: "flex", flexDirection: "column" }}>
          {step !== "active" && step !== "ended" && (
            <button onClick={onClose} style={{ alignSelf: "flex-end", width: 36, height: 36, borderRadius: 18, border: "none", background: "var(--mu-secondary)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 16 }}>
              <Feather name="x" size={20} />
            </button>
          )}

          {(step === "intention" || step === "oath") && Header}

          {step === "intention" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{visit === 1 ? "What's your intention?" : "State your intention"}</div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: "var(--text-body)" }}>
                What are you planning to do in <span style={{ color: "var(--mu-amber)" }}>{app.name}</span>?
              </p>
              <Field value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="I want to check..." rows={4} />
              <Button disabled={!intention.trim()} onClick={() => setStep(oathNeeded ? "oath" : "countdown")} icon={<Feather name={oathNeeded ? "arrow-right" : "unlock"} size={16} />}>
                {oathNeeded ? "Continue" : "Unlock"}
              </Button>
            </div>
          )}

          {step === "oath" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
              <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid color-mix(in srgb, var(--mu-purple) 44%, transparent)", background: "var(--mu-accent)" }}>
                <Feather name="alert-circle" size={15} color="var(--mu-purple-light)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--mu-purple-light)" }}>Solemn Oath Required</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Write a solemn oath</div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: "var(--text-body)" }}>State clearly and honestly why this cannot wait. This is a commitment.</p>
              <Field value={oath} onChange={(e) => setOath(e.target.value)} accent="var(--mu-purple)" placeholder="I swear this is essential because..." rows={3} />
              <Button variant="commit" disabled={!oath.trim()} onClick={() => { setStep("countdown"); setCount(visit >= 3 ? 10 : 5); }} icon={<Feather name="check" size={16} />}>I commit to this oath</Button>
            </div>
          )}

          {step === "countdown" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Sit with your oath</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--text-body)" }}>{count > 0 ? "A few seconds to be sure." : "You're ready."}</p>
              <div style={{ width: 130, height: 130, borderRadius: 65, background: "var(--surface-card)", border: `2px solid ${count === 0 ? "var(--mu-success)" : "var(--mu-purple)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 52, fontWeight: 700, color: count === 0 ? "var(--mu-success)" : "var(--mu-purple)" }}>{count === 0 ? "✓" : count}</span>
              </div>
              <Button disabled={count > 0} onClick={() => setStep("active")} icon={count === 0 ? <Feather name="unlock" size={16} /> : null} style={{ marginTop: 16, maxWidth: 240 }}>
                {count > 0 ? "Wait " + count + "s…" : "Unlock Now"}
              </Button>
            </div>
          )}

          {step === "active" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, flex: 1, textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Feather name="check-circle" size={20} color="var(--mu-success)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--mu-success)" }}>Unlocked</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Session Active</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--text-body)" }}>Go use <span style={{ color: "var(--mu-amber)" }}>{app.name}</span> with intention.<br />You have 5 minutes.</p>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: 16, padding: "20px 40px" }}>
                <span style={{ fontSize: 44, fontWeight: 700, color: "var(--mu-amber)" }}>{fmt(elapsed)}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>elapsed</span>
              </div>
              <button onClick={() => setStep("ended")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, border: "1px solid color-mix(in srgb, var(--mu-danger) 44%, transparent)", background: "color-mix(in srgb, var(--mu-danger) 7%, transparent)", color: "var(--mu-danger)", fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                <Feather name="stop-circle" size={18} />End Session Early
              </button>
            </div>
          )}

          {step === "ended" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, flex: 1, textAlign: "center" }}>
              <Feather name="check-circle" size={44} color="var(--mu-success)" />
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Session Recorded</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--text-body)" }}>You spent <span style={{ color: "var(--mu-amber)" }}>{fmt(elapsed)}</span> in <span style={{ color: "var(--mu-amber)" }}>{app.name}</span>.<br />Logged to your journal.</p>
              <Button onClick={unlock} style={{ maxWidth: 200, marginTop: 8 }}>Done</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  window.MU.Ritual = Ritual;
})();
