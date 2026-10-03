import { asc, eq, isNull } from 'drizzle-orm';
import { JourneyRepo } from '../../core/ports';
import { Journey } from '../../core/types';
import { AppDatabase } from '../client';
import { journeys } from '../schema';

export class DrizzleJourneyRepo implements JourneyRepo {
  constructor(private readonly db: AppDatabase) {}

  async getAll(): Promise<Journey[]> {
    const rows = await this.db
      .select()
      .from(journeys)
      .where(isNull(journeys.archivedAt))
      .orderBy(asc(journeys.sortOrder));
    return rows;
  }

  async getAllIncludingArchived(): Promise<Journey[]> {
    const rows = await this.db.select().from(journeys).orderBy(asc(journeys.sortOrder));
    return rows;
  }

  async getById(id: string): Promise<Journey | null> {
    const rows = await this.db.select().from(journeys).where(eq(journeys.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async create(journey: Journey): Promise<void> {
    await this.db.insert(journeys).values({
      id: journey.id,
      name: journey.name,
      calendarType: journey.calendarType,
      startInput: journey.startInput,
      endInput: journey.endInput,
      startDate: journey.startDate,
      endDate: journey.endDate,
      totalDays: journey.totalDays,
      deadlineLabel: journey.deadlineLabel ?? null,
      deadlineDate: journey.deadlineDate ?? null,
      closingNote: journey.closingNote ?? null,
      completionShownAt: journey.completionShownAt ?? null,
      sortOrder: journey.sortOrder,
      createdAt: journey.createdAt,
      archivedAt: journey.archivedAt ?? null,
    });
  }

  async update(journey: Partial<Journey> & { id: string }): Promise<void> {
    const { id, ...data } = journey;
    await this.db.update(journeys).set(data).where(eq(journeys.id, id));
  }

  async archive(id: string, archivedAt: string): Promise<void> {
    await this.db.update(journeys).set({ archivedAt }).where(eq(journeys.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(journeys).where(eq(journeys.id, id));
  }

  async replaceAll(newJourneys: Journey[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(journeys);
      if (newJourneys.length > 0) {
        await tx.insert(journeys).values(
          newJourneys.map((j) => ({
            id: j.id,
            name: j.name,
            calendarType: j.calendarType,
            startInput: j.startInput,
            endInput: j.endInput,
            startDate: j.startDate,
            endDate: j.endDate,
            totalDays: j.totalDays,
            deadlineLabel: j.deadlineLabel ?? null,
            deadlineDate: j.deadlineDate ?? null,
            closingNote: j.closingNote ?? null,
            completionShownAt: j.completionShownAt ?? null,
            sortOrder: j.sortOrder,
            createdAt: j.createdAt,
            archivedAt: j.archivedAt ?? null,
          })),
        );
      }
    });
  }
}
