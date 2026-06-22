import * as Notifications from 'expo-notifications';
import { ReminderConfig, scheduledReminders } from './reminders';

export async function hasPermission(): Promise<boolean> {
  const p = await Notifications.getPermissionsAsync();
  return p.granted;
}

export async function ensurePermission(): Promise<boolean> {
  if (await hasPermission()) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

async function schedule(config: ReminderConfig): Promise<void> {
  for (const r of scheduledReminders(config)) {
    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: r.hour,
        minute: r.minute,
      },
    });
  }
}

export async function applyReminders(config: ReminderConfig): Promise<{ granted: boolean }> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (config.mode === 'off') return { granted: true };
  const granted = await ensurePermission();
  if (!granted) return { granted: false };
  await schedule(config);
  return { granted: true };
}

// Launch-time resync — never prompts; only reschedules if already permitted.
export async function syncReminders(config: ReminderConfig): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (config.mode === 'off') return;
  if (!(await hasPermission())) return;
  await schedule(config);
}
