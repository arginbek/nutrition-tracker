import { parseTime, formatTime, scheduledReminders, DEFAULT_REMINDERS, ReminderConfig } from '../lib/reminders';

describe('parseTime / formatTime', () => {
  it('parses HH:MM', () => expect(parseTime('08:05')).toEqual({ hour: 8, minute: 5 }));
  it('clamps out-of-range', () => expect(parseTime('25:99')).toEqual({ hour: 23, minute: 59 }));
  it('falls back on garbage', () => expect(parseTime('nope')).toEqual({ hour: 20, minute: 0 }));
  it('formats zero-padded', () => expect(formatTime({ hour: 8, minute: 5 })).toBe('08:05'));
});

describe('scheduledReminders', () => {
  const base: ReminderConfig = { ...DEFAULT_REMINDERS };
  it('off -> none', () => expect(scheduledReminders({ ...base, mode: 'off' })).toEqual([]));
  it('daily -> one at the daily time', () => {
    const r = scheduledReminders({ ...base, mode: 'daily', daily: '20:00' });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ key: 'daily', hour: 20, minute: 0 });
    expect(r[0].body.length).toBeGreaterThan(0);
  });
  it('meals -> three with correct hours and titles', () => {
    const r = scheduledReminders({ ...base, mode: 'meals', breakfast: '08:00', lunch: '13:00', dinner: '19:00' });
    expect(r.map(x => x.key)).toEqual(['breakfast', 'lunch', 'dinner']);
    expect(r.map(x => x.hour)).toEqual([8, 13, 19]);
    expect(r[0].title).toBe('Breakfast');
    expect(r[2].body).toBe('Time to log dinner.');
  });
});
