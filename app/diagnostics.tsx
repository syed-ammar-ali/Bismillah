import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LogEntry } from '../core/types';
import { clearLogs, getLogs } from '../services/logger';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontFamilies } from '../theme/typography';

type LevelFilter = 'all' | 'info' | 'warn' | 'error';
type CategoryFilter = 'all' | 'widget' | 'notification' | 'system' | 'general';

const LogCard = React.memo(function LogCard({ item }: { item: LogEntry }) {
  const levelStyle =
    item.level === 'error'
      ? styles.badgeError
      : item.level === 'warn'
        ? styles.badgeWarn
        : styles.badgeInfo;

  const levelTextColor =
    item.level === 'error'
      ? colors.danger
      : item.level === 'warn'
        ? colors.gold
        : colors.textMuted;

  const timeOnly = item.timestamp.split('T')[1]?.replace('Z', '') ?? item.timestamp;

  return (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={[styles.badge, levelStyle]}>
          <Text style={[styles.badgeText, { color: levelTextColor }]}>
            {item.level.toUpperCase()}
          </Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
        </View>
        <Text style={styles.timestampText}>{timeOnly}</Text>
      </View>
      <Text style={styles.logMessage}>{item.message}</Text>
    </View>
  );
});

export default function DiagnosticsScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>(() => getLogs().reverse());
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  const refresh = useCallback(() => {
    setLogs(getLogs().reverse());
  }, []);

  const handleClear = useCallback(() => {
    clearLogs();
    setLogs([]);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((entry) => {
      if (selectedLevel !== 'all' && entry.level !== selectedLevel) return false;
      if (selectedCategory !== 'all' && entry.category !== selectedCategory) return false;
      return true;
    });
  }, [logs, selectedLevel, selectedCategory]);

  const renderItem = useCallback(
    ({ item }: { item: LogEntry }) => <LogCard item={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: LogEntry, idx: number) => `${item.timestamp}-${idx}`,
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to Settings"
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={colors.gold} />
          <Text style={styles.backText}>Settings</Text>
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            onPress={refresh}
            accessibilityRole="button"
            accessibilityLabel="Refresh logs"
            style={styles.iconButton}
          >
            <RefreshCw size={17} color={colors.gold} />
          </Pressable>
          <Pressable
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Clear logs"
            style={styles.iconButton}
          >
            <Trash2 size={17} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      {/* Screen Title & Info */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Diagnostics Log</Text>
        <Text style={styles.subtitle}>
          Ring buffer of last {logs.length}/100 internal system events. No personal data.
        </Text>
      </View>

      {/* Level Filters */}
      <View style={styles.filterRow}>
        {(['all', 'info', 'warn', 'error'] as const).map((lvl) => {
          const isSelected = selectedLevel === lvl;
          return (
            <Pressable
              key={lvl}
              onPress={() => setSelectedLevel(lvl)}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter level ${lvl}`}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {lvl.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Category Filters */}
      <View style={styles.filterRow}>
        {(['all', 'widget', 'notification', 'system', 'general'] as const).map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter category ${cat}`}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {cat.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Log list */}
      <FlatList
        data={filteredLogs}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matching log entries found.</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontFamily: fontFamilies.labelStrong,
    color: colors.gold,
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 26,
    letterSpacing: -0.6,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  filterChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: colors.gold,
  },
  filterChipText: {
    fontFamily: fontFamilies.label,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  filterChipTextActive: {
    fontFamily: fontFamilies.labelStrong,
    color: colors.gold,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: 40,
    gap: spacing.sm,
  },
  logCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: 6,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  badgeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgeWarn: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeError: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  badgeText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  categoryText: {
    fontFamily: fontFamilies.label,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  timestampText: {
    fontFamily: fontFamilies.label,
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
  logMessage: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.textMuted,
  },
});
