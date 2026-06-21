import { createContext, useContext, useEffect, useState } from 'react';
import { Target } from '../lib/types';
import { getTarget } from '../db/queries';
import { todayISO } from '../lib/date';

interface AppState {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  target: Target;
  refreshTarget: () => Promise<void>;
}
const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [target, setTarget] = useState<Target>({ dailyKcal: 2000, proteinG: 150, carbsG: 200, fatG: 67 });
  const refreshTarget = async () => setTarget(await getTarget());
  useEffect(() => { refreshTarget(); }, []);
  return (
    <Ctx.Provider value={{ selectedDate, setSelectedDate, target, refreshTarget }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
}
