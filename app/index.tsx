import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useToday } from '../hooks/useToday';
import { useTodayViewModel } from '../hooks/useTodayViewModel';
import { useServices } from '../services/ServicesContext';
import { colors } from '../theme/colors';

export default function DebugTodayScreen() {
  const router = useRouter();
  const { today, hijri } = useToday();
  const { activeJourneys, totalDone, totalTasks } = useTodayViewModel();
  const { tickService } = useServices();
  const [tickingTaskId, setTickingTaskId] = useState<string | null>(null);

  const handleToggle = useCallback(
    async (journeyId: string, taskId: string, dayNumber: number) => {
      setTickingTaskId(taskId);
      try {
        await tickService.toggle(journeyId, taskId, dayNumber);
      } finally {
        setTickingTaskId(null);
      }
    },
    [tickService],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bismillah Debug</Text>
        <Text style={styles.dates}>
          {today} · {hijri.formatted}
        </Text>
        <Text style={styles.summary}>
          Today: {totalDone} / {totalTasks} tasks completed
        </Text>
      </View>

      <FlatList
        data={activeJourneys}
        keyExtractor={(item) => item.journey.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: aj }) => (
          <View style={styles.journeyCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.journeyName}>{aj.journey.name}</Text>
                <Text style={styles.journeyMeta}>
                  Day {aj.dayNumber} of {aj.journey.totalDays} · Streak: {aj.streak} (Glow {aj.glowLevel})
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  aj.isSealed ? styles.statusBadgeSealed : styles.statusBadgePending,
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {aj.isSealed ? 'SEALED' : `${aj.doneCount}/${aj.totalCount}`}
                </Text>
              </View>
            </View>

            <View style={styles.taskList}>
              {aj.tasks.map((task) => {
                const isPending = tickingTaskId === task.id;
                return (
                  <Pressable
                    key={task.id}
                    onPress={() => handleToggle(aj.journey.id, task.id, aj.dayNumber)}
                    style={[
                      styles.taskCard,
                      task.isCompleted && styles.taskCardCompleted,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={task.title}
                  >
                    <View style={styles.checkbox}>
                      {isPending ? (
                        <ActivityIndicator size="small" color={colors.gold} />
                      ) : (
                        <Text style={styles.checkMark}>
                          {task.isCompleted ? '✓' : '○'}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.isCompleted && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable
              style={styles.spikeButton}
              onPress={() => router.push('/spike')}
              accessibilityRole="button"
              accessibilityLabel="Go to Native Spike Screen"
            >
              <Text style={styles.spikeButtonText}>View Native Spike Screen →</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: colors.gold,
  },
  dates: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  summary: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  journeyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  journeyName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  journeyMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeSealed: {
    backgroundColor: colors.goldDim,
  },
  statusBadgePending: {
    backgroundColor: colors.surfaceRaised,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldSoft,
  },
  taskList: {
    gap: 8,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardCompleted: {
    borderColor: colors.goldDim,
    backgroundColor: '#1E2538',
  },
  checkbox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkMark: {
    fontSize: 18,
    color: colors.gold,
  },
  taskTitle: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  taskTitleCompleted: {
    color: colors.goldSoft,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  spikeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  spikeButtonText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
});
