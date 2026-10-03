import { and, eq } from 'drizzle-orm';
import { CompletionRepo } from '../../core/ports';
import { TaskCompletion } from '../../core/types';
import { AppDatabase } from '../client';
import { taskCompletions } from '../schema';

export class DrizzleCompletionRepo implements CompletionRepo {
  constructor(private readonly db: AppDatabase) {}

  async getByJourney(journeyId: string): Promise<TaskCompletion[]> {
    const rows = await this.db
      .select()
      .from(taskCompletions)
      .where(eq(taskCompletions.journeyId, journeyId));
    return rows;
  }

  async getByDay(journeyId: string, dayNumber: number): Promise<TaskCompletion[]> {
    const rows = await this.db
      .select()
      .from(taskCompletions)
      .where(
        and(
          eq(taskCompletions.journeyId, journeyId),
          eq(taskCompletions.dayNumber, dayNumber),
        ),
      );
    return rows;
  }

  async getAll(): Promise<TaskCompletion[]> {
    const rows = await this.db.select().from(taskCompletions);
    return rows;
  }

  async add(completion: TaskCompletion): Promise<void> {
    await this.db
      .insert(taskCompletions)
      .values({
        id: completion.id,
        journeyId: completion.journeyId,
        taskId: completion.taskId,
        dayNumber: completion.dayNumber,
        completedAt: completion.completedAt,
      })
      .onConflictDoNothing();
  }

  async remove(taskId: string, dayNumber: number): Promise<void> {
    await this.db
      .delete(taskCompletions)
      .where(
        and(
          eq(taskCompletions.taskId, taskId),
          eq(taskCompletions.dayNumber, dayNumber),
        ),
      );
  }

  async removeByJourneyAndDay(journeyId: string, dayNumber: number): Promise<void> {
    await this.db
      .delete(taskCompletions)
      .where(
        and(
          eq(taskCompletions.journeyId, journeyId),
          eq(taskCompletions.dayNumber, dayNumber),
        ),
      );
  }

  async replaceAll(newCompletions: TaskCompletion[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(taskCompletions);
      if (newCompletions.length > 0) {
        await tx.insert(taskCompletions).values(
          newCompletions.map((c) => ({
            id: c.id,
            journeyId: c.journeyId,
            taskId: c.taskId,
            dayNumber: c.dayNumber,
            completedAt: c.completedAt,
          })),
        );
      }
    });
  }
}
