import { DEFAULT_SETTINGS } from '../../core/constants';
import {
  CompletionRepo,
  GapNoteRepo,
  JourneyRepo,
  MilestoneRepo,
  SettingsRepo,
  TaskRepo,
} from '../../core/ports';
import {
  AppSettings,
  DayLog,
  Journey,
  MilestoneSeen,
  Task,
  TaskCompletion,
} from '../../core/types';

export class FakeJourneyRepo implements JourneyRepo {
  private journeys: Map<string, Journey> = new Map();

  async getAll(): Promise<Journey[]> {
    return Array.from(this.journeys.values())
      .filter((j) => !j.archivedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getAllIncludingArchived(): Promise<Journey[]> {
    return Array.from(this.journeys.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getById(id: string): Promise<Journey | null> {
    return this.journeys.get(id) ?? null;
  }

  async create(journey: Journey): Promise<void> {
    this.journeys.set(journey.id, { ...journey });
  }

  async update(journey: Partial<Journey> & { id: string }): Promise<void> {
    const existing = this.journeys.get(journey.id);
    if (existing) {
      this.journeys.set(journey.id, { ...existing, ...journey });
    }
  }

  async archive(id: string, archivedAt: string): Promise<void> {
    const existing = this.journeys.get(id);
    if (existing) {
      this.journeys.set(id, { ...existing, archivedAt });
    }
  }

  async delete(id: string): Promise<void> {
    this.journeys.delete(id);
  }

  async replaceAll(journeys: Journey[]): Promise<void> {
    this.journeys.clear();
    for (const j of journeys) {
      this.journeys.set(j.id, { ...j });
    }
  }
}

export class FakeTaskRepo implements TaskRepo {
  private tasks: Map<string, Task> = new Map();

  async getByJourney(journeyId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((t) => t.journeyId === journeyId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getAll(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getById(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null;
  }

  async create(task: Task): Promise<void> {
    this.tasks.set(task.id, { ...task });
  }

  async createMany(newTasks: Task[]): Promise<void> {
    for (const t of newTasks) {
      this.tasks.set(t.id, { ...t });
    }
  }

  async update(task: Partial<Task> & { id: string }): Promise<void> {
    const existing = this.tasks.get(task.id);
    if (existing) {
      this.tasks.set(task.id, { ...existing, ...task });
    }
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async replaceAll(tasks: Task[]): Promise<void> {
    this.tasks.clear();
    for (const t of tasks) {
      this.tasks.set(t.id, { ...t });
    }
  }
}

export class FakeCompletionRepo implements CompletionRepo {
  private completions: Map<string, TaskCompletion> = new Map();

  private key(taskId: string, dayNumber: number): string {
    return `${taskId}:${dayNumber}`;
  }

  async getByJourney(journeyId: string): Promise<TaskCompletion[]> {
    return Array.from(this.completions.values()).filter((c) => c.journeyId === journeyId);
  }

  async getByDay(journeyId: string, dayNumber: number): Promise<TaskCompletion[]> {
    return Array.from(this.completions.values()).filter(
      (c) => c.journeyId === journeyId && c.dayNumber === dayNumber,
    );
  }

  async getAll(): Promise<TaskCompletion[]> {
    return Array.from(this.completions.values());
  }

  async add(completion: TaskCompletion): Promise<void> {
    this.completions.set(this.key(completion.taskId, completion.dayNumber), { ...completion });
  }

  async remove(taskId: string, dayNumber: number): Promise<void> {
    this.completions.delete(this.key(taskId, dayNumber));
  }

  async removeByJourneyAndDay(journeyId: string, dayNumber: number): Promise<void> {
    for (const [k, c] of this.completions.entries()) {
      if (c.journeyId === journeyId && c.dayNumber === dayNumber) {
        this.completions.delete(k);
      }
    }
  }

  async replaceAll(completions: TaskCompletion[]): Promise<void> {
    this.completions.clear();
    for (const c of completions) {
      this.completions.set(this.key(c.taskId, c.dayNumber), { ...c });
    }
  }
}

export class FakeGapNoteRepo implements GapNoteRepo {
  private notes: Map<string, DayLog> = new Map();

  private key(journeyId: string, dayNumber: number): string {
    return `${journeyId}:${dayNumber}`;
  }

  async getNote(journeyId: string, dayNumber: number): Promise<string | null> {
    return this.notes.get(this.key(journeyId, dayNumber))?.gapReason ?? null;
  }

  async getByJourney(journeyId: string): Promise<DayLog[]> {
    return Array.from(this.notes.values()).filter((l) => l.journeyId === journeyId);
  }

  async getAll(): Promise<DayLog[]> {
    return Array.from(this.notes.values());
  }

  async setNote(journeyId: string, dayNumber: number, gapReason: string | null): Promise<void> {
    const trimmed = gapReason?.trim();
    const k = this.key(journeyId, dayNumber);
    if (!trimmed) {
      this.notes.delete(k);
      return;
    }

    this.notes.set(k, {
      id: `gap-${journeyId}-${dayNumber}`,
      journeyId,
      dayNumber,
      gapReason: trimmed,
      updatedAt: new Date().toISOString(),
    });
  }

  async replaceAll(logs: DayLog[]): Promise<void> {
    this.notes.clear();
    for (const l of logs) {
      this.notes.set(this.key(l.journeyId, l.dayNumber), { ...l });
    }
  }
}

export class FakeMilestoneRepo implements MilestoneRepo {
  private seen: Map<string, MilestoneSeen> = new Map();

  private key(journeyId: string, dayNumber: number): string {
    return `${journeyId}:${dayNumber}`;
  }

  async getSeen(journeyId: string): Promise<number[]> {
    return Array.from(this.seen.values())
      .filter((s) => s.journeyId === journeyId)
      .map((s) => s.dayNumber);
  }

  async getAll(): Promise<MilestoneSeen[]> {
    return Array.from(this.seen.values());
  }

  async markSeen(journeyId: string, dayNumber: number, shownAt: string): Promise<void> {
    this.seen.set(this.key(journeyId, dayNumber), { journeyId, dayNumber, shownAt });
  }

  async replaceAll(milestones: MilestoneSeen[]): Promise<void> {
    this.seen.clear();
    for (const m of milestones) {
      this.seen.set(this.key(m.journeyId, m.dayNumber), { ...m });
    }
  }
}

export class FakeSettingsRepo implements SettingsRepo {
  private settings: AppSettings = { ...DEFAULT_SETTINGS };

  async get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    return this.settings[key];
  }

  async getAll(): Promise<AppSettings> {
    return { ...this.settings };
  }

  async set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    this.settings[key] = value;
  }

  async setMany(patch: Partial<AppSettings>): Promise<void> {
    this.settings = { ...this.settings, ...patch };
  }

  async replaceAll(newSettings: AppSettings): Promise<void> {
    this.settings = { ...newSettings };
  }
}
