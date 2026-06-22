export type ReminderMode = 'off' | 'daily' | 'meals';

export interface ReminderConfig {
  mode: ReminderMode;
  daily: string;      // "HH:MM"
  breakfast: string;
  lunch: string;
  dinner: string;
}

export const DEFAULT_REMINDERS: ReminderConfig = {
  mode: 'daily', daily: '20:00', breakfast: '08:00', lunch: '13:00', dinner: '19:00',
};

export interface ScheduledReminder {
  key: string; hour: number; minute: number; title: string; body: string;
}

export function parseTime(s: string): { hour: number; minute: number } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s ?? '');
  if (!m) return { hour: 20, minute: 0 };
  return {
    hour: Math.min(23, Math.max(0, Number(m[1]))),
    minute: Math.min(59, Math.max(0, Number(m[2]))),
  };
}

export function formatTime(t: { hour: number; minute: number }): string {
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
}

export function scheduledReminders(c: ReminderConfig): ScheduledReminder[] {
  if (c.mode === 'off') return [];
  if (c.mode === 'daily') {
    const { hour, minute } = parseTime(c.daily);
    return [{ key: 'daily', hour, minute, title: 'Log your day', body: 'Have you logged your meals today?' }];
  }
  const meals: { key: string; time: string; label: string }[] = [
    { key: 'breakfast', time: c.breakfast, label: 'breakfast' },
    { key: 'lunch', time: c.lunch, label: 'lunch' },
    { key: 'dinner', time: c.dinner, label: 'dinner' },
  ];
  return meals.map(({ key, time, label }) => {
    const { hour, minute } = parseTime(time);
    return { key, hour, minute, title: label.charAt(0).toUpperCase() + label.slice(1), body: `Time to log ${label}.` };
  });
}
