**TabBar** — translucent, blurred bottom navigation with a hairline top border. Active tab amber, inactive muted. The signature "hybrid native" chrome.

```jsx
<TabBar
  activeId="apps"
  onSelect={setTab}
  items={[
    { id: "apps", label: "Apps", icon: <Feather name="shield" /> },
    { id: "journal", label: "Journal", icon: <Feather name="book-open" /> },
    { id: "insights", label: "Insights", icon: <Feather name="bar-chart-2" /> },
  ]}
/>
```

Sits over the dark canvas via `backdrop-filter: blur()`. Mirrors the app's native iOS tab bar (shield / book / chart icons).
