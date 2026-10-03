import Storage from 'expo-sqlite/kv-store';

const COUNTER_KEY = 'spike_counter';

export async function getStoredCount(): Promise<number> {
  try {
    const val = await Storage.getItem(COUNTER_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export async function setStoredCount(count: number): Promise<void> {
  try {
    await Storage.setItem(COUNTER_KEY, String(count));
  } catch {
    // kv-store failure fallback
  }
}

export async function incrementStoredCount(): Promise<number> {
  const current = await getStoredCount();
  const next = current + 1;
  await setStoredCount(next);
  return next;
}
