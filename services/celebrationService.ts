import { isMilestone } from '../core/milestones';
import { MilestoneRepo } from '../core/ports';
import { CelebrationItem, Journey } from '../core/types';
import { useJourneyStore } from '../stores/useJourneyStore';
import { useUiStore } from '../stores/useUiStore';

export class CelebrationService {
  constructor(private readonly milestoneRepo: MilestoneRepo) {}

  async handleSealEvent(journey: Journey, dayNumber: number): Promise<CelebrationItem[]> {
    const celebrations: CelebrationItem[] = [];

    // 1. Seal animation
    celebrations.push({
      id: `seal-${journey.id}-${dayNumber}`,
      type: 'seal',
      journeyId: journey.id,
      dayNumber,
    });

    // 2. Milestone check
    if (isMilestone(dayNumber, journey.totalDays)) {
      const seen = await this.milestoneRepo.getSeen(journey.id);
      if (!seen.includes(dayNumber)) {
        const now = new Date().toISOString();
        await this.milestoneRepo.markSeen(journey.id, dayNumber, now);
        useJourneyStore.getState().markMilestoneSeen(journey.id, dayNumber);

        celebrations.push({
          id: `milestone-${journey.id}-${dayNumber}`,
          type: 'milestone',
          journeyId: journey.id,
          dayNumber,
        });
      }
    }

    // 3. Journey completion check
    if (dayNumber === journey.totalDays && !journey.completionShownAt) {
      celebrations.push({
        id: `completion-${journey.id}`,
        type: 'completion',
        journeyId: journey.id,
      });
    }

    useUiStore.getState().enqueueCelebrations(celebrations);
    return celebrations;
  }

  queueCelebrations(items: CelebrationItem[]): void {
    if (items.length > 0) {
      useUiStore.getState().enqueueCelebrations(items);
    }
  }
}
