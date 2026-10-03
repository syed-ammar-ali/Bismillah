import { useMemo } from 'react';
import { toHijri } from '../core/hijri';
import { useAppStore } from '../stores/useAppStore';

export function useToday() {
  const today = useAppStore((s) => s.today);
  const hijriAdjustment = useAppStore((s) => s.settings.hijriAdjustment);

  const hijri = useMemo(() => {
    return toHijri(today, hijriAdjustment);
  }, [today, hijriAdjustment]);

  return {
    today,
    hijri,
  };
}
