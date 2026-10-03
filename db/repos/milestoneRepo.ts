import { eq } from 'drizzle-orm';
import { MilestoneRepo } from '../../core/ports';
import { MilestoneSeen } from '../../core/types';
import { AppDatabase } from '../client';
import { milestonesSeen } from '../schema';

export class DrizzleMilestoneRepo implements MilestoneRepo {
  constructor(private readonly db: AppDatabase) {}

  async getSeen(journeyId: string): Promise<number[]> {
    const rows = await this.db
      .select({ dayNumber: milestonesSeen.dayNumber })
      .from(milestonesSeen)
      .where(eq(milestonesSeen.journeyId, journeyId));
    return rows.map((r) => r.dayNumber);
  }

  async getAll(): Promise<MilestoneSeen[]> {
    const rows = await this.db.select().from(milestonesSeen);
    return rows;
  }

  async markSeen(journeyId: string, dayNumber: number, shownAt: string): Promise<void> {
    await this.db
      .insert(milestonesSeen)
      .values({
        journeyId,
        dayNumber,
        shownAt,
      })
      .onConflictDoNothing();
  }

  async replaceAll(milestones: MilestoneSeen[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(milestonesSeen);
      if (milestones.length > 0) {
        await tx.insert(milestonesSeen).values(
          milestones.map((m) => ({
            journeyId: m.journeyId,
            dayNumber: m.dayNumber,
            shownAt: m.shownAt,
          })),
        );
      }
    });
  }
}
