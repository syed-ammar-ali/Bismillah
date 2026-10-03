import { and, eq } from 'drizzle-orm';
import { GapNoteRepo } from '../../core/ports';
import { DayLog } from '../../core/types';
import { AppDatabase } from '../client';
import { dayLogs } from '../schema';

export class DrizzleGapNoteRepo implements GapNoteRepo {
  constructor(private readonly db: AppDatabase) {}

  async getNote(journeyId: string, dayNumber: number): Promise<string | null> {
    const rows = await this.db
      .select()
      .from(dayLogs)
      .where(and(eq(dayLogs.journeyId, journeyId), eq(dayLogs.dayNumber, dayNumber)))
      .limit(1);
    return rows[0]?.gapReason ?? null;
  }

  async getByJourney(journeyId: string): Promise<DayLog[]> {
    const rows = await this.db.select().from(dayLogs).where(eq(dayLogs.journeyId, journeyId));
    return rows;
  }

  async getAll(): Promise<DayLog[]> {
    const rows = await this.db.select().from(dayLogs);
    return rows;
  }

  async setNote(journeyId: string, dayNumber: number, gapReason: string | null): Promise<void> {
    const trimmed = gapReason?.trim();
    if (!trimmed) {
      await this.db
        .delete(dayLogs)
        .where(and(eq(dayLogs.journeyId, journeyId), eq(dayLogs.dayNumber, dayNumber)));
      return;
    }

    const updatedAt = new Date().toISOString();
    const existing = await this.getNote(journeyId, dayNumber);

    if (existing !== null) {
      await this.db
        .update(dayLogs)
        .set({ gapReason: trimmed, updatedAt })
        .where(and(eq(dayLogs.journeyId, journeyId), eq(dayLogs.dayNumber, dayNumber)));
    } else {
      await this.db.insert(dayLogs).values({
        id: `gap-${journeyId}-${dayNumber}`,
        journeyId,
        dayNumber,
        gapReason: trimmed,
        updatedAt,
      });
    }
  }

  async replaceAll(logs: DayLog[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(dayLogs);
      if (logs.length > 0) {
        await tx.insert(dayLogs).values(
          logs.map((l) => ({
            id: l.id,
            journeyId: l.journeyId,
            dayNumber: l.dayNumber,
            gapReason: l.gapReason ?? null,
            updatedAt: l.updatedAt,
          })),
        );
      }
    });
  }
}
