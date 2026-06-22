// Local Expo config plugin: strip the iOS `aps-environment` (Push Notifications)
// entitlement that expo-notifications adds during prebuild. This app uses ONLY
// local scheduled notifications, which do not require the push entitlement —
// and including it forces automatic signing to provision a Push capability the
// App ID doesn't carry. Listed LAST in app.json `plugins` so it runs after the
// notifications module has added the entitlement, then removes it.
const { withEntitlementsPlist } = require('@expo/config-plugins');

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment'];
    return cfg;
  });
};
