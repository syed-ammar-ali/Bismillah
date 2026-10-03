import { asc, eq } from 'drizzle-orm';
import { TaskRepo } from '../../core/ports';
import { Task } from '../../core/types';
import { AppDatabase } from '../client';
import { tasks } from '../schema';

export class DrizzleTaskRepo implements TaskRepo {
  constructor(private readonly db: AppDatabase) {}

  async getByJourney(journeyId: string): Promise<Task[]> {
    const rows = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.journeyId, journeyId))
      .orderBy(asc(tasks.sortOrder));
    return rows;
  }

  async getAll(): Promise<Task[]> {
    const rows = await this.db.select().from(tasks).orderBy(asc(tasks.sortOrder));
    return rows;
  }

  async getById(id: string): Promise<Task | null> {
    const rows = await this.db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async create(task: Task): Promise<void> {
    await this.db.insert(tasks).values({
      id: task.id,
      journeyId: task.journeyId,
      title: task.title,
      note: task.note ?? null,
      kind: task.kind,
      sortOrder: task.sortOrder,
      activeFromDay: task.activeFromDay,
      activeToDay: task.activeToDay ?? null,
    });
  }

  async createMany(newTasks: Task[]): Promise<void> {
    if (newTasks.length === 0) return;
    await this.db.insert(tasks).values(
      newTasks.map((t) => ({
        id: t.id,
        journeyId: t.journeyId,
        title: t.title,
        note: t.note ?? null,
        kind: t.kind,
        sortOrder: t.sortOrder,
        activeFromDay: t.activeFromDay,
        activeToDay: t.activeToDay ?? null,
      })),
    );
  }

  async update(task: Partial<Task> & { id: string }): Promise<void> {
    const { id, ...data } = task;
    await this.db.update(tasks).set(data).where(eq(tasks.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(tasks).where(eq(tasks.id, id));
  }

  async replaceAll(newTasks: Task[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(tasks);
      if (newTasks.length > 0) {
        await tx.insert(tasks).values(
          newTasks.map((t) => ({
            id: t.id,
            journeyId: t.journeyId,
            title: t.title,
            note: t.note ?? null,
            kind: t.kind,
            sortOrder: t.sortOrder,
            activeFromDay: t.activeFromDay,
            activeToDay: t.activeToDay ?? null,
          })),
        );
      }
    });
  }
}
