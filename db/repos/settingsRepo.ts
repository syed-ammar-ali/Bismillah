import { eq } from 'drizzle-orm';
import { DEFAULT_SETTINGS } from '../../core/constants';
import { SettingsRepo } from '../../core/ports';
import { AppSettings } from '../../core/types';
import { AppDatabase } from '../client';
import { settings } from '../schema';

export class DrizzleSettingsRepo implements SettingsRepo {
  constructor(private readonly db: AppDatabase) {}

  async get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const rows = await this.db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (!rows[0]) {
      return DEFAULT_SETTINGS[key];
    }
    try {
      return JSON.parse(rows[0].value) as AppSettings[K];
    } catch {
      return DEFAULT_SETTINGS[key];
    }
  }

  async getAll(): Promise<AppSettings> {
    const rows = await this.db.select().from(settings);
    const parsed: Partial<AppSettings> = {};

    for (const row of rows) {
      const k = row.key as keyof AppSettings;
      try {
        parsed[k] = JSON.parse(row.value);
      } catch {
        // fallback to default
      }
    }

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  }

  async set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    const strValue = JSON.stringify(value);
    await this.db
      .insert(settings)
      .values({ key, value: strValue })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: strValue },
      });
  }

  async setMany(patch: Partial<AppSettings>): Promise<void> {
    await this.db.transaction(async (tx) => {
      for (const [k, v] of Object.entries(patch)) {
        if (v !== undefined) {
          const strValue = JSON.stringify(v);
          await tx
            .insert(settings)
            .values({ key: k, value: strValue })
            .onConflictDoUpdate({
              target: settings.key,
              set: { value: strValue },
            });
        }
      }
    });
  }

  async replaceAll(newSettings: AppSettings): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(settings);
      for (const [k, v] of Object.entries(newSettings)) {
        if (v !== undefined) {
          await tx.insert(settings).values({
            key: k,
            value: JSON.stringify(v),
          });
        }
      }
    });
  }
}
