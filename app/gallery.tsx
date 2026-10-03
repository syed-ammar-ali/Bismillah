import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DayCircle } from '../components/grid/DayCircle';
import { DayGrid } from '../components/grid/DayGrid';
import { JourneyCard } from '../components/journey/JourneyCard';
import { StreakBadge } from '../components/journey/StreakBadge';
import { ProgressRing } from '../components/ring/ProgressRing';
import { TaskCard } from '../components/tasks/TaskCard';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Crescent } from '../components/ui/Crescent';
import { DayStatus, Journey } from '../core/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function GalleryScreen() {
  const router = useRouter();
  const [selectedChip, setSelectedChip] = useState('All');
  const [taskDone1, setTaskDone1] = useState(false);
  const [taskDone2, setTaskDone2] = useState(true);

  // 120 days sample status data for performance check
  const sample120Statuses: Record<number, DayStatus> = {};
  for (let i = 1; i <= 120; i++) {
    if (i <= 20) {
      sample120Statuses[i] = 'sealed';
    } else if (i === 21) {
      sample120Statuses[i] = 'madeUp';
    } else if (i === 22) {
      sample120Statuses[i] = 'gap';
    } else if (i <= 44) {
      sample120Statuses[i] = 'sealed';
    } else if (i === 45) {
      sample120Statuses[i] = 'today';
    } else {
      sample120Statuses[i] = 'future';
    }
  }

  const sampleJourney: Journey = {
    id: 'demo-journey',
    name: '40 Days of Fajr',
    calendarType: 'gregorian',
    startInput: '2026-10-01',
    endInput: '2026-11-09',
    startDate: '2026-10-01',
    endDate: '2026-11-09',
    totalDays: 40,
    deadlineLabel: 'Before Ramadan',
    deadlineDate: '2026-11-12',
    sortOrder: 0,
    createdAt: '2026-10-01T00:00:00.000Z',
    completionShownAt: null,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.screenTitle}>Design System Gallery</Text>
          <Text style={styles.subtitle}>Component states & Performance verification</Text>
        </View>

        {/* 1. Typography */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>1. Typography</Text>
          <AppText variant="display" color="gold">
            Display 56
          </AppText>
          <AppText variant="title" color="default">
            Title 28 Cormorant
          </AppText>
          <AppText variant="heading" color="goldSoft">
            Heading 18 Inter SemiBold
          </AppText>
          <AppText variant="body" color="default">
            Body 15 Inter Regular. Calm, sacred, minimal aesthetic with warm off-white tones.
          </AppText>
          <AppText variant="caption" color="muted">
            Caption 12 Inter Medium. Used for secondary notes and metadata.
          </AppText>
        </View>

        {/* 2. Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>2. Buttons</Text>
          <View style={styles.rowWrap}>
            <Button title="Primary Gold" variant="primary" onPress={() => {}} />
            <Button title="Secondary" variant="secondary" onPress={() => {}} />
            <Button title="Ghost" variant="ghost" onPress={() => {}} />
            <Button title="Danger" variant="danger" onPress={() => {}} />
          </View>
        </View>

        {/* 3. Chips */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>3. Chips</Text>
          <View style={styles.row}>
            {['All', 'Active', 'Completed'].map((c) => (
              <Chip
                key={c}
                label={c}
                selected={selectedChip === c}
                onPress={() => setSelectedChip(c)}
              />
            ))}
          </View>
        </View>

        {/* 4. Crescent Motif */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>4. Crescent Motif</Text>
          <View style={styles.row}>
            <Crescent size={18} />
            <Crescent size={28} />
            <Crescent size={40} />
            <Crescent size={56} opacity={0.6} />
          </View>
        </View>

        {/* 5. Progress Rings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>5. Progress Rings</Text>
          <View style={styles.ringShowcase}>
            <ProgressRing progress={0.65} size={150}>
              <Text style={styles.ringCenterText}>26 / 40</Text>
              <Text style={styles.ringCenterSub}>Days</Text>
            </ProgressRing>
            <View style={styles.smallRingsRow}>
              <ProgressRing progress={0} size={48}>
                <Text style={styles.smallRingText}>0%</Text>
              </ProgressRing>
              <ProgressRing progress={0.33} size={48}>
                <Text style={styles.smallRingText}>33%</Text>
              </ProgressRing>
              <ProgressRing progress={0.75} size={48}>
                <Text style={styles.smallRingText}>75%</Text>
              </ProgressRing>
              <ProgressRing progress={1} size={48}>
                <Text style={styles.smallRingText}>100%</Text>
              </ProgressRing>
            </View>
          </View>
        </View>

        {/* 6. Task Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>6. Task Cards (Interactive)</Text>
          <View style={styles.column}>
            <TaskCard
              title="Fajr prayer with jama'ah"
              note="First takbir in mosque"
              isCompleted={taskDone1}
              onToggle={() => setTaskDone1(!taskDone1)}
            />
            <TaskCard
              title="Read Quran 10 pages"
              isCompleted={taskDone2}
              onToggle={() => setTaskDone2(!taskDone2)}
            />
          </View>
        </View>

        {/* 7. Streak Badges (Glow Levels 0-4) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>7. Streak Badges (Glow Levels 0 to 4)</Text>
          <View style={styles.rowWrap}>
            <View style={styles.badgeItem}>
              <StreakBadge streak={2} glowLevel={0} />
              <Text style={styles.badgeLabel}>L0 (0-2)</Text>
            </View>
            <View style={styles.badgeItem}>
              <StreakBadge streak={5} glowLevel={1} />
              <Text style={styles.badgeLabel}>L1 (3-6)</Text>
            </View>
            <View style={styles.badgeItem}>
              <StreakBadge streak={12} glowLevel={2} />
              <Text style={styles.badgeLabel}>L2 (7-13)</Text>
            </View>
            <View style={styles.badgeItem}>
              <StreakBadge streak={20} glowLevel={3} />
              <Text style={styles.badgeLabel}>L3 (14-24)</Text>
            </View>
            <View style={styles.badgeItem}>
              <StreakBadge streak={35} glowLevel={4} />
              <Text style={styles.badgeLabel}>L4 (25+)</Text>
            </View>
          </View>
        </View>

        {/* 8. Day Circles (All 5 states) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>8. Day Circles (5 States)</Text>
          <View style={styles.rowWrap}>
            <View style={styles.circleItem}>
              <DayCircle dayNumber={1} status="sealed" />
              <Text style={styles.circleLabel}>Sealed</Text>
            </View>
            <View style={styles.circleItem}>
              <DayCircle dayNumber={2} status="gap" />
              <Text style={styles.circleLabel}>Gap</Text>
            </View>
            <View style={styles.circleItem}>
              <DayCircle dayNumber={3} status="madeUp" />
              <Text style={styles.circleLabel}>Made Up</Text>
            </View>
            <View style={styles.circleItem}>
              <DayCircle dayNumber={4} status="today" />
              <Text style={styles.circleLabel}>Today</Text>
            </View>
            <View style={styles.circleItem}>
              <DayCircle dayNumber={5} status="future" />
              <Text style={styles.circleLabel}>Future</Text>
            </View>
          </View>
        </View>

        {/* 9. Journey Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>9. Journey Cards</Text>
          <View style={styles.column}>
            <JourneyCard
              journey={sampleJourney}
              dayNumber={14}
              progressFraction={0.35}
              currentStreak={14}
              bestStreak={14}
              glowLevel={3}
              todayDoneCount={3}
              todayTotalCount={4}
              isSealedToday={false}
              deadlineCountdownText="Before Ramadan · 33 days left"
              state="active"
            />
            <JourneyCard
              journey={{
                ...sampleJourney,
                name: '30 Days of Tahajjud',
                completionShownAt: '2026-09-30',
              }}
              dayNumber={30}
              progressFraction={1}
              currentStreak={30}
              bestStreak={30}
              glowLevel={4}
              isSealedToday={true}
              state="completed"
            />
          </View>
        </View>

        {/* 10. 120-Day Grid Performance Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>10. 120-Day Grid Demo (Performance Budget)</Text>
          <Text style={styles.captionText}>
            Renders 120 items in 8-column rows without gradients/glow per circle, smooth 60fps.
          </Text>
          <View style={styles.gridContainer}>
            <DayGrid totalDays={120} dayStatuses={sample120Statuses} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: spacing.screenPadding,
    gap: spacing.xl,
  },
  header: {
    marginBottom: spacing.sm,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  backText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  screenTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: colors.gold,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
  },
  column: {
    gap: spacing.md,
  },
  ringShowcase: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  ringCenterText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 36,
    color: colors.gold,
  },
  ringCenterSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  smallRingsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  smallRingText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.goldSoft,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 6,
  },
  badgeLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  circleItem: {
    alignItems: 'center',
    gap: 6,
  },
  circleLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  gridContainer: {
    marginTop: spacing.sm,
  },
  captionText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
