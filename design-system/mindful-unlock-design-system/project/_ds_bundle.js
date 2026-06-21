/* @ds-bundle: {"format":3,"namespace":"MindfulUnlockDesignSystem_bf3027","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"IconTile","sourcePath":"components/display/IconTile.jsx"},{"name":"ListRow","sourcePath":"components/display/ListRow.jsx"},{"name":"MeterBar","sourcePath":"components/display/MeterBar.jsx"},{"name":"Pill","sourcePath":"components/display/Pill.jsx"},{"name":"SectionLabel","sourcePath":"components/display/SectionLabel.jsx"},{"name":"StatTile","sourcePath":"components/display/StatTile.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"c9d391753cb3","components/display/Card.jsx":"0ed6194ca560","components/display/IconTile.jsx":"2e35f38e0f57","components/display/ListRow.jsx":"92d03c5d117c","components/display/MeterBar.jsx":"a34489a02256","components/display/Pill.jsx":"fbde6091a6e3","components/display/SectionLabel.jsx":"8eb7b248c6bf","components/display/StatTile.jsx":"2965402c0ff0","components/forms/Checkbox.jsx":"aaf93d1a4578","components/forms/Field.jsx":"0433da0e1322","components/navigation/TabBar.jsx":"2a599f9ab12f","ui_kits/mindful-unlock/app.jsx":"eed1d9019ac0","ui_kits/mindful-unlock/frame.jsx":"7538a0249dbc","ui_kits/mindful-unlock/home.jsx":"db18222d158e","ui_kits/mindful-unlock/insights.jsx":"1e8460edf37b","ui_kits/mindful-unlock/journal.jsx":"52cbe9a4a3f9","ui_kits/mindful-unlock/picker.jsx":"c75e39228487","ui_kits/mindful-unlock/ritual.jsx":"bea90a1f199c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MindfulUnlockDesignSystem_bf3027 = window.MindfulUnlockDesignSystem_bf3027 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — Mindful Unlock's primary action control.
 *
 * Solid amber by default (dark text on warm amber), with calm secondary,
 * commitment-purple, and destructive variants. Full-width inside cards by
 * default, matching the app's stacked-CTA layout. Pass `icon` (any node,
 * usually a Feather glyph) to sit it after the label.
 */
function Button({
  variant = "primary",
  size = "md",
  fullWidth = true,
  icon,
  iconPosition = "right",
  disabled = false,
  children,
  style,
  ...rest
}) {
  const palette = {
    primary: {
      bg: "var(--mu-amber)",
      fg: "var(--text-on-accent)",
      border: "transparent"
    },
    commit: {
      bg: "var(--mu-purple)",
      fg: "#fff",
      border: "transparent"
    },
    destructive: {
      bg: "var(--mu-danger)",
      fg: "#fff",
      border: "transparent"
    },
    secondary: {
      bg: "var(--mu-secondary)",
      fg: "var(--text-primary)",
      border: "var(--border-hairline)"
    },
    ghost: {
      bg: "transparent",
      fg: "var(--accent-primary)",
      border: "transparent"
    }
  }[variant] || {};
  const sizing = {
    sm: {
      pad: "10px 16px",
      fs: "var(--fs-base)",
      radius: "var(--r-md)"
    },
    md: {
      pad: "14px 24px",
      fs: "var(--fs-subhead)",
      radius: "var(--r-lg)"
    },
    lg: {
      pad: "16px 24px",
      fs: "var(--fs-subhead)",
      radius: "var(--r-lg)"
    }
  }[size] || {};
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      width: fullWidth ? "100%" : "auto",
      padding: sizing.pad,
      fontFamily: "var(--font-sans)",
      fontSize: sizing.fs,
      fontWeight: "var(--fw-bold)",
      lineHeight: 1,
      color: palette.fg,
      background: palette.bg,
      border: `1px solid ${palette.border}`,
      borderRadius: sizing.radius,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: "opacity 0.15s ease, transform 0.05s ease",
      WebkitTapHighlightColor: "transparent",
      ...style
    }
  }, rest), icon && iconPosition === "left" ? icon : null, children, icon && iconPosition === "right" ? icon : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the base surface for Mindful Unlock. A 16px-radius panel on the
 * card background with a hairline border (no drop shadow — the dark theme
 * uses borders + tinted fills for separation). Use `accent` to tint the
 * border (e.g. amber for the ritual prompt, success for an active shield).
 */
function Card({
  accent,
  padding = 20,
  children,
  style,
  ...rest
}) {
  const borderColor = accent ? `color-mix(in srgb, ${accent} 33%, transparent)` : "var(--border-hairline)";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--surface-card)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--r-xl)",
      padding: typeof padding === "number" ? `${padding}px` : padding,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/IconTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconTile — the rounded, color-tinted square that holds an app or feature
 * icon throughout Mindful Unlock. The glyph sits in full brand color on a
 * ~13%-opacity wash of the same color. This single motif appears on every
 * list row, stat, and ritual header.
 */
function IconTile({
  color = "var(--mu-amber)",
  size = 46,
  radius,
  children,
  style,
  ...rest
}) {
  const r = radius != null ? radius : Math.round(size * 0.28);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: size,
      height: size,
      borderRadius: r,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color: color,
      background: `color-mix(in srgb, ${color} 13%, transparent)`,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/IconTile.jsx", error: String((e && e.message) || e) }); }

// components/display/ListRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ListRow — the tappable row used for tracked/selectable apps: a leading
 * IconTile, a title with optional meta pills beneath, and an optional trailing
 * element (chevron, checkbox, trash). A card surface with hairline border.
 */
function ListRow({
  icon,
  title,
  meta,
  trailing,
  onClick,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      background: "var(--surface-card)",
      border: "1px solid var(--border-hairline)",
      borderRadius: "var(--r-xl)",
      padding: "14px 16px",
      cursor: onClick ? "pointer" : "default",
      ...style
    }
  }, rest), icon, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: "5px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-body)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-primary)"
    }
  }, title), meta ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px"
    }
  }, meta) : null), trailing);
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/display/MeterBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * MeterBar — a thin horizontal progress/usage bar. A label row (name + count)
 * sits above a 6px track with a colored fill. Used in "Most Opened Apps".
 */
function MeterBar({
  label,
  value,
  max = 1,
  count,
  color = "var(--mu-amber)",
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0)) * 100;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      ...style
    }
  }, rest), (label != null || count != null) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "4px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-sm)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-primary)"
    }
  }, label), count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-sm)",
      color: "var(--text-muted)"
    }
  }, count)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: "var(--mu-secondary)",
      borderRadius: "var(--r-pill)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: `${pct}%`,
      background: color,
      borderRadius: "var(--r-pill)"
    }
  })));
}
Object.assign(__ds_scope, { MeterBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/MeterBar.jsx", error: String((e && e.message) || e) }); }

// components/display/Pill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Pill — a small rounded chip used for status, visit/level, streaks, and
 * tags. Tinted (`tone` color at ~13% opacity behind colored text) by default,
 * or `solid`. Optional leading dot or icon. This is the app's badge workhorse.
 */
function Pill({
  tone = "var(--mu-amber)",
  solid = false,
  dot = false,
  icon,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "4px 10px",
      borderRadius: "var(--r-pill)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-2xs)",
      fontWeight: "var(--fw-semibold)",
      lineHeight: 1.3,
      whiteSpace: "nowrap",
      color: solid ? "#fff" : tone,
      background: solid ? tone : `color-mix(in srgb, ${tone} 13%, transparent)`,
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: tone,
      flexShrink: 0
    }
  }) : null, icon, children);
}
Object.assign(__ds_scope, { Pill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Pill.jsx", error: String((e && e.message) || e) }); }

// components/display/SectionLabel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SectionLabel — the uppercase, letter-spaced eyebrow that titles a group of
 * rows ("TRACKED APPS", "RECENT SESSIONS"). Muted by default.
 */
function SectionLabel({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-sm)",
      fontWeight: "var(--fw-semibold)",
      textTransform: "uppercase",
      letterSpacing: "var(--ls-label)",
      color: "var(--text-muted)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { SectionLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/SectionLabel.jsx", error: String((e && e.message) || e) }); }

// components/display/StatTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatTile — a compact metric cell: a small amber icon, a big bold number,
 * and a caption. Used in the Insights summary row (three across).
 */
function StatTile({
  icon,
  value,
  label,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px",
      background: "var(--surface-card)",
      border: "1px solid var(--border-hairline)",
      borderRadius: "var(--r-lg)",
      padding: "14px",
      textAlign: "center",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-primary)",
      display: "flex"
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "22px",
      fontWeight: "var(--fw-bold)",
      color: "var(--text-primary)",
      lineHeight: 1.1
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-2xs)",
      color: "var(--text-muted)",
      lineHeight: 1.3
    }
  }, label));
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/StatTile.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Checkbox — a 24px rounded-square check used in the app-selection list.
 * Amber fill + white tick when checked; hairline border when not.
 */
function Checkbox({
  checked = false,
  onChange,
  size = 24,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "checkbox",
    "aria-checked": checked,
    onClick: onChange,
    style: {
      width: size,
      height: size,
      borderRadius: 7,
      boxSizing: "border-box",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      cursor: "pointer",
      border: checked ? "2px solid var(--mu-amber)" : "2px solid var(--border-hairline)",
      background: checked ? "var(--mu-amber)" : "transparent",
      transition: "background 0.12s ease, border-color 0.12s ease",
      ...style
    }
  }, rest), checked ? /*#__PURE__*/React.createElement("svg", {
    width: size * 0.55,
    height: size * 0.55,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#0A0A0E",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Field — the reflection text input used in the unlock ritual. A card-colored
 * box with hairline border; multiline by default (the ritual asks for a few
 * sentences). Pass `accent` to tint the border (purple for oath steps).
 */
function Field({
  multiline = true,
  rows = 4,
  accent,
  style,
  ...rest
}) {
  const borderColor = accent ? `color-mix(in srgb, ${accent} 44%, transparent)` : "var(--border-hairline)";
  const shared = {
    width: "100%",
    boxSizing: "border-box",
    background: "var(--surface-card)",
    border: `1px solid ${borderColor}`,
    borderRadius: "var(--r-lg)",
    padding: "16px",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-body)",
    lineHeight: "var(--lh-snug)",
    color: "var(--text-primary)",
    outline: "none",
    resize: "none",
    ...style
  };
  if (multiline) {
    return /*#__PURE__*/React.createElement("textarea", _extends({
      rows: rows,
      style: {
        ...shared,
        minHeight: 120
      }
    }, rest));
  }
  return /*#__PURE__*/React.createElement("input", _extends({
    type: "text",
    style: shared
  }, rest));
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TabBar — the app's bottom navigation: a translucent, blurred bar pinned to
 * the bottom of the screen with a hairline top border. Active tab in amber,
 * inactive in muted. This is the "hybrid native" chrome — frosted glass over
 * the dark canvas rather than an opaque slab.
 */
function TabBar({
  items = [],
  activeId,
  onSelect,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      display: "flex",
      alignItems: "stretch",
      justifyContent: "space-around",
      gap: "4px",
      padding: "8px 12px 22px",
      background: "color-mix(in srgb, var(--mu-black) 72%, transparent)",
      backdropFilter: "saturate(140%) blur(20px)",
      WebkitBackdropFilter: "saturate(140%) blur(20px)",
      borderTop: "1px solid var(--border-hairline)",
      ...style
    }
  }, rest), items.map(item => {
    const active = item.id === activeId;
    return /*#__PURE__*/React.createElement("button", {
      key: item.id,
      onClick: () => onSelect && onSelect(item.id),
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "6px 0",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: active ? "var(--accent-primary)" : "var(--text-muted)",
        WebkitTapHighlightColor: "transparent"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex"
      }
    }, item.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: "var(--fs-2xs)",
        fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)"
      }
    }, item.label));
  }));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mindful-unlock/app.jsx
try { (() => {
// App shell — tab navigation, ritual overlay, and sheets wired together.
(function () {
  const {
    Feather,
    TabBar,
    StatusBar,
    PhoneFrame,
    HomeScreen,
    JournalScreen,
    InsightsScreen,
    UnlockPicker,
    BlockSheet,
    Ritual,
    APPS
  } = window.MU;
  const SEED_SESSIONS = [{
    id: "s1",
    appId: "instagram",
    appName: "Instagram",
    time: "8:12 AM",
    duration: "4m",
    level: 1,
    intention: "Reply to one DM, then close it.",
    mins: 38,
    delayed: false
  }, {
    id: "s2",
    appId: "youtube",
    appName: "YouTube",
    time: "Yesterday, 9:40 PM",
    duration: "12m",
    level: 3,
    intention: "Watch the recipe I saved.",
    oath: "I swear I'll close it after the one video.",
    mins: 740,
    delayed: true
  }, {
    id: "s3",
    appId: "twitter",
    appName: "X / Twitter",
    time: "Yesterday, 6:05 PM",
    duration: "2m",
    level: 4,
    intention: "Check the reply to my post.",
    oath: "This genuinely cannot wait until tomorrow.",
    emergency: true,
    mins: 880
  }, {
    id: "s4",
    appId: "reddit",
    appName: "Reddit",
    time: "Mon, 11:20 AM",
    duration: "6m",
    level: 2,
    intention: "Look up the camping gear thread.",
    necessity: "Need it before the trip this weekend.",
    mins: 2900
  }];
  function App() {
    const [tab, setTab] = React.useState("apps");
    const [picker, setPicker] = React.useState(false);
    const [blockSheet, setBlockSheet] = React.useState(false);
    const [ritual, setRitual] = React.useState(null); // { appId, visit }
    const [sessions, setSessions] = React.useState(SEED_SESSIONS);
    const [opensToday, setOpensToday] = React.useState({
      instagram: 1,
      youtube: 2
    });
    const tracked = [{
      ...APPS.instagram,
      streak: 3
    }, {
      ...APPS.twitter,
      streak: 0
    }, {
      ...APPS.youtube,
      streak: 0
    }, {
      ...APPS.reddit,
      streak: 5
    }];
    function startRitual(appId) {
      setPicker(false);
      const visit = (opensToday[appId] || 0) + 1;
      setRitual({
        appId,
        visit
      });
    }
    function completeRitual(rec) {
      setSessions(prev => [{
        id: "s" + Date.now(),
        appId: rec.appId,
        appName: rec.appName,
        time: "Just now",
        duration: Math.max(1, Math.round(rec.elapsed / 60)) + "m",
        level: rec.level,
        intention: rec.intention,
        oath: rec.oath,
        mins: 0
      }, ...prev]);
      setOpensToday(p => ({
        ...p,
        [rec.appId]: (p[rec.appId] || 0) + 1
      }));
      setRitual(null);
      setTab("journal");
    }
    const journalGroups = [{
      date: "Today",
      sessions: sessions.filter(s => s.time === "Just now" || s.time.includes("AM") || s.time.includes("PM") && !s.time.includes("Yesterday") && !s.time.includes("Mon"))
    }, {
      date: "Yesterday",
      sessions: sessions.filter(s => s.time.includes("Yesterday"))
    }, {
      date: "Mon, Jun 16",
      sessions: sessions.filter(s => s.time.includes("Mon"))
    }].filter(g => g.sessions.length);
    const stats = {
      total: sessions.length,
      delayed: sessions.filter(s => s.delayed).length,
      time: "37m",
      apps: [{
        id: "instagram",
        count: 8
      }, {
        id: "youtube",
        count: 5
      }, {
        id: "twitter",
        count: 3
      }, {
        id: "reddit",
        count: 2
      }],
      difficulty: [5, 6, 4, 3],
      hours: buildHours(),
      maxHour: 4
    };
    return /*#__PURE__*/React.createElement(PhoneFrame, null, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto"
      }
    }, tab === "apps" && /*#__PURE__*/React.createElement(HomeScreen, {
      tracked: tracked,
      opensToday: opensToday,
      sessions: sessions,
      onUnlock: startRitual,
      onPick: () => setPicker(true)
    }), tab === "journal" && /*#__PURE__*/React.createElement(JournalScreen, {
      groups: journalGroups
    }), tab === "insights" && /*#__PURE__*/React.createElement(InsightsScreen, {
      stats: stats
    })), /*#__PURE__*/React.createElement(TabBar, {
      activeId: tab,
      onSelect: setTab,
      items: [{
        id: "apps",
        label: "Apps",
        icon: /*#__PURE__*/React.createElement(Feather, {
          name: "shield",
          size: 22
        })
      }, {
        id: "journal",
        label: "Journal",
        icon: /*#__PURE__*/React.createElement(Feather, {
          name: "book-open",
          size: 22
        })
      }, {
        id: "insights",
        label: "Insights",
        icon: /*#__PURE__*/React.createElement(Feather, {
          name: "bar-chart-2",
          size: 22
        })
      }]
    }), picker && /*#__PURE__*/React.createElement(UnlockPicker, {
      tracked: tracked,
      opensToday: opensToday,
      onClose: () => setPicker(false),
      onSelect: startRitual
    }), blockSheet && /*#__PURE__*/React.createElement(BlockSheet, {
      onClose: () => setBlockSheet(false),
      onSave: () => setBlockSheet(false)
    }), ritual && /*#__PURE__*/React.createElement(Ritual, {
      appId: ritual.appId,
      visit: ritual.visit,
      onClose: () => setRitual(null),
      onComplete: completeRitual
    }), tab === "apps" && !picker && !ritual && !blockSheet && /*#__PURE__*/React.createElement("button", {
      onClick: () => setBlockSheet(true),
      title: "Edit blocked apps",
      style: {
        position: "absolute",
        right: 18,
        bottom: 96,
        width: 52,
        height: 52,
        borderRadius: 26,
        border: "none",
        background: "var(--mu-amber)",
        color: "var(--text-on-accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(245,158,11,0.35)",
        zIndex: 40
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "sliders",
      size: 22
    })));
  }
  function buildHours() {
    const h = new Array(24).fill(0);
    [8, 9, 12, 13, 18, 19, 20, 21, 21, 22].forEach(x => h[x]++);
    return h;
  }
  window.MU.App = App;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mindful-unlock/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mindful-unlock/frame.jsx
try { (() => {
// Shared frame + helpers for the Mindful Unlock UI kit.
// Exposes window.MU = { Feather, PhoneFrame, StatusBar, APPS, fmt }

(function () {
  const NS = window.MindfulUnlockDesignSystem_bf3027;
  function Feather({
    name,
    size = 20,
    color = "currentColor",
    style
  }) {
    const icon = window.feather.icons[name];
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        lineHeight: 0,
        ...style
      },
      dangerouslySetInnerHTML: {
        __html: icon ? icon.toSvg({
          width: size,
          height: size,
          color
        }) : ""
      }
    });
  }

  // iOS status bar — part of the polished hybrid-native chrome.
  function StatusBar() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        height: 54,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px 0 32px",
        fontFamily: "var(--font-sans)",
        color: "var(--text-primary)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: 0.2
      }
    }, "9:41"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "bell",
      size: 14,
      color: "var(--text-primary)"
    }), /*#__PURE__*/React.createElement(Feather, {
      name: "wifi",
      size: 15,
      color: "var(--text-primary)"
    }), /*#__PURE__*/React.createElement("svg", {
      width: "24",
      height: "12",
      viewBox: "0 0 24 12",
      fill: "none"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "0.5",
      y: "0.5",
      width: "20",
      height: "11",
      rx: "3",
      stroke: "var(--text-primary)",
      opacity: "0.4"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "2",
      width: "16",
      height: "8",
      rx: "1.5",
      fill: "var(--text-primary)"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "21.5",
      y: "4",
      width: "1.5",
      height: "4",
      rx: "0.75",
      fill: "var(--text-primary)",
      opacity: "0.4"
    }))));
  }

  // The device bezel. Children fill the screen; the canvas itself scrolls.
  function PhoneFrame({
    children,
    frosted
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: 390,
        height: 844,
        borderRadius: 54,
        padding: 5,
        background: "linear-gradient(155deg, #2a2a32, #0c0c10)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 49,
        overflow: "hidden",
        background: "var(--surface-app)",
        display: "flex",
        flexDirection: "column"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        top: 11,
        left: "50%",
        transform: "translateX(-50%)",
        width: 112,
        height: 33,
        borderRadius: 20,
        background: "#000",
        zIndex: 50
      }
    }), children));
  }

  // Predefined apps (brand colors + Feather glyphs), mirroring constants/availableApps.ts
  const APPS = {
    instagram: {
      id: "instagram",
      name: "Instagram",
      icon: "instagram",
      color: "#E1306C"
    },
    twitter: {
      id: "twitter",
      name: "X / Twitter",
      icon: "twitter",
      color: "#1DA1F2"
    },
    youtube: {
      id: "youtube",
      name: "YouTube",
      icon: "youtube",
      color: "#FF0000"
    },
    tiktok: {
      id: "tiktok",
      name: "TikTok",
      icon: "music",
      color: "#FF004F"
    },
    reddit: {
      id: "reddit",
      name: "Reddit",
      icon: "message-circle",
      color: "#FF4500"
    },
    netflix: {
      id: "netflix",
      name: "Netflix",
      icon: "film",
      color: "#E50914"
    },
    spotify: {
      id: "spotify",
      name: "Spotify",
      icon: "headphones",
      color: "#1DB954"
    },
    facebook: {
      id: "facebook",
      name: "Facebook",
      icon: "facebook",
      color: "#1877F2"
    },
    linkedin: {
      id: "linkedin",
      name: "LinkedIn",
      icon: "linkedin",
      color: "#0A66C2"
    },
    discord: {
      id: "discord",
      name: "Discord",
      icon: "hash",
      color: "#5865F2"
    }
  };
  const LEVEL_COLORS = ["var(--mu-level-1)", "var(--mu-level-2)", "var(--mu-level-3)", "var(--mu-level-4)"];
  function relTime(mins) {
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    const h = Math.floor(mins / 60);
    if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }
  window.MU = {
    ...NS,
    Feather,
    StatusBar,
    PhoneFrame,
    APPS,
    LEVEL_COLORS,
    relTime
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mindful-unlock/frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mindful-unlock/home.jsx
try { (() => {
// Home screen — shield status, ritual prompt, tracked apps, recent sessions.
(function () {
  const {
    Feather,
    Card,
    Pill,
    IconTile,
    ListRow,
    SectionLabel,
    Button,
    APPS,
    LEVEL_COLORS,
    relTime
  } = window.MU;
  function ShieldCard() {
    return /*#__PURE__*/React.createElement(Card, {
      accent: "var(--mu-success)",
      padding: 0,
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 16
      }
    }, /*#__PURE__*/React.createElement(IconTile, {
      color: "var(--mu-success)",
      size: 48
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "shield",
      size: 24
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, "Shield Active"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, "2 categories + 3 apps blocked")), /*#__PURE__*/React.createElement(Pill, {
      tone: "var(--mu-success)",
      dot: true
    }, "On")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 16px",
        borderTop: "1px solid var(--border-hairline)",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "grid",
      size: 15,
      color: "var(--mu-amber)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 14,
        color: "var(--mu-amber)",
        fontWeight: 500
      }
    }, "Change selected apps"), /*#__PURE__*/React.createElement(Feather, {
      name: "chevron-right",
      size: 15,
      color: "var(--text-muted)"
    })));
  }
  function HomeScreen({
    tracked,
    opensToday,
    sessions,
    onUnlock,
    onPick
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "8px 20px 24px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 26,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "Mindful Unlock"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, "Shield active \u2014 apps are blocked")), /*#__PURE__*/React.createElement(ShieldCard, null), /*#__PURE__*/React.createElement(Card, {
      accent: "var(--mu-amber)",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "lock",
      size: 20,
      color: "var(--mu-amber)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, "Need to open a blocked app?")), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 14,
        lineHeight: 1.55,
        color: "var(--text-body)"
      }
    }, "Choose the app, complete your unlock ritual, and you'll get a timed session."), /*#__PURE__*/React.createElement(Button, {
      icon: /*#__PURE__*/React.createElement(Feather, {
        name: "arrow-right",
        size: 16
      }),
      onClick: onPick
    }, "Start Unlock Ritual")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(SectionLabel, null, "Tracked Apps"), tracked.map(app => {
      const opens = opensToday[app.id] || 0;
      const lvl = Math.min(opens, 3);
      return /*#__PURE__*/React.createElement(ListRow, {
        key: app.id,
        onClick: () => onUnlock(app.id),
        icon: /*#__PURE__*/React.createElement(IconTile, {
          color: app.color
        }, /*#__PURE__*/React.createElement(Feather, {
          name: app.icon,
          size: 20
        })),
        title: app.name,
        meta: opens > 0 || app.streak > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, opens > 0 && /*#__PURE__*/React.createElement(Pill, {
          tone: LEVEL_COLORS[lvl],
          dot: true
        }, opens, " today"), app.streak > 0 && /*#__PURE__*/React.createElement(Pill, {
          tone: "var(--mu-amber)",
          icon: /*#__PURE__*/React.createElement(Feather, {
            name: "trending-up",
            size: 10
          })
        }, app.streak, "d")) : null,
        trailing: /*#__PURE__*/React.createElement(Feather, {
          name: "chevron-right",
          size: 18,
          color: "var(--text-muted)"
        })
      });
    })), sessions.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(SectionLabel, null, "Recent Sessions"), sessions.slice(0, 3).map(s => /*#__PURE__*/React.createElement("div", {
      key: s.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--surface-card)",
        border: "1px solid var(--border-hairline)",
        borderRadius: 12,
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 4,
        background: LEVEL_COLORS[Math.min(s.level - 1, 3)],
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 500,
        color: "var(--text-primary)"
      }
    }, s.appName), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-muted)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, "\"", s.intention, "\"")), s.emergency && /*#__PURE__*/React.createElement(Pill, {
      tone: "var(--mu-danger)"
    }, "Emergency"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--text-muted)",
        whiteSpace: "nowrap"
      }
    }, relTime(s.mins))))));
  }
  window.MU.HomeScreen = HomeScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mindful-unlock/home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mindful-unlock/insights.jsx
try { (() => {
// Insights screen — summary stats, most-opened bars, difficulty + time-of-day.
(function () {
  const {
    Feather,
    Card,
    StatTile,
    MeterBar,
    IconTile,
    APPS,
    LEVEL_COLORS
  } = window.MU;
  function InsightsScreen({
    stats
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "4px 20px 24px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 4px 4px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 26,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "Insights"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, "Your mindfulness patterns")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(StatTile, {
      icon: /*#__PURE__*/React.createElement(Feather, {
        name: "unlock",
        size: 18
      }),
      value: stats.total,
      label: "Total Unlocks"
    }), /*#__PURE__*/React.createElement(StatTile, {
      icon: /*#__PURE__*/React.createElement(Feather, {
        name: "clock",
        size: 18
      }),
      value: stats.delayed,
      label: "With Delay"
    }), /*#__PURE__*/React.createElement(StatTile, {
      icon: /*#__PURE__*/React.createElement(Feather, {
        name: "watch",
        size: 18
      }),
      value: stats.time,
      label: "Time Tracked"
    })), /*#__PURE__*/React.createElement(Card, {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, "Most Opened Apps"), stats.apps.map(a => {
      const app = APPS[a.id];
      return /*#__PURE__*/React.createElement("div", {
        key: a.id,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(IconTile, {
        color: app.color,
        size: 32,
        radius: 8
      }, /*#__PURE__*/React.createElement(Feather, {
        name: app.icon,
        size: 14
      })), /*#__PURE__*/React.createElement(MeterBar, {
        style: {
          flex: 1
        },
        label: app.name,
        count: a.count + "x",
        value: a.count,
        max: stats.apps[0].count,
        color: app.color
      }));
    })), /*#__PURE__*/React.createElement(Card, {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, "Difficulty Distribution"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, "How hard was it to unlock each time?")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 84
      }
    }, stats.difficulty.map((d, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, d), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: Math.max(4, d / stats.total * 60),
        borderRadius: 4,
        background: LEVEL_COLORS[i]
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: LEVEL_COLORS[i]
      }
    }, "L", i + 1)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8
      }
    }, ["Intention", "Reflection", "Deep Oath", "Solemn Vow"].map((l, i) => /*#__PURE__*/React.createElement("span", {
      key: l,
      style: {
        fontSize: 11,
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: LEVEL_COLORS[i]
      }
    }, "L", i + 1), " ", l)))), /*#__PURE__*/React.createElement(Card, {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, "Time of Day"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, "When do you reach for these apps?")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 3
      }
    }, stats.hours.map((c, h) => /*#__PURE__*/React.createElement("div", {
      key: h,
      style: {
        width: 26,
        height: 26,
        borderRadius: 5,
        background: c === 0 ? "var(--mu-secondary)" : "var(--mu-amber)",
        opacity: c === 0 ? 0.4 : 0.3 + c / stats.maxHour * 0.7
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between"
      }
    }, ["12a", "6a", "12p", "6p", "12a"].map((l, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        fontSize: 11,
        color: "var(--text-muted)"
      }
    }, l)))));
  }
  window.MU.InsightsScreen = InsightsScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mindful-unlock/insights.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mindful-unlock/journal.jsx
try { (() => {
// Journal screen — grouped unlock sessions with intention / oath blocks.
(function () {
  const {
    Feather,
    Pill,
    IconTile,
    APPS,
    LEVEL_COLORS
  } = window.MU;
  const VISIT = ["Visit 1", "Visit 2", "Visit 3", "Visit 4+"];
  function SessionCard({
    s
  }) {
    const app = APPS[s.appId] || {
      color: "#6B7280",
      icon: "smartphone"
    };
    const lvl = Math.min(s.level - 1, 3);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-card)",
        border: `1px solid ${s.emergency ? "color-mix(in srgb, var(--mu-danger) 44%, transparent)" : "var(--border-hairline)"}`,
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(IconTile, {
      color: app.color,
      size: 34,
      radius: 9
    }, /*#__PURE__*/React.createElement(Feather, {
      name: app.icon,
      size: 16
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, s.appName), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-muted)"
      }
    }, s.time, s.duration ? "  ·  " + s.duration : ""))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, s.streak > 0 && /*#__PURE__*/React.createElement(Pill, {
      tone: "var(--mu-amber)",
      icon: /*#__PURE__*/React.createElement(Feather, {
        name: "trending-up",
        size: 10
      })
    }, s.streak, "d"), s.emergency ? /*#__PURE__*/React.createElement(Pill, {
      tone: "var(--mu-danger)",
      icon: /*#__PURE__*/React.createElement(Feather, {
        name: "alert-triangle",
        size: 10
      })
    }, "Emergency") : /*#__PURE__*/React.createElement(Pill, {
      tone: LEVEL_COLORS[lvl]
    }, VISIT[lvl]))), /*#__PURE__*/React.createElement(Block, {
      label: "Intention",
      color: "var(--mu-amber)"
    }, s.intention), s.necessity && /*#__PURE__*/React.createElement(Block, {
      label: "Necessity",
      color: "var(--mu-amber)"
    }, s.necessity), s.oath && /*#__PURE__*/React.createElement(Block, {
      label: "Oath",
      color: "var(--mu-purple)",
      border: "var(--mu-purple)"
    }, s.oath), (s.delayed || s.emergency) && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 14,
        flexWrap: "wrap"
      }
    }, s.delayed && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        color: "var(--mu-amber)"
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "clock",
      size: 11,
      color: "var(--mu-amber)"
    }), "Returned after wait"), s.emergency && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        color: "var(--mu-danger)"
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "zap",
      size: 11,
      color: "var(--mu-danger)"
    }), "Emergency unlock")));
  }
  function Block({
    label,
    color,
    border,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        borderLeft: `2px solid ${border || "var(--mu-amber)"}`,
        paddingLeft: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        color
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        lineHeight: 1.45,
        color: "var(--text-primary)",
        marginTop: 2
      }
    }, children));
  }
  function JournalScreen({
    groups
  }) {
    const total = groups.reduce((n, g) => n + g.sessions.length, 0);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "4px 20px 24px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 4px 20px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 26,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "Journal"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, total, " sessions recorded")), groups.map(g => /*#__PURE__*/React.createElement("div", {
      key: g.date
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        color: "var(--text-muted)",
        margin: "14px 0 10px"
      }
    }, g.date), g.sessions.map(s => /*#__PURE__*/React.createElement(SessionCard, {
      key: s.id,
      s: s
    })))));
  }
  window.MU.JournalScreen = JournalScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mindful-unlock/journal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mindful-unlock/picker.jsx
try { (() => {
// Bottom sheets — the polished "hybrid native" surfaces.
//  • BottomSheet  : reusable frosted sheet shell (grabber + header)
//  • UnlockPicker : choose which app to unlock (starts the ritual)
//  • BlockSheet   : a redesigned, on-brand replacement for iOS's stock
//                   Screen Time / Family Activity picker — the jarring
//                   native window, made to feel like part of the app.
(function () {
  const {
    Feather,
    Pill,
    IconTile,
    Checkbox,
    Button,
    APPS,
    LEVEL_COLORS
  } = window.MU;
  function BottomSheet({
    title,
    subtitle,
    onClose,
    children,
    footer,
    tall
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "absolute",
        inset: 0,
        background: "rgba(5,5,8,0.55)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        maxHeight: tall ? "88%" : "74%",
        display: "flex",
        flexDirection: "column",
        background: "color-mix(in srgb, var(--surface-card) 88%, transparent)",
        backdropFilter: "saturate(160%) blur(28px)",
        WebkitBackdropFilter: "saturate(160%) blur(28px)",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderTop: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "var(--shadow-sheet)",
        animation: "muSheetUp 0.32s cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        paddingTop: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 38,
        height: 5,
        borderRadius: 3,
        background: "var(--mu-border)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 22px 16px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, title), subtitle && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        lineHeight: 1.45,
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, subtitle)), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        width: 32,
        height: 32,
        borderRadius: 16,
        border: "none",
        background: "var(--mu-secondary)",
        color: "var(--text-muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "x",
      size: 18
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        overflowY: "auto",
        padding: "0 22px",
        flex: 1
      }
    }, children), footer && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "14px 22px",
        borderTop: "1px solid var(--border-hairline)"
      }
    }, footer)));
  }
  function UnlockPicker({
    tracked,
    opensToday,
    onClose,
    onSelect
  }) {
    return /*#__PURE__*/React.createElement(BottomSheet, {
      title: "Which app?",
      subtitle: "Select the app you want to unlock to begin your ritual.",
      onClose: onClose
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingBottom: 20
      }
    }, tracked.map(app => {
      const opens = opensToday[app.id] || 0;
      const lvl = Math.min(opens, 3);
      return /*#__PURE__*/React.createElement("div", {
        key: app.id,
        onClick: () => onSelect(app.id),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "var(--surface-card)",
          border: "1px solid var(--border-hairline)",
          borderRadius: 16,
          padding: 16,
          cursor: "pointer"
        }
      }, /*#__PURE__*/React.createElement(IconTile, {
        color: app.color
      }, /*#__PURE__*/React.createElement(Feather, {
        name: app.icon,
        size: 22
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text-primary)"
        }
      }, app.name), (opens > 0 || app.streak > 0) && /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          marginTop: 5,
          flexWrap: "wrap"
        }
      }, opens > 0 && /*#__PURE__*/React.createElement(Pill, {
        tone: LEVEL_COLORS[lvl],
        dot: true
      }, opens, " open", opens === 1 ? "" : "s", " today"), app.streak > 0 && /*#__PURE__*/React.createElement(Pill, {
        tone: "var(--mu-amber)",
        icon: /*#__PURE__*/React.createElement(Feather, {
          name: "trending-up",
          size: 10
        })
      }, app.streak, "d streak"))), /*#__PURE__*/React.createElement(Feather, {
        name: "chevron-right",
        size: 18,
        color: "var(--text-muted)"
      }));
    })));
  }

  // The redesigned Screen Time picker.
  function BlockSheet({
    onClose,
    onSave
  }) {
    const ids = Object.keys(APPS);
    const [sel, setSel] = React.useState(new Set(["instagram", "twitter", "youtube", "tiktok", "reddit"]));
    const [q, setQ] = React.useState("");
    const toggle = id => setSel(p => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    const shown = ids.filter(id => APPS[id].name.toLowerCase().includes(q.toLowerCase()));
    return /*#__PURE__*/React.createElement(BottomSheet, {
      tall: true,
      title: "Choose apps to block",
      subtitle: "Pick the apps that should sit behind your shield. You'll run the unlock ritual whenever you reach for one.",
      onClose: onClose,
      footer: /*#__PURE__*/React.createElement(Button, {
        icon: /*#__PURE__*/React.createElement(Feather, {
          name: "shield",
          size: 16
        }),
        iconPosition: "left",
        onClick: () => onSave(sel)
      }, "Block ", sel.size, " app", sel.size === 1 ? "" : "s")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "sticky",
        top: 0,
        paddingBottom: 12,
        background: "linear-gradient(var(--surface-card), color-mix(in srgb, var(--surface-card) 0%, transparent))"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--surface-input)",
        border: "1px solid var(--border-hairline)",
        borderRadius: 12,
        padding: "11px 14px"
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "search",
      size: 16,
      color: "var(--text-muted)"
    }), /*#__PURE__*/React.createElement("input", {
      value: q,
      onChange: e => setQ(e.target.value),
      placeholder: "Search apps & categories",
      style: {
        flex: 1,
        border: "none",
        background: "none",
        outline: "none",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
        fontSize: 14
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        color: "var(--text-muted)",
        margin: "4px 0 10px"
      }
    }, "Social & Entertainment"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        paddingBottom: 16
      }
    }, shown.map(id => {
      const app = APPS[id];
      const checked = sel.has(id);
      return /*#__PURE__*/React.createElement("div", {
        key: id,
        onClick: () => toggle(id),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: checked ? "color-mix(in srgb, var(--mu-amber) 7%, var(--surface-card))" : "var(--surface-card)",
          border: `1px solid ${checked ? "color-mix(in srgb, var(--mu-amber) 33%, transparent)" : "var(--border-hairline)"}`,
          borderRadius: 14,
          padding: 13,
          cursor: "pointer",
          transition: "background 0.12s, border-color 0.12s"
        }
      }, /*#__PURE__*/React.createElement(IconTile, {
        color: app.color,
        size: 40
      }, /*#__PURE__*/React.createElement(Feather, {
        name: app.icon,
        size: 18
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontSize: 15,
          fontWeight: 500,
          color: "var(--text-primary)"
        }
      }, app.name), /*#__PURE__*/React.createElement(Checkbox, {
        checked: checked,
        onChange: e => {
          e.stopPropagation();
          toggle(id);
        }
      }));
    })));
  }
  Object.assign(window.MU, {
    BottomSheet,
    UnlockPicker,
    BlockSheet
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mindful-unlock/picker.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mindful-unlock/ritual.jsx
try { (() => {
// Unlock ritual — the signature flow: intention → oath → countdown →
// active session → recorded. Full-screen overlay over the app.
(function () {
  const {
    Feather,
    Field,
    Button,
    Pill,
    IconTile,
    APPS,
    LEVEL_COLORS
  } = window.MU;
  function fmt(s) {
    const m = Math.floor(s / 60),
      sec = s % 60;
    return m + ":" + String(sec).padStart(2, "0");
  }
  function Ritual({
    appId,
    visit,
    onClose,
    onComplete
  }) {
    const app = APPS[appId] || {
      name: "App",
      color: "#6B7280",
      icon: "smartphone"
    };
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
      const t = setTimeout(() => setCount(c => c - 1), 1000);
      return () => clearTimeout(t);
    }, [step, count]);
    React.useEffect(() => {
      if (step !== "active") return;
      const t = setInterval(() => setElapsed(e => e + 1), 1000);
      return () => clearInterval(t);
    }, [step]);
    function unlock() {
      onComplete({
        appId,
        appName: app.name,
        intention: intention.trim() || "Quick check",
        oath: oath.trim() || undefined,
        level: visit,
        elapsed
      });
    }
    const Header = /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        marginBottom: 28
      }
    }, /*#__PURE__*/React.createElement(IconTile, {
      color: app.color,
      size: 72,
      radius: 20
    }, /*#__PURE__*/React.createElement(Feather, {
      name: app.icon,
      size: 32
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, app.name), /*#__PURE__*/React.createElement(Pill, {
      tone: LEVEL_COLORS[lvl],
      dot: true
    }, "Visit ", visit, " today"));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        zIndex: 70,
        background: "var(--surface-app)",
        display: "flex",
        flexDirection: "column",
        animation: "muFade 0.25s ease"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto",
        padding: "66px 24px 32px",
        display: "flex",
        flexDirection: "column"
      }
    }, step !== "active" && step !== "ended" && /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        alignSelf: "flex-end",
        width: 36,
        height: 36,
        borderRadius: 18,
        border: "none",
        background: "var(--mu-secondary)",
        color: "var(--text-muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "x",
      size: 20
    })), (step === "intention" || step === "oath") && Header, step === "intention" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, visit === 1 ? "What's your intention?" : "State your intention"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 16,
        lineHeight: 1.5,
        color: "var(--text-body)"
      }
    }, "What are you planning to do in ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--mu-amber)"
      }
    }, app.name), "?"), /*#__PURE__*/React.createElement(Field, {
      value: intention,
      onChange: e => setIntention(e.target.value),
      placeholder: "I want to check...",
      rows: 4
    }), /*#__PURE__*/React.createElement(Button, {
      disabled: !intention.trim(),
      onClick: () => setStep(oathNeeded ? "oath" : "countdown"),
      icon: /*#__PURE__*/React.createElement(Feather, {
        name: oathNeeded ? "arrow-right" : "unlock",
        size: 16
      })
    }, oathNeeded ? "Continue" : "Unlock")), step === "oath" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignSelf: "flex-start",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid color-mix(in srgb, var(--mu-purple) 44%, transparent)",
        background: "var(--mu-accent)"
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "alert-circle",
      size: 15,
      color: "var(--mu-purple-light)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--mu-purple-light)"
      }
    }, "Solemn Oath Required")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "Write a solemn oath"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 16,
        lineHeight: 1.5,
        color: "var(--text-body)"
      }
    }, "State clearly and honestly why this cannot wait. This is a commitment."), /*#__PURE__*/React.createElement(Field, {
      value: oath,
      onChange: e => setOath(e.target.value),
      accent: "var(--mu-purple)",
      placeholder: "I swear this is essential because...",
      rows: 3
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "commit",
      disabled: !oath.trim(),
      onClick: () => {
        setStep("countdown");
        setCount(visit >= 3 ? 10 : 5);
      },
      icon: /*#__PURE__*/React.createElement(Feather, {
        name: "check",
        size: 16
      })
    }, "I commit to this oath")), step === "countdown" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        flex: 1,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "Sit with your oath"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 15,
        lineHeight: 1.5,
        color: "var(--text-body)"
      }
    }, count > 0 ? "A few seconds to be sure." : "You're ready."), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 130,
        height: 130,
        borderRadius: 65,
        background: "var(--surface-card)",
        border: `2px solid ${count === 0 ? "var(--mu-success)" : "var(--mu-purple)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 52,
        fontWeight: 700,
        color: count === 0 ? "var(--mu-success)" : "var(--mu-purple)"
      }
    }, count === 0 ? "✓" : count)), /*#__PURE__*/React.createElement(Button, {
      disabled: count > 0,
      onClick: () => setStep("active"),
      icon: count === 0 ? /*#__PURE__*/React.createElement(Feather, {
        name: "unlock",
        size: 16
      }) : null,
      style: {
        marginTop: 16,
        maxWidth: 240
      }
    }, count > 0 ? "Wait " + count + "s…" : "Unlock Now")), step === "active" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        flex: 1,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "check-circle",
      size: 20,
      color: "var(--mu-success)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--mu-success)"
      }
    }, "Unlocked")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "Session Active"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 15,
        lineHeight: 1.5,
        color: "var(--text-body)"
      }
    }, "Go use ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--mu-amber)"
      }
    }, app.name), " with intention.", /*#__PURE__*/React.createElement("br", null), "You have 5 minutes."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        background: "var(--surface-card)",
        border: "1px solid var(--border-hairline)",
        borderRadius: 16,
        padding: "20px 40px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 44,
        fontWeight: 700,
        color: "var(--mu-amber)"
      }
    }, fmt(elapsed)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--text-muted)"
      }
    }, "elapsed")), /*#__PURE__*/React.createElement("button", {
      onClick: () => setStep("ended"),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 28px",
        borderRadius: 14,
        border: "1px solid color-mix(in srgb, var(--mu-danger) 44%, transparent)",
        background: "color-mix(in srgb, var(--mu-danger) 7%, transparent)",
        color: "var(--mu-danger)",
        fontFamily: "var(--font-sans)",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "stop-circle",
      size: 18
    }), "End Session Early")), step === "ended" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        flex: 1,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement(Feather, {
      name: "check-circle",
      size: 44,
      color: "var(--mu-success)"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 700,
        color: "var(--text-primary)"
      }
    }, "Session Recorded"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 15,
        lineHeight: 1.5,
        color: "var(--text-body)"
      }
    }, "You spent ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--mu-amber)"
      }
    }, fmt(elapsed)), " in ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--mu-amber)"
      }
    }, app.name), ".", /*#__PURE__*/React.createElement("br", null), "Logged to your journal."), /*#__PURE__*/React.createElement(Button, {
      onClick: unlock,
      style: {
        maxWidth: 200,
        marginTop: 8
      }
    }, "Done"))));
  }
  window.MU.Ritual = Ritual;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mindful-unlock/ritual.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconTile = __ds_scope.IconTile;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.MeterBar = __ds_scope.MeterBar;

__ds_ns.Pill = __ds_scope.Pill;

__ds_ns.SectionLabel = __ds_scope.SectionLabel;

__ds_ns.StatTile = __ds_scope.StatTile;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.TabBar = __ds_scope.TabBar;

})();
